import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/env";
import { checkCheckoutRateLimit } from "@/lib/rate-limit";
import { getStripe } from "@/lib/stripe";
import { getAdminClient } from "@/lib/supabase";

const MAX_LINE_ITEMS = 20;
const MAX_QUANTITY = 10;
const SESSION_TTL_SECONDS = 30 * 60; // Stripe minimum is 30 minutes

type RequestItem = { productId: string; quantity: number };

function parseItems(body: unknown): RequestItem[] | null {
  if (typeof body !== "object" || body === null || !("items" in body)) return null;
  const items = (body as { items: unknown }).items;
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_LINE_ITEMS) return null;

  const merged = new Map<string, number>();
  for (const item of items) {
    const { productId, quantity } = (item ?? {}) as Record<string, unknown>;
    if (typeof productId !== "string" || !/^[0-9a-f-]{36}$/i.test(productId)) return null;
    if (!Number.isInteger(quantity) || (quantity as number) < 1) return null;
    merged.set(productId, (merged.get(productId) ?? 0) + (quantity as number));
  }
  for (const qty of merged.values()) if (qty > MAX_QUANTITY) return null;

  return [...merged].map(([productId, quantity]) => ({ productId, quantity }));
}

/**
 * POST /api/checkout
 * 0. Rate limit every attempt before parsing the cart or doing checkout work.
 * 1. Validate the cart and look up REAL prices from the database
 *    (never trust prices sent by the browser).
 * 2. Create a `pending` order.
 * 3. Create a Stripe Checkout Session and return its URL.
 */
export async function POST(request: Request) {
  const rateLimit = await checkCheckoutRateLimit(request);
  if (!rateLimit.ok) {
    if (rateLimit.status === 429) {
      return NextResponse.json(
        { error: "Too many checkout attempts. Please wait a few minutes and try again." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }
    return NextResponse.json(
      { error: "Checkout is temporarily unavailable. Please try again shortly." },
      { status: 503 },
    );
  }

  const items = parseItems(await request.json().catch(() => null));
  if (!items) {
    return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
  }

  const supabase = getAdminClient();

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price_cents, currency, stock")
    .in("id", items.map((i) => i.productId))
    .eq("is_active", true);

  if (productsError) {
    console.error("checkout: product lookup failed", productsError);
    return NextResponse.json({ error: "Could not load products" }, { status: 500 });
  }

  const byId = new Map(products.map((p) => [p.id as string, p]));
  const lines = [];
  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product) {
      return NextResponse.json({ error: "A product in your cart is no longer available" }, { status: 409 });
    }
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `Not enough stock for ${product.name}` }, { status: 409 });
    }
    if (product.currency !== "myr") {
      return NextResponse.json({ error: "Mixed currencies are not supported" }, { status: 400 });
    }
    lines.push({ product, quantity: item.quantity });
  }

  const totalCents = lines.reduce((sum, l) => sum + l.product.price_cents * l.quantity, 0);

  // 1) Create the pending order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ status: "pending", total_cents: totalCents, currency: "myr" })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("checkout: order insert failed", orderError);
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    lines.map((l) => ({
      order_id: order.id,
      product_id: l.product.id,
      product_name: l.product.name,
      unit_price_cents: l.product.price_cents,
      quantity: l.quantity,
    })),
  );

  if (itemsError) {
    console.error("checkout: order_items insert failed", itemsError);
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }

  // 2) Create the Stripe Checkout Session (card details never touch our server)
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      client_reference_id: order.id,
      metadata: { order_id: order.id },
      line_items: lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: "myr",
          unit_amount: l.product.price_cents,
          product_data: { name: l.product.name },
        },
      })),
      shipping_address_collection: { allowed_countries: ["MY", "SG"] },
      phone_number_collection: { enabled: true },
      expires_at: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
      success_url: `${siteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/checkout/cancel`,
      // Payment methods (cards, FPX, GrabPay…) are configured in the Stripe Dashboard.
    });

    const { error: updateError } = await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    if (updateError || !session.url) {
      throw updateError ?? new Error("Stripe returned no session URL");
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout: Stripe session failed", err);
    await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json({ error: "Payment provider error, please try again" }, { status: 502 });
  }
}
