import assert from "node:assert/strict";
import test from "node:test";
import { loadTs } from "./load-ts.mjs";

test("MY and SG charge flat fees below their exact free-shipping thresholds", () => {
  const { shippingCents } = loadTs("src/lib/shipping.ts");
  assert.equal(shippingCents("MY", 29_999), 1_000);
  assert.equal(shippingCents("MY", 30_000), 0);
  assert.equal(shippingCents("MY", 50_000), 0);
  assert.equal(shippingCents("SG", 30_000), 2_500);
  assert.equal(shippingCents("SG", 49_999), 2_500);
  assert.equal(shippingCents("SG", 50_000), 0);
});

function checkoutFixture() {
  const sessions = [];
  let writes = 0;
  const builder = (data) => {
    const query = { data, error: null };
    for (const method of ["select", "in", "eq", "single"]) query[method] = () => query;
    return query;
  };
  const db = { from: (table) => ({
    select: () => builder([{ id: "a".repeat(36), name: "Pearl", price_cents: 15_000, currency: "myr", stock: 10 }]),
    insert: () => { writes++; return builder(table === "orders" ? { id: "order-1" } : null); },
    update: () => builder(null),
  }) };
  const { POST } = loadTs("src/app/api/checkout/route.ts", {
    "@/lib/rate-limit": { checkCheckoutRateLimit: async () => ({ ok: true }) },
    "@/lib/supabase": { getAdminClient: () => db },
    "@/lib/env": { siteUrl: () => "https://shop.example" },
    "@/lib/stripe": { getStripe: () => ({ checkout: { sessions: { create: async (session) => {
      sessions.push(session); return { id: "cs_test", url: "https://checkout.example" };
    } } } }) },
  });
  const request = (country) => new Request("https://shop.example/api/checkout", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ country, subtotalCents: 999_999, items: [{ productId: "a".repeat(36), quantity: 2 }] }),
  });
  return { POST, request, sessions, writes: () => writes };
}

test("checkout calculates shipping from DB prices and locks the address country", async () => {
  for (const [country, fee] of [["MY", 0], ["SG", 2_500]]) {
    const f = checkoutFixture();
    assert.equal((await f.POST(f.request(country))).status, 200);
    const session = f.sessions[0];
    assert.deepEqual(session.shipping_address_collection.allowed_countries, [country]);
    assert.equal(session.shipping_options.length, 1);
    assert.equal(session.shipping_options[0].shipping_rate_data.fixed_amount.amount, fee);
    assert.equal(session.shipping_options[0].shipping_rate_data.fixed_amount.currency, "myr");
    assert.equal(Object.hasOwn(session, "payment_method_types"), false);
  }
});

test("checkout rejects unsupported or missing country before writing orders", async () => {
  for (const country of ["US", "__proto__", undefined]) {
    const f = checkoutFixture();
    assert.equal((await f.POST(f.request(country))).status, 400);
    assert.equal(f.writes(), 0);
    assert.equal(f.sessions.length, 0);
  }
});

test("paid webhook passes signed Stripe shipping and total into the payment transaction", async () => {
  let args;
  const { POST } = loadTs("src/app/api/webhooks/stripe/route.ts", {
    "@/lib/env": { requireEnv: () => "test" },
    "@/lib/stripe": { getStripe: () => ({ webhooks: { constructEvent: () => ({
      type: "checkout.session.completed", data: { object: {
        id: "cs_test", payment_status: "paid", shipping_cost: { amount_total: 2_500 }, amount_total: 32_500,
      } },
    }) } }) },
    "@/lib/supabase": { getAdminClient: () => ({ rpc: async (_name, params) => {
      args = params; return { data: "paid", error: null };
    } }) },
    "@/lib/email": { sendOrderConfirmation: async () => {} },
  });
  const response = await POST(new Request("https://shop.example/api/webhooks/stripe", {
    method: "POST", headers: { "stripe-signature": "test" }, body: "signed fixture",
  }));
  assert.equal(response.status, 200);
  assert.equal(args.p_shipping_cents, 2_500);
  assert.equal(args.p_amount_paid_cents, 32_500);
});
