-- Adds an optional subscriber name (collected by the /tracker download gate).
-- Run once in the Supabase SQL editor (or as a migration). Safe to re-run.
-- Then redeploy the subscribe-newsletter edge function so it stores the name.

alter table public.newsletter
  add column if not exists name text;

notify pgrst, 'reload schema';
