-- Pearl Shop: initial schema
-- Run this in Supabase Dashboard → SQL Editor (or with the Supabase CLI).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type order_status as enum ('pending', 'paid', 'failed', 'cancelled');

create type pearl_type as enum ('akoya', 'freshwater', 'south_sea', 'tahitian', 'other');

-- ---------------------------------------------------------------------------
-- Helper: keep updated_at fresh
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
create table products (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  description  text,
  pearl_type   pearl_type not null default 'freshwater',
  size_mm      numeric(4, 1),          -- pearl diameter, e.g. 8.5
  luster       text,                   -- e.g. 'AAA', 'AA', 'A'
  origin       text,                   -- e.g. 'Japan', 'Australia'
  price_cents  integer not null check (price_cents > 0),  -- 1 MYR = 100 cents
  currency     text not null default 'myr',
  stock        integer not null default 0 check (stock >= 0),
  image_url    text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger products_updated_at
  before update on products
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create table orders (
  id                        uuid primary key default gen_random_uuid(),
  status                    order_status not null default 'pending',
  total_cents               integer not null check (total_cents >= 0),
  currency                  text not null default 'myr',
  stripe_session_id         text unique,
  stripe_payment_intent_id  text,
  customer_email            text,
  customer_name             text,
  shipping_address          jsonb,
  -- Set when payment succeeded but stock ran out in the meantime.
  -- Someone needs to contact the customer (refund or restock).
  needs_attention           boolean not null default false,
  paid_at                   timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index orders_status_idx on orders (status);

create trigger orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

create table order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references orders (id) on delete cascade,
  product_id        uuid not null references products (id),
  -- Snapshot at purchase time, so later product edits don't change old orders.
  product_name      text not null,
  unit_price_cents  integer not null check (unit_price_cents > 0),
  quantity          integer not null check (quantity > 0)
);

create index order_items_order_id_idx on order_items (order_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
--   * Anyone may read active products.
--   * Orders are NOT readable/writable from the browser at all.
--     Only the server (service role key) touches them.
-- ---------------------------------------------------------------------------
alter table products    enable row level security;
alter table orders      enable row level security;
alter table order_items enable row level security;

-- Explicit grants (Supabase usually adds these by default; being explicit is safer).
grant select on products to anon, authenticated;
revoke all on orders, order_items from anon, authenticated;
grant all on products, orders, order_items to service_role;

create policy "Public can read active products"
  on products for select
  to anon, authenticated
  using (is_active = true);

-- ---------------------------------------------------------------------------
-- mark_order_paid: called by the Stripe webhook.
--   * Idempotent: Stripe may deliver the same event more than once.
--   * Runs in one transaction: order status + stock change together.
-- Returns: 'paid' | 'already_paid' | 'not_found' | '<other current status>'
-- ---------------------------------------------------------------------------
create or replace function mark_order_paid(
  p_session_id        text,
  p_payment_intent_id text,
  p_customer_email    text,
  p_customer_name     text,
  p_shipping_address  jsonb
)
returns text
language plpgsql
set search_path = public
as $$
declare
  v_order  orders%rowtype;
  v_item   order_items%rowtype;
  v_short  boolean := false;
begin
  -- Lock the order row so two concurrent webhook deliveries can't both process it.
  select * into v_order
  from orders
  where stripe_session_id = p_session_id
  for update;

  if not found then
    return 'not_found';
  end if;

  if v_order.status = 'paid' then
    return 'already_paid';
  end if;

  if v_order.status not in ('pending', 'failed') then
    return v_order.status::text;
  end if;

  for v_item in
    select * from order_items where order_id = v_order.id
  loop
    update products
       set stock = stock - v_item.quantity
     where id = v_item.product_id
       and stock >= v_item.quantity;

    if not found then
      v_short := true;  -- oversold: flag it, never let stock go negative
    end if;
  end loop;

  update orders
     set status                   = 'paid',
         paid_at                  = now(),
         stripe_payment_intent_id = p_payment_intent_id,
         customer_email           = p_customer_email,
         customer_name            = p_customer_name,
         shipping_address         = p_shipping_address,
         needs_attention          = v_short
   where id = v_order.id;

  return 'paid';
end;
$$;

-- Postgres lets everyone execute functions by default. Lock it down so only
-- the server (service_role) can call it.
revoke execute on function mark_order_paid(text, text, text, text, jsonb) from public, anon, authenticated;
grant  execute on function mark_order_paid(text, text, text, text, jsonb) to service_role;
