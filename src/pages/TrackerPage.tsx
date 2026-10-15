import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Bell, Check, Download, Printer, Smartphone, PenLine } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { getSupabase } from "@/lib/supabase";
import { TRACKER_PATH } from "@/lib/routes";
import { cn } from "@/lib/utils";

const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "https://www.livfunctional.com").replace(/\/$/, "");
const SOURCE = "book-tracker";
const BOOK_IMG =
  "https://qoomqtvldvgqecsvpftg.supabase.co/storage/v1/object/public/product-images/hero/1789393620015-kfokceks.png";
const CALL_URL = "https://cal.com/livfunctional/discovery?overlayCalendar=true";

/**
 * Arabic first. The English page reuses this component: add an `en` copy block, flip `LANG`
 * to read from i18n, and bring back the language switcher.
 */
const LANG = "ar" as const;

/**
 * Downloadable agenda pages. Drop the PDF in public/downloads/tracker/ and set `file`
 * to its path; an item without a file shows "coming soon" with the notify form.
 */
const DOWNLOADS: { id: string; chapter: string; title: string; desc: string; file: string | null }[] = [
  {
    id: "ch9",
    chapter: "الفصل التاسع",
    title: "السجل اليومي",
    desc: "13 أسبوعًا لتسجل فيها أيامك الـ 90، مع لقطة أسبوعية تلخص ما لاحظته.",
    file: null,
  },
  {
    id: "ch10",
    chapter: "الفصل العاشر",
    title: "صفحات المتابعة",
    desc: "الصفحات المصاحبة للفصل العاشر.",
    file: null,
  },
];

const ar = {
  seoTitle: "صفحات المتابعة لكتاب التغلب على مقاومة الإنسولين | ليف فنكشنال",
  seoDesc:
    "حمّل صفحات المتابعة المصممة لقرّاء الكتاب. اطبعها أو افتحها على جهازك اللوحي وسجّل أيامك الـ 90.",
  name: "ليف فنكشنال",
  eyebrow: "لمن اشترى الكتاب",
  title: "صفحات المتابعة جاهزة للتحميل",
  lede: "كيندل لا يعرض الصفحات المصممة كما هي. حمّلها هنا، اطبعها أو افتحها على جهازك اللوحي، وابدأ تسجيل أيامك الـ 90.",
  bookAlt: "غلاف كتاب التغلب على مقاومة الإنسولين",
  downloadsTitle: "حمّل صفحاتك",
  download: "تحميل PDF",
  soon: "قريبًا",
  stepsTitle: "كيف تستخدمها",
  steps: [
    { icon: Printer, t: "اطبعها", d: "على ورق A4. اطبع صفحة واحدة لكل ورقة، واحفظها في ملف." },
    { icon: Smartphone, t: "أو افتحها على جهازك", d: "في تطبيق مثل GoodNotes أو Notability واكتب عليها بالقلم." },
    { icon: PenLine, t: "سجّل يومك", d: "دقيقتان في آخر اليوم. وفي نهاية كل أسبوع أكمل اللقطة الأسبوعية." },
  ],
  notifyTitle: "أخبرني عندما تجهز",
  notifyBody: "اترك بريدك وسنرسل لك رابط الفصل التاسع والعاشر فور إضافتها.",
  emailLabel: "البريد الإلكتروني",
  emailPh: "name@example.com",
  notifyBtn: "أرسل لي الرابط",
  sending: "جارٍ الإرسال…",
  error: "حدث خطأ ما. تحقق من بريدك الإلكتروني وحاول مرة أخرى.",
  notifyOk: "تم. سنرسل لك الرابط عندما تجهز الصفحات.",
  coachEyebrow: "التنفيذ مع مدربة",
  coachTitle: "ثلاثة أشهر أسهل عندما يكون معك أحد",
  coachBody:
    "القراءة انتهت، والباقي التزام يومي. في برامج التدريب نمشي معك من اليوم الأول حتى اليوم التسعين. سجلك اليومي يصير مرجع المتابعة، ونعدّل الخطة على أرقامك أنت.",
  plans: [
    {
      name: "برنامج تصحيح المسار",
      tag: "الأنسب لمن يريد متابعة منتظمة",
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
      tag: "الأنسب لمن يريد أن يكون المدرب معه كل يوم",
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
  callBody: "احجز مكالمة تعريفية مجانية مدتها 30 دقيقة. تخرج منها وأنت تعرف خطوتك التالية.",
  callBtn: "احجز مكالمتك المجانية",
  allPrograms: "شاهد كل برامج التدريب",
  disclaimer: "معلومات تثقيفية وليست نصيحة طبية. استشر طبيبك قبل تغيير أي دواء أو مكمل.",
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Standalone page for readers who bought the book: tracker downloads first, coaching upsell second. */
export function TrackerPage() {
  const { i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  const hasPending = DOWNLOADS.some((d) => !d.file);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) {
      setStatus("err");
      return;
    }
    setStatus("loading");
    // Honeypot: bots fill the hidden field. Report success without saving.
    if (trap) {
      setStatus("ok");
      return;
    }
    const sb = getSupabase();
    const payload = { email: clean, locale: i18n.language, source: SOURCE };
    try {
      if (sb) {
        const { error: fnErr } = await sb.functions.invoke("subscribe-newsletter", { body: payload });
        if (fnErr) {
          const { error } = await sb.from("newsletter").insert(payload);
          if (error) throw error;
        }
      }
      setStatus("ok");
    } catch (err) {
      console.error("[tracker] subscribe failed:", err);
      setStatus("err");
    }
  };

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
            src={BOOK_IMG}
            alt={ar.bookAlt}
            loading="eager"
            className="mx-auto h-44 w-auto rounded-lg shadow-md"
          />
          <p className="mt-6 text-xs font-semibold tracking-widest text-forest-500">{ar.eyebrow}</p>
          <h1 className="mt-3 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {ar.title}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-balance leading-relaxed text-ink-muted">{ar.lede}</p>
        </header>

        <section className="mt-10" aria-labelledby="dl-title">
          <h2 id="dl-title" className="mb-4 text-lg font-bold">
            {ar.downloadsTitle}
          </h2>
          <ul className="space-y-3">
            {DOWNLOADS.map((d) => (
              <li
                key={d.id}
                className="flex flex-col gap-4 rounded-2xl border border-ink/10 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-forest-500">{d.chapter}</p>
                  <h3 className="mt-1 text-lg font-bold">{d.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{d.desc}</p>
                </div>
                {d.file ? (
                  <a
                    href={d.file}
                    download
                    className={cn(btn, "bg-forest-500 text-bone-50 hover:bg-forest-600 sm:w-auto sm:shrink-0")}
                  >
                    <Download className="h-5 w-5" aria-hidden />
                    {ar.download}
                  </a>
                ) : (
                  <span className="inline-flex shrink-0 items-center justify-center self-start rounded-full bg-ink/5 px-4 py-2 text-sm font-semibold text-ink-muted sm:self-center">
                    {ar.soon}
                  </span>
                )}
              </li>
            ))}
          </ul>

          {hasPending && (
            <form
              onSubmit={submit}
              noValidate
              aria-live="polite"
              className="mt-4 rounded-2xl border border-dashed border-ink/20 p-5"
            >
              {status === "ok" ? (
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Check className="h-5 w-5 text-forest-500" aria-hidden />
                  {ar.notifyOk}
                </p>
              ) : (
                <>
                  <h3 className="flex items-center gap-2 font-bold">
                    <Bell className="h-4 w-4 text-ink-muted" aria-hidden />
                    {ar.notifyTitle}
                  </h3>
                  <p className="mt-1 text-sm text-ink-muted">{ar.notifyBody}</p>
                  <label htmlFor="trk-email" className="sr-only">
                    {ar.emailLabel}
                  </label>
                  <input
                    id="trk-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={ar.emailPh}
                    className="mt-3 block min-h-[56px] w-full rounded-full border border-ink/20 bg-white px-5 text-base outline-none focus:border-forest-500"
                  />
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                    value={trap}
                    onChange={(e) => setTrap(e.target.value)}
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className={cn(btn, "mt-3 border border-forest-500 text-forest-500 hover:bg-forest-500 hover:text-bone-50 disabled:opacity-60")}
                  >
                    {status === "loading" ? ar.sending : ar.notifyBtn}
                  </button>
                  {status === "err" && (
                    <p role="alert" className="mt-3 text-center text-sm text-red-700">
                      {ar.error}
                    </p>
                  )}
                </>
              )}
            </form>
          )}
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
          <p className="text-xs font-semibold tracking-widest opacity-80">{ar.coachEyebrow}</p>
          <h2 id="coach-title" className="mt-2 text-balance text-2xl font-bold leading-tight">
            {ar.coachTitle}
          </h2>
          <p className="mt-3 leading-relaxed opacity-90">{ar.coachBody}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {ar.plans.map((p) => (
              <article key={p.name} className="flex flex-col rounded-2xl bg-white p-5 text-ink">
                <h3 className="text-lg font-bold">{p.name}</h3>
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
              className={cn(btn, "mt-5 bg-bone-50 text-forest-500 hover:bg-white")}
            >
              {ar.callBtn}
            </a>
            <a href="/ar/coaching" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
              {ar.allPrograms}
            </a>
          </div>
        </section>

        <p className="mt-10 text-center text-xs leading-relaxed text-ink-muted">{ar.disclaimer}</p>
      </div>
    </div>
  );
}
