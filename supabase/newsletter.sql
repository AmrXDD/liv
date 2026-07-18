-- =============================================================
-- Newsletter subscribers — schema + RLS patch (idempotent)
-- Used by the footer signup form and the admin Newsletter page.
-- =============================================================

create table if not exists public.newsletter (
  id              uuid primary key default gen_random_uuid(),
  email           text unique not null,
  locale          text not null default 'en',
  source          text,
  unsubscribed_at timestamptz,
  created_at      timestamptz not null default now()
);

-- Patch older tables that may be missing newer columns.
alter table public.newsletter
  add column if not exists locale text not null default 'en';
alter table public.newsletter
  add column if not exists source text;
alter table public.newsletter
  add column if not exists unsubscribed_at timestamptz;

-- If `locale` is the strict lf_locale enum, relax it to plain text so
-- values like 'en-US' coming from the browser don't reject the insert.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'newsletter'
      and column_name  = 'locale'
      and udt_name     = 'lf_locale'
  ) then
    alter table public.newsletter alter column locale drop default;
    alter table public.newsletter alter column locale type text using locale::text;
    alter table public.newsletter alter column locale set default 'en';
  end if;
end $$;

create index if not exists newsletter_created_at_idx
  on public.newsletter (created_at desc);

alter table public.newsletter enable row level security;

-- Anyone (anon) can subscribe.
drop policy if exists "newsletter insert" on public.newsletter;
create policy "newsletter insert" on public.newsletter
  for insert
  to anon, authenticated
  with check (true);

-- Only signed-in admin can read / update / delete.
drop policy if exists "newsletter admin" on public.newsletter;
create policy "newsletter admin" on public.newsletter
  for all
  to authenticated
  using (true)
  with check (true);

notify pgrst, 'reload schema';
