import assert from "node:assert/strict";
import test from "node:test";
import { loadTs } from "./load-ts.mjs";

const order = {
  id: "12345678-abcd", customer_email: "customer@example.test", currency: "myr",
  shipping_cents: 2_500, amount_paid_cents: 32_500,
  shipping_address: { name: "<img src=x onerror=alert(1)>", address: {
    line1: "A & B", line2: '"Suite"', city: "Singapore", postal_code: "123456", country: "SG",
  } },
  order_items: [{ product_name: "<script>bad</script>", quantity: 2, unit_price_cents: 15_000 }],
};

function emailFixture({ configured = true, fail = false, dbError = false, lostClaim = false, finishError = false, timeout = false } = {}) {
  let claim = null;
  let sentAt = null;
  let now = Date.parse("2026-11-03T00:00:00Z");
  let posts = 0;
  let updates = 0;
  let payload;
  let headers;
  const failure = () => ({ data: null, error: new Error("private upstream detail") });
  const db = { from: (table) => {
    assert.equal(table, "orders");
    const filters = {};
    const query = {
      eq(key, value) { filters[key] = value; return query; },
      is(key, value) { filters[key] = value; return query; },
      select() { return query; },
      async maybeSingle() {
        assert.deepEqual(filters, { stripe_session_id: "cs_test", status: "paid", confirmation_email_sent_at: null });
        if (dbError) return failure();
        return { data: sentAt ? null : order, error: null };
      },
    };
    return query;
  }, rpc: (name, args) => ({
    async maybeSingle() {
      assert.equal(args.p_order_id, order.id);
      if (name === "claim_order_confirmation") {
        if (sentAt || (claim && Date.parse(claim) >= now - 15 * 60_000)) return { data: null, error: null };
        updates++;
        claim = new Date(now).toISOString();
        if (lostClaim) { lostClaim = false; return failure(); }
        return { data: { id: order.id, confirmation_email_claimed_at: claim }, error: null };
      }
      assert.equal(name, "finish_order_confirmation");
      if (finishError) { finishError = false; return failure(); }
      if (sentAt || args.p_claimed_at !== claim) return { data: null, error: null };
      updates++;
      if (args.p_sent) sentAt = new Date(now).toISOString();
      claim = null;
      return { data: { id: order.id }, error: null };
    },
  }) };
  const { sendOrderConfirmation } = loadTs("src/lib/email.ts", {
    "@/lib/supabase": { getAdminClient: () => db },
  });
  return {
    send: async (run = (send) => send()) => {
      const oldKey = process.env.RESEND_API_KEY;
      const oldFrom = process.env.EMAIL_FROM;
      const oldFetch = globalThis.fetch;
      try {
        if (configured) process.env.RESEND_API_KEY = "test-key";
        else delete process.env.RESEND_API_KEY;
        process.env.EMAIL_FROM = "Shop <orders@example.test>";
        globalThis.fetch = async (url, init) => {
          assert.equal(url, "https://api.resend.com/emails");
          assert.ok(claim, "email must have an active lease before sending");
          assert.equal(sentAt, null, "email must not be marked sent before provider success");
          posts++; payload = JSON.parse(init.body); headers = init.headers;
          if (timeout) throw new Error("ambiguous timeout");
          return new Response("{}", { status: fail ? 503 : 200 });
        };
        return await run(() => sendOrderConfirmation("cs_test"));
      } finally {
        if (oldKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = oldKey;
        if (oldFrom === undefined) delete process.env.EMAIL_FROM; else process.env.EMAIL_FROM = oldFrom;
        globalThis.fetch = oldFetch;
      }
    },
    get claim() { return claim; }, get sentAt() { return sentAt; }, get posts() { return posts; }, get updates() { return updates; },
    get payload() { return payload; }, get headers() { return headers; },
    recover() { fail = false; timeout = false; },
    advance(minutes) { now += minutes * 60_000; },
  };
}

test("atomic claim deduplicates repeated and concurrent deliveries", async () => {
  const f = emailFixture();
  const results = await f.send((send) => Promise.allSettled([send(), send()]));
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(results.filter((result) => result.status === "rejected").length, 1);
  await f.send();
  assert.equal(f.posts, 1);
  assert.equal(f.claim, null);
  assert.ok(f.sentAt);
});

test("confirmation escapes HTML and includes snapshots, shipping, paid total and address in both formats", async () => {
  const f = emailFixture();
  await f.send();
  const { html, text, subject } = f.payload;
  assert.match(subject, /12345678/);
  assert.doesNotMatch(html, /<script>|<img/);
  assert.match(html, /&lt;script&gt;bad&lt;\/script&gt;/);
  assert.match(html, /A &amp; B/);
  for (const content of [html, text]) {
    assert.match(content, /150\.00/);
    assert.match(content, /25\.00/);
    assert.match(content, /325\.00/);
    assert.match(content, /123456/);
    assert.match(content, /2/);
  }
  assert.equal(f.headers["Idempotency-Key"], "order-confirmation-12345678-abcd");
});

test("Resend failure clears the owned claim and a later attempt can send", async () => {
  const f = emailFixture({ fail: true });
  await assert.rejects(f.send(), /confirmation email/i);
  assert.equal(f.claim, null);
  assert.equal(f.sentAt, null);
  f.recover();
  await f.send();
  assert.equal(f.posts, 2);
  assert.ok(f.sentAt);
});

test("lost claim response stays retryable and can be reclaimed only after 15 minutes", async () => {
  const f = emailFixture({ lostClaim: true });
  await assert.rejects(f.send(), /confirmation email/i);
  assert.ok(f.claim);
  assert.equal(f.sentAt, null);
  f.advance(15);
  await assert.rejects(f.send(), /confirmation email/i);
  assert.equal(f.posts, 0);
  f.advance(1);
  await f.send();
  assert.equal(f.posts, 1);
  assert.ok(f.sentAt);
});

test("ambiguous provider timeout releases the lease and retries with the same idempotency key", async () => {
  const f = emailFixture({ timeout: true });
  await assert.rejects(f.send(), /confirmation email/i);
  const key = f.headers["Idempotency-Key"];
  assert.equal(f.claim, null);
  assert.equal(f.sentAt, null);
  f.recover();
  await f.send();
  assert.equal(f.headers["Idempotency-Key"], key);
  assert.ok(f.sentAt);
});

test("failure to record provider success retains the lease for later recovery", async () => {
  const f = emailFixture({ finishError: true });
  await assert.rejects(f.send(), /confirmation email/i);
  assert.equal(f.posts, 1);
  assert.equal(f.sentAt, null);
  assert.ok(f.claim);
  await assert.rejects(f.send(), /confirmation email/i);
  assert.equal(f.posts, 1);
  f.advance(16);
  await f.send();
  assert.equal(f.posts, 2);
  assert.ok(f.sentAt);
});

test("failed claim release recovers through lease expiry", async () => {
  const f = emailFixture({ fail: true, finishError: true });
  await assert.rejects(f.send(), /confirmation email/i);
  assert.equal(f.sentAt, null);
  assert.ok(f.claim);
  f.recover();
  await assert.rejects(f.send(), /confirmation email/i);
  assert.equal(f.posts, 1);
  f.advance(16);
  await f.send();
  assert.equal(f.posts, 2);
  assert.ok(f.sentAt);
});

test("missing API key skips the claim and DB errors fail safely", async () => {
  const disabled = emailFixture({ configured: false });
  await disabled.send();
  assert.equal(disabled.posts, 0);
  assert.equal(disabled.updates, 0);
  const broken = emailFixture({ dbError: true });
  await assert.rejects(broken.send(), /confirmation email/i);
  assert.equal(broken.posts, 0);
});

test("only paid payment transitions and paid retries attempt email, and failures return 500", async () => {
  for (const [status, paymentStatus, emailFails, expectedCalls, expectedHttp] of [
    ["paid", "paid", false, 1, 200], ["already_paid", "paid", false, 1, 200],
    ["cancelled", "paid", false, 0, 200], ["paid", "unpaid", false, 0, 200],
    ["already_paid", "paid", true, 1, 500],
  ]) {
    let calls = 0;
    const { POST } = loadTs("src/app/api/webhooks/stripe/route.ts", {
      "@/lib/env": { requireEnv: () => "test" },
      "@/lib/stripe": { getStripe: () => ({ webhooks: { constructEvent: () => ({
        type: "checkout.session.completed", data: { object: { id: "cs_test", payment_status: paymentStatus, amount_total: 32_500 } },
      }) } }) },
      "@/lib/supabase": { getAdminClient: () => ({ rpc: async () => ({ data: status, error: null }) }) },
      "@/lib/email": { sendOrderConfirmation: async () => { calls++; if (emailFails) throw new Error("confirmation email failed"); } },
    });
    const response = await POST(new Request("https://shop.example/api/webhooks/stripe", {
      method: "POST", headers: { "stripe-signature": "test" }, body: "fixture",
    }));
    assert.equal(calls, expectedCalls);
    assert.equal(response.status, expectedHttp);
  }
});

test("webhook logs never include raw signature errors or customer payloads", async () => {
  const logs = [];
  const original = console.error;
  console.error = (...args) => logs.push(args);
  try {
    const { POST } = loadTs("src/app/api/webhooks/stripe/route.ts", {
      "@/lib/env": { requireEnv: () => "test" },
      "@/lib/stripe": { getStripe: () => ({ webhooks: { constructEvent: () => {
        throw Object.assign(new Error("invalid signature"), { payload: "customer@example.test private-address" });
      } } }) },
      "@/lib/email": { sendOrderConfirmation: async () => {} },
    });
    const response = await POST(new Request("https://shop.example/api/webhooks/stripe", {
      method: "POST", headers: { "stripe-signature": "invalid" }, body: "private customer payload",
    }));
    assert.equal(response.status, 400);
    assert.doesNotMatch(JSON.stringify(logs), /customer@example\.test|private-address/);
    assert.equal(logs[0].length, 1);
  } finally {
    console.error = original;
  }
});
