// Post-build prerender: for each public route, emit a static HTML file
// at dist/<route>/index.html with per-route <title>, <meta description>,
// <link rel="canonical">, and hreflang alternates baked in.
//
// Vercel serves static files before applying the SPA rewrite, so direct
// hits (and crawler fetches) to /coaching, /diy-plans, etc. land on the
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
      "Liv Functional is a bilingual wellness studio offering DIY plans, 1:1 coaching, and free consultations rooted in functional medicine and behavior change.",
  },
  {
    path: "/diy-plans",
    title:
      "DIY Plans — Insulin Resistance Reset & Metabolic Protocols | Liv Functional",
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
      "Free Discovery Call & Holistic Consultation | Liv Functional",
    description:
      "Book a free 30-minute discovery call or a deep-dive holistic consultation with a functional nutrition practitioner.",
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
    path: "/b2b",
    title:
      "B2B Wellness — Workshops, Retreats & Corporate Programs | Liv Functional",
    description:
      "We design workshops that fit your corporate culture, event ideas, or wellness programs. Bilingual programming for teams under pressure.",
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
    path: "/p/cgm-guide",
    title:
      "CGM Guide — Continuous Glucose Monitoring for Insulin Resistance | Liv Functional",
    description:
      "What a continuous glucose monitor (CGM) reveals about your insulin resistance, and how to use the data to drive metabolic change.",
  },
];

function buildHtml(template, route) {
  const isHome = route.path === "/";
  const canonical = `${SITE_URL}${isHome ? "/" : route.path}`;
  const arUrl = `${canonical}${canonical.includes("?") ? "&" : "?"}lang=ar`;
  const title = escapeAttr(route.title);
  const description = escapeAttr(route.description);

  let html = template;

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
    `<link rel="alternate" hreflang="en" href="${canonical}" />`
  );
  html = html.replace(
    /<link\s+rel=["']alternate["']\s+hreflang=["']ar["'][^>]*>/i,
    `<link rel="alternate" hreflang="ar" href="${arUrl}" />`
  );
  html = html.replace(
    /<link\s+rel=["']alternate["']\s+hreflang=["']x-default["'][^>]*>/i,
    `<link rel="alternate" hreflang="x-default" href="${canonical}" />`
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
  html = html.replace(
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${description}" />`
  );

  // Twitter
  html = html.replace(
    /<meta\s+name=["']twitter:title["'][^>]*>/i,
    `<meta name="twitter:title" content="${title}" />`
  );
  html = html.replace(
    /<meta\s+name=["']twitter:description["'][^>]*>/i,
    `<meta name="twitter:description" content="${description}" />`
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
