import { Helmet } from "react-helmet-async";
import { ArrowUpRight, Check, Download, PenLine, Printer, Smartphone } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { TRACKER_PATH } from "@/lib/routes";
import { cn } from "@/lib/utils";

const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "https://www.livfunctional.com").replace(/\/$/, "");
const CALL_URL = "https://cal.com/livfunctional/discovery?overlayCalendar=true";
const DL = "/downloads/tracker";

/**
 * Arabic first. The English page reuses this component: add an `en` copy block and
 * file set, then pick by language and bring back the language switcher.
 */
const LANG = "ar" as const;

const ar = {
  seoTitle: "صفحات المتابعة لكتاب تغلب على مقاومة الأنسولين | ليف فنكشنال",
  seoDesc:
    "حمّل صفحات الفصلين التاسع والعاشر من كتابك بصيغة PDF. اطبعها أو اكتب عليها من جهازك اللوحي وسجّل أيامك الـ 90.",
  name: "ليف فنكشنال",
  coverAlt: "غلاف كتاب تغلب على مقاومة الأنسولين",
  eyebrow: "لقرّاء كتاب تغلب على مقاومة الأنسولين",
  title: "حمّل صفحات المتابعة الخاصة بكتابك",
  lede: "كيندل لا يعرض الصفحات المصممة بالشكل الذي صُممت به، لذلك وضعناها هنا بصيغة PDF جاهزة للطباعة أو للكتابة عليها من جهازك. هذه صفحات الفصلين التاسع والعاشر، من الصفحة 133 إلى 205.",
  all: "تحميل كل الصفحات",
  allMeta: "ملف واحد، 73 صفحة، 1.2 ميغابايت",
  or: "أو حمّل كل فصل لوحده",
  download: "تحميل PDF",
  files: [
    {
      id: "ch9",
      chapter: "الفصل التاسع",
      title: "السجل اليومي",
      desc: "اليوم صفر، وصفحة لكل يوم من الأيام الـ 90، ولقطة أسبوعية في نهاية كل أسبوع.",
      meta: "الصفحات 133 إلى 194، 1.1 ميغابايت",
      file: `${DL}/liv-tracker-chapter-9-daily-log.pdf`,
    },
    {
      id: "ch10",
      chapter: "الفصل العاشر",
      title: "المراجعات الأسبوعية",
      desc: "عشر دقائق كل أسبوع لتقرأ أرقامك وتلاحظ الأنماط، ثم ختام البروتوكول.",
      meta: "الصفحات 195 إلى 205، 0.4 ميغابايت",
      file: `${DL}/liv-tracker-chapter-10-weekly-reviews.pdf`,
    },
  ],
  allFile: `${DL}/liv-arabic-tracker-pages.pdf`,
  stepsTitle: "كيف تبدأ",
  steps: [
    { icon: Printer, t: "اطبعها", d: "اطبع الصفحات بحجمها الأصلي، واحفظها في ملف. الصفحات مصممة للأبيض والأسود." },
    { icon: Smartphone, t: "أو اكتب على جهازك", d: "افتح الملف في تطبيق مثل GoodNotes أو Notability واكتب عليه بالقلم." },
    { icon: PenLine, t: "ابدأ باليوم صفر", d: "سجّل خط الأساس قبل تطبيق البروتوكول، ثم دقيقتان كل يوم." },
  ],
  coachEyebrow: "التنفيذ مع مدربة",
  coachTitle: "لا تنفذ الأيام الـ 90 وحدك",
  coachBody:
    "عندما تسجل 90 يومًا من الأرقام يصير عندك بيانات تستحق أن تُقرأ. في برامج التدريب نقرؤها معك ونعدّل الخطة على جسمك أنت، من اليوم الأول حتى المراجعة النهائية.",
  milestones: [
    { d: "اليوم 1 إلى 14", t: "نراجع خط الأساس ونتأكد أنك تبدأ البروتوكول بشكل صحيح." },
    { d: "اليوم 30", t: "أول مراجعة. نقارن أرقامك بخط الأساس ونعدّل." },
    { d: "اليوم 60", t: "مراجعة منتصف الطريق. نثبّت ما نجح ونغيّر ما لم ينجح." },
    { d: "اليوم 90", t: "المراجعة النهائية، وبروتوكول تكمل به بنفسك." },
  ],
  plansTitle: "اختر مستوى المتابعة",
  plans: [
    {
      name: "برنامج تصحيح المسار",
      tag: "متابعة منتظمة خلال الأسبوع",
      points: [
        "جلسة تعريفية مدتها 60 دقيقة وبروتوكول مكتوب لك",
        "مكالمتان أسبوعيًا، 15 دقيقة لكل مكالمة",
        "مجموعة واتساب والرد خلال 6 ساعات",
        "تعديل البروتوكول كل شهر على بيانات جهاز الجلوكوز",
      ],
      cta: "تفاصيل البرنامج",
      href: "/ar/coaching/guided-reset-علاج-مقاومة-الانسولين",
    },
    {
      name: "برنامج طريقة LIV المكثّف",
      tag: "المدربة معك كل يوم",
      points: [
        "جلسة فردية أسبوعية مدتها 30 دقيقة",
        "متابعة يومية عبر واتساب والرد في اليوم نفسه",
        "تعديل البروتوكول لحظة تتغير بياناتك",
        "جدول مكملات ومنتجات LIV ضمن البرنامج",
      ],
      cta: "تفاصيل البرنامج",
      href: "/ar/coaching/inner-circle-علاج-السكري-النوع-2-و-مقاومة-الانسولين",
    },
  ],
  callTitle: "غير متأكد أي برنامج يناسبك؟",
  callBody:
    "احجز مكالمة تعريفية مجانية مدتها 30 دقيقة. أخبرنا أنك بدأت الكتاب لنبدأ من حيث وصلت، وتخرج وأنت تعرف خطوتك التالية.",
  callBtn: "احجز مكالمتك المجانية",
  allPrograms: "شاهد كل برامج التدريب",
  faqTitle: "أسئلة قبل أن تبدأ",
  faq: [
    { q: "الملف لا يفتح عندي", a: "افتحه بتطبيق قارئ PDF مثل Adobe Acrobat Reader. على الهاتف يعمل في تطبيق الملفات أو Books." },
    { q: "هل أطبع الصفحات كلها؟", a: "اطبع اليوم صفر وخريطة الأيام التسعين أولًا، ثم أسبوعًا بأسبوع. هكذا لا تضيع منك الصفحات." },
    { q: "هل أحتاج النسخة الورقية من الكتاب؟", a: "لا. هذه الصفحات هي نفسها الموجودة في الفصلين التاسع والعاشر من نسختك الرقمية." },
  ],
  disclaimer: "معلومات تثقيفية وليست نصيحة طبية. استشر طبيبك قبل تغيير أي دواء أو مكمل.",
} as const;

/** Standalone page for readers of the book: tracker downloads first, coaching upsell second. */
export function TrackerPage() {
  const btn =
    "flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-semibold transition-colors";

  return (
    <div dir="rtl" lang={LANG} className="min-h-screen bg-bone-50 text-ink">
      <SEO
        title={ar.seoTitle}
        description={ar.seoDesc}
        path={TRACKER_PATH}
        image={`${SITE_URL}/og/default.png`}
      />
      {/* /tracker is served at the English root, so pin the document to Arabic. */}
      <Helmet>
        <html lang="ar" dir="rtl" />
      </Helmet>

      <div className="mx-auto w-full max-w-2xl px-5 pb-14 pt-5">
        <a href="/ar" className="text-sm font-bold tracking-tight">
          {ar.name}
        </a>

        <header className="mt-8 text-center">
          <img
            src="/tracker-cover.webp"
            alt={ar.coverAlt}
            width={625}
            height={1000}
            loading="eager"
            className="mx-auto h-56 w-auto rounded-md shadow-lg"
          />
          <p className="mt-6 text-sm font-semibold text-forest-500">{ar.eyebrow}</p>
          <h1 className="mt-3 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {ar.title}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-balance leading-relaxed text-ink-muted">{ar.lede}</p>
          <a
            href={ar.allFile}
            download
            className={cn(btn, "mx-auto mt-7 max-w-sm bg-forest-500 text-bone-50 hover:bg-forest-600")}
          >
            <Download className="h-5 w-5" aria-hidden />
            {ar.all}
          </a>
          <p className="mt-2 text-xs text-ink-muted">{ar.allMeta}</p>
        </header>

        <section className="mt-10" aria-labelledby="dl-title">
          <h2 id="dl-title" className="mb-4 text-lg font-bold">
            {ar.or}
          </h2>
          <ul className="space-y-3">
            {ar.files.map((d) => (
              <li
                key={d.id}
                className="flex flex-col gap-4 rounded-2xl border border-ink/10 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-forest-500">{d.chapter}</p>
                  <h3 className="mt-1 text-lg font-bold">{d.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{d.desc}</p>
                  <p className="mt-1 text-xs text-ink-muted">{d.meta}</p>
                </div>
                <a
                  href={d.file}
                  download
                  className={cn(btn, "border border-forest-500 text-forest-500 hover:bg-forest-500 hover:text-bone-50 sm:w-auto sm:shrink-0")}
                >
                  <Download className="h-5 w-5" aria-hidden />
                  {ar.download}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12" aria-labelledby="how-title">
          <h2 id="how-title" className="mb-4 text-lg font-bold">
            {ar.stepsTitle}
          </h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {ar.steps.map(({ icon: Icon, t, d }) => (
              <li key={t} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
                <Icon className="h-6 w-6 text-forest-500" aria-hidden />
                <h3 className="mt-3 font-bold">{t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 rounded-3xl bg-forest-500 p-6 text-bone-50 sm:p-8" aria-labelledby="coach-title">
          <p className="text-sm font-semibold opacity-80">{ar.coachEyebrow}</p>
          <h2 id="coach-title" className="mt-2 text-balance text-2xl font-bold leading-tight">
            {ar.coachTitle}
          </h2>
          <p className="mt-3 leading-relaxed opacity-90">{ar.coachBody}</p>

          <ol className="mt-6 space-y-3 border-s border-bone-50/30 ps-5">
            {ar.milestones.map((m) => (
              <li key={m.d} className="relative">
                <span className="absolute -start-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-bone-50" aria-hidden />
                <p className="text-sm font-bold">{m.d}</p>
                <p className="text-sm leading-relaxed opacity-90">{m.t}</p>
              </li>
            ))}
          </ol>

          <h3 className="mt-8 text-lg font-bold">{ar.plansTitle}</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {ar.plans.map((p) => (
              <article key={p.name} className="flex flex-col rounded-2xl bg-white p-5 text-ink">
                <h4 className="text-lg font-bold">{p.name}</h4>
                <p className="mt-1 text-sm text-forest-500">{p.tag}</p>
                <ul className="mt-4 flex-1 space-y-2.5">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 text-sm leading-snug">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest-500" aria-hidden />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={p.href}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4"
                >
                  {p.cta}
                  <ArrowUpRight className="h-4 w-4 -scale-x-100" aria-hidden />
                </a>
              </article>
            ))}
          </div>

          <div className="mt-8 text-center">
            <h3 className="text-lg font-bold">{ar.callTitle}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed opacity-90">{ar.callBody}</p>
            <a
              href={CALL_URL}
              target="_blank"
              rel="noreferrer"
              className={cn(btn, "mx-auto mt-5 max-w-sm bg-bone-50 text-forest-500 hover:bg-white")}
            >
              {ar.callBtn}
            </a>
            <a href="/ar/coaching" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
              {ar.allPrograms}
            </a>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="faq-title">
          <h2 id="faq-title" className="mb-4 text-lg font-bold">
            {ar.faqTitle}
          </h2>
          <div className="space-y-3">
            {ar.faq.map((f) => (
              <details key={f.q} className="rounded-2xl border border-ink/10 bg-white p-4">
                <summary className="cursor-pointer font-semibold">{f.q}</summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <p className="mt-10 text-center text-xs leading-relaxed text-ink-muted">{ar.disclaimer}</p>
      </div>
    </div>
  );
}
