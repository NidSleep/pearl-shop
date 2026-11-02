# Pearl Shop

E-commerce site for pearl jewellery.
**Next.js 16 · Supabase · Stripe Checkout · Tailwind CSS**

## How payment works

```
Browser cart ──POST /api/checkout──▶ Server re-checks prices & stock
                                     creates order (status: pending)
                                     creates Stripe Checkout Session
Browser ◀── redirect to Stripe's hosted payment page (card/FPX entered there, never on our server)
Stripe ──POST /api/webhooks/stripe──▶ verify signature
                                      mark_order_paid(): status → paid, stock − qty (idempotent)
```

## Project structure

```
src/
  app/
    page.tsx                      Product listing
    products/[slug]/page.tsx      Product detail
    cart/page.tsx                 Cart (stored in localStorage)
    checkout/success|cancel/      Return pages from Stripe
    api/checkout/route.ts         Creates order + Stripe session
    api/webhooks/stripe/route.ts  Stripe webhook → marks order paid
  components/                     UI components
  lib/
    supabase.ts                   Public (RLS) and admin (service role) clients
    stripe.ts                     Stripe client
    rate-limit.ts                 Checkout IP canonicalization, HMAC and limiter RPC
    products.ts                   Product queries
    cart.tsx                      Cart state
supabase/
  migrations/0001_init.sql        Tables, RLS, mark_order_paid()
  migrations/0003_checkout_rate_limit.sql  Checkout counters, limiter and hourly cleanup
  seed.sql                        Sample products
```

## Local setup

1. **Install**: `npm install`
2. **Supabase**: create a project at https://supabase.com →
   SQL Editor → run `supabase/migrations/0001_init.sql`, `0002_product_images_bucket.sql`,
   and `0003_checkout_rate_limit.sql` (as `postgres`, with `pg_cron` available),
   then `supabase/seed.sql`.
3. **Stripe**: create an account at https://stripe.com, stay in **Test mode**.
4. **Env**: `cp .env.example .env.local` and fill in the keys, including
   `RATE_LIMIT_SECRET`. Generate it with the command in `.env.example` (at least
   32 random bytes); keep it server-only and identical across instances.
5. **Webhook (local)**: install the [Stripe CLI](https://docs.stripe.com/stripe-cli), then
   ```
   stripe login
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET`.
6. **Run**: `npm run dev` → http://localhost:3000
7. **Test payment**: card `4242 4242 4242 4242`, any future date, any CVC.
   Then check the `orders` table in Supabase — status should be `paid`.
8. **Product photos** (optional): put photos named after each product slug
   (e.g. `akoya-classic-strand.jpg`) in a folder, then run
   `npm run images:upload -- path/to/folder`. Re-run to replace a photo.

## Checkout rate limiting

`POST /api/checkout` allows **5 attempts per IP per 10-minute fixed window**.
Every attempt counts, including malformed carts, stock errors and downstream
failures. Rejected attempts also increment the counter. A 429 response includes
`Retry-After` in seconds. Customers sharing a NAT share the quota; up to 10 attempts
can pass around a window boundary (5 before and 5 after). Card retries on Stripe's
hosted page do not call this route.

The limiter runs before body parsing, product reads, order writes or Stripe calls.
It fails closed with **503** if the secret is missing, the production client IP is
missing or invalid, or the limiter RPC fails, times out after 3 seconds, or returns
a malformed result. Apply migration `0003` before deploying the dependent code:
first in the Singapore development project (Stripe test mode), then in production
before its first deployment (QY-14).

Supported deployment is **Vercel directly, with no extra proxy in front**. The
first `x-forwarded-for` entry is trusted because Vercel overwrites it; `x-real-ip`
is used when that header is absent. Self-hosting requires a trusted proxy that
strips and rebuilds forwarding headers and prevents direct access to the origin.
Without that setup, self-hosting is unsupported. In development only, a missing
or invalid IP uses the shared `dev-local` bucket.

Canonical IPs are keyed with HMAC-SHA-256 using `RATE_LIMIT_SECRET`; raw IPs and
headers are never stored or logged. The hashes are still pseudonymous identifiers.
Rotating the secret resets quotas. An hourly `pg_cron` job,
`prune-checkout-rate-limits`, deletes buckets older than 24 hours in batches of up
to 50,000, for normal maximum retention of about 25 hours. Check `cron.job` for
the scheduled job and `cron.job_run_details` for successful or failed runs; failed
runs or a backlog can extend retention until cleanup catches up.

Monitor server logs for `checkout rate limit: limit exceeded` (429) and limiter
failure reasons (503). Logs contain no IPs, HMAC keys or headers. Tune `c_limit`
and `c_window` in `public.check_checkout_rate_limit` through a **new numbered
migration**, keeping already-applied migrations unchanged.

## Production checklist
- [ ] Deploy (e.g. Vercel) and set all env vars there
- [ ] Apply `0003_checkout_rate_limit.sql` before deploying code; confirm the prune job in `cron.job`
- [ ] Set the same server-only `RATE_LIMIT_SECRET` on all Vercel instances/environments that share counters
- [ ] On the first preview deploy (QY-14), send a forged `x-forwarded-for` and verify Vercel overwrites it with the real client IP
- [ ] Verify checkout limits / `Retry-After`, fail-closed 503s, and successful cleanup in `cron.job_run_details`
- [ ] Stripe Dashboard → Webhooks → add `https://YOUR-DOMAIN/api/webhooks/stripe`
      with events `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
      `checkout.session.async_payment_failed`, `checkout.session.expired`
- [ ] Enable FPX / cards in Stripe Dashboard → Payment methods
- [ ] Switch to live Stripe keys

## Contributing
See `AGENTS.md` for code rules and workflow (applies to humans and AI agents).
