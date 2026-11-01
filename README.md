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
    products.ts                   Product queries
    cart.tsx                      Cart state
supabase/
  migrations/0001_init.sql        Tables, RLS, mark_order_paid()
  seed.sql                        Sample products
```

## Local setup

1. **Install**: `npm install`
2. **Supabase**: create a project at https://supabase.com →
   SQL Editor → run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`.
3. **Stripe**: create an account at https://stripe.com, stay in **Test mode**.
4. **Env**: `cp .env.example .env.local` and fill in the keys.
5. **Webhook (local)**: install the [Stripe CLI](https://docs.stripe.com/stripe-cli), then
   ```
   stripe login
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET`.
6. **Run**: `npm run dev` → http://localhost:3000
7. **Test payment**: card `4242 4242 4242 4242`, any future date, any CVC.
   Then check the `orders` table in Supabase — status should be `paid`.

## Production checklist
- [ ] Deploy (e.g. Vercel) and set all env vars there
- [ ] Stripe Dashboard → Webhooks → add `https://YOUR-DOMAIN/api/webhooks/stripe`
      with events `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
      `checkout.session.async_payment_failed`, `checkout.session.expired`
- [ ] Enable FPX / cards in Stripe Dashboard → Payment methods
- [ ] Switch to live Stripe keys
- [ ] Add rate limiting to `/api/checkout`

## Contributing
See `AGENTS.md` for code rules and workflow (applies to humans and AI agents).
