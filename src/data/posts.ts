import type { BlogPost } from "@/types";

export const posts: BlogPost[] = [
  {
    id: "p1",
    slug: "the-five-pillars-of-functional-energy",
    title: {
      en: "The five pillars of functional energy",
      ar: "أركان الطاقة الوظيفية الخمسة",
    },
    excerpt: {
      en: "Why caffeine isn't the answer — and what the data says actually fixes the 4pm crash.",
      ar: "لماذا الكافيين ليس الحل — وما الذي تقوله البيانات لإصلاح خمول الرابعة عصرًا.",
    },
    content: {
      en: "Energy is not a single system — it's the output of five overlapping ones: mitochondria, sleep, light exposure, movement, and nervous-system regulation. When one of these fails, no amount of caffeine, supplements, or 'biohacks' will keep the others compensating for long. In this article we break down each pillar, the markers to watch, and the smallest possible interventions that actually move the needle.",
      ar: "الطاقة ليست نظامًا واحدًا — بل ناتج خمسة أنظمة متداخلة: الميتوكوندريا، النوم، التعرّض للضوء، الحركة، وتنظيم الجهاز العصبي. حين يخفق أحدها، لا الكافيين ولا المكملات ولا الـ 'بيوهاكس' تستطيع التعويض طويلًا. في هذا المقال نشرح كل ركن، المؤشرات التي يجب مراقبتها، وأصغر التدخلات التي تُحدث فرقًا فعليًا.",
    },
    category: "energy",
    author: "Amro Ghamrawy",
    publishedAt: "2026-03-12",
    readingMinutes: 7,
    featured: true,
  },
  {
    id: "p2",
    slug: "why-most-gut-protocols-fail",
    title: {
      en: "Why most gut protocols fail",
      ar: "لماذا تفشل معظم بروتوكولات الجهاز الهضمي",
    },
    excerpt: {
      en: "The 5R framework, what it gets right, and the one variable nobody tracks.",
      ar: "إطار 5R، ما يصيب فيه، والمتغيّر الوحيد الذي لا يتتبّعه أحد.",
    },
    content: {
      en: "Most gut protocols hand you a removal phase and call it a day. The clinical 5R framework — Remove, Replace, Reinoculate, Repair, Rebalance — works only when paired with one thing most people skip: nervous-system co-regulation.",
      ar: "معظم بروتوكولات الأمعاء تكتفي بمرحلة الإزالة. إطار 5R السريري — إزالة، استبدال، إعادة تلقيح، ترميم، توازن — لا ينجح إلا مع شيء يتخطّاه الناس: تنظيم الجهاز العصبي.",
    },
    category: "gut",
    author: "Amro Ghamrawy",
    publishedAt: "2026-02-28",
    readingMinutes: 9,
    featured: true,
  },
  {
    id: "p3",
    slug: "perimenopause-and-the-glucose-question",
    title: {
      en: "Perimenopause and the glucose question",
      ar: "ما قبل سن اليأس وسؤال الجلوكوز",
    },
    excerpt: {
      en: "Why insulin sensitivity shifts in your 40s — and the small habit that resets it.",
      ar: "لماذا تتبدّل حساسية الإنسولين في الأربعينيات — والعادة الصغيرة التي تعيد ضبطها.",
    },
    content: {
      en: "Estrogen and insulin have a quiet conversation that most women don't notice — until perimenopause turns up the volume. We unpack the latest research and the one habit that disproportionately moves the needle.",
      ar: "بين الإستروجين والإنسولين حوار هادئ تتجاهله معظم النساء — حتى يأتي ما قبل سن اليأس فيرفع الصوت. نشرح آخر الأبحاث، والعادة الواحدة التي تُحدث الفرق الأكبر.",
    },
    category: "hormones",
    author: "Amro Ghamrawy",
    publishedAt: "2026-02-14",
    readingMinutes: 8,
  },
  {
    id: "p4",
    slug: "a-tuesday-morning-protocol",
    title: {
      en: "A Tuesday-morning protocol",
      ar: "بروتوكول صباح الثلاثاء",
    },
    excerpt: {
      en: "If your wellness routine doesn't survive a real Tuesday, it's a fantasy. Here's what does.",
      ar: "إن لم ينجُ روتين الويلنس لديك يوم ثلاثاء عاديًا، فهو فانتازيا. إليك ما ينجو فعلًا.",
    },
    content: {
      en: "We don't trust morning routines built for Sundays. We trust ones that survive a school run, a deadline, and a 6am dentist appointment. Here's our Tuesday-tested 12-minute morning system.",
      ar: "لا نثق بالروتينات المصمّمة ليوم أحد. نثق بتلك التي تنجو من توصيلة المدرسة، الديدلاين، ومواعيد طبيب الأسنان السادسة صباحًا. هذا نظامنا الصباحي المختبر يوم ثلاثاء، اثنا عشر دقيقة فقط.",
    },
    category: "habits",
    author: "Amro Ghamrawy",
    publishedAt: "2026-01-30",
    readingMinutes: 5,
  },
  {
    id: "p5",
    slug: "behaviour-design-for-wellness",
    title: {
      en: "Behaviour design for wellness",
      ar: "تصميم السلوك للويلنس",
    },
    excerpt: {
      en: "Why willpower is the wrong tool — and the design principles that replace it.",
      ar: "لماذا الإرادة أداة خاطئة — وما المبادئ التي تحلّ محلّها.",
    },
    content: {
      en: "BJ Fogg's behaviour model and James Clear's habit stacking, translated into a wellness operating system that doesn't depend on motivation.",
      ar: "نموذج السلوك لـ BJ Fogg، وتراكم العادات لـ James Clear، مترجمَين إلى نظام ويلنس لا يعتمد على الحماس.",
    },
    category: "mindset",
    author: "Amro Ghamrawy",
    publishedAt: "2026-01-12",
    readingMinutes: 6,
  },
  {
    id: "p6",
    slug: "the-bilingual-wellness-gap",
    title: {
      en: "The bilingual wellness gap",
      ar: "الفجوة في الويلنس ثنائي اللغة",
    },
    excerpt: {
      en: "Why translated wellness content fails Arabic-speaking women — and what we do differently.",
      ar: "لماذا يفشل محتوى الويلنس المترجم مع النساء العربيات — وما الذي نفعله بشكل مختلف.",
    },
    content: {
      en: "Translated content carries cultural assumptions that don't survive transit. We rebuild from scratch in both languages, with bicultural clinicians.",
      ar: "المحتوى المترجم يحمل افتراضات ثقافية لا تعبر معه. نحن نعيد البناء من الصفر بكلتا اللغتين، مع ممارسين ثنائيي الثقافة.",
    },
    category: "habits",
    author: "Amro Ghamrawy",
    publishedAt: "2025-12-20",
    readingMinutes: 4,
  },
];

export const findPostBySlug = (slug: string) => posts.find((p) => p.slug === slug);
