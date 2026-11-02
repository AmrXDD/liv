import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/lib/langRouting";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { WHATSAPP_PHONE } from "@/components/ui/WhatsAppFab";
import { DIAL_COUNTRIES, dialLabel } from "@/data/dialCodes";
import { getSupabase } from "@/lib/supabase";
import { renderQuizImage } from "@/lib/quizImage";
import { MENO_QUIZ_PATH, SELF_GUIDED_PATH } from "@/lib/routes";
import { useProduct } from "@/lib/queries";
import { cn, formatPrice } from "@/lib/utils";
import type { QuizResult } from "@/data/irQuiz";
import {
  hasFlaggedLabs,
  hasLowMoodFlag,
  MENO_SUPPORT_NOTE,
  MENO_DISCLAIMER,
  MENO_DOCTOR_NOTE,
  MENO_PLAN_SLUG,
  MENO_QUESTIONS,
  MENO_QUIZ_SOURCE,
  MENO_VIDEO_POSTER,
  MENO_VIDEO_URL,
  PERI_PLAN_SLUG,
  scoreMenoQuiz,
  stageFromAnswers,
  topSymptoms,
} from "@/data/menoQuiz";

type Step = "intro" | "questions" | "contact" | "result";
type L = { en: string; ar: string };

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "ref", "src"] as const;

const copy = {
  eyebrow: { en: "Free 2-minute quiz", ar: "اختبار مجاني بدقيقتين" },
  title: {
    en: "Is menopause changing your metabolism?",
    ar: "هل انقطاع الطمث عم يغيّر الأيض عندك؟",
  },
  lede: {
    en: "Answer 13 quick questions and see where you sit on the metabolic scale of perimenopause and menopause. You get a score and a plan built around your answers.",
    ar: "جاوبي على 13 سؤال سريع وشوفي وين إنتي على مقياس الأيض في مرحلة ما قبل انقطاع الطمث وانقطاعه. بتاخدي نتيجة وخطة مبنية على إجاباتك.",
  },
  start: { en: "Start the quiz", ar: "ابدأي الاختبار" },
  back: { en: "Back", ar: "رجوع" },
  contactTitle: { en: "Let's customize your plan", ar: "خلّينا نخصّص خطتك" },
  contactLede: {
    en: "Enter your name and WhatsApp number. We send your plan link to WhatsApp, and Reham reads your result personally.",
    ar: "اكتبي اسمك ورقم الواتساب. منبعتلك رابط خطتك عالواتساب، ورهام بتقرا نتيجتك بنفسها.",
  },
  name: { en: "First name", ar: "الاسم الأول" },
  country: { en: "Country code", ar: "رمز الدولة" },
  phone: { en: "WhatsApp number", ar: "رقم الواتساب" },
  consent: {
    en: "I agree to be contacted on WhatsApp about my result and plan.",
    ar: "بوافق تتواصلوا معي عالواتساب بخصوص نتيجتي وخطتي.",
  },
  see: { en: "Show my result", ar: "أظهري نتيجتي" },
  badPhone: { en: "Please enter a valid WhatsApp number.", ar: "من فضلك اكتبي رقم واتساب صحيح." },
  seoTitle: {
    en: "Is menopause changing your metabolism? Free quiz",
    ar: "هل انقطاع الطمث عم يغيّر الأيض عندك؟ اختبار مجاني",
  },
  seoDesc: {
    en: "A free 2-minute quiz on how perimenopause and menopause affect your muscle, sleep and insulin. Get your score and a plan built around your answers.",
    ar: "اختبار مجاني بدقيقتين عن تأثير ما قبل انقطاع الطمث وانقطاعه على العضل والنوم والأنسولين. بتاخدي نتيجتك وخطة مبنية على إجاباتك.",
  },
} as const;

/** Result page = sales page. Every string is {en, ar}; Arabic is Lebanese. */
const sales = {
  resultEyebrow: { en: "Your result", ar: "نتيجتك" },
  headline: (name: string): L => ({
    en: `${name}, your body is not broken. Your hormones changed the rules.`,
    ar: `${name}، جسمك مش خربان. هرموناتك غيّرت القواعد.`,
  }),
  scoreLine: (pct: number): L => ({
    en: `Your menopause metabolic score: ${pct}%`,
    ar: `نتيجتك على مقياس الأيض في انقطاع الطمث: ${pct}٪`,
  }),
  videoCaption: {
    en: "Watch this first. Reham, in her own words.",
    ar: "شوفي هالفيديو أول شي. رهام، بكلامها.",
  },
  youToldMe: { en: "What you told me", ar: "شو قلتيلي" },
  youToldMeBody: {
    en: "These are the answers that scored highest. They are not random. They often share one cause.",
    ar: "هيدي الإجابات اللي إجت أعلى نتيجة. مش صدفة. غالبًا إلها سبب مشترك.",
  },
  costTitle: { en: "Why \"normal\" is not the same as fine", ar: "ليش \"طبيعي\" مش معناها منيح" },
  cost: [
    {
      en: "A routine check-up looks at 10 to 19 markers. It usually skips fasting insulin, ferritin and a full thyroid panel.",
      ar: "الفحص العادي بيطلع على 10 لـ19 مؤشر. وغالبًا بيتجاهل أنسولين الصيام والفيريتين وفحوصات الغدة الكاملة.",
    },
    {
      en: "Insulin can climb for years while fasting glucose still reads normal. By the time glucose is flagged, the shift has been running for a long time.",
      ar: "الأنسولين ممكن يضل يرتفع سنين وسكر الصيام لسا طبيعي. لما السكر يتعلّم عليه، التغيّر يكون صار له وقت طويل.",
    },
    {
      en: "When estrogen drops, muscle responds less to protein. Without enough protein and weights, you may lose muscle, and belly fat and a slower metabolism may follow.",
      ar: "لما الإستروجين بينزل، العضل بيستجيب أقل للبروتين. بدون بروتين كافي وأوزان، ممكن تخسري عضل، وممكن يتبعها دهن بطن وأيض أبطأ.",
    },
    {
      en: "\"Normal\" on a lab report is the average of the people who visited that lab. It does not mean optimal for you.",
      ar: "\"طبيعي\" بورقة التحليل هو متوسط الناس اللي إجوا عالمختبر. مش معناها مثالي إلك.",
    },
  ] as L[],
  waitLine: {
    en: "Every month of \"wait and see\" is a month your muscle, sleep and insulin run without a plan.",
    ar: "كل شهر \"منستنى ونشوف\" هو شهر عضلك ونومك وأنسولينك بيمشوا بدون خطة.",
  },
  failTitle: { en: "Why what you tried did not work", ar: "ليش اللي جرّبتيه ما نفع" },
  fail: [
    {
      old: { en: "Eat less", ar: "كلي أقل" },
      now: { en: "Midlife muscle needs more protein, 30 to 40 g per meal, not less food.", ar: "عضل هالعمر بدو بروتين أكتر، 30 لـ40 غرام بكل وجبة، مش أكل أقل." },
    },
    {
      old: { en: "Do more cardio", ar: "اعملي كارديو أكتر" },
      now: { en: "Lifting weights protects the muscle that keeps your metabolism running.", ar: "الأوزان بتحمي العضل اللي بيخلّي الأيض شغّال." },
    },
    {
      old: { en: "Your labs are normal", ar: "تحاليلك طبيعية" },
      now: { en: "Normal is the population average. Functional ranges show what is optimal for you.", ar: "طبيعي هو متوسط الناس. الحدود الوظيفية بتبيّن شو المثالي إلك." },
    },
  ] as { old: L; now: L }[],
  planEyebrow: { en: "Your plan", ar: "خطتك" },
  planTitle: (stage: "peri" | "meno"): L =>
    stage === "peri"
      ? { en: "Perimenopause Management Plan", ar: "خطة إدارة مرحلة قبل سن الأمل" }
      : { en: "Menopause Plan", ar: "خطة لمرحلة سن الأمل" },
  planTagline: (stage: "peri" | "meno"): L =>
    stage === "peri"
      ? { en: "The smart way to work with your body during the changes.", ar: "الطريقة الذكية لتشتغلي مع جسمك خلال التغيّرات." }
      : { en: "A detailed health plan to live stronger and healthier.", ar: "خطة صحية مفصّلة لتعيشي أقوى وأصحّ." },
  planLede: {
    en: "Built around your numbers and your answers, not a template. Every part follows the 5 pillars of the Liv Method.",
    ar: "مبنية على أرقامك وإجاباتك، مش قالب جاهز. كل جزء فيها بيتبع ركائز منهج ليف الخمس.",
  },
  planItems: (stage: "peri" | "meno"): { title: L; body: L }[] => [
    {
      title: { en: "Nervous system and sleep", ar: "الجهاز العصبي والنوم" },
      body: {
        en: "A short evening routine aimed at the 2 to 4 am wake-ups and night sweats.",
        ar: "روتين مسائي قصير موجّه لصحيان الفجر والتعرّق الليلي.",
      },
    },
    {
      title: { en: "Gut and hormone food strategy", ar: "الأمعاء وأكل الهرمونات" },
      body: {
        en: "Fibre and cruciferous foods that may support how your body clears estrogen.",
        ar: "ألياف وخضار صليبية ممكن تدعم طريقة جسمك بالتخلّص من الإستروجين.",
      },
    },
    {
      title: { en: "Protein and leucine targets", ar: "أهداف البروتين والليوسين" },
      body: {
        en: "30 to 40 g per meal, set from your body weight and the foods you already eat.",
        ar: "30 لـ40 غرام بكل وجبة، محسوبة من وزنك والأكل اللي بتاكليه أصلًا.",
      },
    },
    {
      title: { en: "Your lab list in functional ranges", ar: "لائحة تحاليلك بالحدود الوظيفية" },
      body: {
        en: "Fasting insulin, ferritin, full thyroid, vitamin D and more, and how to read each result against optimal, not average.",
        ar: "أنسولين الصيام، الفيريتين، الغدة كاملة، فيتامين د وغيرها، وكيف تقرايها مقابل المثالي، مش المتوسط.",
      },
    },
    {
      title: { en: "Strength training plan", ar: "خطة تمارين الأوزان" },
      body: {
        en: "Two to three short sessions a week to protect muscle, bone and metabolism.",
        ar: "جلستين أو تلات قصار بالأسبوع لتحمي العضل والعظم والأيض.",
      },
    },
    stage === "peri"
      ? {
          title: { en: "Cycle-aware adjustments", ar: "تعديلات حسب الدورة" },
          body: {
            en: "What to change in the weeks your periods are late, heavy or unpredictable.",
            ar: "شو تغيّري بالأسابيع اللي بتتأخر فيها الدورة أو بتكون غزيرة أو غير متوقعة.",
          },
        }
      : {
          title: { en: "Post-menopause targets", ar: "أهداف ما بعد انقطاع الطمث" },
          body: {
            en: "Priorities for muscle, bone and insulin now that periods have stopped.",
            ar: "الأولويات للعضل والعظم والأنسولين بعد ما وقفت الدورة.",
          },
        },
  ],
  personalTitle: { en: "I read your result myself", ar: "أنا بقرا نتيجتك بنفسي" },
  personalBody: {
    en: "No bot, no assistant. Send me your result on WhatsApp and I reply personally, in the order they arrive. We go through your answers and your numbers together before you decide anything.",
    ar: "مش بوت ولا مساعدة. ابعتيلي نتيجتك عالواتساب وببعتلك ردّي بنفسي، حسب ترتيب وصول الرسايل. منراجع إجاباتك وأرقامك سوا قبل ما تقرري أي شي.",
  },
  openWa: { en: "Send my result to Reham on WhatsApp", ar: "ابعتي النتيجة لرهام عالواتساب" },
  buyPlan: { en: "Get my plan", ar: "خدي خطتي" },
  notSure: { en: "Not sure yet? Message me before you buy.", ar: "لسا مش متأكدة؟ راسليني قبل ما تشتري." },
  faqTitle: { en: "Questions I get", ar: "أسئلة بتوصلني" },
  faq: [
    {
      q: { en: "I am on HRT or other medication. Can I follow this?", ar: "عم آخد هرمونات أو دوا. فيني أتبع الخطة؟" },
      a: {
        en: "Keep taking what your doctor prescribed. The plan works on food, strength, sleep and reading your labs. Share it with your doctor before you start.",
        ar: "كمّلي بالدوا اللي وصفه طبيبك. الخطة بتشتغل على الأكل والقوة والنوم وقراءة التحاليل. شاركيها مع طبيبك قبل ما تبلّشي.",
      },
    },
    {
      q: { en: "Is this medical advice?", ar: "هيدا نصيحة طبية؟" },
      a: {
        en: "No. It is education and coaching. It does not diagnose or treat, and it does not replace your doctor.",
        ar: "لأ. هيدا تثقيف وكوتشينغ. ما بيشخّص وما بيعالج، وما بيحلّ مكان طبيبك.",
      },
    },
    {
      q: { en: "What changes first?", ar: "شو بيتغيّر أول شي؟" },
      a: {
        en: "Many women notice sleep and energy first. Everyone is different, and your numbers guide the pace.",
        ar: "كتير سيدات بيلاحظوا النوم والطاقة أول شي. كل وحدة مختلفة، وأرقامك هنّي اللي بيحدّدوا الوتيرة.",
      },
    },
  ] as { q: L; a: L }[],
} as const;

/** Dial code + local number -> "+9655xxxxxxx". Accepts a pasted full "+code…" / "00code…" number too. */
function normalizePhone(dial: string, raw: string): string | null {
  let s = raw.trim().replace(/[\s\-().]/g, "");
  s = s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  if (s.startsWith("00")) s = `+${s.slice(2)}`;
  const full = s.startsWith("+") ? s : `+${dial}${s.replace(/^0+/, "")}`;
  return /^\+\d{8,15}$/.test(full) ? full : null;
}

export function MenopauseQuizPage() {
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

  const total = MENO_QUESTIONS.length;
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

  // Ignore taps while the previous question is still sliding out (see InsulinQuizPage for the bug this prevents).
  const advancing = useRef(false);
  const choose = useCallback(
    (optionIndex: number) => {
      if (advancing.current) return;
      advancing.current = true;
      const q = MENO_QUESTIONS[qIndex];
      setAnswers((a) => ({ ...a, [q.id]: optionIndex }));
      window.setTimeout(() => {
        if (qIndex + 1 >= total) setStep("contact");
        else setQIndex(qIndex + 1);
        window.setTimeout(() => {
          advancing.current = false;
        }, 600);
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

  useEffect(() => {
    if (step !== "questions") return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      const q = MENO_QUESTIONS[qIndex];
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
    const scored = scoreMenoQuiz(answers);
    const cleanName = name.trim();

    if (!trap) {
      const sb = getSupabase();
      if (sb) {
        const { error } = await sb.from("quiz_leads").insert({
          source: MENO_QUIZ_SOURCE,
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
      setImageUrl(await renderQuizImage({ name: cleanName, result: scored, lang, variant: "meno" }));
    } catch (err) {
      console.error("[quiz] image failed:", err);
    }
    setSaving(false);
    setStep("result");
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    if (step !== "result" || !result) return;
    renderQuizImage({ name: name.trim(), result, lang, variant: "meno" }).then(setImageUrl).catch(() => undefined);
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const stage = stageFromAnswers(answers);
  const symptoms = useMemo(() => topSymptoms(answers), [answers]);
  const flagged = hasFlaggedLabs(answers);
  const lowMood = hasLowMoodFlag(answers);

  const waText = useMemo(() => {
    if (!result) return "";
    return isAr
      ? `مرحبًا رهام، أنا ${name.trim()}. عملت اختبار الأيض وانقطاع الطمث ونتيجتي: ${result.band.label.ar} (${result.percent}٪). بدي أخصّص خطتي.`
      : `Hi Reham, I'm ${name.trim()}. I took the menopause metabolic quiz and my result is: ${result.band.label.en} (${result.percent}%). I'd like to customize my plan.`;
  }, [result, name, isAr]);
  const waHref = `https://wa.me/${WHATSAPP_PHONE}${waText ? `?text=${encodeURIComponent(waText)}` : ""}`;

  // The plan price is read live. If the product row does not exist yet, the page sells through WhatsApp only.
  const planSlug = stage === "peri" ? PERI_PLAN_SLUG : MENO_PLAN_SLUG;
  const planQuery = useProduct(planSlug);
  const planLive = !!planQuery.data;
  const planPrice =
    planQuery.data && planQuery.data.price > 0 ? formatPrice(planQuery.data.price, planQuery.data.currency) : null;
  const planHref = `${SELF_GUIDED_PATH}/${planSlug}?utm_source=quiz&utm_medium=result&utm_campaign=${result?.band.id ?? "unknown"}`;

  const Arrow = isAr ? ArrowRight : ArrowLeft;
  const q = MENO_QUESTIONS[Math.min(qIndex, total - 1)];
  const slide = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -16 }, transition: { duration: 0.28 } };

  const waButton = (extra = "") => (
    <a
      href={waHref}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex w-full items-center justify-center rounded-full bg-[#25D366] px-8 py-4 text-base font-semibold text-white shadow-elevation transition hover:brightness-95",
        extra,
      )}
    >
      {sales.openWa[lang]}
    </a>
  );

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="flex min-h-screen flex-col bg-bone-100 text-ink">
      <SEO title={t("seoTitle")} description={t("seoDesc")} path={MENO_QUIZ_PATH} />

      <div className="fixed inset-x-0 top-0 z-20 h-1.5 bg-ink/10">
        <div className="h-full bg-forest-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <header className="flex items-center justify-between px-5 pb-2 pt-6 md:px-10">
        <Link to="/" aria-label="Liv Functional">
          <span className="relative block h-[54px] w-[84px] overflow-hidden">
            <img src="/liv-logo.png" alt="Liv Functional" className="absolute max-w-none" style={{ height: 183, left: -24, top: -55 }} />
          </span>
        </Link>
        <LanguageSwitcher compact />
      </header>

      <main className={cn("mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-8 md:px-8", step !== "result" && "justify-center")}>
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
                      <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg border border-ink/20 text-sm font-semibold">{i + 1}</span>
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
            <motion.section key="result" {...slide} className="space-y-10">
              {/* 1. Score + headline */}
              <div>
                <div className="eyebrow mb-3 text-coral-600">{sales.resultEyebrow[lang]}</div>
                <h1 className="display-serif text-display-md text-balance font-extrabold">{sales.headline(name.trim())[lang]}</h1>
                <p className="mt-3 font-semibold" style={{ color: result.band.color }}>
                  {sales.scoreLine(result.percent)[lang]} · {result.band.label[lang]}
                </p>
                {imageUrl ? (
                  <img src={imageUrl} alt={result.band.label[lang]} className="mt-5 w-full rounded-3xl border border-ink/10 shadow-elevation" />
                ) : (
                  <div className="mt-5 rounded-3xl border border-ink/10 bg-white p-8">
                    <p className="text-ink-muted">{result.band.summary[lang]}</p>
                  </div>
                )}
                {lowMood && <p className="mt-5 rounded-2xl bg-white px-5 py-4 text-sm leading-relaxed ring-1 ring-ink/10">{MENO_SUPPORT_NOTE[lang]}</p>}
                <div className="mt-5">{waButton()}</div>
              </div>

              {/* 2. Reham's video (hidden until a URL is set in menoQuiz.ts) */}
              {MENO_VIDEO_URL && (
                <div>
                  <p className="mb-3 text-sm font-semibold text-forest-600">{sales.videoCaption[lang]}</p>
                  <video
                    src={MENO_VIDEO_URL}
                    poster={MENO_VIDEO_POSTER || undefined}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full rounded-3xl border border-ink/10 bg-ink shadow-elevation"
                  />
                </div>
              )}

              {/* 3. Her own answers, echoed back */}
              {symptoms.length > 0 && (
                <div className="rounded-3xl border border-ink/10 bg-white p-6 md:p-8">
                  <h2 className="display-serif text-2xl font-bold">{sales.youToldMe[lang]}</h2>
                  <p className="mt-2 text-ink-muted">{sales.youToldMeBody[lang]}</p>
                  <ul className="mt-4 space-y-2">
                    {symptoms.map((s, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="mt-1 h-4 w-4 flex-shrink-0 text-coral-600" />
                        <span className="font-medium">{s[lang]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 4. Cost of waiting */}
              <div>
                <h2 className="display-serif text-2xl font-bold text-balance">{sales.costTitle[lang]}</h2>
                <ul className="mt-4 space-y-3">
                  {sales.cost.map((c, i) => (
                    <li key={i} className="flex items-start gap-3 leading-relaxed">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-coral-500" />
                      <span>{c[lang]}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 rounded-2xl bg-coral-50 px-5 py-4 font-semibold leading-relaxed text-coral-700">{sales.waitLine[lang]}</p>
              </div>

              {/* 5. Why generic advice fails */}
              <div>
                <h2 className="display-serif text-2xl font-bold text-balance">{sales.failTitle[lang]}</h2>
                <div className="mt-4 grid gap-3">
                  {sales.fail.map((f, i) => (
                    <div key={i} className="rounded-2xl border border-ink/10 bg-white p-5">
                      <div className="text-sm text-ink-muted line-through">{f.old[lang]}</div>
                      <div className="mt-1 leading-relaxed">{f.now[lang]}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. The plan */}
              <div className="rounded-3xl border border-forest-500/20 bg-white p-6 shadow-elevation md:p-8">
                <div className="eyebrow mb-2 text-coral-600">{sales.planEyebrow[lang]}</div>
                <h2 className="display-serif text-2xl font-bold text-balance">{sales.planTitle(stage)[lang]}</h2>
                <p className="mt-2 font-semibold text-forest-600">{sales.planTagline(stage)[lang]}</p>
                <p className="mt-3 leading-relaxed text-ink-muted">{sales.planLede[lang]}</p>
                <ul className="mt-5 space-y-4">
                  {sales.planItems(stage).map((it, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="mt-1 h-5 w-5 flex-shrink-0 text-forest-500" />
                      <div>
                        <div className="font-semibold">{it.title[lang]}</div>
                        <div className="text-ink-muted">{it.body[lang]}</div>
                      </div>
                    </li>
                  ))}
                </ul>
                {flagged && <p className="mt-5 rounded-2xl bg-bone-100 px-4 py-3 text-sm leading-relaxed">{MENO_DOCTOR_NOTE[lang]}</p>}
                <div className="mt-6 space-y-3">
                  {waButton()}
                  {planLive && (
                    <Link
                      to={planHref}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-forest-500 px-8 py-4 text-base font-semibold text-white transition hover:bg-forest-600"
                    >
                      {sales.buyPlan[lang]}
                      {planPrice ? <span className="opacity-80">· {planPrice}</span> : null}
                    </Link>
                  )}
                </div>
              </div>

              {/* 7. Personal follow-up */}
              <div className="rounded-3xl bg-forest-500 p-6 text-white md:p-8">
                <h2 className="display-serif text-2xl font-bold">{sales.personalTitle[lang]}</h2>
                <p className="mt-3 leading-relaxed text-white/90">{sales.personalBody[lang]}</p>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex w-full items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-forest-600 transition hover:bg-bone-100"
                >
                  {sales.openWa[lang]}
                </a>
                <p className="mt-3 text-center text-sm text-white/80">{sales.notSure[lang]}</p>
              </div>

              {/* 8. FAQ + disclaimer */}
              <div>
                <h2 className="display-serif text-2xl font-bold">{sales.faqTitle[lang]}</h2>
                <div className="mt-4 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white">
                  {sales.faq.map((f, i) => (
                    <details key={i} className="group p-5">
                      <summary className="cursor-pointer font-semibold">{f.q[lang]}</summary>
                      <p className="mt-2 leading-relaxed text-ink-muted">{f.a[lang]}</p>
                    </details>
                  ))}
                </div>
              </div>

              <p className="text-center text-xs leading-relaxed text-ink-muted">{MENO_DISCLAIMER[lang]}</p>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
