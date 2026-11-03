begin;

-- Existing RLS/grants keep this accessible only to the service role.
alter table public.orders
  add column confirmation_email_sent_at timestamptz,
  add column confirmation_email_claimed_at timestamptz;

-- Use the database clock and one UPDATE so concurrent Stripe deliveries cannot
-- both acquire the lease. A lost RPC response or crashed worker expires in 15m.
-- Return the timestamp as an ownership token for completion/release.
create function public.claim_order_confirmation(p_order_id uuid)
returns table (id uuid, confirmation_email_claimed_at timestamptz)
language sql
security invoker
set search_path = public
as $$
  update public.orders as o
  set confirmation_email_claimed_at = now()
  where o.id = p_order_id
    and o.status = 'paid'
    and o.confirmation_email_sent_at is null
    and (o.confirmation_email_claimed_at is null
      or o.confirmation_email_claimed_at < now() - interval '15 minutes')
  returning o.id, o.confirmation_email_claimed_at;
$$;

-- p_sent is true only after Resend success; false releases a failed send.
-- An expired worker cannot finish or release a newer worker's lease.
create function public.finish_order_confirmation(
  p_order_id uuid,
  p_claimed_at timestamptz,
  p_sent boolean
)
returns table (id uuid)
language sql
security invoker
set search_path = public
as $$
  update public.orders as o
  set confirmation_email_sent_at = case when p_sent then now() else o.confirmation_email_sent_at end,
      confirmation_email_claimed_at = null
  where o.id = p_order_id
    and o.confirmation_email_sent_at is null
    and o.confirmation_email_claimed_at = p_claimed_at
  returning o.id;
$$;

revoke execute on function public.claim_order_confirmation(uuid) from public, anon, authenticated;
grant execute on function public.claim_order_confirmation(uuid) to service_role;
revoke execute on function public.finish_order_confirmation(uuid, timestamptz, boolean) from public, anon, authenticated;
grant execute on function public.finish_order_confirmation(uuid, timestamptz, boolean) to service_role;

commit;
