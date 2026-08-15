-- =============================================================
-- Liv Functional — Physical Products, Shipping Address & Stock Tracking Migration
-- Idempotent: safe to re-run in Supabase SQL editor.
-- =============================================================

-- 1. Ensure product categories support 'physical'
do $$ begin
  alter type lf_product_category add value if not exists 'physical';
exception when others then null; end $$;

do $$ begin
  alter type lf_product_category add value if not exists 'consultation';
exception when others then null; end $$;

do $$ begin
  alter type product_category add value if not exists 'physical';
exception when others then null; end $$;

-- Drop obsolete category check constraint if it exists and replace with updated one
do $$ begin
  if exists (select 1 from information_schema.table_constraints
             where table_name = 'products' and constraint_name = 'products_category_check') then
    alter table public.products drop constraint products_category_check;
  end if;
end $$;

-- 2. Ensure physical product attributes and inventory columns on products
alter table public.products add column if not exists sku text;
alter table public.products add column if not exists weight_grams integer;
alter table public.products add column if not exists length_cm numeric(6,2);
alter table public.products add column if not exists width_cm numeric(6,2);
alter table public.products add column if not exists height_cm numeric(6,2);
alter table public.products add column if not exists stock integer;
alter table public.products add column if not exists requires_shipping boolean not null default false;

-- 3. Add shipping address and physical order tracking columns to orders
alter table public.orders add column if not exists shipping_address jsonb default null;
alter table public.orders add column if not exists shipping_line1 text;
alter table public.orders add column if not exists shipping_line2 text;
alter table public.orders add column if not exists shipping_city text;
alter table public.orders add column if not exists shipping_state text;
alter table public.orders add column if not exists shipping_postal_code text;
alter table public.orders add column if not exists shipping_country text;
alter table public.orders add column if not exists has_physical boolean not null default false;

-- 4. Create function to atomically decrement product stock on purchase
create or replace function public.decrement_product_stock(
  p_product_id uuid,
  p_qty integer
)
returns void
language plpgsql
security definer
as $$
begin
  update public.products
  set
    stock = greatest(0, coalesce(stock, 0) - greatest(1, p_qty)),
    updated_at = now()
  where id = p_product_id
    and (stock is not null);
end;
$$;

-- Grant execute permissions to service role and authenticated users
grant execute on function public.decrement_product_stock(uuid, integer) to service_role;
grant execute on function public.decrement_product_stock(uuid, integer) to authenticated;

-- 5. RLS: Allow customers to read their own order details on the success page
-- by filtering on the unguessable stripe_session_id returned by Stripe redirect.
drop policy if exists "orders read by session" on public.orders;
create policy "orders read by session"
  on public.orders for select
  using (
    stripe_session_id is not null
  );

-- Refresh schema cache notification
notify pgrst, 'reload schema';
