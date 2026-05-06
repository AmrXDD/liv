-- =============================================================
-- Liv Functional — products seed
-- Source: Downloads/Liv Functional Website (May 2026 brief from Reham)
-- Categories: consultation | diy | coaching | physical
-- =============================================================

-- ---------- 1. Make sure the category column accepts new values ----------
do $$
begin
  -- If `category` is an enum, add the missing values; if it's text the alters are no-ops.
  begin alter type product_category add value if not exists 'consultation'; exception when others then null; end;
  begin alter type product_category add value if not exists 'physical';     exception when others then null; end;
end $$;

-- Drop a CHECK constraint if one exists and recreate it to permit all four.
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where table_name = 'products' and constraint_name = 'products_category_check'
  ) then
    execute 'alter table public.products drop constraint products_category_check';
  end if;
end $$;

alter table public.products
  add constraint products_category_check
  check (category in ('diy','coaching','consultation','physical'));

-- ---------- 2. Make sure required columns exist ----------
alter table public.products
  add column if not exists slug           text unique,
  add column if not exists category       text,
  add column if not exists title_en       text,
  add column if not exists title_ar       text,
  add column if not exists tagline_en     text,
  add column if not exists tagline_ar     text,
  add column if not exists description_en text,
  add column if not exists description_ar text,
  add column if not exists long_en        text,
  add column if not exists long_ar        text,
  add column if not exists price          numeric not null default 0,
  add column if not exists currency       text not null default 'USD',
  add column if not exists duration_en    text,
  add column if not exists duration_ar    text,
  add column if not exists format         text,
  add column if not exists badge_en       text,
  add column if not exists badge_ar       text,
  add column if not exists hero_image     text,
  add column if not exists images         text[] default '{}',
  add column if not exists accent         text default 'forest',
  add column if not exists outcomes       jsonb default '[]'::jsonb,
  add column if not exists inclusions     jsonb default '[]'::jsonb,
  add column if not exists is_published   boolean not null default true,
  add column if not exists position       int not null default 0,
  add column if not exists created_at     timestamptz not null default now();

-- ---------- 3. RLS ----------
alter table public.products enable row level security;
drop policy if exists "products read"  on public.products;
create policy "products read"  on public.products
  for select to anon, authenticated using (is_published = true);
drop policy if exists "products admin" on public.products;
create policy "products admin" on public.products
  for all to authenticated using (true) with check (true);

-- ---------- 4. Seed: CONSULTATIONS ----------
insert into public.products
  (slug, category, title_en, title_ar, tagline_en, description_en,
   long_en, price, currency, duration_en, format, badge_en, accent,
   outcomes, inclusions, is_published, position)
values
('discovery-call', 'consultation',
 'Free Discovery Call',
 'مكالمة تعارف مجانية',
 '15 minutes. No commitment. A real conversation about your next step.',
 'A short, free call to understand where you are, what you''ve tried, and which Liv path actually fits — even if it isn''t with us.',
 'Tell us where you are. Walk away with a next step — even if it isn''t with us. Available on Zoom, WhatsApp call, or phone. Most calls last 12–15 minutes.',
 0, 'USD', '15 minutes', '1:1', 'Free', 'forest',
 '[{"en":"A clear next step","ar":"خطوة تالية واضحة"},
   {"en":"An honest read on whether Liv is the right fit","ar":"رأي صريح إن كانت ليف هي الخيار المناسب"},
   {"en":"No pressure to enroll","ar":"بدون أي ضغط للتسجيل"}]'::jsonb,
 '[{"en":"15-min Zoom / WhatsApp / phone call","ar":"مكالمة زووم / واتساب / هاتف 15 دقيقة"},
   {"en":"Pre-call intake form","ar":"استمارة قبل المكالمة"},
   {"en":"Post-call recommendation in writing","ar":"توصية مكتوبة بعد المكالمة"}]'::jsonb,
 true, 10),

('root-cause-session', 'consultation',
 'The Root Cause Session',
 'جلسة الجذور',
 'For the self-driven woman who knows something is wrong but can''t pinpoint why.',
 'A focused 60-minute deep-dive — emotional landscape, lifestyle, symptoms, lab results — followed by a custom holistic protocol delivered within 3–5 business days.',
 'Most women spend years managing symptoms without ever addressing the root cause. This session changes that. In one focused hour we go deep — your emotional landscape, lifestyle patterns, symptom history, and lab results. You leave with a custom protocol you can execute independently. No ongoing follow-up is included; clients who want accountability after this session can move into The Guided Reset.',
 135, 'USD', '60 minutes', '1:1', 'Deep dive', 'coral',
 '[{"en":"Symptom mapping and root-cause analysis","ar":"تحديد الأعراض وتحليل أسبابها الجذرية"},
   {"en":"Lab results review and interpretation","ar":"مراجعة وتفسير نتائج التحاليل"},
   {"en":"Custom holistic protocol within 3–5 business days","ar":"بروتوكول مخصص خلال 3–5 أيام عمل"}]'::jsonb,
 '[{"en":"60-minute 1:1 session — Kuwait, Zoom, or WhatsApp","ar":"جلسة 1:1 لمدة 60 دقيقة — الكويت، زووم، أو واتساب"},
   {"en":"Full emotional and lifestyle intake","ar":"تقييم كامل لنمط الحياة والحالة العاطفية"},
   {"en":"Lab results review","ar":"مراجعة نتائج التحاليل"},
   {"en":"Written custom protocol delivered within 3–5 days","ar":"بروتوكول مكتوب خلال 3–5 أيام"}]'::jsonb,
 true, 20)

on conflict (slug) do update set
  category = excluded.category,
  title_en = excluded.title_en,
  title_ar = excluded.title_ar,
  tagline_en = excluded.tagline_en,
  description_en = excluded.description_en,
  long_en = excluded.long_en,
  price = excluded.price,
  currency = excluded.currency,
  duration_en = excluded.duration_en,
  format = excluded.format,
  badge_en = excluded.badge_en,
  accent = excluded.accent,
  outcomes = excluded.outcomes,
  inclusions = excluded.inclusions,
  is_published = excluded.is_published,
  position = excluded.position;

-- ---------- 5. Seed: COACHING ----------
insert into public.products
  (slug, category, title_en, title_ar, tagline_en, description_en,
   long_en, price, currency, duration_en, format, badge_en, accent,
   outcomes, inclusions, is_published, position)
values
('guided-reset', 'coaching',
 'The Guided Reset',
 'الإعادة الموجَّهة',
 'For the woman who has a plan but needs someone to hold her accountable to it.',
 'A clinical-style intake, a written protocol built around your labs and symptoms, twice-weekly check-in calls, and a six-hour WhatsApp response guarantee.',
 'A full clinical-style intake in your first session, a written protocol built around your labs and symptoms, and twice-weekly calls to keep you on track. CGM integration is optional at this tier — live dashboard access plus real-time food-spike analysis via WhatsApp food photos.',
 815, 'USD', 'per month', '1:1', 'Most popular', 'forest',
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
 true, 10),

('daily-reset', 'coaching',
 'The Daily Reset',
 'الإعادة اليومية',
 'Real-time coaching based on real data. Not guesswork — your glucose, your patterns, your protocol.',
 'Everything in The Guided Reset, plus a CGM-required live dashboard, real-time food-spike analysis, daily WhatsApp check-ins, and mid-month protocol adjustments.',
 'From this tier onward a CGM is required — non-negotiable, because results at this level are in a different category. Coaching is based on what your body is actually doing in real time. CGM device and sensors are sourced and paid for by the client. Full setup guidance is provided at onboarding.',
 1145, 'USD', 'per month', '1:1', 'CGM required', 'coral',
 '[{"en":"Real-time food-spike analysis","ar":"تحليل ارتفاعات الجلوكوز فوراً"},
   {"en":"Daily WhatsApp check-ins","ar":"تواصل يومي عبر واتساب"},
   {"en":"Mid-month protocol adjustments","ar":"تعديلات منتصف الشهر"}]'::jsonb,
 '[{"en":"Everything in The Guided Reset","ar":"كل ما في الإعادة الموجَّهة"},
   {"en":"Required CGM with live dashboard access","ar":"CGM إلزامي مع وصول مباشر للوحة"},
   {"en":"Real-time food-spike analysis via WhatsApp photos","ar":"تحليل ارتفاعات الطعام عبر صور واتساب"},
   {"en":"Daily WhatsApp text check-in","ar":"تواصل نصي يومي على واتساب"},
   {"en":"Mid-month protocol adjustments if data calls for it","ar":"تعديلات على البروتوكول حسب البيانات"}]'::jsonb,
 true, 20),

('inner-circle', 'coaching',
 'The LIV Inner Circle',
 'الدائرة الداخلية',
 'Total immersion. Daily coaching, live glucose data, weekly sessions, and LIV products delivered to you.',
 'Protocol, CGM data, daily habits, supplements, and products — all working together. Not a consultation. A complete metabolic reset with expert eyes on you every single day.',
 'For women who are done experimenting. You want your data analyzed, your protocol adjusted in real time, and a lifestyle that is sustainable — not punishing.',
 1635, 'USD', 'per month', 'Hybrid', 'High touch', 'forest',
 '[{"en":"Daily expert eyes on your data","ar":"متابعة يومية لبياناتك من الخبيرة"},
   {"en":"Weekly 30-minute session (Kuwait or online)","ar":"جلسة أسبوعية 30 دقيقة"},
   {"en":"15% off all LIV products + monthly supply","ar":"خصم 15% على منتجات ليف ومخزون شهري"}]'::jsonb,
 '[{"en":"Everything in The Daily Reset","ar":"كل ما في الإعادة اليومية"},
   {"en":"Weekly 30-min session — Kuwait or online","ar":"جلسة أسبوعية 30 دقيقة"},
   {"en":"Daily personalized supplement reminders","ar":"تذكيرات يومية للمكملات"},
   {"en":"15% discount on all LIV products","ar":"خصم 15% على جميع منتجات ليف"},
   {"en":"Monthly LIV product supply (fermented foods or kombucha)","ar":"إمدادات شهرية من منتجات ليف"}]'::jsonb,
 true, 30),

('vvip-concierge', 'coaching',
 'VVIP — The LIV Concierge',
 'كونسيرج ليف',
 'Your protocol, inside your home. The full LIV experience — coaching, live data, hands-on culinary support.',
 'The highest-touch program offered. Limited spots. Kuwait-based clients only. Includes a monthly in-home visit: personal meal-prep session or training your household cook directly.',
 'By application only — Kuwait based. Limited to a small number of clients at any time. Renewal pricing assessed individually.',
 0, 'USD', 'monthly · by application', 'Hybrid', 'By application', 'coral',
 '[{"en":"Monthly in-home visit (Kuwait)","ar":"زيارة منزلية شهرية (الكويت)"},
   {"en":"Personal meal prep or cook training","ar":"تحضير وجبات شخصي أو تدريب الطباخ"},
   {"en":"Full monthly LIV product supply","ar":"إمدادات ليف شهرية كاملة"}]'::jsonb,
 '[{"en":"Everything in The Inner Circle","ar":"كل ما في الدائرة الداخلية"},
   {"en":"Monthly in-home visit — meal prep or cook training","ar":"زيارة منزلية شهرية"},
   {"en":"Fermented foods + kombucha included","ar":"أطعمة مخمرة وكومبوتشا مشمولة"}]'::jsonb,
 true, 40)

on conflict (slug) do update set
  category = excluded.category,
  title_en = excluded.title_en,
  tagline_en = excluded.tagline_en,
  description_en = excluded.description_en,
  long_en = excluded.long_en,
  price = excluded.price,
  currency = excluded.currency,
  duration_en = excluded.duration_en,
  format = excluded.format,
  badge_en = excluded.badge_en,
  accent = excluded.accent,
  outcomes = excluded.outcomes,
  inclusions = excluded.inclusions,
  is_published = excluded.is_published,
  position = excluded.position;

-- ---------- 6. Seed: DIY plans ----------
insert into public.products
  (slug, category, title_en, title_ar, tagline_en, description_en,
   long_en, price, currency, duration_en, format, badge_en, accent,
   outcomes, inclusions, is_published, position)
values
('insulin-sensitivity-reset', 'diy',
 'The 10-Day Insulin Sensitivity Reset',
 'إعادة ضبط حساسية الإنسولين — 10 أيام',
 'Lower fasting insulin, stabilize blood sugar, rebuild your metabolic foundation — no medications, no gym, no guesswork.',
 'A structured, science-backed 10-day system designed for prediabetes, PCOS, elevated fasting insulin, and high A1C. Tested on an insulin-dependent patient with 24/7 monitoring.',
 'Insulin resistance doesn''t develop overnight — and it doesn''t reverse overnight. But 10 days of precise, consistent action create measurable shifts most people can feel before they can measure them. This protocol targets four interconnected systems simultaneously: blood sugar regulation, insulin sensitivity, gut microbiome restoration, and hormonal rhythm alignment.',
 39, 'USD', 'Instant download', 'PDF', 'New', 'forest',
 '[{"en":"Reduced cravings and stable energy","ar":"شغف أقل وطاقة ثابتة"},
   {"en":"Better sleep and lower bloating","ar":"نوم أفضل وانتفاخ أقل"},
   {"en":"Measurable changes in fasting glucose","ar":"تغييرات قابلة للقياس في سكر الصيام"}]'::jsonb,
 '[{"en":"Nutrition framework with 8 non-negotiable rules","ar":"إطار غذائي مع 8 قواعد أساسية"},
   {"en":"Gut health + fermented food protocol","ar":"بروتوكول صحة الأمعاء والأطعمة المخمرة"},
   {"en":"Movement protocol (no gym needed)","ar":"بروتوكول حركة دون نادٍ"},
   {"en":"Circadian + sleep optimization","ar":"تحسين الإيقاع اليومي والنوم"},
   {"en":"Full supplement stack with timing","ar":"قائمة مكملات كاملة بالجرعات"},
   {"en":"Behavioral if-then rules","ar":"قواعد سلوكية بتنسيق إذا/فـ"}]'::jsonb,
 true, 10),

('thyroid-reset-90', 'diy',
 'The 90-Day Thyroid Reset',
 'إعادة ضبط الغدة الدرقية — 90 يوماً',
 'For women who haven''t been put on medication, and don''t want to be.',
 'A food-first, lifestyle-led, twelve-week protocol for women navigating thyroid symptoms — fatigue, weight gain, brain fog, hair thinning, cold hands — without a Levothyroxine prescription.',
 'A 90-day, three-phase, twelve-week downloadable workbook. Phase 1 — Remove (Weeks 1–4): take the foot off the inflammation pedal, stabilize blood sugar, restore sleep, heal the gut. Phase 2 — Rebuild (Weeks 5–8): replenish minerals and nutrients the thyroid needs. Phase 3 — Regulate (Weeks 9–12): mitochondrial repair, hormonal balance for perimenopause, vagal tone, integration into a sustainable rhythm.',
 89, 'USD', 'Instant download', 'PDF', 'Best seller', 'coral',
 '[{"en":"Energy that doesn''t crash at 3 pm","ar":"طاقة لا تنهار بعد الظهر"},
   {"en":"Sleeping through the night","ar":"نوم متواصل طوال الليل"},
   {"en":"Less hair shedding, better skin","ar":"تساقط شعر أقل، بشرة أفضل"},
   {"en":"Body temperature back in healthy range","ar":"عودة درجة حرارة الجسم لمعدلها الطبيعي"}]'::jsonb,
 '[{"en":"Weekly theme + the science behind it","ar":"موضوع أسبوعي مع شرح علمي"},
   {"en":"Hero foods + one signature meal per week","ar":"أطعمة بطلة ووجبة مميزة لكل أسبوع"},
   {"en":"Complete supplement stack — doses + timing","ar":"قائمة مكملات كاملة بالجرعات والتوقيت"},
   {"en":"Weekly breathwork + meditation practice","ar":"تنفس وتأمل أسبوعي"},
   {"en":"7-day tracker grid per week","ar":"شبكة متابعة لـ7 أيام لكل أسبوع"},
   {"en":"Recommended labs to ask your doctor for","ar":"تحاليل موصى بطلبها من الطبيب"},
   {"en":"Red-flag escalation guide","ar":"دليل العلامات التحذيرية"}]'::jsonb,
 true, 20),

('pcos-reset-30', 'diy',
 'The 30-Day PCOS Reset',
 'إعادة ضبط متلازمة تكيس المبايض — 30 يوماً',
 'Cycle support, insulin balance, and inflammation reduction — built for PCOS.',
 'A 30-day food, movement, and supplement protocol designed specifically for women with PCOS — to balance insulin, regulate cycles, and reduce androgen-driven symptoms.',
 'Detailed product copy coming soon. Reham is finalizing the workbook content; this listing is a placeholder you can edit in the admin once the PDF is ready.',
 49, 'USD', 'Instant download', 'PDF', 'Coming soon', 'forest',
 '[{"en":"More predictable cycles","ar":"دورات أكثر انتظاماً"},
   {"en":"Reduced androgen-driven symptoms","ar":"أعراض أقل مرتبطة بالأندروجين"},
   {"en":"Better insulin response","ar":"استجابة إنسولين أفضل"}]'::jsonb,
 '[{"en":"30-day food + lifestyle protocol","ar":"بروتوكول 30 يوماً للطعام ونمط الحياة"},
   {"en":"Cycle-aware movement plan","ar":"خطة حركة مرتبطة بالدورة"},
   {"en":"Supplement stack for PCOS","ar":"قائمة مكملات لتكيس المبايض"}]'::jsonb,
 true, 30)

on conflict (slug) do update set
  category = excluded.category,
  title_en = excluded.title_en,
  tagline_en = excluded.tagline_en,
  description_en = excluded.description_en,
  long_en = excluded.long_en,
  price = excluded.price,
  currency = excluded.currency,
  duration_en = excluded.duration_en,
  format = excluded.format,
  badge_en = excluded.badge_en,
  accent = excluded.accent,
  outcomes = excluded.outcomes,
  inclusions = excluded.inclusions,
  is_published = excluded.is_published,
  position = excluded.position;

-- ---------- 7. Seed: PHYSICAL (coming soon placeholder) ----------
insert into public.products
  (slug, category, title_en, title_ar, tagline_en, description_en,
   price, currency, format, badge_en, accent, is_published, position)
values
('coming-soon-physical', 'physical',
 'LIV Pantry — Coming Soon',
 'مؤن ليف — قريباً',
 'Fresh fermented foods, kombucha, and signature pantry staples.',
 'Reham''s small-batch fermented foods and kombucha — currently available only to Inner Circle and VVIP clients. Public storefront launching soon.',
 0, 'USD', 'Physical', 'Coming soon', 'bone', true, 100)
on conflict (slug) do update set
  description_en = excluded.description_en,
  badge_en = excluded.badge_en,
  is_published = excluded.is_published;

-- ---------- 8. Email templates table (admin-editable) ----------
create table if not exists public.email_templates (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  name        text not null,
  subject_en  text not null,
  subject_ar  text not null default '',
  body_en     text not null,
  body_ar     text not null default '',
  is_active   boolean not null default true,
  updated_at  timestamptz not null default now()
);

alter table public.email_templates enable row level security;

drop policy if exists "email templates read"  on public.email_templates;
create policy "email templates read"
  on public.email_templates for select to authenticated using (true);

drop policy if exists "email templates admin" on public.email_templates;
create policy "email templates admin"
  on public.email_templates for all to authenticated using (true) with check (true);

insert into public.email_templates (key, name, subject_en, body_en) values
  ('welcome',
   'Welcome email',
   'Welcome to Liv Functional, {{name}}',
   'Hi {{name}},\n\nWelcome to Liv Functional. You''ll get one short letter from us each Sunday — a protocol, a study, and one habit to test that week.\n\n— Reham'),
  ('booking_confirmation',
   'Consultation booking confirmation',
   'Your Liv Functional consultation is confirmed',
   'Hi {{name}},\n\nYour {{topic}} on {{date}} at {{time}} (Asia/Kuwait) is confirmed.\n\nYou''ll get a calendar invite and a WhatsApp confirmation shortly.\n\n— Reham'),
  ('payment_confirmation',
   'Payment confirmation',
   'Payment received — {{product}}',
   'Hi {{name}},\n\nWe''ve received your payment of {{amount}} for {{product}}.\n\n{{download_or_next_steps}}\n\n— Reham'),
  ('digital_delivery',
   'Digital product download',
   'Your {{product}} is ready',
   'Hi {{name}},\n\nYour download link: {{download_url}}\n\nThe link expires in 7 days. Reach out if you hit any trouble.\n\n— Reham')
on conflict (key) do nothing;

-- ---------- 9. Reload PostgREST cache ----------
notify pgrst, 'reload schema';
