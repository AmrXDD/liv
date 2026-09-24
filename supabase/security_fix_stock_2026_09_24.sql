-- Security fix: stop the public (anon) key from lowering product stock.
--
-- decrement_product_stock is SECURITY DEFINER and had the default PUBLIC
-- execute grant, so anyone could call /rest/v1/rpc/decrement_product_stock
-- and zero out stock without paying. Only the stripe-webhook edge function
-- (service role) calls it.
--
-- Applied to production 2026-09-24. Idempotent — safe to re-run.

alter function public.decrement_product_stock(uuid, integer) set search_path = public;
revoke all on function public.decrement_product_stock(uuid, integer) from public, anon, authenticated;
grant execute on function public.decrement_product_stock(uuid, integer) to service_role;

notify pgrst, 'reload schema';
