begin;

alter table public.orders
  add column shipping_cents integer not null default 0 check (shipping_cents >= 0),
  add column amount_paid_cents integer check (amount_paid_cents >= 0);

-- Existing paid orders predate shipping fees. total_cents remains the item subtotal.
update public.orders set amount_paid_cents = total_cents where status = 'paid';

-- Replace the old signature, rather than leaving an unsafe callable overload.
drop function public.mark_order_paid(text, text, text, text, jsonb);
create or replace function public.mark_order_paid(
  p_session_id        text,
  p_payment_intent_id text,
  p_customer_email    text,
  p_customer_name     text,
  p_shipping_address jsonb,
  p_shipping_cents    integer,
  p_amount_paid_cents integer
)
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_order orders%rowtype;
  v_item  order_items%rowtype;
  v_short boolean := false;
begin
  select * into v_order from orders
  where stripe_session_id = p_session_id for update;

  if not found then return 'not_found'; end if;
  if v_order.status = 'paid' then return 'already_paid'; end if;
  if v_order.status not in ('pending', 'failed') then return v_order.status::text; end if;

  if p_shipping_cents is null or p_shipping_cents < 0
     or p_amount_paid_cents is null or p_amount_paid_cents < p_shipping_cents then
    raise exception 'Invalid payment amounts';
  end if;

  for v_item in select * from order_items where order_id = v_order.id loop
    update products set stock = stock - v_item.quantity
    where id = v_item.product_id and stock >= v_item.quantity;
    if not found then v_short := true; end if;
  end loop;

  update orders
  set status = 'paid',
      paid_at = now(),
      stripe_payment_intent_id = p_payment_intent_id,
      customer_email = p_customer_email,
      customer_name = p_customer_name,
      shipping_address = p_shipping_address,
      shipping_cents = p_shipping_cents,
      amount_paid_cents = p_amount_paid_cents,
      needs_attention = v_short
  where id = v_order.id;

  return 'paid';
end;
$$;

revoke execute on function public.mark_order_paid(text, text, text, text, jsonb, integer, integer) from public, anon, authenticated;
grant execute on function public.mark_order_paid(text, text, text, text, jsonb, integer, integer) to service_role;

commit;
