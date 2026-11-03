import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { requireEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { getAdminClient } from "@/lib/supabase";

/**
 * POST /api/webhooks/stripe
 *
 * Stripe calls this URL when a payment succeeds/fails. This is the ONLY place
 * where an order becomes `paid`.
 *
 * Security:
 *  - The signature header is verified with STRIPE_WEBHOOK_SECRET, so nobody
 *    can fake a "payment succeeded" call.
 *  - Processing is idempotent (see mark_order_paid in the SQL migration),
 *    because Stripe can deliver the same event more than once.
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Signature verification needs the raw, unparsed body.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, requireEnv("STRIPE_WEBHOOK_SECRET"));
  } catch (err) {
    console.error("webhook: signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        // For delayed methods, "completed" can arrive before the money does.
        if (session.payment_status === "paid") {
          await markPaid(session);
        }
        break;
      }
      case "checkout.session.async_payment_failed":
        await setStatusIfPending(event.data.object.id, "failed");
        break;
      case "checkout.session.expired":
        await setStatusIfPending(event.data.object.id, "cancelled");
        break;
      default:
        // Ignore events we don't care about.
        break;
    }
  } catch (err) {
    console.error(`webhook: failed to handle ${event.type}`, err);
    // Non-2xx tells Stripe to retry later.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function markPaid(session: Stripe.Checkout.Session) {
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);

  const { data, error } = await getAdminClient().rpc("mark_order_paid", {
    p_session_id: session.id,
    p_payment_intent_id: paymentIntentId,
    p_customer_email: session.customer_details?.email ?? null,
    p_customer_name: session.customer_details?.name ?? null,
    p_shipping_address: session.collected_information?.shipping_details ?? null,
  });

  if (error) throw error;
  if (data === "not_found") {
    // Throwing makes Stripe retry, which covers the small window where the
    // session id hasn't been saved to the order yet.
    throw new Error(`No order found for session ${session.id}`);
  }
  console.info(`webhook: order for session ${session.id} → ${data}`);
}

async function setStatusIfPending(sessionId: string, status: "failed" | "cancelled") {
  const { error } = await getAdminClient()
    .from("orders")
    .update({ status })
    .eq("stripe_session_id", sessionId)
    .eq("status", "pending");
  if (error) throw error;
}
