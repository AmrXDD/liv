-- Conversion tracking: keep the campaign tags (UTM) with each order, and let the
-- order confirmation page read the order's own id, total and currency.
--
-- Run BEFORE deploying the updated create-checkout-session function: that function
-- writes orders.utm, so the column must exist first.
--
-- Safe to run while the site is live. Idempotent: safe to re-run.

-- 1. Campaign tags for each order, e.g. {"utm_source":"instagram","utm_medium":"dm","utm_campaign":"quiz_balloon"}.
--    Existing orders get an empty {}. (quiz_leads already has the same column.)
alter table public.orders
  add column if not exists utm jsonb not null default '{}'::jsonb;

-- 2. The confirmation page needs id, total and currency to report the purchase once,
--    with the real amount. Same function as security_fix_orders_2026_09_23.sql with
--    those three fields added. Still one order only, looked up by its exact Stripe
--    session id. The campaign tags are NOT returned to the browser.
create or replace function public.get_order_confirmation(p_session_id text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_order     jsonb;
  v_downloads jsonb;
begin
  -- Stripe Checkout session ids look like cs_live_… / cs_test_… (60+ chars).
  if p_session_id is null or p_session_id !~ '^cs_(live|test)_[A-Za-z0-9]{20,}$' then
    return null;
  end if;

  select jsonb_build_object(
           'id',               o.id,
           'name',             o.name,
           'status',           o.status,
           'items',            o.items,
           'total',            o.total,
           'currency',         o.currency,
           'has_physical',     o.has_physical,
           'shipping_address', o.shipping_address
         )
    into v_order
    from orders o
   where o.stripe_session_id = p_session_id
   limit 1;

  select coalesce(jsonb_agg(jsonb_build_object(
           'id',                  d.id,
           'product_slug',        d.product_slug,
           'download_url',        d.download_url,
           'download_expires_at', d.download_expires_at
         )), '[]'::jsonb)
    into v_downloads
    from digital_orders d
   where d.stripe_session_id = p_session_id
     and (d.download_expires_at is null or d.download_expires_at > now());

  return jsonb_build_object('order', v_order, 'downloads', v_downloads);
end;
$$;

revoke all on function public.get_order_confirmation(text) from public;
grant execute on function public.get_order_confirmation(text) to anon, authenticated;

notify pgrst, 'reload schema';
