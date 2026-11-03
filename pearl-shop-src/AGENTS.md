<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Pearl Shop — rules for AI agents (Claude Code, Codex) and humans

## Stack
- Next.js 16 (App Router, `src/`), TypeScript, Tailwind CSS v4
- Supabase (Postgres) — schema in `supabase/migrations/`
- Stripe Checkout (hosted payment page) — currency MYR

## Golden rules
1. **Payments**: an order becomes `paid` ONLY in `src/app/api/webhooks/stripe/route.ts`
   via the `mark_order_paid` SQL function. Never mark orders paid from the success page
   or from client code.
2. **Never trust the browser** for prices, totals or stock. Always re-read from the DB on the server.
3. `SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_SECRET_KEY` are server-only. Files that use them
   must `import "server-only"`. Never prefix them with `NEXT_PUBLIC_`.
4. Schema changes go in a NEW numbered file in `supabase/migrations/` (e.g. `0002_add_categories.sql`).
   Never edit a migration that has already been applied to production.
5. Money is stored as integer cents (`price_cents`). Never use floats for money.
6. This Next.js version differs from older docs — check `node_modules/next/dist/docs/` before using an API.

## Workflow
- One Linear issue = one branch = one PR. Branch name: use Linear's "Copy git branch name"
  (e.g. `pea-12-add-product-search`) so Linear links the PR automatically.
- Put the Linear issue ID (e.g. `PEA-12`) in the PR title.
- Before opening a PR, run: `npm run lint && npx tsc --noEmit && npm run build`.
- Keep PRs small and focused on the issue. Don't refactor unrelated code.
