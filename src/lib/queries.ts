import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "./supabase";
import { mapBlogPost, mapCollection, mapPage, mapProduct } from "./mappers";
import type { BlogPost, Collection, Page, Product, ProductCategory } from "@/types";

const PRODUCT_COLS =
  "id,slug,category,title_en,title_ar,tagline_en,tagline_ar,description_en,description_ar,long_en,long_ar,price,currency,duration_en,duration_ar,format,badge_en,badge_ar,hero_image,images,accent,outcomes,inclusions,is_published,position";

const COLLECTION_COLS =
  "id,slug,title_en,title_ar,description_en,description_ar,cover_image,accent,is_published,position";

const PAGE_COLS =
  "id,slug,title_en,title_ar,description_en,description_ar,blocks,is_published";

const BLOG_COLS =
  "id,slug,title_en,title_ar,excerpt_en,excerpt_ar,content_en,content_ar,category,author,hero_image,reading_minutes,is_featured,is_published,published_at";

// ---------------- PRODUCTS ----------------
async function fetchProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("products")
    .select(PRODUCT_COLS)
    .eq("category", category)
    .eq("is_published", true)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("products")
    .select(PRODUCT_COLS)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data) : null;
}

async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("products")
    .select(PRODUCT_COLS)
    .in("id", ids)
    .eq("is_published", true);
  if (error) throw error;
  const products = (data ?? []).map(mapProduct);
  // preserve incoming order
  const byId = new Map(products.map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as Product[];
}

export function useProducts(category: ProductCategory) {
  return useQuery({
    queryKey: ["products", category],
    queryFn: () => fetchProductsByCategory(category),
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: !!slug,
  });
}

export function useProductsByIds(ids: string[]) {
  return useQuery({
    queryKey: ["products-by-ids", ids.join(",")],
    queryFn: () => fetchProductsByIds(ids),
    enabled: ids.length > 0,
  });
}

// Featured: first 3 published DIY products
export function useFeaturedProducts(limit = 3) {
  return useQuery({
    queryKey: ["featured-products", limit],
    queryFn: async () => {
      const sb = getSupabase();
      if (!sb) return [] as Product[];
      const { data, error } = await sb
        .from("products")
        .select(PRODUCT_COLS)
        .eq("category", "diy")
        .eq("is_published", true)
        .order("position", { ascending: true })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map(mapProduct);
    },
  });
}

// ---------------- COLLECTIONS ----------------
export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: async (): Promise<Collection[]> => {
      const sb = getSupabase();
      if (!sb) return [];
      const { data, error } = await sb
        .from("collections")
        .select(COLLECTION_COLS)
        .eq("is_published", true)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapCollection);
    },
  });
}

export function useCollection(slug: string | undefined) {
  return useQuery({
    queryKey: ["collection", slug],
    queryFn: async (): Promise<Collection | null> => {
      const sb = getSupabase();
      if (!sb || !slug) return null;
      const { data, error } = await sb
        .from("collections")
        .select(`${COLLECTION_COLS}, collection_products(position, products(${PRODUCT_COLS}))`)
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const collection = mapCollection(data as never);
      const raw = data as unknown as {
        collection_products?: Array<{ position: number; products: unknown }>;
      };
      const links = (raw.collection_products ?? []).sort((a, b) => a.position - b.position);
      collection.products = links.map((l) => mapProduct(l.products as never));
      return collection;
    },
    enabled: !!slug,
  });
}

// ---------------- PAGES ----------------
export function usePage(slug: string | undefined) {
  return useQuery({
    queryKey: ["page", slug],
    queryFn: async (): Promise<Page | null> => {
      const sb = getSupabase();
      if (!sb || !slug) return null;
      const { data, error } = await sb
        .from("pages")
        .select(PAGE_COLS)
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data ? mapPage(data) : null;
    },
    enabled: !!slug,
  });
}

// ---------------- ACCREDITATIONS ----------------
export interface Accreditation {
  id: string;
  name_en: string;
  name_ar: string;
  issuer_en: string | null;
  issuer_ar: string | null;
  image_url: string | null;
  link_url: string | null;
  position: number;
  is_published: boolean;
}

export function useAccreditations(opts?: { publishedOnly?: boolean }) {
  const publishedOnly = opts?.publishedOnly ?? true;
  return useQuery({
    queryKey: ["accreditations", publishedOnly],
    queryFn: async (): Promise<Accreditation[]> => {
      const sb = getSupabase();
      if (!sb) return [];
      let q = sb
        .from("accreditations")
        .select("id,name_en,name_ar,issuer_en,issuer_ar,image_url,link_url,position,is_published")
        .order("position", { ascending: true });
      if (publishedOnly) q = q.eq("is_published", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Accreditation[];
    },
  });
}

// ---------------- BLOG ----------------
export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts"],
    queryFn: async (): Promise<BlogPost[]> => {
      const sb = getSupabase();
      if (!sb) return [];
      const { data, error } = await sb
        .from("blog_posts")
        .select(BLOG_COLS)
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapBlogPost);
    },
  });
}

export function useBlogPost(slug: string | undefined) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async (): Promise<BlogPost | null> => {
      const sb = getSupabase();
      if (!sb || !slug) return null;
      const { data, error } = await sb
        .from("blog_posts")
        .select(BLOG_COLS)
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data ? mapBlogPost(data) : null;
    },
    enabled: !!slug,
  });
}

export const QUERY_KEYS = {
  products: (category: ProductCategory) => ["products", category] as const,
  product: (slug: string) => ["product", slug] as const,
  featured: ["featured-products"] as const,
  collections: ["collections"] as const,
  collection: (slug: string) => ["collection", slug] as const,
  page: (slug: string) => ["page", slug] as const,
};
