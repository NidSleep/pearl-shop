# Backlog for Linear

Already done in the skeleton: product list/detail, cart, Stripe checkout, webhook, DB schema.

Create each item below as a Linear issue (title = heading, description = text below it).

## 1. Set up Supabase project and run migrations
Create the Supabase project, run `supabase/migrations/0001_init.sql` and `supabase/seed.sql`,
add keys to `.env.local`. Share keys with the team via a password manager, not chat.
Label: `setup` · Owner: human

## 2. Set up Stripe test account and local webhook
Create Stripe account (test mode), run `stripe listen`, complete a test payment with
`4242 4242 4242 4242` and confirm the order becomes `paid` in Supabase.
Label: `setup` · Owner: human

## 3. Add product images via Supabase Storage
Create a public `product-images` bucket, upload photos, store the URL in `products.image_url`.
Product pages already render `image_url` with `next/image`.
Label: `feature` · Good for AI agent

## 4. Send order confirmation email after payment
After `mark_order_paid` returns `paid` in the webhook, send an email (e.g. Resend) with
order items, total and shipping address. Must not send twice for the same order.
Label: `feature` · Good for AI agent

## 5. Admin page: list orders
Password-protected `/admin/orders` page listing orders (newest first) with status,
total, customer email, and a highlight for `needs_attention = true`.
Use Supabase Auth; only allow specific admin emails.
Label: `feature` · Good for AI agent

## 6. Add shipping fee to checkout
Flat shipping rate for MY (e.g. RM10, free above RM300) and SG, using Stripe
`shipping_options`. Store shipping amount on the order.
Label: `feature` · Good for AI agent

## 7. Product filters on the home page
Filter by pearl type and price range using URL search params.
Label: `feature` · Good for AI agent

## 8. Add rate limiting to /api/checkout
Prevent abuse (spam pending orders). E.g. Upstash Ratelimit by IP.
Label: `security` · Good for AI agent

## 9. Deploy to Vercel
Connect GitHub repo, set env vars, add production Stripe webhook (see README checklist).
Label: `setup` · Owner: human
