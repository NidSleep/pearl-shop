import assert from "node:assert/strict";
import test from "node:test";
import { loadTs } from "./load-ts.mjs";

test("admin allowlist is trimmed, case insensitive and fails closed", () => {
  const previous = process.env.ADMIN_EMAILS;
  try {
    process.env.ADMIN_EMAILS = "  OWNER@example.test, second@example.test , ";
    const { isAdminEmail } = loadTs("src/lib/admin-auth.ts");
    assert.equal(isAdminEmail("owner@EXAMPLE.test"), true);
    assert.equal(isAdminEmail("outsider@example.test"), false);
    assert.equal(isAdminEmail(null), false);
    delete process.env.ADMIN_EMAILS;
    assert.equal(isAdminEmail("owner@example.test"), false);
  } finally {
    if (previous === undefined) delete process.env.ADMIN_EMAILS; else process.env.ADMIN_EMAILS = previous;
  }
});

test("each admin verification calls live getUser and rejects invalid tokens and outsiders", async () => {
  const previous = process.env.ADMIN_EMAILS;
  process.env.ADMIN_EMAILS = "owner@example.test";
  let calls = 0;
  try {
    const { verifyAdminToken } = loadTs("src/lib/admin-auth.ts", {
      "@/lib/supabase": { createAuthClient: () => ({ auth: { getUser: async (token) => {
        calls++;
        if (token === "error") throw new Error("upstream");
        return { data: { user: { email: token === "owner" ? "owner@example.test" : "other@example.test" } }, error: token === "expired" ? {} : null };
      } } }) },
    });
    assert.equal(await verifyAdminToken(undefined), null);
    assert.ok(await verifyAdminToken("owner"));
    assert.ok(await verifyAdminToken("owner"));
    assert.equal(await verifyAdminToken("other"), null);
    assert.equal(await verifyAdminToken("expired"), null);
    assert.equal(await verifyAdminToken("error"), null);
    assert.equal(calls, 5);
  } finally {
    if (previous === undefined) delete process.env.ADMIN_EMAILS; else process.env.ADMIN_EMAILS = previous;
  }
});

test("admin POSTs require a matching origin, including protocol and port", () => {
  const { isSameOriginAdminPost } = loadTs("src/lib/admin-auth.ts");
  for (const [origin, fetchSite, allowed] of [
    ["https://shop.example", "same-origin", true], [null, null, false],
    ["http://shop.example", "same-origin", false], ["https://shop.example:444", "same-origin", false],
    ["https://evil.example", "cross-site", false], ["null", null, false],
    ["https://shop.example", "cross-site", false],
  ]) {
    const headers = new Headers();
    if (origin !== null) headers.set("origin", origin);
    if (fetchSite !== null) headers.set("sec-fetch-site", fetchSite);
    assert.equal(isSameOriginAdminPost(new Request("https://shop.example/admin/login/submit", { method: "POST", headers })), allowed);
  }
});

test("admin auth clients are isolated anon clients without persisted or refreshed sessions", () => {
  const configurations = [];
  const { createAuthClient } = loadTs("src/lib/supabase.ts", {
    "./env": { requireEnv: (name) => name },
    "@supabase/supabase-js": { createClient: (...args) => { configurations.push(args); return {}; } },
  });
  assert.notEqual(createAuthClient(), createAuthClient());
  assert.equal(configurations[0][1], "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  assert.deepEqual(configurations[0][2].auth, { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false });
});

function loginFixture(authorized = true) {
  let signins = 0;
  let verified;
  const { POST } = loadTs("src/app/admin/login/submit/route.ts", {
    "@/lib/supabase": { createAuthClient: () => ({ auth: { signInWithPassword: async () => {
      signins++; return { data: { session: { access_token: "verified-token", expires_at: Math.floor(Date.now() / 1000) + 3600 } }, error: null };
    } } }) },
    "@/lib/admin-auth": {
      ...loadTs("src/lib/admin-auth.ts"),
      verifyAdminToken: async (token) => { verified = token; return authorized ? { email: "owner@example.test" } : null; },
    },
  });
  const request = (origin = "https://shop.example") => new Request("https://shop.example/admin/login/submit", {
    method: "POST", headers: { origin }, body: new URLSearchParams({ email: "owner@example.test", password: "secret" }),
  });
  return { POST, request, get signins() { return signins; }, get verified() { return verified; } };
}

test("login rejects cross-site requests before auth and cookies contain only a verified access token", async () => {
  const f = loginFixture();
  assert.equal((await f.POST(f.request("https://evil.example"))).status, 403);
  assert.equal(f.signins, 0);
  const response = await f.POST(f.request());
  assert.equal(response.status, 303);
  assert.equal(f.verified, "verified-token");
  assert.equal(response.headers.get("location"), "https://shop.example/admin/orders");
  const cookie = response.headers.get("set-cookie");
  assert.match(cookie, /verified-token/);
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=lax/i);
  assert.match(cookie, /Path=\/admin/i);
  assert.doesNotMatch(cookie, /refresh/i);
  const denied = loginFixture(false);
  const rejected = await denied.POST(denied.request());
  assert.equal(rejected.status, 303);
  assert.doesNotMatch(rejected.headers.get("set-cookie") ?? "", /verified-token/);
  assert.match(rejected.headers.get("location"), /error=invalid/);
});

test("production cookies are Secure and logout clears only the admin cookie", async () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    const f = loginFixture();
    assert.match((await f.POST(f.request())).headers.get("set-cookie"), /; Secure/i);
    let checks = 0;
    const { POST } = loadTs("src/app/admin/logout/route.ts", {
      "@/lib/admin-auth": { ...loadTs("src/lib/admin-auth.ts"), requireAdmin: async () => { checks++; } },
    });
    const response = await POST(new Request("https://shop.example/admin/logout", { method: "POST", headers: { origin: "https://shop.example" } }));
    assert.equal(checks, 1);
    assert.equal(response.status, 303);
    assert.match(response.headers.get("set-cookie"), /Max-Age=0/i);
    assert.match(response.headers.get("location"), /\/admin\/login$/);
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous;
  }
});

test("orders enforce authorization before service-role access, validate filters and use stable 50-row pagination", async () => {
  let authorized = false;
  const calls = [];
  const builder = {
    select: (...args) => { calls.push(["select", ...args]); return builder; },
    eq: (...args) => { calls.push(["eq", ...args]); return builder; },
    order: (...args) => { calls.push(["order", ...args]); return builder; },
    range: (...args) => { calls.push(["range", ...args]); return { data: [], error: null, count: 151 }; },
  };
  const { getAdminOrders, parseOrderFilters } = loadTs("src/lib/admin-orders.ts", {
    "@/lib/admin-auth": { requireAdmin: async () => { if (!authorized) throw new Error("redirect login"); } },
    "@/lib/supabase": { getAdminClient: () => { calls.push(["admin-client"]); return { from: () => builder }; } },
  });
  await assert.rejects(getAdminOrders({ status: "paid", page: "2" }), /redirect login/);
  assert.equal(calls.length, 0);
  authorized = true;
  const result = await getAdminOrders({ status: "paid", page: "2" });
  assert.equal(result.page, 2);
  assert.ok(calls.some((call) => call[0] === "eq" && call[1] === "status" && call[2] === "paid"));
  assert.deepEqual(calls.find((call) => call[0] === "range"), ["range", 50, 99]);
  assert.ok(calls.some((call) => call[0] === "order" && call[1] === "id"));
  for (const page of ["-1", "1.5", "99999999999999999999999", "NaN"]) {
    assert.equal(parseOrderFilters({ status: "injected", page }).page, 1);
    assert.equal(parseOrderFilters({ status: "injected", page }).status, "");
  }
});

test("out-of-range order URLs redirect while preserving the status filter", async () => {
  for (const rangeError of [false, true]) {
    const query = {};
    for (const method of ["select", "eq", "order"]) query[method] = () => query;
    query.range = () => ({ data: [], count: rangeError ? null : 51, error: rangeError ? { code: "PGRST103" } : null });
    const { getAdminOrders } = loadTs("src/lib/admin-orders.ts", {
      "@/lib/admin-auth": { requireAdmin: async () => {} },
      "@/lib/supabase": { getAdminClient: () => ({ from: () => query }) },
      "next/navigation": { redirect: (url) => { throw new Error(`redirect ${url}`); } },
    });
    await assert.rejects(getAdminOrders({ status: "paid", page: "9" }),
      new RegExp(`redirect /admin/orders\\?status=paid&page=${rangeError ? 1 : 2}`));
  }
});
