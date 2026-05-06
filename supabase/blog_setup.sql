-- ============================================================
-- BLOG SETUP — table, indexes, RLS, and storage bucket
-- Safe to run multiple times (idempotent).
-- ============================================================

-- 1) Table -----------------------------------------------------
create table if not exists public.blog_posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title_en        text not null default '',
  title_ar        text not null default '',
  excerpt_en      text,
  excerpt_ar      text,
  content_en      text,
  content_ar      text,
  category        text not null default 'metabolic',
  author          text not null default 'Reham Alsharif',
  hero_image      text,
  reading_minutes integer not null default 5,
  is_featured     boolean not null default false,
  is_published    boolean not null default true,
  published_at    date    not null default current_date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Add columns if table existed in an older shape
alter table public.blog_posts add column if not exists title_en        text not null default '';
alter table public.blog_posts add column if not exists title_ar        text not null default '';
alter table public.blog_posts add column if not exists excerpt_en      text;
alter table public.blog_posts add column if not exists excerpt_ar      text;
alter table public.blog_posts add column if not exists content_en      text;
alter table public.blog_posts add column if not exists content_ar      text;
alter table public.blog_posts add column if not exists category        text not null default 'metabolic';
alter table public.blog_posts add column if not exists author          text not null default 'Reham Alsharif';
alter table public.blog_posts add column if not exists hero_image      text;
alter table public.blog_posts add column if not exists reading_minutes integer not null default 5;
alter table public.blog_posts add column if not exists is_featured     boolean not null default false;
alter table public.blog_posts add column if not exists is_published    boolean not null default true;
alter table public.blog_posts add column if not exists published_at    date    not null default current_date;
alter table public.blog_posts add column if not exists created_at      timestamptz not null default now();
alter table public.blog_posts add column if not exists updated_at      timestamptz not null default now();

create index if not exists idx_blog_posts_published_at on public.blog_posts (published_at desc);
create index if not exists idx_blog_posts_category     on public.blog_posts (category);
create index if not exists idx_blog_posts_is_published on public.blog_posts (is_published);

-- 2) updated_at trigger ----------------------------------------
create or replace function public.tg_blog_posts_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at
  before update on public.blog_posts
  for each row execute procedure public.tg_blog_posts_set_updated_at();

-- 3) RLS -------------------------------------------------------
alter table public.blog_posts enable row level security;

-- Public can read only published posts
drop policy if exists "blog_posts public read published" on public.blog_posts;
create policy "blog_posts public read published"
  on public.blog_posts for select
  to anon, authenticated
  using (is_published = true);

-- Authenticated (admin) can read every row
drop policy if exists "blog_posts admin read all" on public.blog_posts;
create policy "blog_posts admin read all"
  on public.blog_posts for select
  to authenticated
  using (true);

-- Authenticated can insert / update / delete (admin UI is gated by ProtectedRoute)
drop policy if exists "blog_posts admin write" on public.blog_posts;
create policy "blog_posts admin write"
  on public.blog_posts for all
  to authenticated
  using (true)
  with check (true);

-- 4) Storage bucket for blog hero images -----------------------
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = excluded.public;

-- Storage policies (public read, authenticated write)
drop policy if exists "blog-images public read"  on storage.objects;
create policy "blog-images public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'blog-images');

drop policy if exists "blog-images admin write"  on storage.objects;
create policy "blog-images admin write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-images');

drop policy if exists "blog-images admin update" on storage.objects;
create policy "blog-images admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-images')
  with check (bucket_id = 'blog-images');

drop policy if exists "blog-images admin delete" on storage.objects;
create policy "blog-images admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-images');

-- 5) Reload PostgREST schema cache -----------------------------
notify pgrst, 'reload schema';

-- 6) Optional: seed one sample post (safe; on conflict do nothing)
insert into public.blog_posts (slug, title_en, title_ar, excerpt_en, excerpt_ar, content_en, content_ar, category, author, reading_minutes, is_featured)
values (
  'why-most-gut-protocols-fail',
  'Why most gut protocols fail',
  'لماذا تفشل معظم بروتوكولات الجهاز الهضمي',
  'The 5R framework, what it gets right, and the one variable nobody tracks.',
  'إطار 5R، ما يصيب فيه، والمتغيّر الوحيد الذي لا يتتبّعه أحد.',
  'Most gut protocols hand you a removal phase and call it a day. The clinical 5R framework — Remove, Replace, Reinoculate, Repair, Rebalance — works only when paired with one thing most people skip: nervous-system co-regulation.',
  'معظم بروتوكولات الأمعاء تكتفي بمرحلة الإزالة. إطار 5R السريري — إزالة، استبدال، إعادة تلقيح، ترميم، توازن — لا ينجح إلا مع شيء يتخطّاه الناس: تنظيم الجهاز العصبي.',
  'gut',
  'Reham Alsharif',
  6,
  true
)
on conflict (slug) do nothing;
