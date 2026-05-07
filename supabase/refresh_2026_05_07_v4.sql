-- =============================================================
-- v4 — Product image wiring
--   1. Re-assert coaching cover paths (in case v2 didn't fully run)
--   2. Wire DIY hero_image to expected /public/diy/*.png paths
--      so cards render an image as soon as you drop the files in
-- Idempotent. Safe to re-run.
-- =============================================================

-- Coaching cover images (paths exist in /public/coaching/)
update public.products set hero_image = '/coaching/01-root-cause-session.png' where slug = 'root-cause-session';
update public.products set hero_image = '/coaching/02-guided-reset.png'        where slug = 'guided-reset';
update public.products set hero_image = '/coaching/03-daily-reset.png'         where slug = 'daily-reset';
update public.products set hero_image = '/coaching/04-inner-circle.png'        where slug = 'inner-circle';
update public.products set hero_image = '/coaching/05-vvip-concierge.png'      where slug = 'vvip-concierge';

-- DIY cover images — drop matching files into public/diy/ to see them.
update public.products set hero_image = '/diy/insulin-sensitivity-reset.png' where slug = 'insulin-sensitivity-reset';
update public.products set hero_image = '/diy/thyroid-reset-90.png'          where slug = 'thyroid-reset-90';
update public.products set hero_image = '/diy/pcos-reset-30.png'             where slug = 'pcos-reset-30';
update public.products set hero_image = '/diy/t2d-reset-30.png'              where slug = 't2d-reset-30';

notify pgrst, 'reload schema';

-- Sanity check — every product should now have a hero_image.
-- select slug, category, hero_image from public.products order by category, position;
