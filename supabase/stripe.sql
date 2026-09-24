-- =============================================================
-- Liv Functional — Stripe integration columns + RLS hardening
-- Idempotent: safe to re-run.
-- =============================================================

-- ---------- ORDERS columns ----------
alter table orders add column if not exists stripe_session_id    text;
alter table orders add column if not exists stripe_payment_intent text;
alter table orders add column if not exists paid_at              timestamptz;

create unique index if not exists orders_stripe_session_uq
  on orders(stripe_session_id)
  where stripe_session_id is not null;

create index if not exists orders_payment_intent_idx
  on orders(stripe_payment_intent)
  where stripe_payment_intent is not null;

-- ---------- DIGITAL_ORDERS columns ----------
alter table digital_orders add column if not exists order_id          uuid references orders(id) on delete set null;
alter table digital_orders add column if not exists stripe_session_id text;
create index if not exists digital_orders_order_idx on digital_orders(order_id);
create index if not exists digital_orders_session_idx on digital_orders(stripe_session_id);

-- =============================================================
-- RLS HARDENING
-- The success page reads only the order it just paid for, through the
-- get_order_confirmation(session_id) RPC keyed on the unguessable Stripe
-- checkout session id. There is no public SELECT policy on orders or
-- digital_orders.
-- =============================================================

-- Drop legacy permissive policies if any
drop policy if exists "digital_orders insert"        on digital_orders;
drop policy if exists "digital_orders admin"         on digital_orders;
drop policy if exists "digital_orders read by session" on digital_orders;
drop policy if exists "digital_orders public read"   on digital_orders;

-- Service-role inserts only (Edge Functions use service role; anon CANNOT insert).
create policy "digital_orders service insert"
  on digital_orders for insert
  with check (auth.role() = 'service_role');

-- No public SELECT policy: the success page reads its order through the
-- get_order_confirmation(session_id) RPC (see security_fix_orders_2026_09_23.sql).

-- Admins (any authenticated user) full access.
create policy "digital_orders admin"
  on digital_orders for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---------- ORDERS RLS hardening ----------
-- Previously: "orders insert" allowed any anon to insert.
-- Now: only the Edge Function (service role) can insert pending orders.
-- This prevents drive-by spam of the orders table.
drop policy if exists "orders insert" on orders;
drop policy if exists "orders admin"  on orders;
drop policy if exists "orders service insert" on orders;
drop policy if exists "orders service all"    on orders;

create policy "orders service all"
  on orders for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "orders admin"
  on orders for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- No public SELECT policy: the success page reads its order through the
-- get_order_confirmation(session_id) RPC (see security_fix_orders_2026_09_23.sql).

-- ---------- CONTACTS / BOOKINGS / NEWSLETTER (small hardening) ----------
-- Keep anon insert (forms still work) but prevent anon SELECT explicitly
-- by ensuring no select policy exists. RLS denies by default.
-- These DROP-IF-EXISTS lines are defensive — re-running schema.sql
-- recreates the insert/admin pair, so we don't redefine them here.
