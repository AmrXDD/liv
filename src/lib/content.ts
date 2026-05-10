/**
 * Site content registry + override store.
 *
 *  - Defaults live in src/content/{en,ar}.json (still used as i18next resources).
 *  - Overrides live in the Supabase `site_content` table, keyed by `content_key`.
 *  - The runtime merges overrides on top of i18next via a postProcessor in lib/i18n.ts.
 *  - The admin UI uses `CONTENT_MANIFEST` (derived from the JSON tree) to enumerate
 *    every editable key, grouped by page.
 */

import en from "@/content/en.json";
import ar from "@/content/ar.json";
import { getSupabase } from "@/lib/supabase";

export type ElementType = "title" | "paragraph" | "card" | "button" | "text";

export interface ContentEntry {
  contentKey: string;
  pageSlug: string;
  elementType: ElementType;
  defaultEn: string;
  defaultAr: string;
}

export interface SiteContentRow {
  content_key: string;
  page_slug: string;
  element_type: ElementType | string;
  value_en: string | null;
  value_ar: string | null;
  description: string | null;
}

// ---- Page slug derivation -------------------------------------------------

const PAGE_SLUG_BY_PREFIX: Record<string, string> = {
  hero: "home",
  marquee: "home",
  services: "home",
  servicesPillars: "home",
  stories: "home",
  credentials: "home",
  howItWorks: "home",
  featuredProducts: "home",
  blogPreview: "home",
  testimonials: "home",
  newsletter: "home",
  conversionFunnel: "home",
  bloodSugar: "home",
  diy: "diy-plans",
  diyPlans: "diy-plans",
  coaching: "coaching",
  consultations: "consultations",
  about: "about",
  myStory: "my-story",
  whyUs: "why-us",
  contact: "contact",
  faq: "faq",
  faqs: "faq",
  b2b: "b2b",
  partners: "partners",
  recommended: "recommended",
  blog: "blog",
  checkout: "checkout",
  notFound: "not-found",
  privacy: "privacy",
  terms: "terms",
  // Global / cross-cutting
  brand: "global",
  nav: "global",
  cta: "global",
  cart: "global",
  common: "global",
  footer: "global",
  seo: "global",
  language: "global",
  forms: "global",
  errors: "global",
};

function pageSlugFor(topKey: string): string {
  return PAGE_SLUG_BY_PREFIX[topKey] ?? topKey.toLowerCase();
}

// ---- Element type derivation ---------------------------------------------

function elementTypeFor(path: string[]): ElementType {
  const leaf = path[path.length - 1] ?? "";
  const parent = path[path.length - 2] ?? "";

  // index-based leaves like ".0", treat as the parent's intent
  const probe = /^\d+$/.test(leaf) ? parent : leaf;
  const norm = probe.toLowerCase();

  if (/(^|[^a-z])(title|titlea|titleb|titlec|titled|heading|headline|eyebrow|name|label)$/.test(norm))
    return "title";
  if (/(button|cta|primary|secondary|submit|apply|view|book|shop|download|getstarted|learnmore|action)/.test(norm))
    return "button";
  if (/(items?|cards?|tiles?|features?|pillars?|steps?|voices|metrics|stories|programs?|plans?)/.test(norm))
    return "card";
  if (/(lede|body|description|summary|outcome|note|copy|text|paragraph|tagline|hint|message|content|placeholder)/.test(norm))
    return "paragraph";
  if (path.includes("metrics") || path.includes("steps") || path.includes("items")) return "card";
  return "text";
}

// ---- Walk JSON tree and produce manifest ---------------------------------

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

function walk(
  enNode: JsonValue,
  arNode: JsonValue,
  path: string[],
  out: ContentEntry[]
) {
  if (typeof enNode === "string") {
    const top = path[0] ?? "global";
    out.push({
      contentKey: path.join("."),
      pageSlug: pageSlugFor(top),
      elementType: elementTypeFor(path),
      defaultEn: enNode,
      defaultAr: typeof arNode === "string" ? arNode : "",
    });
    return;
  }
  if (Array.isArray(enNode)) {
    enNode.forEach((child, i) => {
      const arChild = Array.isArray(arNode) ? arNode[i] : undefined;
      walk(child, (arChild ?? null) as JsonValue, [...path, String(i)], out);
    });
    return;
  }
  if (enNode && typeof enNode === "object") {
    for (const k of Object.keys(enNode)) {
      const arChild =
        arNode && typeof arNode === "object" && !Array.isArray(arNode)
          ? (arNode as Record<string, JsonValue>)[k]
          : undefined;
      walk((enNode as Record<string, JsonValue>)[k], (arChild ?? null) as JsonValue, [...path, k], out);
    }
  }
}

let _manifest: ContentEntry[] | null = null;

export function getContentManifest(): ContentEntry[] {
  if (_manifest) return _manifest;
  const out: ContentEntry[] = [];
  walk(en as JsonValue, ar as JsonValue, [], out);
  _manifest = out;
  return out;
}

export function getManifestByPage(): Record<string, ContentEntry[]> {
  const grouped: Record<string, ContentEntry[]> = {};
  for (const e of getContentManifest()) {
    (grouped[e.pageSlug] ||= []).push(e);
  }
  for (const slug of Object.keys(grouped)) {
    grouped[slug].sort((a, b) => a.contentKey.localeCompare(b.contentKey));
  }
  return grouped;
}

export function listManagedPages(): { slug: string; label: string; count: number }[] {
  const grouped = getManifestByPage();
  return Object.keys(grouped)
    .map((slug) => ({ slug, label: prettyLabel(slug), count: grouped[slug].length }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function prettyLabel(slug: string): string {
  if (slug === "home") return "Home";
  if (slug === "global") return "Global (nav, footer, CTAs)";
  return slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

// ---- Override store -------------------------------------------------------
//
// A simple module-level Map of content_key -> {en, ar}. Populated once from
// Supabase on app boot, and updated when the admin saves. The i18n
// postProcessor reads from this Map synchronously.

type Overrides = Map<string, { en: string | null; ar: string | null }>;

const overrides: Overrides = new Map();
let loaded = false;
let loadingPromise: Promise<void> | null = null;
const subscribers = new Set<() => void>();

export function getOverride(key: string, lang: "en" | "ar"): string | null {
  const row = overrides.get(key);
  if (!row) return null;
  const v = lang === "ar" ? row.ar : row.en;
  return v && v.length > 0 ? v : null;
}

export function setOverride(
  key: string,
  next: { en: string | null; ar: string | null }
) {
  overrides.set(key, next);
  subscribers.forEach((cb) => cb());
}

export function clearOverride(key: string) {
  overrides.delete(key);
  subscribers.forEach((cb) => cb());
}

export function subscribeOverrides(cb: () => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

export async function loadOverrides(force = false): Promise<void> {
  if (loaded && !force) return;
  if (loadingPromise && !force) return loadingPromise;

  loadingPromise = (async () => {
    const sb = getSupabase();
    if (!sb) {
      loaded = true;
      return;
    }
    const { data, error } = await sb
      .from("site_content")
      .select("content_key,value_en,value_ar");
    if (error) {
      // Surface to console but don't break the UI; defaults still render.
      // eslint-disable-next-line no-console
      console.warn("[site_content] load failed:", error.message);
      loaded = true;
      return;
    }
    overrides.clear();
    for (const row of data ?? []) {
      overrides.set(row.content_key, {
        en: (row as SiteContentRow).value_en ?? null,
        ar: (row as SiteContentRow).value_ar ?? null,
      });
    }
    loaded = true;
    subscribers.forEach((cb) => cb());
  })();

  return loadingPromise;
}

export function hasOverridesLoaded(): boolean {
  return loaded;
}

// ---- Admin write helpers --------------------------------------------------

export async function upsertContent(rows: SiteContentRow[]): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase not configured");
  if (rows.length === 0) return;
  const { error } = await sb.from("site_content").upsert(rows, { onConflict: "content_key" });
  if (error) throw error;
  // Update local store optimistically
  for (const row of rows) {
    overrides.set(row.content_key, { en: row.value_en, ar: row.value_ar });
  }
  subscribers.forEach((cb) => cb());
}

export async function deleteContent(contentKey: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase not configured");
  const { error } = await sb.from("site_content").delete().eq("content_key", contentKey);
  if (error) throw error;
  overrides.delete(contentKey);
  subscribers.forEach((cb) => cb());
}
