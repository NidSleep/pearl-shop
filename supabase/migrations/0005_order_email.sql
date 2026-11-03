begin;

-- Also acts as an atomic send claim. Failed sends clear their own claim.
-- Existing RLS/grants keep this accessible only to the service role.
alter table public.orders add column confirmation_email_sent_at timestamptz;

commit;
