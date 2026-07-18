-- =============================================================
-- Liv Functional — May 7, 2026 refresh
--   1. Add download_url + seo_keywords columns to products
--   2. Replace coaching packages with cover images from /coaching/
--   3. Set Root Cause consultation cover image
--   4. Add Type-2-Diabetes Reset DIY product (and wire downloads
--      for all four DIY plans)
--   5. Insert founder portrait into the About page
--   6. Refresh accreditations to point at the latest /accreditations/ files
-- Idempotent. Safe to re-run.
-- =============================================================

-- ---------- 1) Schema additions ----------
alter table public.products
  add column if not exists download_url   text,
  add column if not exists seo_keywords   text;

-- ---------- 2) Coaching: remove + reinsert ----------
delete from public.products where category = 'coaching';

insert into public.products
  (slug, category, title_en, title_ar, tagline_en, tagline_ar,
   description_en, description_ar, long_en, long_ar,
   price, currency, duration_en, duration_ar, format,
   badge_en, badge_ar, accent, hero_image,
   outcomes, inclusions, seo_keywords, is_published, position)
values
('guided-reset', 'coaching',
 'The Guided Reset', 'الإعادة الموجَّهة',
 'For the woman who has a plan but needs someone to hold her accountable to it.',
 'للمرأة التي لديها خطة وتحتاج لمن يحاسبها عليها.',
 'A clinical-style intake, a written protocol built around your labs and symptoms, twice-weekly check-in calls, and a six-hour WhatsApp response guarantee.',
 'تقييم سريري كامل، بروتوكول مكتوب مبني على تحاليلك وأعراضك، مكالمتان أسبوعياً، ورد على واتساب خلال 6 ساعات.',
 'A full clinical-style intake in your first session, a written protocol built around your labs and symptoms, and twice-weekly calls to keep you on track. CGM integration is optional at this tier.',
 'تقييم سريري كامل في الجلسة الأولى، بروتوكول مكتوب مبني على تحاليلك وأعراضك، ومكالمتان أسبوعياً لإبقائك على المسار. دمج CGM اختياري في هذا المستوى.',
 815, 'USD', 'per month', 'شهرياً', '1:1', 'Most popular', 'الأكثر طلباً', 'forest',
 '/coaching/02-guided-reset.png',
 '[{"en":"Structured support without daily check-ins","ar":"دعم منظم دون متابعة يومية"},
   {"en":"Written holistic protocol from your data","ar":"بروتوكول مكتوب مبني على بياناتك"},
   {"en":"6-hour WhatsApp response (Sun–Thu)","ar":"رد على واتساب خلال 6 ساعات (الأحد–الخميس)"}]'::jsonb,
 '[{"en":"60-min onboarding (Kuwait / Zoom / WhatsApp)","ar":"جلسة افتتاحية 60 دقيقة"},
   {"en":"Full lifestyle, symptom, emotional intake","ar":"تقييم كامل لنمط الحياة والأعراض"},
   {"en":"Lab results review and interpretation","ar":"مراجعة وتفسير التحاليل"},
   {"en":"Custom written holistic protocol (3–5 days)","ar":"بروتوكول مكتوب مخصص (3–5 أيام)"},
   {"en":"Gulf-friendly meal plan","ar":"خطة وجبات خليجية"},
   {"en":"Personal glucose & habit tracker","ar":"متابع الجلوكوز والعادات"},
   {"en":"2× weekly check-in calls (up to 15 min)","ar":"مكالمتان أسبوعياً (حتى 15 دقيقة)"},
   {"en":"WhatsApp group access","ar":"الوصول لمجموعة واتساب"},
   {"en":"Optional CGM integration","ar":"دمج CGM اختياري"}]'::jsonb,
 'metabolic health program, insulin sensitivity reset, insulin resistance protocol, blood sugar stabilization, functional nutrition protocol, lower fasting insulin, prediabetes plan, مقاومه الأنسولين, علاج السكري الكويت',
 true, 20),

('daily-reset', 'coaching',
 'The Daily Reset', 'الإعادة اليومية',
 'Real-time coaching based on real data. Not guesswork — your glucose, your patterns, your protocol.',
 'تدريب لحظي مبني على بياناتك. ليس تخميناً — جلوكوزك، أنماطك، بروتوكولك.',
 'Everything in The Guided Reset, plus a CGM-required live dashboard, real-time food-spike analysis, daily WhatsApp check-ins, and mid-month protocol adjustments.',
 'كل ما في الإعادة الموجَّهة، إضافة إلى لوحة CGM مباشرة، تحليل لحظي لارتفاعات الطعام، تواصل يومي على واتساب، وتعديلات منتصف الشهر.',
 'From this tier onward a CGM is required — non-negotiable, because results at this level are in a different category. CGM device and sensors are sourced and paid for by the client.',
 'من هذا المستوى فصاعداً، CGM إلزامي — غير قابل للتفاوض، لأن النتائج في فئة مختلفة. جهاز CGM والحساسات تُؤمَّن وتُدفع من قبل العميلة.',
 1145, 'USD', 'per month', 'شهرياً', '1:1', 'CGM required', 'CGM إلزامي', 'coral',
 '/coaching/03-daily-reset.png',
 '[{"en":"Real-time food-spike analysis","ar":"تحليل ارتفاعات الجلوكوز فوراً"},
   {"en":"Daily WhatsApp check-ins","ar":"تواصل يومي عبر واتساب"},
   {"en":"Mid-month protocol adjustments","ar":"تعديلات منتصف الشهر"}]'::jsonb,
 '[{"en":"Everything in The Guided Reset","ar":"كل ما في الإعادة الموجَّهة"},
   {"en":"Required CGM with live dashboard access","ar":"CGM إلزامي مع وصول مباشر للوحة"},
   {"en":"Real-time food-spike analysis via WhatsApp photos","ar":"تحليل ارتفاعات الطعام عبر صور واتساب"},
   {"en":"Daily WhatsApp text check-in","ar":"تواصل نصي يومي على واتساب"},
   {"en":"Mid-month protocol adjustments if data calls for it","ar":"تعديلات على البروتوكول حسب البيانات"}]'::jsonb,
 'insulin sensitivity reset, insulin resistance protocol, lower A1C naturally, lower fasting insulin, fasting glucose protocol, blood sugar stabilization, gut health insulin resistance, no medication for diabetes prevention, دايت لعلاج السكري, علاج السكري من غير دوا, علاج السكري الكويت',
 true, 30),

('inner-circle', 'coaching',
 'The LIV Inner Circle', 'الدائرة الداخلية',
 'Total immersion. Daily coaching, live glucose data, weekly sessions, and LIV products delivered to you.',
 'انغماس كامل. تدريب يومي، بيانات جلوكوز لحظية، جلسات أسبوعية، ومنتجات ليف تُسلَّم إليكِ.',
 'Protocol, CGM data, daily habits, supplements, and products — all working together. Not a consultation. A complete metabolic reset with expert eyes on you every single day.',
 'بروتوكول وبيانات CGM وعادات يومية ومكملات ومنتجات — كلها معاً. ليست استشارة. إعادة ضبط أيضي كاملة مع متابعة خبيرة كل يوم.',
 'For women who are done experimenting. You want your data analyzed, your protocol adjusted in real time, and a lifestyle that is sustainable — not punishing.',
 'للنساء اللواتي انتهين من التجربة. تريدين تحليل بياناتك، تعديل بروتوكولك لحظياً، ونمط حياة مستدام — لا عقابي.',
 1635, 'USD', 'per month', 'شهرياً', 'Hybrid', 'High touch', 'لمسة عالية', 'forest',
 '/coaching/04-inner-circle.png',
 '[{"en":"Daily expert eyes on your data","ar":"متابعة يومية لبياناتك من الخبيرة"},
   {"en":"Weekly 30-minute session (Kuwait or online)","ar":"جلسة أسبوعية 30 دقيقة"},
   {"en":"15% off all LIV products + monthly supply","ar":"خصم 15% على منتجات ليف ومخزون شهري"}]'::jsonb,
 '[{"en":"Everything in The Daily Reset","ar":"كل ما في الإعادة اليومية"},
   {"en":"Weekly 30-min session — Kuwait or online","ar":"جلسة أسبوعية 30 دقيقة"},
   {"en":"Daily personalized supplement reminders","ar":"تذكيرات يومية للمكملات"},
   {"en":"15% discount on all LIV products","ar":"خصم 15% على جميع منتجات ليف"},
   {"en":"Monthly LIV product supply (fermented foods or kombucha)","ar":"إمدادات شهرية من منتجات ليف"}]'::jsonb,
 'metabolic health program, insulin resistance protocol, gut health insulin resistance, functional nutrition protocol, blood sugar stabilization, PCOS nutrition plan, تكيس المبايض, مقاومه الأنسولين',
 true, 40),

('vvip-concierge', 'coaching',
 'VVIP — The LIV Concierge', 'كونسيرج ليف',
 'Your protocol, inside your home. The full LIV experience — coaching, live data, hands-on culinary support.',
 'بروتوكولك داخل بيتك. تجربة ليف الكاملة — تدريب وبيانات لحظية ودعم طهي عملي.',
 'The highest-touch program offered. Limited spots. Kuwait-based clients only. Includes a monthly in-home visit: personal meal-prep session or training your household cook directly.',
 'البرنامج الأعلى لمسة. عدد محدود من الأماكن. للعميلات في الكويت فقط. يشمل زيارة منزلية شهرية: جلسة تحضير وجبات شخصية أو تدريب الطاهي.',
 'By application only — Kuwait based. Limited to a small number of clients at any time. Renewal pricing assessed individually.',
 'بالتقديم فقط — مقرّها الكويت. مقتصر على عدد صغير من العميلات. تسعير التجديد يُقيَّم فردياً.',
 0, 'USD', 'monthly · by application', 'شهرياً · بالتقديم', 'Hybrid', 'By application', 'بالتقديم', 'coral',
 '/coaching/05-vvip-concierge.png',
 '[{"en":"Monthly in-home visit (Kuwait)","ar":"زيارة منزلية شهرية (الكويت)"},
   {"en":"Personal meal prep or cook training","ar":"تحضير وجبات شخصي أو تدريب الطباخ"},
   {"en":"Full monthly LIV product supply","ar":"إمدادات ليف شهرية كاملة"}]'::jsonb,
 '[{"en":"Everything in The Inner Circle","ar":"كل ما في الدائرة الداخلية"},
   {"en":"Monthly in-home visit — meal prep or cook training","ar":"زيارة منزلية شهرية"},
   {"en":"Fermented foods + kombucha included","ar":"أطعمة مخمرة وكومبوتشا مشمولة"}]'::jsonb,
 'metabolic health program, functional nutrition protocol, insulin sensitivity reset, blood sugar stabilization, gut health insulin resistance',
 true, 50);

-- ---------- 3) Root Cause consultation cover ----------
update public.products
   set hero_image = '/coaching/01-root-cause-session.png',
       seo_keywords = 'metabolic health program, functional nutrition protocol, insulin resistance protocol, blood sugar stabilization, مقاومه الأنسولين, علاج السكري الكويت'
 where slug = 'root-cause-session';

-- ---------- 4) DIY downloads ----------
update public.products
   set download_url = '/downloads/insulin-sensitivity-reset.docx',
       seo_keywords = '10 day reset plan, insulin sensitivity reset, insulin resistance protocol, lower fasting insulin, fasting glucose protocol, blood sugar stabilization, prediabetes plan, no medication for diabetes prevention, مقاومه الأنسولين, علاج السكري من غير دوا, دايت لعلاج السكري'
 where slug = 'insulin-sensitivity-reset';

update public.products
   set download_url = '/downloads/thyroid-reset-90.pdf',
       seo_keywords = 'metabolic health program, functional nutrition protocol, gut health insulin resistance, lower fasting insulin, blood sugar stabilization, no medication for diabetes prevention'
 where slug = 'thyroid-reset-90';

update public.products
   set download_url = '/downloads/pcos-reset.html',
       seo_keywords = 'pcos, PCOS nutrition plan, تكيس المبايض, insulin sensitivity reset, insulin resistance protocol, lower fasting insulin, gut health insulin resistance, متلازمة تكيس المبايض'
 where slug = 'pcos-reset-30';

-- Add the Type-2-Diabetes Reset DIY product (wasn't in the previous seed).
insert into public.products
  (slug, category, title_en, title_ar, tagline_en, tagline_ar,
   description_en, description_ar, long_en, long_ar,
   price, currency, duration_en, duration_ar, format,
   badge_en, badge_ar, accent,
   outcomes, inclusions, download_url, seo_keywords, is_published, position)
values
('t2d-reset-30', 'diy',
 'The 30-Day Type 2 Diabetes Reset',
 'إعادة ضبط السكري النوع الثاني — 30 يوماً',
 'Reverse type-2 diabetes naturally. Reduce A1C, fasting glucose, and insulin resistance — without medications.',
 'عكس السكري النوع الثاني طبيعياً. خفض A1C والجلوكوز ومقاومة الإنسولين — بدون أدوية.',
 'A 30-day food, lifestyle, and supplement protocol designed to lower fasting glucose, reduce A1C, and rebuild insulin sensitivity in adults with type-2 diabetes.',
 'بروتوكول 30 يوماً للطعام ونمط الحياة والمكملات لخفض سكر الصيام و A1C وإعادة بناء حساسية الإنسولين لمرضى السكري النوع الثاني.',
 'Type-2 diabetes is reversible for most people in the early-to-mid stage of the disease — when the protocol matches what is happening at the cellular level. This is not a sugar-counting plan. It is a layered intervention that targets insulin resistance, hepatic glucose output, gut inflammation, and circadian dysregulation simultaneously.',
 'السكري النوع الثاني قابل للعكس لمعظم الناس في المراحل المبكرة والمتوسطة — حين يطابق البروتوكول ما يحدث على المستوى الخلوي. ليست خطة عدّ سكر. هي تدخّل متعدّد الطبقات يستهدف مقاومة الإنسولين والإفراز الكبدي للجلوكوز والتهاب الأمعاء واضطراب الإيقاع اليومي.',
 59, 'USD', 'Instant download', 'تحميل فوري', 'PDF', 'New', 'جديد', 'forest',
 '[{"en":"Lower A1C and fasting glucose","ar":"خفض A1C وسكر الصيام"},
   {"en":"Stable energy without crashes","ar":"طاقة ثابتة بدون انهيار"},
   {"en":"Less reliance on medication","ar":"اعتماد أقل على الدواء"}]'::jsonb,
 '[{"en":"30-day food + lifestyle protocol","ar":"بروتوكول 30 يوماً للطعام ونمط الحياة"},
   {"en":"Glucose tracking sheet","ar":"ورقة متابعة الجلوكوز"},
   {"en":"Targeted supplement stack","ar":"قائمة مكملات مستهدفة"},
   {"en":"Recommended labs to monitor","ar":"تحاليل موصى بمتابعتها"}]'::jsonb,
 '/downloads/t2d-reset.pdf',
 'lower A1C naturally, no medication for diabetes prevention, fasting glucose protocol, blood sugar stabilization, insulin resistance protocol, lower fasting insulin, metabolic health program, دايت لعلاج السكري, علاج السكري من غير دوا, علاج السكري الكويت',
 true, 40)
on conflict (slug) do update set
  category       = excluded.category,
  title_en       = excluded.title_en,
  title_ar       = excluded.title_ar,
  tagline_en     = excluded.tagline_en,
  tagline_ar     = excluded.tagline_ar,
  description_en = excluded.description_en,
  description_ar = excluded.description_ar,
  long_en        = excluded.long_en,
  long_ar        = excluded.long_ar,
  price          = excluded.price,
  currency       = excluded.currency,
  duration_en    = excluded.duration_en,
  duration_ar    = excluded.duration_ar,
  format         = excluded.format,
  badge_en       = excluded.badge_en,
  badge_ar       = excluded.badge_ar,
  accent         = excluded.accent,
  outcomes       = excluded.outcomes,
  inclusions     = excluded.inclusions,
  download_url   = excluded.download_url,
  seo_keywords   = excluded.seo_keywords,
  is_published   = excluded.is_published,
  position       = excluded.position;

-- ---------- 5) Founder portrait on About page ----------
-- Inject (or refresh) an image block at the top of the About page.
update public.pages
   set blocks = jsonb_build_array(
                  jsonb_build_object(
                    'id','founder-portrait',
                    'type','image',
                    'url','/reham.png',
                    'alt','Reham Alsharif — Founder of Liv Functional',
                    'rounded', true,
                    'caption', jsonb_build_object(
                      'en','Reham Alsharif — Founder, Liv Functional',
                      'ar','ريهام الشريف — مؤسِّسة ليف'
                    )
                  )
                )
                || coalesce(
                     (select jsonb_agg(elem)
                        from jsonb_array_elements(blocks) elem
                       where coalesce(elem->>'id','') <> 'founder-portrait'),
                     '[]'::jsonb
                   )
 where slug = 'about';

-- Same on My Story page.
update public.pages
   set blocks = jsonb_build_array(
                  jsonb_build_object(
                    'id','founder-portrait',
                    'type','image',
                    'url','/reham.png',
                    'alt','Reham Alsharif — Founder of Liv Functional',
                    'rounded', true
                  )
                )
                || coalesce(
                     (select jsonb_agg(elem)
                        from jsonb_array_elements(blocks) elem
                       where coalesce(elem->>'id','') <> 'founder-portrait'),
                     '[]'::jsonb
                   )
 where slug = 'my-story';

-- ---------- 6) Refresh accreditations to latest paths ----------
-- Idempotent upserts (no unique key on name, so guard with delete-of-stale).
delete from public.accreditations
 where image_url in (
   '/accreditations/holistic-nutrition-certificate.pdf',
   '/accreditations/nutrition-coach-certificate.png',
   '/accreditations/reham-nlp-certificate.pdf',
   '/accreditations/center-of-cpd.jpg',
   '/accreditations/contemporary-medical-association.jpg',
   '/accreditations/international-compliance-assurance.png',
   '/accreditations/international-practitioners-of-holistic-medicine.png'
 );

insert into public.accreditations
  (name_en, name_ar, issuer_en, issuer_ar, image_url, position, is_published)
values
  ('Holistic Nutrition Certificate',           'شهادة التغذية الشاملة',                   'Holistic Nutrition Programme',     'برنامج التغذية الشاملة',  '/accreditations/holistic-nutrition-certificate.pdf',                    10, true),
  ('Nutrition Coach Certificate',              'شهادة مدربة تغذية',                       'Accredited Provider',              'مزود معتمد',              '/accreditations/nutrition-coach-certificate.png',                       20, true),
  ('NLP Practitioner Certificate',             'شهادة ممارس البرمجة اللغوية العصبية',     'NLP Institute',                    'معهد البرمجة اللغوية',    '/accreditations/reham-nlp-certificate.pdf',                             30, true),
  ('Center of CPD Accreditation',              'اعتماد مركز التطوير المهني المستمر',     'Center of CPD',                    'مركز CPD',                '/accreditations/center-of-cpd.jpg',                                     40, true),
  ('Contemporary Medical Association',         'الجمعية الطبية المعاصرة',                 'Contemporary Medical Association', 'الجمعية الطبية المعاصرة', '/accreditations/contemporary-medical-association.jpg',                  50, true),
  ('International Compliance Assurance',       'الامتثال الدولي — مزوّد تدريب معتمد',     'International Compliance Assurance','الامتثال الدولي',         '/accreditations/international-compliance-assurance.png',                60, true),
  ('International Practitioners of Holistic Medicine', 'الممارسون الدوليون للطب الشمولي', 'IPHM',                              'IPHM',                   '/accreditations/international-practitioners-of-holistic-medicine.png',  70, true);

-- ---------- 7) Reload PostgREST cache ----------
notify pgrst, 'reload schema';
