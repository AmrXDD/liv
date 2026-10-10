import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Download, Lock } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Link } from "@/lib/langRouting";
import { getSupabase } from "@/lib/supabase";
import { INSULIN_RESET_GUIDE_PATH, SELF_GUIDED_PATH } from "@/lib/routes";
import { cn } from "@/lib/utils";

const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "https://www.livfunctional.com").replace(/\/$/, "");
const SOURCE = "insulin-reset-guide";
const HERO =
  "https://qoomqtvldvgqecsvpftg.supabase.co/storage/v1/object/public/product-images/hero/1778942040962-sztet95m.png";

const DOWNLOAD = {
  en: "https://drive.google.com/drive/folders/1JPkOsMVbsKbP6wY0xJFrAi-6MJW95576?usp=sharing",
  ar: "https://drive.google.com/file/d/1bVz-XOF24yM8RCOjZ9qduOwTPo1J795q/view?usp=drive_link",
} as const;

const copy = {
  seoTitle: {
    en: "Free 10-Day Insulin Sensitivity Reset | Liv Functional",
    ar: "إعادة ضبط حساسية الإنسولين خلال 10 أيام، مجانًا | ليف فنكشنال",
  },
  seoDesc: {
    en: "A free, structured 10-day plan for prediabetes, PCOS, high fasting insulin and high A1C. Enter your email to download it.",
    ar: "خطة منظمة مجانية لمدة 10 أيام لما قبل السكري وتكيس المبايض وارتفاع إنسولين الصيام وارتفاع A1C. أدخل بريدك الإلكتروني لتحميلها.",
  },
  eyebrow: { en: "Free self-guided plan", ar: "خطة ذاتية مجانية" },
  title: { en: "10-Day Insulin Sensitivity Reset", ar: "إعادة ضبط حساسية الإنسولين خلال 10 أيام" },
  lede: {
    en: "A structured, science-backed plan for prediabetes, PCOS, elevated fasting insulin and high A1C. No gym, no guesswork.",
    ar: "خطة منظمة ومبنية على العلم لما قبل السكري وتكيس المبايض وارتفاع إنسولين الصيام وارتفاع A1C. بدون نادٍ وبدون تخمين.",
  },
  insideTitle: { en: "What's inside", ar: "ماذا تتضمن الخطة" },
  inside: {
    en: [
      "Nutrition framework with 8 non-negotiable rules",
      "Gut health and fermented food protocol",
      "Movement protocol, no gym needed",
      "Circadian and sleep optimization",
      "Full supplement stack with timing",
      "Behavioral if-then rules",
    ],
    ar: [
      "إطار غذائي مع 8 قواعد أساسية",
      "بروتوكول صحة الأمعاء والأطعمة المخمرة",
      "بروتوكول حركة دون نادٍ",
      "تحسين الإيقاع اليومي والنوم",
      "قائمة مكملات كاملة بالجرعات والتوقيت",
      "قواعد سلوكية بتنسيق إذا/فـ",
    ],
  },
  outcomesTitle: { en: "What to expect", ar: "ما المتوقع" },
  outcomes: {
    en: [
      "Reduced cravings and stable energy",
      "Better sleep and less bloating",
      "Measurable changes in fasting glucose",
      "Gentle habit change that lasts",
    ],
    ar: [
      "شغف أقل وطاقة ثابتة",
      "نوم أفضل وانتفاخ أقل",
      "تغييرات قابلة للقياس في سكر الصيام",
      "تغيير لطيف في العادات يدوم",
    ],
  },
  formTitle: { en: "Get your free copy", ar: "احصل على نسختك المجانية" },
  emailLabel: { en: "Email address", ar: "البريد الإلكتروني" },
  emailPh: { en: "you@example.com", ar: "name@example.com" },
  button: { en: "Send me the plan", ar: "أرسل لي الخطة" },
  sending: { en: "Sending…", ar: "جارٍ الإرسال…" },
  privacy: {
    en: "We'll also send occasional tips on insulin resistance. Unsubscribe any time.",
    ar: "سنرسل لك أيضًا نصائح متفرقة عن مقاومة الإنسولين. يمكنك إلغاء الاشتراك في أي وقت.",
  },
  error: {
    en: "Something went wrong. Please check your email and try again.",
    ar: "حدث خطأ ما. تحقق من بريدك الإلكتروني وحاول مرة أخرى.",
  },
  unlockedTitle: { en: "Your plan is ready", ar: "خطتك جاهزة" },
  unlockedBody: {
    en: "Tap below to open the download. Save a copy to your phone or print it.",
    ar: "اضغط في الأسفل لفتح التحميل. احفظ نسخة على هاتفك أو اطبعها.",
  },
  download: { en: "Download the plan", ar: "تحميل الخطة" },
  disclaimer: {
    en: "Educational information, not medical advice. Talk to your doctor before changing medication or supplements.",
    ar: "معلومات تثقيفية وليست نصيحة طبية. استشر طبيبك قبل تغيير أي دواء أو مكمل.",
  },
  more: { en: "Explore more self-guided programs", ar: "استكشف المزيد من البرامج الجاهزة للتطبيق" },
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Standalone email-gated landing page for the free 10-day insulin sensitivity reset. */
export function InsulinResetGuidePage() {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) {
      setStatus("err");
      return;
    }
    setStatus("loading");
    // Honeypot: bots fill the hidden field. Unlock without saving.
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
      console.error("[insulin-reset-guide] subscribe failed:", err);
      setStatus("err");
    }
  };

  const List = ({ items }: { items: readonly string[] }) => (
    <ul className="space-y-3">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-3 text-[15px] leading-snug">
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-forest-500" aria-hidden />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div dir={dir} className="min-h-screen bg-bone-50 text-ink">
      <SEO
        title={copy.seoTitle[lang]}
        description={copy.seoDesc[lang]}
        path={INSULIN_RESET_GUIDE_PATH}
        image={`${SITE_URL}/og/insulin-reset-guide.png`}
      />
      <div className="mx-auto w-full max-w-2xl px-5 pb-12 pt-5">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-sm font-bold tracking-tight">
            {lang === "ar" ? "ليف فنكشنال" : "Liv Functional"}
          </Link>
          <LanguageSwitcher compact />
        </div>

        <header className="mt-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-forest-500">{copy.eyebrow[lang]}</p>
          <h1 className="mt-3 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {copy.title[lang]}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-balance leading-relaxed text-ink-muted">{copy.lede[lang]}</p>
        </header>

        <img
          src={HERO}
          alt={copy.title[lang]}
          loading="eager"
          className="mx-auto mt-8 w-full max-w-md rounded-2xl shadow-md"
        />

        <section
          aria-live="polite"
          className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8"
        >
          {status === "ok" ? (
            <div className="text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-forest-500 text-bone-50">
                <Check className="h-6 w-6" aria-hidden />
              </div>
              <h2 className="mt-4 text-xl font-bold">{copy.unlockedTitle[lang]}</h2>
              <p className="mt-2 text-ink-muted">{copy.unlockedBody[lang]}</p>
              <a
                href={DOWNLOAD[lang]}
                target="_blank"
                rel="noreferrer"
                className="mt-6 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-forest-500 px-6 py-4 text-base font-semibold text-bone-50 transition-colors hover:bg-forest-600"
              >
                <Download className="h-5 w-5" aria-hidden />
                {copy.download[lang]}
              </a>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <h2 className="flex items-center justify-center gap-2 text-xl font-bold">
                <Lock className="h-4 w-4 text-ink-muted" aria-hidden />
                {copy.formTitle[lang]}
              </h2>
              <label htmlFor="irg-email" className="mt-5 block text-sm font-medium">
                {copy.emailLabel[lang]}
              </label>
              <input
                id="irg-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={copy.emailPh[lang]}
                className="mt-2 block min-h-[56px] w-full rounded-full border border-ink/20 bg-white px-5 text-base outline-none focus:border-forest-500"
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
                className={cn(
                  "mt-4 flex min-h-[56px] w-full items-center justify-center rounded-full bg-forest-500 px-6 py-4",
                  "text-base font-semibold text-bone-50 transition-colors hover:bg-forest-600 disabled:opacity-60"
                )}
              >
                {status === "loading" ? copy.sending[lang] : copy.button[lang]}
              </button>
              {status === "err" && (
                <p role="alert" className="mt-3 text-center text-sm text-red-700">
                  {copy.error[lang]}
                </p>
              )}
              <p className="mt-4 text-center text-xs leading-relaxed text-ink-muted">{copy.privacy[lang]}</p>
            </form>
          )}
        </section>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <section>
            <h2 className="mb-4 text-lg font-bold">{copy.insideTitle[lang]}</h2>
            <List items={copy.inside[lang]} />
          </section>
          <section>
            <h2 className="mb-4 text-lg font-bold">{copy.outcomesTitle[lang]}</h2>
            <List items={copy.outcomes[lang]} />
          </section>
        </div>

        <p className="mt-10 text-center text-xs leading-relaxed text-ink-muted">{copy.disclaimer[lang]}</p>
        <p className="mt-4 text-center text-sm">
          <Link to={SELF_GUIDED_PATH} className="font-semibold underline underline-offset-4">
            {copy.more[lang]}
          </Link>
        </p>
      </div>
    </div>
  );
}
