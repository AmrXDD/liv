// Post-build: extend dist/sitemap.xml with the dynamic pages (published blog
// posts and products), each with an English and an /ar entry plus hreflang.
// The hand-maintained public/sitemap.xml supplies the static pages. If
// Supabase is unreachable the static sitemap is left as-is and the build
// continues.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITEMAP = path.join(ROOT, "dist", "sitemap.xml");
const SITE_URL = "https://www.livfunctional.com";
const SELF_GUIDED_PATH = "/self-guided-programs-خطة-مقاومة-الانسولين";
const FREE_ASSESSMENT_SLUG = "free-assessment-كيف-اعرف-إذا-عندي-مقاومة-انسولين";

// Vercel provides env vars; locally fall back to .env files.
function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

async function rest(table, select, filter = "") {
  const base = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  const res = await fetch(`${base}/rest/v1/${table}?select=${select}&is_published=eq.true${filter}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`${table}: HTTP ${res.status}`);
  return res.json();
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function entry(pagePath, { priority, changefreq, lastmod }) {
  const en = `${SITE_URL}${encodeURI(pagePath)}`;
  const ar = `${SITE_URL}/ar${encodeURI(pagePath)}`;
  const alt = `    <xhtml:link rel="alternate" hreflang="en" href="${esc(en)}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${esc(ar)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(en)}" />
`;
  return [en, ar]
    .map(
      (loc) => `  <url>
    <loc>${esc(loc)}</loc>
${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${alt}  </url>
`
    )
    .join("");
}

async function main() {
  loadEnv();
  if (!fs.existsSync(SITEMAP)) {
    console.warn("[sitemap] dist/sitemap.xml missing; skipped");
    return;
  }
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    console.warn("[sitemap] Supabase env not set; keeping static sitemap");
    return;
  }

  let products, posts;
  try {
    [products, posts] = await Promise.all([
      rest("products", "slug,category,format", "&category=in.(diy,coaching,physical)"),
      rest("blog_posts", "slug,published_at"),
    ]);
  } catch (err) {
    console.warn(`[sitemap] ${err.message}; keeping static sitemap`);
    return;
  }

  let xml = fs.readFileSync(SITEMAP, "utf8");
  const have = new Set([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]));
  let add = "";
  let n = 0;
  const push = (p, opts) => {
    if (have.has(`${SITE_URL}${encodeURI(p)}`)) return;
    add += entry(p, opts);
    n += 2;
  };

  for (const p of products) {
    if (!p.slug || p.slug === FREE_ASSESSMENT_SLUG) continue;
    const base =
      p.category === "coaching"
        ? "/coaching"
        : p.category === "physical" || p.format === "Physical"
          ? "/shop"
          : SELF_GUIDED_PATH;
    push(`${base}/${p.slug}`, { priority: "0.8", changefreq: "weekly" });
  }
  for (const p of posts) {
    if (!p.slug) continue;
    const lastmod = p.published_at ? new Date(p.published_at).toISOString().slice(0, 10) : "";
    push(`/blog/${p.slug}`, { priority: "0.6", changefreq: "monthly", lastmod });
  }

  xml = xml.replace("</urlset>", `${add}</urlset>`);
  fs.writeFileSync(SITEMAP, xml, "utf8");
  console.log(`[sitemap] added ${n} dynamic URL(s) (${products.length} products, ${posts.length} posts)`);
}

main();
