-- Security fix: stop the public (anon) key from reading every order.
--
-- The "orders read by session" / "digital_orders read by session" policies
-- only checked `stripe_session_id is not null`, so anyone holding the public
-- anon key could list ALL orders (names, emails, shipping addresses) and all
-- live download links. They are replaced by a SECURITY DEFINER function that
-- returns one order, looked up by its exact Stripe Checkout session id, with
-- only the fields the /checkout/success page needs.
--
-- Safe to run while the site is live: payments, the Stripe webhook and emails
-- use the service role and are unaffected. Until the matching frontend change
-- (CheckoutSuccessPage -> rpc get_order_confirmation) is deployed, the success
-- page shows its generic "Thank you" message without order details.
--
-- Idempotent — safe to re-run.

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
           'name',             o.name,
           'status',           o.status,
           'items',            o.items,
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

-- Remove the policies that exposed every row to the anon key.
drop policy if exists "orders read by session"         on public.orders;
drop policy if exists "digital_orders read by session" on public.digital_orders;

notify pgrst, 'reload schema';
