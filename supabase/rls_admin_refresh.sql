-- Refresh admin RLS policies for tables touched by the page builder.
-- Replaces `auth.role() = 'authenticated'` with `auth.uid() is not null`,
-- which is more tolerant when the JWT is forwarded via PostgREST and the
-- role claim is occasionally missing on the request — that mismatch is what
-- was throwing "new row violates row-level security policy" when admins
-- added a coaching widget (which inserts into `pages.blocks`).
--
-- Safe to re-run. Apply via:
--   supabase db push   (or paste into the SQL editor)

-- ---- PAGES ----
drop policy if exists "pages admin" on pages;
create policy "pages admin"
  on pages for all
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ---- PRODUCTS ----
drop policy if exists "products admin" on products;
create policy "products admin"
  on products for all
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ---- COLLECTIONS ----
drop policy if exists "collections admin" on collections;
create policy "collections admin"
  on collections for all
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ---- COLLECTION_PRODUCTS ----
drop policy if exists "cp admin" on collection_products;
create policy "cp admin"
  on collection_products for all
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
