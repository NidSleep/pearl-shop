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

function emailFixture({ configured = true, fail = false, dbError = false } = {}) {
  let claim = null;
  let posts = 0;
  let updates = 0;
  let payload;
  let headers;
  const db = { from: () => {
    let change;
    let matchesNull = false;
    let ownedClaim;
    const query = {
      update(value) { updates++; change = value; return query; },
      eq(key, value) { if (key === "confirmation_email_sent_at") ownedClaim = value; return query; },
      is() { matchesNull = true; return query; },
      select() { return query; },
      async maybeSingle() {
        if (dbError) return { data: null, error: new Error("private upstream detail") };
        if (change) {
          if (matchesNull && claim !== null) return { data: null, error: null };
          claim = change.confirmation_email_sent_at;
        }
        return { data: order, error: null };
      },
      then(resolve) {
        if (ownedClaim === claim) claim = change.confirmation_email_sent_at;
        return Promise.resolve({ error: null }).then(resolve);
      },
    };
    return query;
  } };
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
          posts++; payload = JSON.parse(init.body); headers = init.headers;
          return new Response("{}", { status: fail ? 503 : 200 });
        };
        return await run(() => sendOrderConfirmation("cs_test"));
      } finally {
        if (oldKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = oldKey;
        if (oldFrom === undefined) delete process.env.EMAIL_FROM; else process.env.EMAIL_FROM = oldFrom;
        globalThis.fetch = oldFetch;
      }
    },
    get claim() { return claim; }, get posts() { return posts; }, get updates() { return updates; },
    get payload() { return payload; }, get headers() { return headers; },
    recover() { fail = false; },
  };
}

test("atomic claim deduplicates repeated and concurrent deliveries", async () => {
  const f = emailFixture();
  await f.send((send) => Promise.all([send(), send()]));
  await f.send();
  assert.equal(f.posts, 1);
  assert.ok(f.claim);
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
  assert.equal(f.headers["Idempotency-Key"], "order-confirmation/12345678-abcd");
});

test("Resend failure clears the owned claim and a later attempt can send", async () => {
  const f = emailFixture({ fail: true });
  await assert.rejects(f.send(), /confirmation email/i);
  assert.equal(f.claim, null);
  f.recover();
  await f.send();
  assert.equal(f.posts, 2);
  assert.ok(f.claim);
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
