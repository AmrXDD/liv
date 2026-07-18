// Pulls products + collections from a public Shopify storefront's JSON
// endpoints and upserts them into our Supabase tables. Image URLs reference
// Shopify's CDN directly — no re-upload needed.

import { requireSupabase } from "./supabase";
import { slugify } from "./utils";

export const SHOPIFY_DOMAIN = "liv-functional.myshopify.com";

interface ShopifyImage {
  id: number;
  src: string;
  position: number;
  alt: string | null;
}
interface ShopifyVariant {
  id: number;
  title: string;
  price: string;
  available: boolean;
}
export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string[] | string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  published_at: string | null;
}
export interface ShopifyCollection {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  image?: { src: string } | null;
  published_at: string | null;
}

const STRIP_TAGS = /<[^>]*>/g;
const COLLAPSE_WS = /\s+/g;

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(STRIP_TAGS, " ").replace(COLLAPSE_WS, " ").trim();
}

function firstSentence(text: string, max = 180): string {
  const t = text.trim();
  if (!t) return "";
  const m = t.match(/^[^.!?]+[.!?]/);
  const s = (m?.[0] ?? t).trim();
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}

const SKIP_COLLECTION_HANDLES = new Set(["frontpage", "all"]);

const COACHING_HINTS = [
  "coaching",
  "consultation",
  "consultations",
  "session",
  "1:1",
  "program",
  "programs",
  "work with me",
];
const DIY_HINTS = ["diy", "protocol", "protocols", "plan", "plans", "reset", "guide", "ebook"];

function detectCategory(p: ShopifyProduct, hintsByProductHandle: Map<string, Set<string>>):
  | "diy"
  | "coaching" {
  const tagsArr = Array.isArray(p.tags)
    ? p.tags
    : (p.tags ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const hay = [
    p.product_type ?? "",
    ...tagsArr,
    ...(hintsByProductHandle.get(p.handle) ?? []),
  ]
    .join(" ")
    .toLowerCase();
  if (DIY_HINTS.some((h) => hay.includes(h))) return "diy";
  if (COACHING_HINTS.some((h) => hay.includes(h))) return "coaching";
  // sensible default — most catalog items here are coaching/consultation
  return "coaching";
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return (await res.json()) as T;
}

async function fetchAllProducts(): Promise<ShopifyProduct[]> {
  const all: ShopifyProduct[] = [];
  let page = 1;
  while (true) {
    const data = await fetchJson<{ products: ShopifyProduct[] }>(
      `https://${SHOPIFY_DOMAIN}/products.json?limit=250&page=${page}`
    );
    if (!data.products?.length) break;
    all.push(...data.products);
    if (data.products.length < 250) break;
    page += 1;
    if (page > 20) break;
  }
  return all;
}

async function fetchAllCollections(): Promise<ShopifyCollection[]> {
  const all: ShopifyCollection[] = [];
  let page = 1;
  while (true) {
    const data = await fetchJson<{ collections: ShopifyCollection[] }>(
      `https://${SHOPIFY_DOMAIN}/collections.json?limit=250&page=${page}`
    );
    if (!data.collections?.length) break;
    all.push(...data.collections);
    if (data.collections.length < 250) break;
    page += 1;
    if (page > 20) break;
  }
  return all.filter((c) => !SKIP_COLLECTION_HANDLES.has(c.handle));
}

async function fetchCollectionProducts(handle: string): Promise<ShopifyProduct[]> {
  try {
    const data = await fetchJson<{ products: ShopifyProduct[] }>(
      `https://${SHOPIFY_DOMAIN}/collections/${handle}/products.json?limit=250`
    );
    return data.products ?? [];
  } catch {
    return [];
  }
}

export interface ImportProgress {
  step: string;
  detail?: string;
}
export interface ImportResult {
  productsImported: number;
  collectionsImported: number;
  links: number;
}

function formatSbError(err: unknown, ctx: string): Error {
  // Supabase / PostgREST errors are plain objects: { message, details, hint, code }
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    const msg = (e.message as string) || (e.error_description as string) || JSON.stringify(e);
    const code = e.code ? ` [${e.code}]` : "";
    const hint = e.hint ? `\nhint: ${e.hint}` : "";
    const details = e.details ? `\ndetails: ${e.details}` : "";
    return new Error(`${ctx}${code}: ${msg}${hint}${details}`);
  }
  return new Error(`${ctx}: ${String(err)}`);
}

async function preflight(sb: ReturnType<typeof requireSupabase>): Promise<void> {
  // Verify each required table is reachable + writable so we fail loudly *before*
  // doing real work (and the user gets a clear message instead of [object Object]).
  for (const table of ["products", "collections", "collection_products"]) {
    const { error } = await sb.from(table).select("id").limit(1);
    if (error) {
      throw formatSbError(
        error,
        `Pre-flight check: cannot read "${table}". Did you run supabase/schema.sql in the SQL editor?`
      );
    }
  }
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    throw new Error(
      "You're not signed in. Sign in at /admin/login first — the importer writes through your auth session."
    );
  }
}

export async function importFromShopify(
  onProgress: (p: ImportProgress) => void
): Promise<ImportResult> {
  const sb = requireSupabase();

  onProgress({ step: "Pre-flight: checking Supabase tables and auth" });
  await preflight(sb);

  onProgress({ step: "Fetching products from Shopify" });
  const products = await fetchAllProducts();
  onProgress({ step: "Fetching collections from Shopify" });
  const collections = await fetchAllCollections();

  // Map: shopify product handle → set of collection handles for category hinting
  const productCollectionMap = new Map<string, Set<string>>();
  // Cache collection → product handle ordered list (for linking)
  const collectionProducts = new Map<string, string[]>();

  for (let i = 0; i < collections.length; i++) {
    const c = collections[i];
    onProgress({
      step: `Fetching products in collection ${i + 1}/${collections.length}`,
      detail: c.title,
    });
    const inCol = await fetchCollectionProducts(c.handle);
    const handles: string[] = [];
    for (const cp of inCol) {
      handles.push(cp.handle);
      const set = productCollectionMap.get(cp.handle) ?? new Set<string>();
      set.add(c.handle);
      set.add(c.title);
      productCollectionMap.set(cp.handle, set);
    }
    collectionProducts.set(c.handle, handles);
  }

  // ---- Insert products ----
  onProgress({ step: "Saving products to Supabase" });
  const productHandleToId = new Map<string, string>();
  let productCount = 0;

  for (const p of products) {
    const slug = slugify(p.handle);
    const text = stripHtml(p.body_html);
    const tagline = firstSentence(text, 160);
    const description = text.length > 220 ? text.slice(0, 220).trimEnd() + "…" : text;
    const long = text;
    const category = detectCategory(p, productCollectionMap);
    const price = Number(p.variants?.[0]?.price ?? 0) || 0;
    const heroImage = p.images?.[0]?.src ?? null;
    const imageUrls = (p.images ?? []).slice(0, 12).map((i) => i.src);

    const row = {
      slug,
      category,
      title_en: p.title,
      title_ar: p.title, // Arabic translations not provided by Shopify — admin can edit later
      tagline_en: tagline,
      tagline_ar: tagline,
      description_en: description,
      description_ar: description,
      long_en: long,
      long_ar: long,
      price,
      currency: "KWD",
      format: p.product_type || null,
      hero_image: heroImage,
      images: imageUrls,
      accent: category === "coaching" ? "coral" : "forest",
      outcomes: [],
      inclusions: [],
      is_published: !!p.published_at,
      position: productCount,
    };

    const { data, error } = await sb
      .from("products")
      .upsert(row, { onConflict: "slug" })
      .select("id, slug")
      .single();
    if (error) throw formatSbError(error, `Insert product "${p.handle}"`);
    productHandleToId.set(p.handle, data.id as string);
    productCount += 1;
  }

  // ---- Insert collections ----
  onProgress({ step: "Saving collections to Supabase" });
  const collectionHandleToId = new Map<string, string>();
  let colCount = 0;

  for (const c of collections) {
    const desc = stripHtml(c.body_html);
    const row = {
      slug: slugify(c.handle),
      title_en: c.title,
      title_ar: c.title,
      description_en: desc,
      description_ar: desc,
      cover_image: c.image?.src ?? null,
      accent: "forest",
      is_published: !!c.published_at,
      position: colCount,
    };
    const { data, error } = await sb
      .from("collections")
      .upsert(row, { onConflict: "slug" })
      .select("id, slug")
      .single();
    if (error) throw formatSbError(error, `Insert collection "${c.handle}"`);
    collectionHandleToId.set(c.handle, data.id as string);
    colCount += 1;
  }

  // ---- Link products to collections ----
  onProgress({ step: "Linking products to collections" });
  let linkCount = 0;
  for (const c of collections) {
    const collectionId = collectionHandleToId.get(c.handle);
    if (!collectionId) continue;
    const handles = collectionProducts.get(c.handle) ?? [];

    // wipe existing links for this collection so we get a clean re-import
    await sb.from("collection_products").delete().eq("collection_id", collectionId);

    const rows = handles
      .map((h, idx) => {
        const productId = productHandleToId.get(h);
        if (!productId) return null;
        return { collection_id: collectionId, product_id: productId, position: idx };
      })
      .filter((r): r is { collection_id: string; product_id: string; position: number } => !!r);

    if (rows.length) {
      const { error } = await sb.from("collection_products").insert(rows);
      if (error) throw formatSbError(error, `Linking products to collection "${c.handle}"`);
      linkCount += rows.length;
    }
  }

  return { productsImported: productCount, collectionsImported: colCount, links: linkCount };
}
