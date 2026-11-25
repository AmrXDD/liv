// Post-build prerender of the page BODY. Runs last, after prerender-seo.mjs and
// generate-sitemap.mjs, so it can read the final dist/sitemap.xml.
//
// For every URL in the sitemap it opens the built site in headless Chrome, lets
// the app render, then writes dist/<route>/index.html with:
//   - the rendered #root markup (H1, copy, links), so the raw HTML has real text
//   - the <head> tags the page itself sets through react-helmet-async
//     (title, description, canonical, hreflang, og/twitter, JSON-LD)
// The SPA still boots with createRoot and replaces #root, so runtime behaviour
// is unchanged.
//
// This step is best-effort: with no Chrome available or on any failure the
// build keeps the meta-only files from prerender-seo.mjs and still succeeds.
// Set PRERENDER_STRICT=1 to make failures fatal. CHROME_PATH picks a browser.

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const CONCURRENCY = 4;
const STRICT = process.env.PRERENDER_STRICT === "1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

const log = (m) => console.log(`[prerender-html] ${m}`);
const warn = (m) => console.warn(`[prerender-html] ${m}`);

function sitemapPaths() {
  const xml = fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
  const out = new Set();
  for (const m of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const loc = m[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<");
    try {
      out.add(new URL(loc).pathname);
    } catch {
      /* skip malformed */
    }
  }
  return [...out];
}

// Tiny static server over dist/ with the same SPA fallback Vercel applies.
function serve(shell) {
  const server = http.createServer((req, res) => {
    let pathname = "/";
    try {
      pathname = decodeURIComponent(new URL(req.url, "http://x").pathname);
    } catch {
      /* keep "/" */
    }
    const rel = pathname.replace(/^\/+/, "");
    const asFile = path.join(DIST, rel);
    const inDist = asFile.startsWith(DIST);
    if (inDist && rel && fs.existsSync(asFile) && fs.statSync(asFile).isFile()) {
      res.writeHead(200, { "Content-Type": MIME[path.extname(asFile).toLowerCase()] ?? "application/octet-stream" });
      fs.createReadStream(asFile).pipe(res);
      return;
    }
    // Always hand back the pristine shell so earlier output never leaks into later renders.
    res.writeHead(200, { "Content-Type": MIME[".html"] });
    res.end(shell);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

async function launchBrowser() {
  const puppeteer = (await import("puppeteer-core")).default;
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);
  const local = candidates.find((p) => fs.existsSync(p));
  // The renderer-backgrounding flags matter: Helmet commits head changes in requestAnimationFrame, which
  // headless Chrome pauses for tabs it considers hidden when several render at once.
  const base = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-renderer-backgrounding",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
  ];
  if (local) return puppeteer.launch({ executablePath: local, headless: true, args: base });

  const { default: chromium } = await import("@sparticuz/chromium");
  return puppeteer.launch({
    executablePath: await chromium.executablePath(),
    headless: "shell",
    args: [...chromium.args, ...base],
  });
}

// Runs in the page: strip things that must not be baked in and read what Helmet set.
function extract() {
  const root = document.getElementById("root");
  root.querySelectorAll("script,iframe,noscript").forEach((n) => n.remove());
  const head = [...document.head.querySelectorAll('[data-rh="true"]')].map((n) => ({
    tag: n.tagName.toLowerCase(),
    name: n.getAttribute("name"),
    property: n.getAttribute("property"),
    rel: n.getAttribute("rel"),
    hreflang: n.getAttribute("hreflang"),
    type: n.getAttribute("type"),
    html: n.outerHTML.replace(/\sdata-rh="true"/g, ""),
  }));
  return {
    html: root.innerHTML,
    h1: root.querySelector("h1")?.textContent?.trim() ?? "",
    title: document.title,
    head,
    lang: document.documentElement.getAttribute("lang"),
    dir: document.documentElement.getAttribute("dir"),
  };
}

async function renderOne(browser, origin, routePath) {
  const context = await browser.createBrowserContext(); // fresh storage: no language leak between routes
  const page = await context.newPage();
  try {
    const cdp = await page.createCDPSession();
    await cdp.send("Emulation.setFocusEmulationEnabled", { enabled: true });
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]); // reveals render visible
    await page.setViewport({ width: 1280, height: 900 });
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const u = req.url();
      if (u.startsWith("data:") || u.startsWith("blob:")) return req.continue();
      let host = "";
      try {
        host = new URL(u).hostname;
      } catch {
        /* abort below */
      }
      // Only our own server and Supabase. Blocks analytics, pixels and embeds from firing at build time.
      if (host === "127.0.0.1" || host.endsWith(".supabase.co")) return req.continue();
      return req.abort();
    });
    await page.goto(`${origin}${routePath}`, { waitUntil: "networkidle0", timeout: 45000 });
    await page.waitForSelector("#root :is(h1,h2)", { timeout: 15000 });
    // Wait until Helmet has committed this route's canonical, so we never capture a half-switched language.
    const expected = decodeURIComponent(routePath).replace(/\/+$/, "") || "/";
    await page
      .waitForFunction(
        (want) => {
          const c = document.querySelector('link[rel="canonical"][data-rh="true"]');
          if (!c) return false;
          const got = decodeURIComponent(new URL(c.href).pathname).replace(/\/+$/, "") || "/";
          return got === want;
        },
        { timeout: 8000 },
        expected
      )
      .catch(() => {}); // pages without an SEO component: keep the shell's head
    await new Promise((r) => setTimeout(r, 300));
    return await page.evaluate(extract);
  } finally {
    await context.close();
  }
}

const headKey = (t) =>
  t.tag === "title"
    ? "title"
    : t.tag === "meta"
      ? `meta:${t.name ?? t.property}`
      : t.tag === "link" && t.rel === "alternate"
        ? `alt:${t.hreflang}`
        : t.tag === "link"
          ? `link:${t.rel}`
          : t.tag === "script"
            ? `script:${t.type}`
            : null;

// useHelmetHead=false keeps the route's head exactly as prerender-seo.mjs wrote it (its canonicals match the
// sitemap; a few pages, e.g. the admin-built /about, declare a different canonical at runtime) and only adds
// the page's JSON-LD. useHelmetHead=true is for routes prerender-seo does not cover, which have only the shell's head.
function applyHead(html, cap, useHelmetHead) {
  const tags = cap.head.filter((t) => headKey(t) && (useHelmetHead || headKey(t).startsWith("script:")));
  const keys = new Set(tags.map(headKey));
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (const key of keys) {
    const [kind, val] = key.split(/:(.*)/s);
    if (kind === "meta") {
      html = html.replace(new RegExp(`<meta\\s+(?:name|property)=["']${esc(val)}["'][^>]*>\\s*`, "gi"), "");
    } else if (kind === "alt") {
      html = html.replace(new RegExp(`<link\\s+rel=["']alternate["']\\s+hreflang=["']${esc(val)}["'][^>]*>\\s*`, "gi"), "");
    } else if (kind === "link") {
      html = html.replace(new RegExp(`<link\\s+rel=["']${esc(val)}["'][^>]*>\\s*`, "gi"), "");
    }
    // JSON-LD scripts from Helmet are page-specific; the template carries none, so nothing to remove.
  }
  const inject = tags.map((t) => `    ${t.html}`).join("\n");
  // Helmet's <title> has no data-rh tag, so take it from document.title (only when the page set its own head).
  if (tags.some((t) => t.tag === "link" && t.rel === "canonical") && cap.title) {
    const safe = cap.title.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    html = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${safe}</title>`);
  }
  html = html.replace("</head>", () => `${inject}\n  </head>`);
  if (useHelmetHead && cap.lang) html = html.replace(/<html([^>]*?)\slang=["'][^"']*["']/i, `<html$1 lang="${cap.lang}"`);
  if (useHelmetHead && cap.dir) {
    if (/<html[^>]*\sdir=/i.test(html)) html = html.replace(/(<html[^>]*?)\sdir=["'][^"']*["']/i, `$1 dir="${cap.dir}"`);
    else html = html.replace(/<html/i, `<html dir="${cap.dir}"`);
  }
  return html;
}

const fileFor = (routePath) => {
  const segs = decodeURIComponent(routePath).replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  return path.join(DIST, ...segs, "index.html");
};

async function main() {
  if (!fs.existsSync(path.join(DIST, "index.html")) || !fs.existsSync(path.join(DIST, "sitemap.xml"))) {
    warn("dist/index.html or dist/sitemap.xml missing; skipped");
    return;
  }
  const shell = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
  if (!/<div id="root"><\/div>/.test(shell)) {
    warn('dist/index.html has no empty <div id="root"></div>; skipped');
    return;
  }
  const paths = sitemapPaths();

  let browser;
  const server = await serve(shell);
  try {
    browser = await launchBrowser();
  } catch (err) {
    server.close();
    const msg = `no browser available (${err.message.split("\n")[0]}); keeping meta-only pages`;
    if (STRICT) throw new Error(msg);
    warn(msg);
    return;
  }

  const origin = `http://127.0.0.1:${server.address().port}`;
  const results = [];
  const failed = [];
  const noH1 = [];
  let next = 0;
  async function worker() {
    while (next < paths.length) {
      const p = paths[next++];
      try {
        const cap = await renderOne(browser, origin, p);
        if (!cap.h1) noH1.push(p);
        results.push([p, cap]);
      } catch (err) {
        failed.push(`${p} (${err.message.split("\n")[0]})`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  await browser.close();
  server.close();

  // Write after every render so each page was loaded from the pristine shell.
  for (const [p, cap] of results) {
    const file = fileFor(p);
    // Start from the route's meta-only file when prerender-seo wrote one (keeps og:image etc.), else the shell.
    const hasMetaFile = fs.existsSync(file);
    const base = hasMetaFile ? fs.readFileSync(file, "utf8") : shell;
    let html = applyHead(base, cap, !hasMetaFile);
    html = html.replace('<div id="root"></div>', () => `<div id="root">${cap.html}</div>`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html, "utf8");
  }

  log(`rendered ${results.length}/${paths.length} sitemap route(s)`);
  if (noH1.length) warn(`no <h1> on ${noH1.length} route(s) (the page itself has none):\n  ${noH1.join("\n  ")}`);
  if (failed.length) {
    warn(`${failed.length} route(s) left as meta-only:\n  ${failed.join("\n  ")}`);
    if (STRICT) process.exit(1);
  }
}

main().catch((err) => {
  warn(`failed: ${err.message}`);
  process.exit(STRICT ? 1 : 0);
});
