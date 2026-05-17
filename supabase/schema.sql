-- =============================================================
-- Liv Functional — Supabase schema
-- Run in the SQL Editor (or via supabase db reset --linked).
-- Idempotent: safe to re-run.
-- =============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ---------- ENUMS ----------
do $$ begin
  create type lf_locale as enum ('en', 'ar');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lf_product_category as enum ('diy', 'coaching');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lf_booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');
exception when duplicate_object then null; end $$;

-- ---------- HELPERS ----------
create or replace function lf_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------- PRODUCTS ----------
create table if not exists products (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  category        lf_product_category not null,
  title_en        text not null,
  title_ar        text not null,
  tagline_en      text,
  tagline_ar      text,
  description_en  text,
  description_ar  text,
  long_en         text,
  long_ar         text,
  price           numeric(10,2) not null,
  currency        text not null default 'USD',
  duration_en     text,
  duration_ar     text,
  format          text,
  badge_en        text,
  badge_ar        text,
  hero_image      text,
  images          jsonb not null default '[]'::jsonb, -- gallery URLs
  accent          text,
  outcomes        jsonb default '[]'::jsonb,          -- [{en, ar}]
  inclusions      jsonb default '[]'::jsonb,
  download_url    text,
  is_published    boolean not null default true,
  position        integer not null default 0,
  -- Physical-product attributes (only meaningful when format = 'Physical')
  sku             text,
  weight_grams    integer,
  length_cm       numeric(6,2),
  width_cm        numeric(6,2),
  height_cm       numeric(6,2),
  stock           integer,
  requires_shipping boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table products add column if not exists sku text;
alter table products add column if not exists weight_grams integer;
alter table products add column if not exists length_cm numeric(6,2);
alter table products add column if not exists width_cm numeric(6,2);
alter table products add column if not exists height_cm numeric(6,2);
alter table products add column if not exists stock integer;
alter table products add column if not exists requires_shipping boolean not null default false;
create index if not exists products_category_idx on products(category, is_published, position);
drop trigger if exists trg_products_updated on products;
create trigger trg_products_updated before update on products
  for each row execute function lf_set_updated_at();

-- ---------- COLLECTIONS ----------
create table if not exists collections (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title_en        text not null,
  title_ar        text not null,
  description_en  text,
  description_ar  text,
  cover_image     text,
  accent          text default 'forest',
  is_published    boolean not null default true,
  position        integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists collections_published_idx on collections(is_published, position);
drop trigger if exists trg_collections_updated on collections;
create trigger trg_collections_updated before update on collections
  for each row execute function lf_set_updated_at();

-- ---------- COLLECTION ↔ PRODUCT (many-to-many) ----------
create table if not exists collection_products (
  collection_id uuid not null references collections(id) on delete cascade,
  product_id    uuid not null references products(id) on delete cascade,
  position      integer not null default 0,
  created_at    timestamptz not null default now(),
  primary key (collection_id, product_id)
);
create index if not exists cp_collection_idx on collection_products(collection_id, position);
create index if not exists cp_product_idx    on collection_products(product_id);

-- ---------- PAGES (dynamic, block-based) ----------
create table if not exists pages (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title_en        text not null,
  title_ar        text not null,
  description_en  text,
  description_ar  text,
  blocks          jsonb not null default '[]'::jsonb, -- ordered blocks
  is_published    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists pages_published_idx on pages(is_published);
drop trigger if exists trg_pages_updated on pages;
create trigger trg_pages_updated before update on pages
  for each row execute function lf_set_updated_at();

-- ---------- BLOG POSTS ----------
create table if not exists posts (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  title_en         text not null,
  title_ar         text not null,
  excerpt_en       text,
  excerpt_ar       text,
  content_en       text,
  content_ar       text,
  category         text,
  author           text,
  hero_image       text,
  reading_minutes  integer default 5,
  featured         boolean default false,
  is_published     boolean default true,
  published_at     timestamptz default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists posts_published_idx on posts(is_published, published_at desc);
create index if not exists posts_category_idx on posts(category);
drop trigger if exists trg_posts_updated on posts;
create trigger trg_posts_updated before update on posts
  for each row execute function lf_set_updated_at();

-- ---------- TESTIMONIALS ----------
create table if not exists testimonials (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  location    text,
  quote_en    text not null,
  quote_ar    text not null,
  result_en   text,
  result_ar   text,
  avatar      text,
  position    integer not null default 0,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists testimonials_visible_idx on testimonials(is_visible, position);

-- ---------- BOOKINGS / CONTACTS / NEWSLETTER / DIGITAL ORDERS ----------
create table if not exists bookings (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  date        date not null,
  time        text not null,
  topic       text,
  message     text,
  locale      lf_locale not null default 'en',
  status      lf_booking_status not null default 'pending',
  google_event_id text,
  ip          inet,
  user_agent  text,
  created_at  timestamptz not null default now()
);
create index if not exists bookings_date_idx on bookings(date, time);
create index if not exists bookings_email_idx on bookings(lower(email));

create table if not exists contacts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text not null,
  subject     text,
  message     text not null,
  locale      lf_locale not null default 'en',
  ip          inet,
  user_agent  text,
  created_at  timestamptz not null default now()
);
alter table contacts add column if not exists phone text;
update contacts set phone = '' where phone is null;
alter table contacts alter column phone set not null;
alter table contacts add column if not exists nutrition_issues text[] not null default '{}';
create index if not exists contacts_email_idx on contacts(lower(email));

create table if not exists newsletter (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  locale      lf_locale not null default 'en',
  unsubscribed_at timestamptz,
  source      text,
  created_at  timestamptz not null default now()
);

-- ---------- ORDERS (cart checkout) ----------
create table if not exists orders (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  name         text not null,
  phone        text,
  items        jsonb not null default '[]'::jsonb, -- [{product_id, slug, title_en, title_ar, price, currency, quantity, hero_image}]
  subtotal     numeric(10,2) not null default 0,
  total        numeric(10,2) not null default 0,
  currency     text not null default 'USD',
  notes        text,
  status       text not null default 'pending', -- pending, paid, fulfilled, cancelled, refunded
  payment_ref  text,
  locale       lf_locale not null default 'en',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists orders_email_idx  on orders(lower(email));
create index if not exists orders_status_idx on orders(status, created_at desc);
drop trigger if exists trg_orders_updated on orders;
create trigger trg_orders_updated before update on orders
  for each row execute function lf_set_updated_at();

create table if not exists digital_orders (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  product_slug  text not null references products(slug) on update cascade,
  locale        lf_locale not null default 'en',
  amount_paid   numeric(10,2),
  payment_ref   text,
  download_url  text,
  download_expires_at timestamptz,
  fulfilled     boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists digital_orders_email_idx on digital_orders(lower(email));
create index if not exists digital_orders_product_idx on digital_orders(product_slug);

-- =============================================================
-- ROW LEVEL SECURITY
-- Pattern: anon can read published rows; authenticated users
-- (admins) can do everything. The admin user is created in the
-- Supabase dashboard (Auth → Users → Add user). Any signed-in
-- user is treated as an admin in this project.
-- =============================================================

alter table products            enable row level security;
alter table collections         enable row level security;
alter table collection_products enable row level security;
alter table pages               enable row level security;
alter table posts               enable row level security;
alter table testimonials        enable row level security;
alter table bookings            enable row level security;
alter table contacts            enable row level security;
alter table newsletter          enable row level security;
alter table orders              enable row level security;
alter table digital_orders      enable row level security;

-- ---- PRODUCTS ----
drop policy if exists "products read"  on products;
drop policy if exists "products admin" on products;
create policy "products read"
  on products for select
  using (is_published = true or auth.role() = 'authenticated');
create policy "products admin"
  on products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---- COLLECTIONS ----
drop policy if exists "collections read"  on collections;
drop policy if exists "collections admin" on collections;
create policy "collections read"
  on collections for select
  using (is_published = true or auth.role() = 'authenticated');
create policy "collections admin"
  on collections for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---- COLLECTION_PRODUCTS ----
drop policy if exists "cp read"  on collection_products;
drop policy if exists "cp admin" on collection_products;
create policy "cp read"
  on collection_products for select
  using (true);
create policy "cp admin"
  on collection_products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---- PAGES ----
drop policy if exists "pages read"  on pages;
drop policy if exists "pages admin" on pages;
create policy "pages read"
  on pages for select
  using (is_published = true or auth.role() = 'authenticated');
create policy "pages admin"
  on pages for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---- POSTS ----
drop policy if exists "posts read"  on posts;
drop policy if exists "posts admin" on posts;
create policy "posts read"
  on posts for select
  using (is_published = true or auth.role() = 'authenticated');
create policy "posts admin"
  on posts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---- TESTIMONIALS ----
drop policy if exists "testimonials read"  on testimonials;
drop policy if exists "testimonials admin" on testimonials;
create policy "testimonials read"
  on testimonials for select
  using (is_visible = true or auth.role() = 'authenticated');
create policy "testimonials admin"
  on testimonials for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---- WRITE-ONLY FORMS (anon insert; admin manages) ----
drop policy if exists "bookings insert" on bookings;
drop policy if exists "bookings admin"  on bookings;
create policy "bookings insert" on bookings for insert with check (true);
create policy "bookings admin"  on bookings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "contacts insert" on contacts;
drop policy if exists "contacts admin"  on contacts;
create policy "contacts insert" on contacts for insert with check (true);
create policy "contacts admin"  on contacts for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "newsletter insert" on newsletter;
drop policy if exists "newsletter admin"  on newsletter;
create policy "newsletter insert" on newsletter for insert with check (true);
create policy "newsletter admin"  on newsletter for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "orders insert" on orders;
drop policy if exists "orders admin"  on orders;
create policy "orders insert" on orders for insert with check (true);
create policy "orders admin"  on orders for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "digital_orders insert" on digital_orders;
drop policy if exists "digital_orders admin"  on digital_orders;
create policy "digital_orders insert" on digital_orders for insert with check (true);
create policy "digital_orders admin"  on digital_orders for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- =============================================================
-- STORAGE BUCKETS
-- Create three public buckets. Public read; authenticated users
-- can upload / update / delete.
-- =============================================================

insert into storage.buckets (id, name, public)
values
  ('product-images',    'product-images',    true),
  ('collection-images', 'collection-images', true),
  ('page-images',       'page-images',       true)
on conflict (id) do update set public = excluded.public;

-- Storage policies live on storage.objects; RLS is enabled by default.
drop policy if exists "lf storage public read"  on storage.objects;
drop policy if exists "lf storage admin write"  on storage.objects;
drop policy if exists "lf storage admin update" on storage.objects;
drop policy if exists "lf storage admin delete" on storage.objects;

create policy "lf storage public read"
  on storage.objects for select
  using (bucket_id in ('product-images', 'collection-images', 'page-images'));

create policy "lf storage admin write"
  on storage.objects for insert
  with check (
    bucket_id in ('product-images', 'collection-images', 'page-images')
    and auth.role() = 'authenticated'
  );

create policy "lf storage admin update"
  on storage.objects for update
  using (
    bucket_id in ('product-images', 'collection-images', 'page-images')
    and auth.role() = 'authenticated'
  );

create policy "lf storage admin delete"
  on storage.objects for delete
  using (
    bucket_id in ('product-images', 'collection-images', 'page-images')
    and auth.role() = 'authenticated'
  );
