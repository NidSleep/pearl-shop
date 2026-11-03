import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("shipping migration leaves one payment signature accepting the deployed five named arguments", () => {
  const sql = readFileSync("supabase/migrations/0004_order_shipping.sql", "utf8");
  assert.match(sql, /^begin;/i);
  assert.match(sql, /commit;\s*$/i);
  assert.match(sql, /drop function public\.mark_order_paid\(text, text, text, text, jsonb\);/i);
  const signatures = [...sql.matchAll(/create (?:or replace )?function public\.mark_order_paid\(([\s\S]*?)\)\s*returns/gi)];
  assert.equal(signatures.length, 1);
  assert.deepEqual(signatures[0][1].split(",").map((arg) => arg.trim().split(/\s+/)[0]), [
    "p_session_id", "p_payment_intent_id", "p_customer_email", "p_customer_name", "p_shipping_address",
    "p_shipping_cents", "p_amount_paid_cents",
  ]);
  assert.match(signatures[0][1], /p_shipping_cents\s+integer default 0/i);
  assert.match(signatures[0][1], /p_amount_paid_cents\s+integer default null/i);
  assert.match(sql, /coalesce\(p_amount_paid_cents, v_order\.total_cents \+ p_shipping_cents\)/i);
  assert.match(sql, /for update;/i);
  assert.match(sql, /if v_order\.status = 'paid' then return 'already_paid';/i);
  assert.match(sql, /security invoker\s+set search_path = public/i);
  assert.match(sql, /revoke execute on function public\.mark_order_paid\([^;]+from public, anon, authenticated;/i);
  assert.match(sql, /grant execute on function public\.mark_order_paid\([^;]+to service_role;/i);
});

test("email claims use a database-timed atomic lease and completion requires ownership", () => {
  const sql = readFileSync("supabase/migrations/0005_order_email.sql", "utf8");
  assert.match(sql, /confirmation_email_claimed_at timestamptz/i);
  assert.match(sql, /update public\.orders as o\s+set confirmation_email_claimed_at = now\(\)\s+where o\.id = p_order_id[\s\S]*?and o\.confirmation_email_sent_at is null[\s\S]*?\(o\.confirmation_email_claimed_at is null\s+or o\.confirmation_email_claimed_at < now\(\) - interval '15 minutes'\)\s+returning o\.id, o\.confirmation_email_claimed_at;/i);
  assert.match(sql, /confirmation_email_sent_at = case when p_sent then now\(\) else o\.confirmation_email_sent_at end/i);
  assert.match(sql, /o\.confirmation_email_claimed_at = p_claimed_at/i);
  for (const name of ["claim_order_confirmation", "finish_order_confirmation"]) {
    assert.match(sql, new RegExp(`function public\\.${name}\\([\\s\\S]*?security invoker\\s+set search_path = public`, "i"));
    assert.match(sql, new RegExp(`revoke execute on function public\\.${name}\\([^;]+from public, anon, authenticated;`, "i"));
    assert.match(sql, new RegExp(`grant execute on function public\\.${name}\\([^;]+to service_role;`, "i"));
  }
});
