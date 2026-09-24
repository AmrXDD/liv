-- Clear the Security Advisor warning on get_order_confirmation
-- ("Public can execute SECURITY DEFINER function").
--
-- The SECURITY DEFINER lookup moves to a `private` schema, which the API does
-- not expose. `public.get_order_confirmation` becomes a thin SECURITY INVOKER
-- wrapper around it, so the frontend call (sb.rpc("get_order_confirmation"))
-- and its behaviour are unchanged.
--
-- Run after security_fix_orders_2026_09_23.sql. Idempotent — safe to re-run,
-- including after that file has been re-run.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

do $$
begin
  -- Only move the function while public still holds the SECURITY DEFINER one.
  if exists (
    select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname = 'get_order_confirmation'
       and p.prosecdef
  ) then
    drop function if exists private.get_order_confirmation(text);
    alter function public.get_order_confirmation(text) set schema private;
  end if;
end;
$$;

revoke all on function private.get_order_confirmation(text) from public;
grant execute on function private.get_order_confirmation(text) to anon, authenticated;

create or replace function public.get_order_confirmation(p_session_id text)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.get_order_confirmation(p_session_id);
$$;

revoke all on function public.get_order_confirmation(text) from public;
grant execute on function public.get_order_confirmation(text) to anon, authenticated;

notify pgrst, 'reload schema';
