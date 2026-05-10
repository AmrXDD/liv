-- =============================================================
-- Liv Functional — site_content table
-- Stores per-key text overrides editable from the admin portal.
-- The default values still live in src/content/{en,ar}.json; this
-- table only persists overrides written by an admin. The runtime
-- merges overrides on top of the JSON fallback via a
-- react-i18next postProcessor.
-- =============================================================

create table if not exists site_content (
  content_key   text primary key,                  -- dot-path, e.g. hero.titleA
  page_slug     text not null default 'global',    -- groups keys per page
  element_type  text not null default 'text',      -- title | paragraph | card | button | text
  value_en      text,
  value_ar      text,
  description   text,                              -- optional admin-friendly label
  updated_at    timestamptz not null default now()
);

create index if not exists site_content_page_idx on site_content(page_slug, element_type);

drop trigger if exists trg_site_content_updated on site_content;
create trigger trg_site_content_updated before update on site_content
  for each row execute function lf_set_updated_at();

alter table site_content enable row level security;

drop policy if exists "site_content read"  on site_content;
drop policy if exists "site_content admin" on site_content;

create policy "site_content read"
  on site_content for select
  using (true);

create policy "site_content admin"
  on site_content for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
