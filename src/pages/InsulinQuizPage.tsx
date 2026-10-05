import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/langRouting";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { WHATSAPP_PHONE } from "@/components/ui/WhatsAppFab";
import { DIAL_COUNTRIES, dialLabel } from "@/data/dialCodes";
import { getSupabase } from "@/lib/supabase";
import { renderQuizImage } from "@/lib/quizImage";
import { IR_QUIZ_PATH } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  IR_QUIZ_SOURCE,
  QUIZ_QUESTIONS,
  scoreQuiz,
  type QuizResult,
} from "@/data/irQuiz";

type Step = "intro" | "questions" | "contact" | "result";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "ref", "src"] as const;

const copy = {
  eyebrow: { en: "Free 2-minute quiz", ar: "اختبار مجاني في دقيقتين" },
  title: {
    en: "Do I have insulin resistance?",
    ar: "هل عندي مقاومة أنسولين؟",
  },
  lede: {
    en: "Answer 10 quick questions and see where you sit on the insulin resistance spectrum. You get a one-page result you can keep.",
    ar: "أجب عن 10 أسئلة سريعة وتعرّف أين تقف على طيف مقاومة الأنسولين. وتحصل على نتيجة في صفحة واحدة تحتفظ بها.",
  },
  start: { en: "Start the quiz", ar: "ابدأ الاختبار" },
  back: { en: "Back", ar: "رجوع" },
  contactTitle: { en: "Where should we send your result?", ar: "أين نرسل لك نتيجتك؟" },
  contactLede: {
    en: "Add your name and WhatsApp number. Reham will message you with your next step.",
    ar: "أضف اسمك ورقم واتساب. ستراسلك رهام بخطوتك التالية.",
  },
  name: { en: "First name", ar: "الاسم الأول" },
  country: { en: "Country code", ar: "رمز الدولة" },
  phone: { en: "WhatsApp number", ar: "رقم واتساب" },
  consent: {
    en: "I agree to be contacted on WhatsApp about my result.",
    ar: "أوافق على التواصل معي عبر واتساب بخصوص نتيجتي.",
  },
  see: { en: "Show my result", ar: "أظهر نتيجتي" },
  badPhone: { en: "Please enter a valid WhatsApp number.", ar: "من فضلك أدخل رقم واتساب صحيحًا." },
  resultEyebrow: { en: "Your result", ar: "نتيجتك" },
  openWa: { en: "Send my result to Reham on WhatsApp", ar: "أرسل النتيجة لرهام على واتساب" },
  download: { en: "Download my result (JPG)", ar: "تحميل نتيجتي (JPG)" },
  seoTitle: {
    en: "What are the insulin resistance symptoms and how do I know if I have it?",
    ar: "كيف أعرف إذا في عندي مقاومة أنسولين؟",
  },
  seoDesc: {
    en: "A free 2-minute quiz on common insulin resistance symptoms. See where you sit on the spectrum and get a one-page result on WhatsApp.",
    ar: "اختبار مجاني في دقيقتين عن أعراض مقاومة الأنسولين الشائعة. اعرف أين تقف على الطيف واحصل على نتيجتك في صفحة واحدة عبر واتساب.",
  },
} as const;

/** Dial code + local number -> "+9655xxxxxxx". Accepts a pasted full "+code…" / "00code…" number too. */
function normalizePhone(dial: string, raw: string): string | null {
  let s = raw.trim().replace(/[\s\-().]/g, "");
  s = s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  if (s.startsWith("00")) s = `+${s.slice(2)}`;
  const full = s.startsWith("+") ? s : `+${dial}${s.replace(/^0+/, "")}`;
  return /^\+\d{8,15}$/.test(full) ? full : null;
}

export function InsulinQuizPage() {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const isAr = lang === "ar";
  const t = <K extends keyof typeof copy>(k: K) => copy[k][lang];

  const [step, setStep] = useState<Step>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [dial, setDial] = useState("KW");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState("");
  const [phoneErr, setPhoneErr] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const total = QUIZ_QUESTIONS.length;
  const progress = step === "intro" ? 0 : step === "questions" ? (qIndex / (total + 1)) * 100 : step === "contact" ? (total / (total + 1)) * 100 : 100;

  const utm = useMemo(() => {
    const params = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
    const out: Record<string, string> = {};
    UTM_KEYS.forEach((k) => {
      const v = params.get(k);
      if (v) out[k] = v.slice(0, 120);
    });
    return out;
  }, []);

  const choose = useCallback(
    (optionIndex: number) => {
      const q = QUIZ_QUESTIONS[qIndex];
      setAnswers((a) => ({ ...a, [q.id]: optionIndex }));
      window.setTimeout(() => {
        if (qIndex + 1 >= total) setStep("contact");
        else setQIndex((i) => i + 1);
      }, 220);
    },
    [qIndex, total],
  );

  const goBack = () => {
    if (step === "contact") {
      setStep("questions");
      setQIndex(total - 1);
    } else if (step === "questions") {
      if (qIndex === 0) setStep("intro");
      else setQIndex((i) => i - 1);
    }
  };

  // Keyboard: 1-4 picks an option (Typeform style)
  useEffect(() => {
    if (step !== "questions") return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      const q = QUIZ_QUESTIONS[qIndex];
      if (n >= 1 && n <= q.options.length) choose(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, qIndex, choose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhone(DIAL_COUNTRIES.find((c) => c.iso === dial)?.dial ?? "965", phone);
    if (!normalized) {
      setPhoneErr(true);
      return;
    }
    setPhoneErr(false);
    setSaving(true);
    const scored = scoreQuiz(answers);
    const cleanName = name.trim();

    if (!trap) {
      const sb = getSupabase();
      if (sb) {
        const { error } = await sb.from("quiz_leads").insert({
          source: IR_QUIZ_SOURCE,
          name: cleanName,
          phone: normalized,
          locale: lang,
          score: scored.score,
          score_max: scored.scoreMax,
          band: scored.band.id,
          answers,
          utm,
        });
        if (error) console.error("[quiz] could not save lead:", error);
      }
    }

    setResult(scored);
    try {
      setImageUrl(await renderQuizImage({ name: cleanName, result: scored, lang }));
    } catch (err) {
      console.error("[quiz] image failed:", err);
    }
    setSaving(false);
    setStep("result");
  };

  // Re-render the JPG if the visitor flips language on the result screen
  useEffect(() => {
    if (step !== "result" || !result) return;
    renderQuizImage({ name: name.trim(), result, lang }).then(setImageUrl).catch(() => undefined);
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const waText = useMemo(() => {
    if (!result) return "";
    return isAr
      ? `مرحبًا رهام، أنا ${name.trim()}. أجريت اختبار مقاومة الأنسولين ونتيجتي: ${result.band.label.ar} (${result.percent}٪).`
      : `Hi Reham, I'm ${name.trim()}. I took the insulin resistance quiz and my result is: ${result.band.label.en} (${result.percent}%).`;
  }, [result, name, isAr]);
  const waHref = `https://wa.me/${WHATSAPP_PHONE}${waText ? `?text=${encodeURIComponent(waText)}` : ""}`;

  const Arrow = isAr ? ArrowRight : ArrowLeft;
  const q = QUIZ_QUESTIONS[qIndex];
  const slide = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -16 }, transition: { duration: 0.28 } };

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="flex min-h-screen flex-col bg-bone-100 text-ink">
      <SEO title={t("seoTitle")} description={t("seoDesc")} path={IR_QUIZ_PATH} />

      <div className="fixed inset-x-0 top-0 z-20 h-1.5 bg-ink/10">
        <div className="h-full bg-forest-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <header className="flex items-center justify-between px-5 pb-2 pt-6 md:px-10">
        <Link to="/" aria-label="Liv Functional">
          <span className="relative block h-[54px] w-[84px] overflow-hidden">
            <img
              src="/liv-logo.png"
              alt="Liv Functional"
              className="absolute max-w-none"
              style={{ height: 183, left: -24, top: -55 }}
            />
          </span>
        </Link>
        <LanguageSwitcher compact />
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-8 md:px-8">
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.section key="intro" {...slide}>
              <div className="eyebrow mb-4 text-coral-600">{t("eyebrow")}</div>
              <h1 className="display-serif text-display-lg text-balance font-extrabold tracking-tightest">{t("title")}</h1>
              <p className="mt-5 text-lg leading-relaxed text-ink-muted">{t("lede")}</p>
              <button
                type="button"
                onClick={() => setStep("questions")}
                className="mt-8 inline-flex items-center rounded-full bg-forest-500 px-8 py-4 text-base font-semibold text-white transition hover:bg-forest-600"
              >
                {t("start")}
              </button>
            </motion.section>
          )}

          {step === "questions" && (
            <motion.section key={q.id} {...slide}>
              <div dir="ltr" className="mb-3 text-start text-sm font-semibold text-forest-500" style={{ textAlign: isAr ? "right" : "left" }}>
                {qIndex + 1} / {total}
              </div>
              <h2 className="display-serif text-display-md text-balance font-bold">{q.prompt[lang]}</h2>
              {q.hint && <p className="mt-3 text-ink-muted">{q.hint[lang]}</p>}
              <div className="mt-8 grid gap-3">
                {q.options.map((o, i) => {
                  const selected = answers[q.id] === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => choose(i)}
                      className={cn(
                        "flex items-center gap-4 rounded-2xl border bg-white px-5 py-4 text-start text-base transition",
                        selected ? "border-forest-500 bg-forest-50 ring-2 ring-forest-500/30" : "border-ink/10 hover:border-forest-400",
                      )}
                    >
                      <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg border border-ink/20 text-sm font-semibold">
                        {i + 1}
                      </span>
                      <span>{o.label[lang]}</span>
                    </button>
                  );
                })}
              </div>
              <button type="button" onClick={goBack} className="mt-6 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
                <Arrow className="h-4 w-4" /> {t("back")}
              </button>
            </motion.section>
          )}

          {step === "contact" && (
            <motion.section key="contact" {...slide}>
              <h2 className="display-serif text-display-md text-balance font-bold">{t("contactTitle")}</h2>
              <p className="mt-3 text-ink-muted">{t("contactLede")}</p>
              <form onSubmit={submit} className="mt-8 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium" htmlFor="quiz-name">
                    {t("name")}
                  </label>
                  <input
                    id="quiz-name"
                    required
                    maxLength={120}
                    autoComplete="given-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3.5 text-base focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium" htmlFor="quiz-phone">
                    {t("phone")}
                  </label>
                  <div dir="ltr" className="flex gap-2">
                    <select
                      aria-label={t("country")}
                      value={dial}
                      onChange={(e) => setDial(e.target.value)}
                      className="w-[7.5rem] flex-shrink-0 rounded-2xl border border-ink/10 bg-white px-3 py-3.5 text-base focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                    >
                      {DIAL_COUNTRIES.map((c) => (
                        <option key={c.iso} value={c.iso} label={`${c.iso} +${c.dial}`}>
                          {dialLabel(c, lang)}
                        </option>
                      ))}
                    </select>
                    <input
                      id="quiz-phone"
                      required
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={cn(
                        "min-w-0 flex-1 rounded-2xl border bg-white px-4 py-3.5 text-base focus:outline-none focus:ring-2",
                        phoneErr ? "border-coral-500 focus:ring-coral-500/20" : "border-ink/10 focus:border-forest-500 focus:ring-forest-500/20",
                      )}
                    />
                  </div>
                  {phoneErr && <p className="mt-2 text-sm text-coral-700">{t("badPhone")}</p>}
                </div>
                {/* honeypot: real visitors never see or fill this */}
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  value={trap}
                  onChange={(e) => setTrap(e.target.value)}
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  name="website"
                />
                <label className="flex items-start gap-3 text-sm text-ink-muted">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-forest-500"
                  />
                  <span>{t("consent")}</span>
                </label>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center rounded-full bg-forest-500 px-8 py-4 text-base font-semibold text-white transition hover:bg-forest-600 disabled:opacity-60 sm:w-auto"
                >
                  {saving ? "…" : t("see")}
                </button>
              </form>
              <button type="button" onClick={goBack} className="mt-6 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
                <Arrow className="h-4 w-4" /> {t("back")}
              </button>
            </motion.section>
          )}

          {step === "result" && result && (
            <motion.section key="result" {...slide}>
              <div className="eyebrow mb-3 text-coral-600">{t("resultEyebrow")}</div>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={result.band.label[lang]}
                  className="w-full rounded-3xl border border-ink/10 shadow-elevation"
                />
              ) : (
                <div className="rounded-3xl border border-ink/10 bg-white p-8">
                  <div className="display-serif text-4xl font-extrabold" style={{ color: result.band.color }}>
                    {result.band.label[lang]}
                  </div>
                  <p className="mt-4 text-ink-muted">{result.band.summary[lang]}</p>
                </div>
              )}
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center rounded-full bg-[#25D366] px-8 py-4 text-base font-semibold text-white shadow-elevation transition hover:brightness-95"
              >
                {t("openWa")}
              </a>
              {imageUrl && (
                <a
                  href={imageUrl}
                  download="liv-insulin-resistance-result.jpg"
                  className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-forest-600 hover:underline"
                >
                  <Download className="h-4 w-4" /> {t("download")}
                </a>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
