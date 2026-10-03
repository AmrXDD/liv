-- Lead capture for the insulin-resistance quiz (and any future lead-gen page).
-- Run once in the Supabase SQL editor (or via a migration). Safe to re-run.
--
-- `source` says which page the lead came from (e.g. 'insulin-quiz'); `utm`
-- holds the ad/social tags from the link (utm_source, utm_campaign, ref ...).

create table if not exists public.quiz_leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  source      text not null,
  name        text not null,
  phone       text not null,
  locale      text not null default 'en' check (locale in ('en', 'ar')),
  score       integer not null,
  score_max   integer not null,
  band        text not null,
  answers     jsonb not null default '{}'::jsonb,
  utm         jsonb not null default '{}'::jsonb,
  handled     boolean not null default false
);

create index if not exists quiz_leads_created_idx on public.quiz_leads (created_at desc);
create index if not exists quiz_leads_source_idx  on public.quiz_leads (source);

alter table public.quiz_leads enable row level security;

-- Visitors can only add a row; they can never read, change or delete leads.
drop policy if exists "quiz_leads insert" on public.quiz_leads;
create policy "quiz_leads insert" on public.quiz_leads
  for insert to anon, authenticated
  with check (
    length(name) between 1 and 120
    and length(phone) between 6 and 30
    and source <> ''
  );

-- Only signed-in admins can read / mark handled / delete.
drop policy if exists "quiz_leads admin" on public.quiz_leads;
create policy "quiz_leads admin" on public.quiz_leads
  for all to authenticated
  using (true) with check (true);
