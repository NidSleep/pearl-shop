import "server-only";
import { formatPrice } from "@/lib/money";
import { getAdminClient } from "@/lib/supabase";

type ConfirmationOrder = {
  id: string;
  customer_email: string | null;
  currency: string;
  shipping_cents: number;
  amount_paid_cents: number;
  shipping_address: {
    name?: string | null;
    address?: {
      line1?: string | null; line2?: string | null; city?: string | null;
      state?: string | null; postal_code?: string | null; country?: string | null;
    } | null;
  } | null;
  order_items: { product_name: string; quantity: number; unit_price_cents: number }[];
};

function escapeHtml(value: string): string {
  const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return value.replace(/[&<>"']/g, (character) => entities[character]);
}

function confirmationContent(order: ConfirmationOrder) {
  const shortId = order.id.slice(0, 8);
  const price = (cents: number) => formatPrice(cents, order.currency);
  const address = order.shipping_address?.address;
  const addressLines = [
    order.shipping_address?.name, address?.line1, address?.line2,
    address?.city, address?.state, address?.postal_code, address?.country,
  ].filter((line): line is string => Boolean(line));
  const lines = order.order_items.map((item) =>
    `${item.product_name} — ${item.quantity} × ${price(item.unit_price_cents)} each`,
  );
  const shipping = `Shipping: ${price(order.shipping_cents)}`;
  const total = `Total: ${price(order.amount_paid_cents)}`;
  return {
    subject: `Pearl Shop — order ${shortId} confirmed`,
    text: [
      `Thank you for your order ${shortId}.`, "Your payment is confirmed.", "",
      ...lines, "", shipping, total, "", "Shipping address:",
      ...(addressLines.length ? addressLines : ["No shipping address provided."]),
    ].join("\n"),
    html: `<!doctype html><html lang="en"><body style="margin:0;background:#fafaf9;color:#292524;font-family:Arial,sans-serif;line-height:1.6">
      <main style="max-width:600px;margin:32px auto;padding:32px;background:#fff;border:1px solid #e7e5e4">
        <h1 style="font-family:Georgia,serif">Thank you for your order</h1>
        <p>Order <strong>${escapeHtml(shortId)}</strong> · Your payment is confirmed.</p>
        <ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
        <p>${escapeHtml(shipping)}<br><strong>${escapeHtml(total)}</strong></p>
        <h2 style="font-family:Georgia,serif;font-size:20px">Shipping address</h2>
        <p>${addressLines.length ? addressLines.map(escapeHtml).join("<br>") : "No shipping address provided."}</p>
        <p>Pearl Shop</p>
      </main></body></html>`,
  };
}

/** Called only after the verified payment RPC returned paid or already_paid. */
export async function sendOrderConfirmation(sessionId: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn("confirmation email: missing RESEND_API_KEY or EMAIL_FROM; skipping");
    return;
  }

  const supabase = getAdminClient();
  const claimedAt = new Date().toISOString();
  // The conditional UPDATE is one atomic DB operation. Concurrent deliveries
  // cannot both claim the same paid order; no read-then-write race.
  const { data, error } = await supabase.from("orders")
    .update({ confirmation_email_sent_at: claimedAt })
    .eq("stripe_session_id", sessionId)
    .eq("status", "paid")
    .is("confirmation_email_sent_at", null)
    .select("id, customer_email, currency, shipping_cents, amount_paid_cents, shipping_address, order_items(product_name, quantity, unit_price_cents)")
    .maybeSingle();

  if (error) throw new Error("Confirmation email claim failed");
  if (!data) return;
  const order = data as ConfirmationOrder;

  try {
    if (!order.customer_email) throw new Error("Missing recipient");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Also deduplicate ambiguous HTTP failures at the provider (24h window).
        "Idempotency-Key": `order-confirmation/${order.id}`,
      },
      body: JSON.stringify({ from, to: [order.customer_email], ...confirmationContent(order) }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error("Provider rejected email");
  } catch {
    // Never log addresses, payloads, provider responses or upstream errors.
    console.error("confirmation email: send failed; releasing claim for Stripe retry");
    const { error: releaseError } = await supabase.from("orders")
      .update({ confirmation_email_sent_at: null })
      .eq("id", order.id)
      .eq("confirmation_email_sent_at", claimedAt);
    if (releaseError) console.error("confirmation email: claim release failed; manual recovery required");
    throw new Error("Confirmation email failed");
  }
}
