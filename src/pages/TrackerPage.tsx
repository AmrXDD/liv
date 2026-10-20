import { useState } from "react";
import { ArrowUpRight, Check, Download, Lock, PenLine, Printer, Smartphone } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Link, useUrlLang } from "@/lib/langRouting";
import { getSupabase } from "@/lib/supabase";
import { TRACKER_PATH } from "@/lib/routes";
import { cn } from "@/lib/utils";

const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "https://www.livfunctional.com").replace(/\/$/, "");
const CALL_URL = "https://cal.com/livfunctional/discovery?overlayCalendar=true";
const DL = "/downloads/tracker";
const SOURCE = "book-tracker";
const EN_COVER =
  "https://qoomqtvldvgqecsvpftg.supabase.co/storage/v1/object/public/product-images/hero/1789393620015-kfokceks.png";

const steps = [Printer, Smartphone, PenLine];

/**
 * Per language. The download links stay hidden until the visitor gives a name and email.
 * PDFs live in public/downloads/tracker/ (the gate is a soft one: the file URLs are not secret).
 */
const copy = {
  ar: {
    seoTitle: "صفحات المتابعة لكتاب تغلب على مقاومة الأنسولين | ليف فنكشنال",
    seoDesc:
      "حمّل صفحات الفصلين التاسع والعاشر من كتابك بصيغة PDF. اطبعها أو اكتب عليها من جهازك اللوحي وسجّل أيامك الـ 90.",
    cover: "/tracker-cover.webp",
    coverAlt: "غلاف كتاب تغلب على مقاومة الأنسولين",
    eyebrow: "لقرّاء كتاب تغلب على مقاومة الأنسولين",
    title: "حمّل صفحات المتابعة الخاصة بكتابك",
    lede: "كيندل لا يعرض الصفحات المصممة بالشكل الذي صُممت به، لذلك وضعناها هنا بصيغة PDF جاهزة للطباعة أو للكتابة عليها من جهازك. هذه صفحات الفصلين التاسع والعاشر، من الصفحة 133 إلى 205.",
    all: "تحميل كل الصفحات",
    allFile: `${DL}/liv-arabic-tracker-pages.pdf`,
    allMeta: "ملف واحد، 73 صفحة، 1.2 ميغابايت",
    gateTitle: "أدخل اسمك وبريدك لفتح التحميل",
    nameLabel: "الاسم",
    namePh: "اسمك",
    emailLabel: "البريد الإلكتروني",
    emailPh: "name@example.com",
    gateBtn: "افتح صفحات المتابعة",
    sending: "جارٍ الإرسال…",
    error: "أدخل اسمك وبريدًا إلكترونيًا صحيحًا وحاول مرة أخرى.",
    privacy: "سنرسل لك أيضًا نصائح متفرقة عن مقاومة الإنسولين. يمكنك إلغاء الاشتراك في أي وقت.",
    stepsTitle: "كيف تبدأ",
    steps: [
      { t: "اطبعها", d: "اطبع الصفحات بحجمها الأصلي، واحفظها في ملف. الصفحات مصممة للأبيض والأسود." },
      { t: "أو اكتب على جهازك", d: "افتح الملف في تطبيق مثل GoodNotes أو Notability واكتب عليه بالقلم." },
      { t: "ابدأ باليوم صفر", d: "سجّل خط الأساس قبل تطبيق البروتوكول، ثم دقيقتان كل يوم." },
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
        href: "/coaching/guided-reset-علاج-مقاومة-الانسولين",
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
        href: "/coaching/inner-circle-علاج-السكري-النوع-2-و-مقاومة-الانسولين",
      },
    ],
    planCta: "تفاصيل البرنامج",
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
  },
  en: {
    seoTitle: "Download Your Tracker Pages | Liv Functional",
    seoDesc:
      "Download the Chapter 9 and 10 tracker pages from your book as PDFs. Print them or write on them from your tablet and log your 90 days.",
    cover: EN_COVER,
    coverAlt: "Reverse Insulin Resistance: The 90-Day LIV Method, book cover",
    eyebrow: "For readers of Reverse Insulin Resistance",
    title: "Download your tracker pages",
    lede: "Kindle can't display heavily designed pages, so we put them here as PDFs you can print or write on from your tablet. These are the Chapter 9 and 10 pages from your book.",
    all: "Download all tracker pages",
    allFile: `${DL}/liv-english-tracker-pages.pdf`,
    allMeta: "One file, 76 pages, 1.6 MB",
    gateTitle: "Enter your name and email to unlock the downloads",
    nameLabel: "Name",
    namePh: "Your name",
    emailLabel: "Email address",
    emailPh: "you@example.com",
    gateBtn: "Unlock my tracker pages",
    sending: "Sending…",
    error: "Please enter your name and a valid email and try again.",
    privacy: "We'll also send occasional tips on insulin resistance. Unsubscribe any time.",
    stepsTitle: "How to start",
    steps: [
      { t: "Print them", d: "Print the pages at their original size and keep them in a folder. They're designed for black and white." },
      { t: "Or write on your device", d: "Open the file in an app like GoodNotes or Notability and write on it with a pencil." },
      { t: "Start with day zero", d: "Record your baseline before you start the protocol, then two minutes a day." },
    ],
    coachEyebrow: "Coaching",
    coachTitle: "Don't do the 90 days alone",
    coachBody:
      "After 90 days of logging you have data worth reading. In our coaching programs we read it with you and adjust the plan to your body, from day one to the final review.",
    milestones: [
      { d: "Days 1 to 14", t: "We review your baseline and make sure you're starting the protocol correctly." },
      { d: "Day 30", t: "First review. We compare your numbers to your baseline and adjust." },
      { d: "Day 60", t: "Midpoint review. We lock in what worked and change what didn't." },
      { d: "Day 90", t: "Final review, and a protocol you can run on your own." },
    ],
    plansTitle: "Choose your level of support",
    plans: [
      {
        name: "The Guided Reset Program",
        tag: "Regular check-ins every week",
        points: [
          "60-minute onboarding session and a written protocol for you",
          "Two 15-minute calls every week",
          "WhatsApp group with a 6-hour response",
          "Monthly protocol adjustment based on your CGM data",
        ],
        href: "/coaching/guided-reset-علاج-مقاومة-الانسولين",
      },
      {
        name: "LIV Method Intensive",
        tag: "Your coach with you every day",
        points: [
          "Weekly 30-minute 1:1 session",
          "Daily WhatsApp check-in with a same-day response",
          "Real-time protocol adjustment when your data changes",
          "Supplement schedule and LIV products included",
        ],
        href: "/coaching/inner-circle-علاج-السكري-النوع-2-و-مقاومة-الانسولين",
      },
    ],
    planCta: "Program details",
    callTitle: "Not sure which program fits?",
    callBody:
      "Book a free 30-minute discovery call. Tell us you've started the book so we pick up where you are, and leave knowing your next step.",
    callBtn: "Book your free call",
    allPrograms: "See all coaching programs",
    faqTitle: "Before you start",
    faq: [
      { q: "The file won't open", a: "Open it with a PDF reader such as Adobe Acrobat Reader. On your phone it opens in the Files app or Books." },
      { q: "Do I print everything?", a: "Print day zero and the 90-day map first, then one week at a time. That way no pages get lost." },
      { q: "Do I need the paperback?", a: "No. These are the same pages as Chapters 9 and 10 in your digital copy." },
    ],
    disclaimer: "Educational information, not medical advice. Talk to your doctor before changing medication or supplements.",
  },
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UNLOCK_KEY = "liv-tracker-unlocked";

const readUnlocked = () => {
  try {
    return localStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
};

/** Standalone page for readers of the book: name + email unlocks the tracker downloads, coaching upsell follows. */
export function TrackerPage() {
  const lang = useUrlLang();
  const c = copy[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState("");
  const [unlocked, setUnlocked] = useState(readUnlocked);
  const [status, setStatus] = useState<"idle" | "loading" | "err">("idle");

  const unlock = () => {
    setUnlocked(true);
    try {
      localStorage.setItem(UNLOCK_KEY, "1");
    } catch {
      /* private mode: the page still unlocks for this visit */
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const clean = email.trim().toLowerCase();
    if (!cleanName || !EMAIL_RE.test(clean)) {
      setStatus("err");
      return;
    }
    setStatus("loading");
    // Honeypot: bots fill the hidden field. Unlock without saving.
    if (trap) {
      unlock();
      return;
    }
    const sb = getSupabase();
    const payload = { email: clean, locale: lang, source: `${SOURCE}-${lang}` };
    try {
      if (sb) {
        // The live edge function ignores the name, so save it straight to the table (a duplicate email is fine),
        // then call the function for the welcome email. The name is sent to it too, for when it stores names.
        const ins = await sb.from("newsletter").insert({ ...payload, name: cleanName });
        const fn = await sb.functions.invoke("subscribe-newsletter", { body: { ...payload, name: cleanName } });
        const saved = !ins.error || ins.error.code === "23505";
        if (!saved && fn.error) throw ins.error;
      }
      unlock();
      setStatus("idle");
    } catch (err) {
      console.error("[tracker] subscribe failed:", err);
      setStatus("err");
    }
  };

  const btn =
    "flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-semibold transition-colors";
  const field =
    "mt-2 block min-h-[56px] w-full rounded-full border border-ink/20 bg-white px-5 text-base outline-none focus:border-forest-500";

  return (
    <div dir={dir} lang={lang} className="min-h-screen bg-bone-50 text-ink">
      <SEO
        title={c.seoTitle}
        description={c.seoDesc}
        path={TRACKER_PATH}
        image={`${SITE_URL}/og/default.png`}
      />

      <div className="mx-auto w-full max-w-2xl px-5 pb-14 pt-5">
        <div className="flex justify-end">
          <LanguageSwitcher compact />
        </div>

        <header className="mt-8 text-center">
          <img
            src={c.cover}
            alt={c.coverAlt}
            loading="eager"
            className="mx-auto h-56 w-auto rounded-md shadow-lg"
          />
          <p className="mt-6 text-sm font-semibold text-forest-500">{c.eyebrow}</p>
          <h1 className="mt-3 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {c.title}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-balance leading-relaxed text-ink-muted">{c.lede}</p>
          {unlocked && (
            <>
              <a
                href={c.allFile}
                download
                className={cn(btn, "mx-auto mt-7 max-w-sm bg-forest-500 text-bone-50 hover:bg-forest-600")}
              >
                <Download className="h-5 w-5" aria-hidden />
                {c.all}
              </a>
              <p className="mt-2 text-xs text-ink-muted">{c.allMeta}</p>
            </>
          )}
        </header>

        {!unlocked && (
          <form
            onSubmit={submit}
            noValidate
            aria-live="polite"
            className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 text-start shadow-sm sm:p-8"
          >
            <h2 className="flex items-center justify-center gap-2 text-center text-xl font-bold">
              <Lock className="h-4 w-4 text-ink-muted" aria-hidden />
              {c.gateTitle}
            </h2>
            <label htmlFor="trk-name" className="mt-5 block text-sm font-medium">
              {c.nameLabel}
            </label>
            <input
              id="trk-name"
              type="text"
              autoComplete="name"
              required
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={c.namePh}
              className={field}
            />
            <label htmlFor="trk-email" className="mt-4 block text-sm font-medium">
              {c.emailLabel}
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
              placeholder={c.emailPh}
              className={field}
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
              className={cn(btn, "mt-5 bg-forest-500 text-bone-50 hover:bg-forest-600 disabled:opacity-60")}
            >
              {status === "loading" ? c.sending : c.gateBtn}
            </button>
            {status === "err" && (
              <p role="alert" className="mt-3 text-center text-sm text-red-700">
                {c.error}
              </p>
            )}
            <p className="mt-4 text-center text-xs leading-relaxed text-ink-muted">{c.privacy}</p>
          </form>
        )}

        <section className="mt-12" aria-labelledby="how-title">
          <h2 id="how-title" className="mb-4 text-lg font-bold">
            {c.stepsTitle}
          </h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {c.steps.map(({ t, d }, i) => {
              const Icon = steps[i];
              return (
                <li key={t} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
                  <Icon className="h-6 w-6 text-forest-500" aria-hidden />
                  <h3 className="mt-3 font-bold">{t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{d}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="mt-14 rounded-3xl bg-forest-500 p-6 text-bone-50 sm:p-8" aria-labelledby="coach-title">
          <p className="text-sm font-semibold opacity-80">{c.coachEyebrow}</p>
          <h2 id="coach-title" className="mt-2 text-balance text-2xl font-bold leading-tight">
            {c.coachTitle}
          </h2>
          <p className="mt-3 leading-relaxed opacity-90">{c.coachBody}</p>

          <ol className="mt-6 space-y-3 border-s border-bone-50/30 ps-5">
            {c.milestones.map((m) => (
              <li key={m.d} className="relative">
                <span className="absolute -start-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-bone-50" aria-hidden />
                <p className="text-sm font-bold">{m.d}</p>
                <p className="text-sm leading-relaxed opacity-90">{m.t}</p>
              </li>
            ))}
          </ol>

          <h3 className="mt-8 text-lg font-bold">{c.plansTitle}</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {c.plans.map((p) => (
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
                <Link
                  to={p.href}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4"
                >
                  {c.planCta}
                  <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-8 text-center">
            <h3 className="text-lg font-bold">{c.callTitle}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed opacity-90">{c.callBody}</p>
            <a
              href={CALL_URL}
              target="_blank"
              rel="noreferrer"
              className={cn(btn, "mx-auto mt-5 max-w-sm bg-bone-50 text-forest-500 hover:bg-white")}
            >
              {c.callBtn}
            </a>
            <Link to="/coaching" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
              {c.allPrograms}
            </Link>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="faq-title">
          <h2 id="faq-title" className="mb-4 text-lg font-bold">
            {c.faqTitle}
          </h2>
          <div className="space-y-3">
            {c.faq.map((f) => (
              <details key={f.q} className="rounded-2xl border border-ink/10 bg-white p-4">
                <summary className="cursor-pointer font-semibold">{f.q}</summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <p className="mt-10 text-center text-xs leading-relaxed text-ink-muted">{c.disclaimer}</p>
      </div>
    </div>
  );
}
