/**
 * Menopause metabolic quiz: questions, scoring, result bands and plan routing.
 * DRAFT clinical content. Reham must review the wording and band thresholds
 * before this goes live. It is an educational screener, not a diagnosis, and
 * every result screen says so. Arabic is Lebanese Levantine, addressed to women.
 *
 * Scoring engine, band ids and result shape are shared with the insulin quiz so
 * the result image, lead table and admin list keep working.
 */
import type { LocalizedString } from "@/types";
import type { QuizBand, QuizQuestion, QuizOption, QuizResult } from "@/data/irQuiz";

export const MENO_QUIZ_SOURCE = "menopause-quiz";

/** Set to a video URL or a /public path (e.g. "/videos/reham-menopause.mp4") to show Reham's video on the result page. Empty hides the slot. */
export const MENO_VIDEO_URL = "";
/** Optional poster image for the video. */
export const MENO_VIDEO_POSTER = "";

/** Slugs of the two plans. Create the products in admin with these slugs; until then the page shows no price and sells through WhatsApp. */
export const PERI_PLAN_SLUG = "perimenopause-metabolic-plan";
export const MENO_PLAN_SLUG = "menopause-metabolic-plan";

export type MenoStage = "peri" | "meno";

export interface MenoQuestion extends QuizQuestion {
  /** Short noun phrase echoed back on the result page when this answer scored high. */
  symptom?: LocalizedString;
}

const freq = (
  never: [string, string],
  some: [string, string],
  often: [string, string],
  always: [string, string],
): QuizOption[] => [
  { label: { en: never[0], ar: never[1] }, points: 0 },
  { label: { en: some[0], ar: some[1] }, points: 1 },
  { label: { en: often[0], ar: often[1] }, points: 2 },
  { label: { en: always[0], ar: always[1] }, points: 3 },
];

export const MENO_QUESTIONS: MenoQuestion[] = [
  {
    id: "stage",
    prompt: {
      en: "Where are you with your periods right now?",
      ar: "وين صرتي بالدورة الشهرية هلأ؟",
    },
    options: [
      { label: { en: "Still regular, but I feel something is changing", ar: "لسا منتظمة، بس حاسة إنو شي عم يتغيّر" }, points: 0 },
      { label: { en: "Irregular, skipped or unpredictable", ar: "مش منتظمة، أو بتفوت شهور، أو ما بعرف مت بتجي" }, points: 0 },
      { label: { en: "Stopped for 12 months or more", ar: "وقفت من 12 شهر أو أكتر" }, points: 0 },
      { label: { en: "Stopped after surgery or treatment", ar: "وقفت بعد عملية أو علاج" }, points: 0 },
    ],
  },
  {
    id: "hot",
    symptom: { en: "hot flashes and night sweats", ar: "الهبّات الساخنة والتعرّق الليلي" },
    prompt: {
      en: "How often do hot flashes or night sweats wake you or interrupt your day?",
      ar: "قديش بتصحّيكي أو بتقطع نهارك الهبّات الساخنة أو التعرّق الليلي؟",
    },
    options: freq(
      ["Never", "ولا مرة"],
      ["Sometimes", "أحيانًا"],
      ["Most weeks", "تقريبًا كل أسبوع"],
      ["Almost every day or night", "تقريبًا كل يوم أو كل ليلة"],
    ),
  },
  {
    id: "sleep",
    symptom: { en: "broken sleep", ar: "النوم المتقطّع" },
    prompt: {
      en: "Do you wake between 2 and 4 am, or wake up unrefreshed?",
      ar: "بتفيقي بين الساعة 2 و4 الفجر، أو بتفيقي وإنتي تعبانة؟",
    },
    options: freq(
      ["I sleep well", "نومي منيح"],
      ["Sometimes", "أحيانًا"],
      ["Several nights a week", "كم ليلة بالأسبوع"],
      ["Most nights", "معظم الليالي"],
    ),
  },
  {
    id: "crash",
    symptom: { en: "energy crashes after meals", ar: "هبوط الطاقة بعد الأكل" },
    prompt: {
      en: "A few hours after meals, especially carbs, do you get sleepy, shaky or foggy?",
      ar: "بعد الأكل بساعتين أو تلات، خصوصًا النشويات، بتحسّي بنعاس أو رجفة أو ضبابية؟",
    },
    options: freq(
      ["Never", "أبدًا"],
      ["Sometimes", "أحيانًا"],
      ["Often", "كتير"],
      ["After almost every meal", "بعد كل وجبة تقريبًا"],
    ),
  },
  {
    id: "belly",
    symptom: { en: "belly fat and muscle loss that diets no longer fix", ar: "دهون البطن وخسارة العضل اللي ما عاد الدايت يصلّحها" },
    prompt: {
      en: "Is fat gathering around your belly, or is your muscle tone fading, even though you eat the same as before?",
      ar: "عم يتجمّع دهن حوالين البطن أو عم بتخفّ عضلاتك، حتى لو أكلك متل قبل؟",
    },
    options: [
      { label: { en: "No", ar: "لأ" }, points: 0 },
      { label: { en: "A little", ar: "شوي" }, points: 1 },
      { label: { en: "Yes, clearly", ar: "إي، بشكل واضح" }, points: 2 },
      { label: { en: "Yes, and dieting no longer works", ar: "إي، وما عاد الدايت ينفع" }, points: 3 },
    ],
  },
  {
    id: "cravings",
    symptom: { en: "strong sugar and carb cravings", ar: "اشتهاء السكر والنشويات" },
    prompt: {
      en: "How often do you crave sweets or carbs, especially in the evening?",
      ar: "قديش بتشتهي الحلو أو النشويات، خصوصًا بالمسا؟",
    },
    options: freq(
      ["Rarely", "نادرًا"],
      ["A few times a week", "كم مرة بالأسبوع"],
      ["Most days", "معظم الأيام"],
      ["Every day, and it is intense", "كل يوم، وبقوة"],
    ),
  },
  {
    id: "mood",
    symptom: { en: "anxiety, irritability or low mood", ar: "القلق والعصبية وتقلّب المزاج" },
    prompt: {
      en: "Do you have anxiety, irritability or low mood that you did not have before?",
      ar: "عندك قلق أو عصبية أو مزاج واطي ما كان عندك قبل؟",
    },
    options: [
      { label: { en: "No", ar: "لأ" }, points: 0 },
      { label: { en: "Sometimes", ar: "أحيانًا" }, points: 1 },
      { label: { en: "Often", ar: "كتير" }, points: 2 },
      { label: { en: "Most days, and it affects my relationships or work", ar: "معظم الأيام، وبيأثّر على علاقاتي أو شغلي" }, points: 3 },
    ],
  },
  {
    id: "drive",
    symptom: { en: "low mood and loss of drive", ar: "الحزن وفقدان الشغف" },
    prompt: {
      en: "Lately, have you lost interest or energy for things you used to enjoy, or felt flat, sad or without purpose?",
      ar: "بالفترة الأخيرة، حسّيتي إنو ما عاد عندك شغف أو طاقة للأشياء اللي كنتي تحبيها، أو حسّيتي بحزن أو فراغ أو إنو ما في هدف؟",
    },
    options: [
      { label: { en: "Not at all", ar: "أبدًا" }, points: 0 },
      { label: { en: "Sometimes", ar: "أحيانًا" }, points: 1 },
      { label: { en: "Often", ar: "كتير" }, points: 2 },
      { label: { en: "Most days, and it is hard to get through my day", ar: "معظم الأيام، وصعب عليّي كمّل يومي" }, points: 3 },
    ],
  },
  {
    id: "fog",
    symptom: { en: "brain fog", ar: "ضبابية الدماغ" },
    prompt: {
      en: "Do you get brain fog, lose words, or struggle to focus?",
      ar: "بتحسّي بضبابية بالدماغ، بتنسي الكلمات، أو بيصعب عليكي التركيز؟",
    },
    options: freq(
      ["Rarely", "نادرًا"],
      ["Sometimes", "أحيانًا"],
      ["Most days", "معظم الأيام"],
      ["Every day", "كل يوم"],
    ),
  },
  {
    id: "energy",
    symptom: { en: "energy lower than two years ago", ar: "الطاقة الأقل من أول" },
    prompt: {
      en: "Is your energy lower than it was two years ago?",
      ar: "طاقتك أقل من من سنتين؟",
    },
    options: [
      { label: { en: "No, the same", ar: "لأ، متل ما كانت" }, points: 0 },
      { label: { en: "Slightly lower", ar: "أقل شوي" }, points: 1 },
      { label: { en: "Much lower", ar: "أقل بكتير" }, points: 2 },
      { label: { en: "I am exhausted most days", ar: "تعبانة معظم الأيام" }, points: 3 },
    ],
  },
  {
    id: "protein",
    symptom: { en: "too little protein at breakfast", ar: "البروتين القليل بالفطور" },
    prompt: {
      en: "How much protein do you eat at breakfast?",
      ar: "قديش بتاكلي بروتين بالفطور؟",
    },
    hint: {
      en: "Many women in midlife need 30 to 40 g of protein per meal.",
      ar: "كتير سيدات بعمر الأربعينات والخمسينات بيحتاجوا بين 30 و40 غرام بروتين بكل وجبة.",
    },
    options: [
      { label: { en: "30 g or more", ar: "30 غرام أو أكتر" }, points: 0 },
      { label: { en: "Some, maybe 15 to 25 g", ar: "شوي، يمكن بين 15 و25 غرام" }, points: 1 },
      { label: { en: "Very little: mostly bread, cheese or coffee", ar: "قليل كتير: غالبًا خبز أو جبنة أو قهوة" }, points: 2 },
      { label: { en: "Almost none", ar: "تقريبًا ولا شي" }, points: 3 },
    ],
  },
  {
    id: "strength",
    symptom: { en: "no strength training", ar: "غياب تمارين الأوزان" },
    prompt: {
      en: "Do you lift weights or do resistance training?",
      ar: "بتتمرني بالأوزان أو بتمارين المقاومة؟",
    },
    options: [
      { label: { en: "Two or more times a week", ar: "مرتين بالأسبوع أو أكتر" }, points: 0 },
      { label: { en: "Once a week, or on and off", ar: "مرة بالأسبوع، أو على فترات" }, points: 1 },
      { label: { en: "Only walking, yoga or cardio", ar: "بس مشي أو يوغا أو كارديو" }, points: 2 },
      { label: { en: "No exercise right now", ar: "ما عم بتمرّن هلأ" }, points: 3 },
    ],
  },
  {
    id: "labs",
    symptom: { en: "symptoms with \"normal\" labs", ar: "أعراض مع تحاليل \"طبيعية\"" },
    prompt: {
      en: "What did your last blood tests say?",
      ar: "شو قالت آخر تحاليلك؟",
    },
    hint: {
      en: "Think fasting insulin, ferritin, full thyroid, vitamin D.",
      ar: "فكّري بأنسولين الصيام، الفيريتين، فحوصات الغدة الكاملة، وفيتامين د.",
    },
    options: [
      { label: { en: "Checked recently, and I feel well", ar: "عملتها مؤخرًا، وحاسة حالي منيحة" }, points: 0 },
      { label: { en: "I never checked insulin, ferritin or the full thyroid", ar: "ما فحصت الأنسولين ولا الفيريتين ولا الغدة كاملة" }, points: 1 },
      { label: { en: "Told \"all normal\", but I still feel unwell", ar: "قالولي \"كلها طبيعية\"، بس لسا حاسة حالي مش منيحة" }, points: 3 },
      { label: { en: "Something was flagged (sugar, thyroid, cholesterol)", ar: "في شي طلع غير طبيعي (سكر، غدة، كوليسترول)" }, points: 3 },
    ],
  },
];

export const MENO_BANDS: QuizBand[] = [
  {
    id: "low",
    maxPercent: 24,
    label: { en: "Stable", ar: "مستقرّ" },
    summary: {
      en: "Your answers show few signs that hormonal change is affecting your metabolism right now. This is the best time to protect your muscle, sleep and insulin, before the shift starts.",
      ar: "إجاباتك بتُظهر علامات قليلة إنو التغيّر الهرموني عم يأثّر على الأيض عندك هلأ. هيدا أحسن وقت لتحمي عضلاتك ونومك وأنسولينك قبل ما يبلّش التغيّر.",
    },
    color: "#2d8e60",
  },
  {
    id: "early",
    maxPercent: 49,
    label: { en: "Early shift", ar: "تغيّر مبكر" },
    summary: {
      en: "Your body is starting to respond to the hormonal shift. Muscle, sleep and insulin are the first places it shows. This is the easiest stage to support.",
      ar: "جسمك عم يبلّش يتجاوب مع التغيّر الهرموني. العضل والنوم والأنسولين هنّي أول أماكن بيبين فيها. هيدي أسهل مرحلة لتدعميه.",
    },
    color: "#c9a227",
  },
  {
    id: "moderate",
    maxPercent: 74,
    label: { en: "Metabolic shift", ar: "تغيّر أيضي واضح" },
    summary: {
      en: "Several answers point to a clear metabolic shift. Standard labs may still look normal while your muscle, sleep and insulin are already under strain. A plan built on your numbers matters now.",
      ar: "عدة إجابات بتدلّ على تغيّر أيضي واضح. التحاليل العادية ممكن لسا تبيّن طبيعية، وعضلاتك ونومك وأنسولينك أصلًا تحت ضغط. صار مهم يكون عندك خطة مبنية على أرقامك.",
    },
    color: "#ef8a3c",
  },
  {
    id: "strong",
    maxPercent: 100,
    label: { en: "High metabolic strain", ar: "ضغط أيضي عالي" },
    summary: {
      en: "Your answers show many of the signs linked to hormonal metabolic strain. Don't wait for a lab to flag it. Send me your result and I will go through it with you personally.",
      ar: "إجاباتك بتُظهر كتير من العلامات المرتبطة بالضغط الأيضي الهرموني. لا تستني لحتى تحليل يعلّم عليه. ابعتيلي نتيجتك وبراجعها معك شخصيًا.",
    },
    color: "#ff5757",
  },
];

export const MENO_DISCLAIMER: LocalizedString = {
  en: "Educational screener only. It is not a medical diagnosis and does not replace your doctor's care. Never change or stop a medication without your doctor.",
  ar: "أداة تثقيفية فقط. مش تشخيص طبي وما بتحلّ مكان رعاية طبيبك. لا تغيّري أو توقفي أي دوا بدون ما تحكي مع طبيبك.",
};

/** Shown when the labs answer is "something was flagged". */
export const MENO_DOCTOR_NOTE: LocalizedString = {
  en: "You said something was flagged in your labs. Share this plan with your doctor before you start.",
  ar: "ذكرتي إنو في شي طلع غير طبيعي بتحاليلك. شاركي الخطة مع طبيبك قبل ما تبلّشي.",
};

/** Peri if she still has (even irregular) periods, meno if they stopped. */
export function stageFromAnswers(answers: Record<string, number>): MenoStage {
  const idx = answers["stage"];
  return idx === 2 || idx === 3 ? "meno" : "peri";
}

/** Shown when she answers the low-mood question with its highest option. */
export const MENO_SUPPORT_NOTE: LocalizedString = {
  en: "Many women in this stage tell me the same thing: feeling flat, sad or without drive. You are not imagining it, and you are not the only one. It is a real part of this transition, and it deserves care. You can always tell me about it.",
  ar: "كتير سيدات بهالمرحلة بيحكوولي نفس الشي: إحساس بالحزن أو الفراغ أو فقدان الشغف. إنتي مش عم تتخيّلي، ومش لوحدك. هيدا جزء حقيقي من هالمرحلة وبيستاهل اهتمام. وفيكي تحكيلي عنها بأي وقت.",
};

export function hasLowMoodFlag(answers: Record<string, number>): boolean {
  return answers["drive"] === 3;
}

export function hasFlaggedLabs(answers: Record<string, number>): boolean {
  return answers["labs"] === 3;
}

/** The three highest-scoring symptoms (ties keep question order), echoed back on the result page. */
export function topSymptoms(answers: Record<string, number>, limit = 3): LocalizedString[] {
  return MENO_QUESTIONS.map((q, order) => ({
    q,
    order,
    pts: answers[q.id] != null ? (q.options[answers[q.id]]?.points ?? 0) : 0,
  }))
    .filter((x) => x.q.symptom && x.pts >= 2)
    .sort((a, b) => b.pts - a.pts || a.order - b.order)
    .slice(0, limit)
    .map((x) => x.q.symptom as LocalizedString);
}

export function scoreMenoQuiz(answers: Record<string, number>): QuizResult {
  let score = 0;
  let scoreMax = 0;
  for (const q of MENO_QUESTIONS) {
    scoreMax += Math.max(...q.options.map((o) => o.points));
    const idx = answers[q.id];
    if (idx != null && q.options[idx]) score += q.options[idx].points;
  }
  const percent = scoreMax === 0 ? 0 : Math.round((score / scoreMax) * 100);
  const band = MENO_BANDS.find((b) => percent <= b.maxPercent) ?? MENO_BANDS[MENO_BANDS.length - 1];
  return { score, scoreMax, percent, band };
}
