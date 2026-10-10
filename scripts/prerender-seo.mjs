// Post-build prerender: for each public route, emit a static HTML file
// at dist/<route>/index.html with per-route <title>, <meta description>,
// <link rel="canonical">, and hreflang alternates baked in.
//
// Vercel serves static files before applying the SPA rewrite, so direct
// hits (and crawler fetches) to /coaching, /shop, etc. land on the
// per-route HTML with correct meta tags. The SPA still hydrates client-
// side from the same shell — runtime behavior is unchanged.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const SITE_URL = "https://www.livfunctional.com";

const escapeAttr = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const routes = [
  {
    path: "/",
    title: "Liv Functional — Functional wellness, real transformation.",
    description:
      "Liv Functional is a bilingual wellness studio offering self-guided programs, 1:1 coaching, and free consultations rooted in functional medicine and behavior change.",
  },
  {
    path: "/self-guided-programs-خطة-مقاومة-الانسولين",
    title:
      "Self-Guided Programs — Insulin Resistance Reset & Metabolic Protocols | Liv Functional",
    description:
      "Self-paced reset programs for insulin resistance, hormones, gut health, and metabolic function. Built by functional nutritionists.",
  },
  {
    path: "/coaching",
    title:
      "1:1 Holistic Nutrition Coaching for Insulin Resistance | Liv Functional",
    description:
      "Work 1:1 with a certified holistic nutrition consultant to reverse insulin resistance through behavior change and functional protocols.",
  },
  {
    path: "/consultations",
    title:
      "Book Your Free 30-Minute Discovery Call | Liv Functional",
    description:
      "Book a free 30-minute discovery call with a functional nutrition practitioner and walk away with a clear next step.",
  },
  {
    path: "/blog",
    title: "Blog — Functional Wellness & Metabolic Health Journal | Liv Functional",
    description:
      "Field notes from the studio: hormones, gut, metabolic health, mindset, habits, and energy — translated for real life.",
  },
  {
    path: "/about",
    title: "About — Bilingual Functional Wellness Studio | Liv Functional",
    description:
      "Liv Functional is a bilingual transformation studio rooted in functional medicine, behaviour change, and metabolic health.",
  },
  {
    path: "/my-story",
    title:
      "Founder's Story — Reham Alsharif & LIV Functional | Liv Functional",
    description:
      "How Reham Alsharif went from Marketing VP to LADA diagnosis at 44 — and built LIV Functional from that experience.",
  },
  {
    path: "/why-us",
    title:
      "Why Liv Functional — Bilingual, Behaviour-First, Clinical Depth",
    description:
      "Why women across the GCC, Europe, and North America choose Liv Functional over generic wellness brands.",
  },
  {
    path: "/how-it-works",
    title: "How It Works — Our Functional Nutrition Method | Liv Functional",
    description:
      "Transparent, structured, and built around your life — not ours. How working with Liv Functional actually works.",
  },
  {
    path: "/faq",
    title:
      "FAQ — 1:1 Discovery Consultation Questions Answered | Liv Functional",
    description:
      "Real answers about how the discovery consultation works and what you'll walk away with.",
  },
  {
    path: "/contact",
    title: "Contact — Talk to Liv Functional",
    description:
      "Talk to Liv Functional. We answer every email — usually within 48 hours.",
  },
  {
    path: "/liv-at-work",
    title: "LIV At Work: Metabolic Health Workshops for Teams | Liv Functional",
    description:
      "A 3-hour live workshop at your office. Watch a real glucose monitor react to real food and leave with a plan for your working day. Up to 20 people, English or Arabic.",
  },
  {
    path: "/recommended",
    title: "Recommended Products — Curated by Liv Functional",
    description:
      "A short, honest list of products we use ourselves. Some links are affiliate — they don't change the price you pay.",
  },
  {
    path: "/partners",
    title: "Partners | Liv Functional",
    description: "Our partners — clinics, brands, and practitioners we trust.",
  },
  {
    path: "/privacy",
    title: "Privacy Policy | Liv Functional",
    description: "How Liv Functional handles your data and privacy.",
  },
  {
    path: "/terms",
    title: "Refund & Terms Policy | Liv Functional",
    description:
      "Terms of service and refund policy for Liv Functional.",
  },
  {
    path: "/coaching-agreement",
    title: "Coaching Agreement | Liv Functional",
    description:
      "The coaching agreement for clients enrolled in Liv Functional 1:1 programs.",
  },
  {
    path: "/bio",
    title: "Liv Functional · Links",
    description:
      "Book a free discovery call, take the insulin resistance quiz, start a self-guided program or read Reham's books.",
  },
  {
    path: "/insulin-reset-guide",
    title: "Free 10-Day Insulin Sensitivity Reset | Liv Functional",
    description:
      "A free, structured 10-day plan for prediabetes, PCOS, high fasting insulin and high A1C. Enter your email to download it.",
  },
  {
    path: "/p/cgm-guide",
    title:
      "CGM Guide — Continuous Glucose Monitoring for Insulin Resistance | Liv Functional",
    description:
      "What a continuous glucose monitor (CGM) reveals about your insulin resistance, and how to use the data to drive metabolic change.",
  },
];

// Arabic title/description for each route's /ar twin (keyed by route path).
const arCopy = {
  "/": {
    title: "ليف فنكشنال — صحة وظيفية وتحوّل حقيقي",
    description:
      "ليف فنكشنال استوديو صحي ثنائي اللغة يقدّم برامج ذاتية، وتدريبًا فرديًا، واستشارات مجانية مبنية على الطب الوظيفي وتغيير السلوك.",
  },
  "/self-guided-programs-خطة-مقاومة-الانسولين": {
    title: "برامج ذاتية — خطة إعادة ضبط مقاومة الإنسولين | ليف فنكشنال",
    description:
      "برامج ذاتية لإعادة ضبط مقاومة الإنسولين والهرمونات وصحة الأمعاء والتمثيل الغذائي، من إعداد أخصائيات تغذية وظيفية.",
  },
  "/coaching": {
    title: "تدريب تغذية علاجية فردي لمقاومة الإنسولين | ليف فنكشنال",
    description:
      "اعملي بشكل فردي مع مستشارة تغذية علاجية معتمدة لعكس مقاومة الإنسولين عبر تغيير السلوك والبروتوكولات الوظيفية.",
  },
  "/consultations": {
    title: "احجزي مكالمتك التعريفية المجانية ٣٠ دقيقة | ليف فنكشنال",
    description:
      "احجزي مكالمة تعريفية مجانية مدتها ٣٠ دقيقة، أو استشارة علاجية معمّقة مع ممارسة تغذية وظيفية.",
  },
  "/blog": {
    title: "المدوّنة — ملاحظات في الصحة الوظيفية والتمثيل الغذائي | ليف فنكشنال",
    description:
      "ملاحظات ميدانية من الاستوديو: الهرمونات والأمعاء والصحة الأيضية والعقلية والعادات والطاقة، مترجمة للحياة الحقيقية.",
  },
  "/about": {
    title: "من نحن — استوديو صحة وظيفية ثنائي اللغة | ليف فنكشنال",
    description:
      "ليف فنكشنال استوديو تحوّل ثنائي اللغة، مبني على الطب الوظيفي وتغيير السلوك والصحة الأيضية.",
  },
  "/my-story": {
    title: "قصة المؤسِّسة — رهام الشريف وليف فنكشنال | ليف فنكشنال",
    description:
      "كيف انتقلت رهام الشريف من نائبة رئيس تسويق إلى تشخيص LADA في عمر الرابعة والأربعين، وأسّست ليف فنكشنال من تلك التجربة.",
  },
  "/why-us": {
    title: "لماذا ليف فنكشنال — ثنائي اللغة، يبدأ بالسلوك، وعمق علمي",
    description:
      "لماذا تختار النساء في الخليج وأوروبا وأمريكا الشمالية ليف فنكشنال بدل علامات الصحة العامة.",
  },
  "/how-it-works": {
    title: "كيف يسير العمل — منهجنا في التغذية الوظيفية | ليف فنكشنال",
    description:
      "شفاف ومنظّم ومبني حول حياتك لا حياتنا. هكذا يسير العمل مع ليف فنكشنال فعليًا.",
  },
  "/faq": {
    title: "الأسئلة الشائعة — عن الاستشارة التعريفية الفردية | ليف فنكشنال",
    description:
      "إجابات واضحة عن كيفية سير الاستشارة التعريفية وما ستخرجين به منها.",
  },
  "/contact": {
    title: "تواصلي معنا — تحدّثي إلى ليف فنكشنال",
    description:
      "تحدّثي إلى ليف فنكشنال. نردّ على كل بريد، وعادة خلال ٤٨ ساعة.",
  },
  "/liv-at-work": {
    title: "LIV At Work: ورش الصحة الأيضية لفرق العمل | ليف فنكشنال",
    description:
      "ورشة حية مدتها 3 ساعات في مقر شركتك. شاهد جهاز قياس سكر حقيقيًا يتفاعل مع أكل حقيقي، واخرج بخطة ليوم عملك. حتى 20 شخصًا، بالعربية أو الإنجليزية.",
  },
  "/recommended": {
    title: "منتجات نوصي بها — اختيارات ليف فنكشنال",
    description:
      "قائمة قصيرة وصادقة بمنتجات نستخدمها بأنفسنا. بعض الروابط تابعة ولا تغيّر السعر الذي تدفعينه.",
  },
  "/partners": {
    title: "شركاؤنا | ليف فنكشنال",
    description: "شركاؤنا من عيادات وعلامات وممارسين نثق بهم.",
  },
  "/privacy": {
    title: "سياسة الخصوصية | ليف فنكشنال",
    description: "كيف تتعامل ليف فنكشنال مع بياناتك وخصوصيتك.",
  },
  "/terms": {
    title: "شروط الخدمة وسياسة الاسترجاع | ليف فنكشنال",
    description: "شروط الخدمة وسياسة الاسترجاع الخاصة بليف فنكشنال.",
  },
  "/coaching-agreement": {
    title: "اتفاقية التدريب | ليف فنكشنال",
    description: "اتفاقية التدريب للمشتركات في برامج ليف فنكشنال الفردية.",
  },
  "/bio": {
    title: "ليف فنكشنال · الروابط",
    description:
      "حجز مكالمة تعريفية مجانية، واختبار مقاومة الإنسولين، وبرامج جاهزة للتطبيق، وكتب رهام.",
  },
  "/insulin-reset-guide": {
    title: "إعادة ضبط حساسية الإنسولين خلال 10 أيام، مجانًا | ليف فنكشنال",
    description:
      "خطة منظمة مجانية لمدة 10 أيام لما قبل السكري وتكيس المبايض وارتفاع إنسولين الصيام وارتفاع A1C. أدخل بريدك الإلكتروني لتحميلها.",
  },
  "/p/cgm-guide": {
    title: "دليل جهاز CGM — مراقبة الجلوكوز المستمرة لمقاومة الإنسولين | ليف فنكشنال",
    description:
      "ماذا يكشف جهاز مراقبة الجلوكوز المستمرة (CGM) عن مقاومة الإنسولين لديكِ، وكيف تستخدمين بياناته لتغيير صحتك الأيضية.",
  },
};

// Short, warm text for link previews (WhatsApp, iMessage, Facebook, LinkedIn).
// Falls back to the meta description when a route has no entry.
const shareCopy = {
  en: {
    "/": "Functional nutrition coaching for women with insulin resistance. Programs, 1:1 coaching and a free call.",
    "/self-guided-programs-خطة-مقاومة-الانسولين": "Self-paced plans to reset insulin resistance, hormones and gut health. Start today, at your own speed.",
    "/coaching": "1:1 coaching with Reham to reverse insulin resistance, one realistic habit at a time.",
    "/consultations": "A free 30-minute call. You leave knowing your next step.",
    "/blog": "Plain-language notes on hormones, gut health and blood sugar.",
    "/about": "A bilingual wellness studio built on functional medicine and real behavior change.",
    "/my-story": "From Marketing VP to a LADA diagnosis at 44. Why Reham started LIV.",
    "/why-us": "Bilingual, behavior-first and clinically grounded. Why women choose LIV.",
    "/how-it-works": "What working with LIV looks like, step by step.",
    "/faq": "Answers about the free discovery call and what happens next.",
    "/contact": "Questions? Write to us. We reply within 48 hours.",
    "/liv-at-work": "A 3-hour workshop at your office. A live glucose monitor reacts to real food. Up to 20 people.",
    "/recommended": "Products we actually use. Some links are affiliate, and your price stays the same.",
    "/partners": "Clinics, brands and practitioners we trust.",
    "/bio": "Book a free call, take the insulin resistance quiz, or start a self-guided program.",
    "/insulin-reset-guide": "A free 10-day plan to improve insulin sensitivity. Enter your email and download it.",
    "/p/cgm-guide": "What a glucose monitor shows about your insulin resistance, and how to use it.",
  },
  ar: {
    "/": "تغذية وظيفية للنساء مع مقاومة الإنسولين. برامج، وتدريب فردي، ومكالمة مجانية.",
    "/self-guided-programs-خطة-مقاومة-الانسولين": "خطط ذاتية لإعادة ضبط مقاومة الإنسولين والهرمونات والأمعاء. ابدئي اليوم وبالسرعة التي تناسبك.",
    "/coaching": "تدريب فردي مع رهام لعكس مقاومة الإنسولين، بعادة واقعية كل مرة.",
    "/consultations": "مكالمة مجانية مدتها ٣٠ دقيقة. تخرجين منها وأنتِ تعرفين خطوتك التالية.",
    "/blog": "ملاحظات بلغة بسيطة عن الهرمونات والأمعاء وسكر الدم.",
    "/about": "استوديو صحي ثنائي اللغة، مبني على الطب الوظيفي وتغيير السلوك الحقيقي.",
    "/my-story": "من نائبة رئيس تسويق إلى تشخيص LADA في الرابعة والأربعين. هكذا بدأت رهام ليف.",
    "/why-us": "ثنائي اللغة، يبدأ بالسلوك، ومبني على أساس علمي. لماذا تختارنا النساء.",
    "/how-it-works": "كيف يكون العمل معنا، خطوة بخطوة.",
    "/faq": "أجوبة عن المكالمة التعريفية المجانية وما بعدها.",
    "/contact": "عندك سؤال؟ اكتبي لنا. نردّ خلال ٤٨ ساعة.",
    "/liv-at-work": "ورشة ٣ ساعات في مقر شركتكم. جهاز قياس سكر حي يتفاعل مع أكل حقيقي. حتى ٢٠ شخصًا.",
    "/recommended": "منتجات نستخدمها نحن فعلًا. بعض الروابط تابعة ولا يتغير السعر عليك.",
    "/partners": "عيادات وعلامات وممارسون نثق بهم.",
    "/bio": "حجز مكالمة مجانية، واختبار مقاومة الإنسولين، وبرامج جاهزة للتطبيق.",
    "/insulin-reset-guide": "خطة مجانية لمدة 10 أيام لتحسين حساسية الإنسولين. أدخل بريدك وحمّلها.",
    "/p/cgm-guide": "ماذا يكشف جهاز قياس السكر المستمر عن مقاومة الإنسولين عندك، وكيف تستفيدين من بياناته.",
  },
};

// Share images live in public/og/. Drop a file named after the route slug to
// give that page its own picture; add "-ar" for an Arabic-specific one.
//   public/og/coaching.jpg, public/og/coaching-ar.jpg, ...
// Anything missing falls back to public/og/default.png.
const ogSlugs = {
  "/": "home",
  "/self-guided-programs-خطة-مقاومة-الانسولين": "programs",
  "/p/cgm-guide": "cgm-guide",
};
const ogSlug = (routePath) =>
  ogSlugs[routePath] ?? routePath.replace(/^\//, "").replace(/\//g, "-");

function resolveOgImage(routePath, lang) {
  const slug = ogSlug(routePath);
  const candidates = [
    ...(lang === "ar" ? [`${slug}-ar`] : []),
    slug,
    "default",
  ];
  for (const name of candidates) {
    for (const ext of ["jpg", "png"]) {
      if (fs.existsSync(path.join(DIST, "og", `${name}.${ext}`))) {
        return `${SITE_URL}/og/${name}.${ext}`;
      }
    }
  }
  return `${SITE_URL}/liv-logo.png`;
}

function buildHtml(template, route, lang = "en") {
  const isHome = route.path === "/";
  const enUrl = `${SITE_URL}${isHome ? "/" : encodeURI(route.path)}`;
  const arUrl = `${SITE_URL}/ar${isHome ? "" : encodeURI(route.path)}`;
  const canonical = lang === "ar" ? arUrl : enUrl;
  const copy = lang === "ar" ? arCopy[route.path] ?? route : route;
  const title = escapeAttr(copy.title);
  const description = escapeAttr(copy.description);

  let html = template;

  if (lang === "ar") {
    html = html.replace(/<html([^>]*?)\slang=["'][^"']*["']/i, '<html$1 lang="ar"');
    if (/<html[^>]*\sdir=/i.test(html)) html = html.replace(/(<html[^>]*?)\sdir=["'][^"']*["']/i, '$1 dir="rtl"');
    else html = html.replace(/<html/i, '<html dir="rtl"');
  }

  // <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);

  // <meta name="description">
  html = html.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${description}" />`
  );

  // canonical
  html = html.replace(
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${canonical}" />`
  );

  // hreflang alternates (replace all three; order: en, ar, x-default)
  html = html.replace(
    /<link\s+rel=["']alternate["']\s+hreflang=["']en["'][^>]*>/i,
    `<link rel="alternate" hreflang="en" href="${enUrl}" />`
  );
  html = html.replace(
    /<link\s+rel=["']alternate["']\s+hreflang=["']ar["'][^>]*>/i,
    `<link rel="alternate" hreflang="ar" href="${arUrl}" />`
  );
  html = html.replace(
    /<link\s+rel=["']alternate["']\s+hreflang=["']x-default["'][^>]*>/i,
    `<link rel="alternate" hreflang="x-default" href="${enUrl}" />`
  );

  // OG
  html = html.replace(
    /<meta\s+property=["']og:url["'][^>]*>/i,
    `<meta property="og:url" content="${canonical}" />`
  );
  html = html.replace(
    /<meta\s+property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${title}" />`
  );
  const shareDescription = escapeAttr(
    shareCopy[lang]?.[route.path] ?? copy.description
  );
  const ogImage = resolveOgImage(route.path, lang);
  html = html.replace(
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${shareDescription}" />`
  );
  html = html.replace(
    /<meta\s+property=["']og:image["'][^>]*>/i,
    `<meta property="og:image" content="${ogImage}" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:alt" content="${title}" />`
  );
  if (lang === "ar") {
    html = html.replace(
      /<meta\s+property=["']og:locale["'][^>]*>/i,
      `<meta property="og:locale" content="ar_KW" />`
    );
    html = html.replace(
      /<meta\s+property=["']og:locale:alternate["'][^>]*>/i,
      `<meta property="og:locale:alternate" content="en_US" />`
    );
  }

  // Twitter
  html = html.replace(
    /<meta\s+name=["']twitter:title["'][^>]*>/i,
    `<meta name="twitter:title" content="${title}" />`
  );
  html = html.replace(
    /<meta\s+name=["']twitter:description["'][^>]*>/i,
    `<meta name="twitter:description" content="${shareDescription}" />`
  );
  html = html.replace(
    /<meta\s+name=["']twitter:image["'][^>]*>/i,
    `<meta name="twitter:image" content="${ogImage}" />`
  );

  return html;
}

function main() {
  const indexPath = path.join(DIST, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.error(`[prerender-seo] dist/index.html not found at ${indexPath}`);
    process.exit(1);
  }

  const template = fs.readFileSync(indexPath, "utf8");
  let count = 0;

  for (const route of routes) {
    // Arabic twin at /ar/<route> (same shell; the SPA fills in Arabic content)
    const arDir = path.join(DIST, "ar", ...route.path.replace(/^\//, "").split("/").filter(Boolean));
    fs.mkdirSync(arDir, { recursive: true });
    fs.writeFileSync(path.join(arDir, "index.html"), buildHtml(template, route, "ar"), "utf8");
    count += 1;

    const html = buildHtml(template, route);
    if (route.path === "/") {
      fs.writeFileSync(indexPath, html, "utf8");
    } else {
      const dir = path.join(DIST, ...route.path.replace(/^\//, "").split("/"));
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
    }
    count += 1;
  }

  console.log(`[prerender-seo] wrote ${count} route(s)`);
}

main();
