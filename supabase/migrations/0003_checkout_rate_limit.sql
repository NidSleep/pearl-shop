begin;

create table public.checkout_rate_limits (
  key          text        not null check (length(key) = 64),  -- hex HMAC
  window_start timestamptz not null,
  hits         integer     not null default 0,
  primary key (key, window_start)
);
create index checkout_rate_limits_window_start_idx on public.checkout_rate_limits (window_start);

alter table public.checkout_rate_limits enable row level security;  -- no policies
revoke all on public.checkout_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on public.checkout_rate_limits to service_role;

-- Returns one row: allowed, retry_after_seconds (positive int, only meaningful when not allowed).
create or replace function public.check_checkout_rate_limit(p_key text)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  c_limit   constant integer := 5;
  c_window  constant integer := 600;  -- seconds
  v_now     timestamptz := pg_catalog.now();
  v_window  timestamptz;
  v_hits    integer;
begin
  if p_key is null or pg_catalog.length(p_key) <> 64 then
    raise exception 'invalid rate limit key';
  end if;

  -- EXTRACT is special SQL syntax: must stay unqualified (resolves to pg_catalog even with search_path = '').
  v_window := pg_catalog.to_timestamp(
    pg_catalog.floor(extract(epoch from v_now) / c_window) * c_window);

  insert into public.checkout_rate_limits as r (key, window_start, hits)
  values (p_key, v_window, 1)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning r.hits into v_hits;

  allowed := v_hits <= c_limit;
  retry_after_seconds := greatest(1, pg_catalog.ceil(
    extract(epoch from (v_window + pg_catalog.make_interval(secs => c_window) - v_now)))::integer);
  return next;
end;
$$;

revoke execute on function public.check_checkout_rate_limit(text) from public, anon, authenticated;
grant  execute on function public.check_checkout_rate_limit(text) to service_role;

-- Retention: hourly, bounded batch, outside request transactions.
-- Returns rows deleted. 50k/run is far above this shop's expected volume
-- (distinct IPs × 6 windows/hour); if a run hits the cap, the next run continues.
create or replace function public.prune_checkout_rate_limits()
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  delete from public.checkout_rate_limits
  where ctid in (
    select ctid from public.checkout_rate_limits
    where window_start < pg_catalog.now() - interval '24 hours'
    limit 50000
  );
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;
revoke execute on function public.prune_checkout_rate_limits() from public, anon, authenticated;

-- Job runs as the migration user (`postgres` via SQL Editor), which owns the
-- table: owners are not subject to RLS (no FORCE ROW LEVEL SECURITY), so the
-- invoker function can delete. No SECURITY DEFINER needed.
create extension if not exists pg_cron;
select cron.schedule('prune-checkout-rate-limits', '7 * * * *', 'select public.prune_checkout_rate_limits()');

commit;
