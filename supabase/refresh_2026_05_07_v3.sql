-- =============================================================
-- v3 follow-up — May 7, 2026
--   1. Make every product currency = 'KWD'
--   2. Remove any non-DIY product still tagged as 'diy'
--   3. Make sure accreditations are present and published
-- Idempotent. Safe to re-run.
-- =============================================================

-- 1) Unify currency
update public.products
   set currency = 'KWD'
 where currency is distinct from 'KWD';

-- 2) DIY section: keep only the four allowed plans
delete from public.products
 where category = 'diy'
   and slug not in (
     'insulin-sensitivity-reset',
     'thyroid-reset-90',
     'pcos-reset-30',
     't2d-reset-30'
   );

-- 3) Accreditations — ensure visible
-- Republish anything that was inserted as not-published, just in case.
update public.accreditations
   set is_published = true
 where is_published is distinct from true;

-- If the table somehow ended up empty, reseed it.
insert into public.accreditations
  (name_en, name_ar, issuer_en, issuer_ar, image_url, position, is_published)
select * from (values
  ('Holistic Nutrition Certificate',                     $ar$شهادة التغذية الشاملة$ar$,                'Holistic Nutrition Programme',       $ar$برنامج التغذية الشاملة$ar$,  '/accreditations/holistic-nutrition-certificate.pdf',                    10, true),
  ('Nutrition Coach Certificate',                        $ar$شهادة مدربة تغذية$ar$,                    'Accredited Provider',                $ar$مزود معتمد$ar$,              '/accreditations/nutrition-coach-certificate.png',                       20, true),
  ('NLP Practitioner Certificate',                       $ar$شهادة ممارس البرمجة اللغوية العصبية$ar$,  'NLP Institute',                      $ar$معهد البرمجة اللغوية$ar$,    '/accreditations/reham-nlp-certificate.pdf',                             30, true),
  ('Center of CPD Accreditation',                        $ar$اعتماد مركز التطوير المهني المستمر$ar$,  'Center of CPD',                      $ar$مركز CPD$ar$,                '/accreditations/center-of-cpd.jpg',                                     40, true),
  ('Contemporary Medical Association',                   $ar$الجمعية الطبية المعاصرة$ar$,              'Contemporary Medical Association',   $ar$الجمعية الطبية المعاصرة$ar$, '/accreditations/contemporary-medical-association.jpg',                  50, true),
  ('International Compliance Assurance',                 $ar$الامتثال الدولي — مزوّد تدريب معتمد$ar$,  'International Compliance Assurance', $ar$الامتثال الدولي$ar$,         '/accreditations/international-compliance-assurance.png',                60, true),
  ('International Practitioners of Holistic Medicine',   $ar$الممارسون الدوليون للطب الشمولي$ar$,      'IPHM',                               'IPHM',                          '/accreditations/international-practitioners-of-holistic-medicine.png',  70, true)
) as v(name_en, name_ar, issuer_en, issuer_ar, image_url, position, is_published)
where not exists (select 1 from public.accreditations);

notify pgrst, 'reload schema';

-- Quick sanity checks (read-only) — leave them or delete after running:
-- select count(*) from public.accreditations where is_published;
-- select slug, category, currency, price from public.products order by category, position;
