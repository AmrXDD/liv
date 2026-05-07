-- =============================================================
-- Storage buckets + RLS policies (idempotent)
-- Buckets used: product-images, collection-images, page-images, blog-images
-- Public read for everyone, write/update/delete for signed-in admins.
-- =============================================================

-- 1. Make sure the buckets exist and are public-read.
insert into storage.buckets (id, name, public)
values
  ('product-images',    'product-images',    true),
  ('collection-images', 'collection-images', true),
  ('page-images',       'page-images',       true),
  ('blog-images',       'blog-images',       true)
on conflict (id) do update set public = excluded.public;

-- 2. Drop any older policies we will replace.
drop policy if exists "lf_buckets_read"   on storage.objects;
drop policy if exists "lf_buckets_insert" on storage.objects;
drop policy if exists "lf_buckets_update" on storage.objects;
drop policy if exists "lf_buckets_delete" on storage.objects;

-- 3. Public read on the four buckets.
create policy "lf_buckets_read"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id in ('product-images', 'collection-images', 'page-images', 'blog-images')
);

-- 4. Signed-in users (admin) can upload/update/delete.
create policy "lf_buckets_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('product-images', 'collection-images', 'page-images', 'blog-images')
);

create policy "lf_buckets_update"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('product-images', 'collection-images', 'page-images', 'blog-images')
)
with check (
  bucket_id in ('product-images', 'collection-images', 'page-images', 'blog-images')
);

create policy "lf_buckets_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('product-images', 'collection-images', 'page-images', 'blog-images')
);
