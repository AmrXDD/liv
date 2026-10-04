/**
 * Insulin-resistance quiz: questions, scoring and result bands.
 * DRAFT clinical content — Reham must review the wording and the band
 * thresholds before this goes live. It is an educational screener, not a
 * diagnosis, and every result screen / image says so.
 */
import type { LocalizedString } from "@/types";

export const IR_QUIZ_SOURCE = "insulin-quiz";

export interface QuizOption {
  label: LocalizedString;
  /** 0 = no sign, 3 = strongest sign */
  points: number;
}

export interface QuizQuestion {
  id: string;
  prompt: LocalizedString;
  hint?: LocalizedString;
  options: QuizOption[];
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

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "crash",
    prompt: {
      en: "Do you feel sleepy or drained after meals?",
      ar: "هل تشعر بالنعاس أو الإرهاق بعد الأكل؟",
    },
    hint: { en: "Especially after rice, bread, pasta or sweets.", ar: "خصوصًا بعد الرز والخبز والمعكرونة والحلويات." },
    options: freq(
      ["Never", "أبدًا"],
      ["Sometimes", "أحيانًا"],
      ["Often", "كثيرًا"],
      ["After almost every meal", "بعد كل وجبة تقريبًا"],
    ),
  },
  {
    id: "cravings",
    prompt: {
      en: "How often do you crave sweets or carbs?",
      ar: "كم مرة تشتهي الحلويات أو النشويات؟",
    },
    hint: { en: "The kind of craving that is hard to ignore.", ar: "الاشتهاء الذي يصعب تجاهله." },
    options: freq(
      ["Rarely", "نادرًا"],
      ["A few times a week", "عدة مرات في الأسبوع"],
      ["Most days", "معظم الأيام"],
      ["Every day, and it is intense", "كل يوم، وبشدة"],
    ),
  },
  {
    id: "hunger",
    prompt: {
      en: "Are you hungry again within 2–3 hours of a full meal?",
      ar: "هل تجوع من جديد بعد ساعتين أو ثلاث من وجبة كاملة؟",
    },
    options: freq(
      ["No, I stay full", "لا، أبقى شبعانة"],
      ["Sometimes", "أحيانًا"],
      ["Often", "كثيرًا"],
      ["Almost always", "تقريبًا دائمًا"],
    ),
  },
  {
    id: "weight",
    prompt: {
      en: "Do you gain weight around your belly, or struggle to lose it even when you try?",
      ar: "هل عندك دهون و وزن حول البطن، أو يصعب عليك إنقاصه رغم المحاولة؟",
    },
    options: freq(
      ["No", "لا"],
      ["A little", "قليلًا"],
      ["Yes, quite a lot", "نعم، كثيرًا"],
      ["Yes, and nothing seems to work", "نعم، ولا شيء ينفع"],
    ),
  },
  {
    id: "skin",
    prompt: {
      en: "Do you have dark, velvety patches of skin (neck, armpits, groin) or skin tags?",
      ar: "هل لديك بقع جلدية داكنة وناعمة (الرقبة، الإبطان) أو زوائد جلدية؟",
    },
    options: [
      { label: { en: "No", ar: "لا" }, points: 0 },
      { label: { en: "Not sure", ar: "لست متأكدة" }, points: 1 },
      { label: { en: "Yes, mild", ar: "نعم، خفيفة" }, points: 2 },
      { label: { en: "Yes, clearly", ar: "نعم، واضحة" }, points: 3 },
    ],
  },
  {
    id: "family",
    prompt: {
      en: "Does type 2 diabetes run in your family?",
      ar: "هل يوجد سكري من النوع الثاني في عائلتك؟",
    },
    options: [
      { label: { en: "No", ar: "لا" }, points: 0 },
      { label: { en: "A grandparent or relative", ar: "جد أو جدة أو قريب" }, points: 1 },
      { label: { en: "A parent or sibling", ar: "أحد الوالدين أو الإخوة" }, points: 3 },
    ],
  },
  {
    id: "cycle",
    prompt: {
      en: "Do you have PCOS, or irregular periods?",
      ar: "هل تعانين من تكيس المبايض أو عدم انتظام الدورة؟",
    },
    options: [
      { label: { en: "No", ar: "لا" }, points: 0 },
      { label: { en: "Not applicable to me", ar: "لا ينطبق عليّ" }, points: 0 },
      { label: { en: "Sometimes irregular", ar: "غير منتظمة أحيانًا" }, points: 2 },
      { label: { en: "Yes, PCOS or very irregular", ar: "نعم، تكيس أو دورة غير منتظمة جدًا" }, points: 3 },
    ],
  },
  {
    id: "fog",
    prompt: {
      en: "Do you get brain fog, low focus or an afternoon energy crash?",
      ar: "هل تعاني من ضبابية الدماغ أو ضعف التركيز أو هبوط الطاقة بعد الظهر؟",
    },
    options: freq(
      ["Rarely", "نادرًا"],
      ["Sometimes", "أحيانًا"],
      ["Most days", "معظم الأيام"],
      ["Every day", "كل يوم"],
    ),
  },
  {
    id: "sleepStress",
    prompt: {
      en: "How are your sleep and stress levels?",
      ar: "كيف حال نومك ومستوى التوتر لديك؟",
    },
    options: [
      { label: { en: "Good sleep, low stress", ar: "نوم جيد وتوتر قليل" }, points: 0 },
      { label: { en: "Okay, with some rough days", ar: "مقبول مع بعض الأيام الصعبة" }, points: 1 },
      { label: { en: "Poor sleep or high stress most days", ar: "نوم سيئ أو توتر عالٍ معظم الأيام" }, points: 2 },
      { label: { en: "Poor sleep and high stress", ar: "نوم سيئ وتوتر عالٍ معًا" }, points: 3 },
    ],
  },
  {
    id: "labs",
    prompt: {
      en: "What did your last blood tests say about glucose, HbA1c or fasting insulin?",
      ar: "ماذا أظهرت آخر تحاليلك عن السكر أو HbA1c أو أنسولين الصيام؟",
    },
    options: [
      { label: { en: "All normal", ar: "كلها طبيعية" }, points: 0 },
      { label: { en: "I have never checked / I don't know", ar: "لم أفحصها أبدًا / لا أعرف" }, points: 1 },
      { label: { en: "Borderline or slightly high", ar: "على الحد أو مرتفعة قليلًا" }, points: 2 },
      { label: { en: "High, or I was told prediabetes / diabetes", ar: "مرتفعة، أو قيل لي ما قبل السكري / سكري" }, points: 3 },
    ],
  },
];

export interface QuizBand {
  id: "low" | "early" | "moderate" | "strong";
  /** upper bound (inclusive) of the percentage range for this band */
  maxPercent: number;
  label: LocalizedString;
  summary: LocalizedString;
  color: string;
}

export const QUIZ_BANDS: QuizBand[] = [
  {
    id: "low",
    maxPercent: 24,
    label: { en: "Few signs", ar: "علامات قليلة" },
    summary: {
      en: "Your answers show few of the common signs of insulin resistance. A good moment to protect that with food, movement and sleep habits.",
      ar: "إجاباتك تُظهر علامات قليلة من علامات مقاومة الأنسولين الشائعة. الآن هو الوقت مناسب لحماية هذا الوضع بعادات الأكل والحركة والنوم.",
    },
    color: "#2d8e60",
  },
  {
    id: "early",
    maxPercent: 49,
    label: { en: "Early signs", ar: "علامات مبكرة" },
    summary: {
      en: "Some of your answers match early patterns of insulin resistance. This is the easiest stage to turn around.",
      ar: ". لا تتأخر. بعض إجاباتك توضح صوره مبكرة من مقاومة الأنسولين. هذه أسهل مرحلة للتحسن.",
    },
    color: "#c9a227",
  },
  {
    id: "moderate",
    maxPercent: 74,
    label: { en: "Moderate signs", ar: "علامات متوسطة" },
    summary: {
      en: "Several of your answers point to insulin resistance patterns. It is worth checking your labs and building a plan around them.",
      ar: "عدة إجابات تشير إلى بداية مقاومة الأنسولين. يجب فحص تحاليل الدم وبناء خطة. لا تتأخر لأن جسمك بدأ حالات إلتهاب داخليه صامته.",
    },
    color: "#ef8a3c",
  },
  {
    id: "strong",
    maxPercent: 100,
    label: { en: "Strong signs", ar: "علامات قوية" },
    summary: {
      en: "Your answers show many of the signs linked to insulin resistance. Speak to your doctor about the right tests, and let's talk about a plan.",
      ar: "إجاباتك تُظهر كثيرًا من العلامات المرتبطة بمقاومة الأنسولين. تحدث معي لأدلك على الفحوصات اللآزمه، وعن خطة غذائيه تقلل إعتمادك على الادويه و تقلل أعراض الإلتهاب و الوزن.",
    },
    color: "#ff5757",
  },
];

export const QUIZ_DISCLAIMER: LocalizedString = {
  en: "Educational screener only. It is not a medical diagnosis and does not replace your doctor's care.",
  ar: "أداة تثقيفية فقط. ليست تشخيصًا طبيًا ولا تغني عن رعاية طبيبك.",
};

export interface QuizResult {
  score: number;
  scoreMax: number;
  percent: number;
  band: QuizBand;
}

export function scoreQuiz(answers: Record<string, number>): QuizResult {
  let score = 0;
  let scoreMax = 0;
  for (const q of QUIZ_QUESTIONS) {
    scoreMax += Math.max(...q.options.map((o) => o.points));
    const idx = answers[q.id];
    if (idx != null && q.options[idx]) score += q.options[idx].points;
  }
  const percent = scoreMax === 0 ? 0 : Math.round((score / scoreMax) * 100);
  const band = QUIZ_BANDS.find((b) => percent <= b.maxPercent) ?? QUIZ_BANDS[QUIZ_BANDS.length - 1];
  return { score, scoreMax, percent, band };
}
