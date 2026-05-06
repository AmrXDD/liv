import type {
  Accent,
  Block,
  BlogPost,
  Collection,
  LocalizedString,
  Page,
  Product,
  ProductCategory,
} from "@/types";

type ProductRow = {
  id: string;
  slug: string;
  category: ProductCategory;
  title_en: string;
  title_ar: string;
  tagline_en: string | null;
  tagline_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  long_en: string | null;
  long_ar: string | null;
  price: number | string;
  currency: string;
  duration_en: string | null;
  duration_ar: string | null;
  format: string | null;
  badge_en: string | null;
  badge_ar: string | null;
  hero_image: string | null;
  images: string[] | null;
  accent: string | null;
  outcomes: LocalizedString[] | null;
  inclusions: LocalizedString[] | null;
  is_published: boolean;
  position: number;
};

const ls = (en: string | null, ar: string | null): LocalizedString | undefined =>
  en || ar ? { en: en ?? "", ar: ar ?? "" } : undefined;

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    title: { en: row.title_en, ar: row.title_ar },
    tagline: ls(row.tagline_en, row.tagline_ar) ?? { en: "", ar: "" },
    description: ls(row.description_en, row.description_ar) ?? { en: "", ar: "" },
    longDescription: ls(row.long_en, row.long_ar),
    price: Number(row.price),
    currency: row.currency,
    duration: ls(row.duration_en, row.duration_ar),
    outcomes: row.outcomes ?? [],
    inclusions: row.inclusions ?? [],
    format: row.format ?? undefined,
    badge: ls(row.badge_en, row.badge_ar),
    heroImage: row.hero_image ?? undefined,
    images: row.images ?? [],
    accent: (row.accent as Accent) ?? "forest",
    isPublished: row.is_published,
    position: row.position,
  };
}

export function productToRow(p: Partial<Product>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (p.slug !== undefined) out.slug = p.slug;
  if (p.category !== undefined) out.category = p.category;
  if (p.title) {
    out.title_en = p.title.en;
    out.title_ar = p.title.ar;
  }
  if (p.tagline) {
    out.tagline_en = p.tagline.en;
    out.tagline_ar = p.tagline.ar;
  }
  if (p.description) {
    out.description_en = p.description.en;
    out.description_ar = p.description.ar;
  }
  if (p.longDescription) {
    out.long_en = p.longDescription.en;
    out.long_ar = p.longDescription.ar;
  }
  if (p.price !== undefined) out.price = p.price;
  if (p.currency !== undefined) out.currency = p.currency;
  if (p.duration) {
    out.duration_en = p.duration.en;
    out.duration_ar = p.duration.ar;
  }
  if (p.format !== undefined) out.format = p.format;
  if (p.badge) {
    out.badge_en = p.badge.en;
    out.badge_ar = p.badge.ar;
  }
  if (p.heroImage !== undefined) out.hero_image = p.heroImage;
  if (p.images !== undefined) out.images = p.images;
  if (p.accent !== undefined) out.accent = p.accent;
  if (p.outcomes !== undefined) out.outcomes = p.outcomes;
  if (p.inclusions !== undefined) out.inclusions = p.inclusions;
  if (p.isPublished !== undefined) out.is_published = p.isPublished;
  if (p.position !== undefined) out.position = p.position;
  return out;
}

type CollectionRow = {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  cover_image: string | null;
  accent: string | null;
  is_published: boolean;
  position: number;
};

export function mapCollection(row: CollectionRow): Collection {
  return {
    id: row.id,
    slug: row.slug,
    title: { en: row.title_en, ar: row.title_ar },
    description: ls(row.description_en, row.description_ar),
    coverImage: row.cover_image ?? undefined,
    accent: (row.accent as Accent) ?? "forest",
    isPublished: row.is_published,
    position: row.position,
  };
}

export function collectionToRow(c: Partial<Collection>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (c.slug !== undefined) out.slug = c.slug;
  if (c.title) {
    out.title_en = c.title.en;
    out.title_ar = c.title.ar;
  }
  if (c.description) {
    out.description_en = c.description.en;
    out.description_ar = c.description.ar;
  }
  if (c.coverImage !== undefined) out.cover_image = c.coverImage;
  if (c.accent !== undefined) out.accent = c.accent;
  if (c.isPublished !== undefined) out.is_published = c.isPublished;
  if (c.position !== undefined) out.position = c.position;
  return out;
}

type PageRow = {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  blocks: Block[] | null;
  is_published: boolean;
};

export function mapPage(row: PageRow): Page {
  return {
    id: row.id,
    slug: row.slug,
    title: { en: row.title_en, ar: row.title_ar },
    description: ls(row.description_en, row.description_ar),
    blocks: row.blocks ?? [],
    isPublished: row.is_published,
  };
}

type BlogPostRow = {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  excerpt_en: string | null;
  excerpt_ar: string | null;
  content_en: string | null;
  content_ar: string | null;
  category: string;
  author: string;
  hero_image: string | null;
  reading_minutes: number;
  is_featured: boolean;
  is_published: boolean;
  published_at: string;
};

export function mapBlogPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: { en: row.title_en, ar: row.title_ar },
    excerpt: { en: row.excerpt_en ?? "", ar: row.excerpt_ar ?? "" },
    content: { en: row.content_en ?? "", ar: row.content_ar ?? "" },
    category: row.category,
    author: row.author,
    publishedAt: row.published_at,
    readingMinutes: row.reading_minutes,
    heroImage: row.hero_image ?? undefined,
    featured: row.is_featured,
  };
}

export function blogPostToRow(p: Partial<BlogPost> & { isPublished?: boolean }): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (p.slug !== undefined) out.slug = p.slug;
  if (p.title) {
    out.title_en = p.title.en;
    out.title_ar = p.title.ar;
  }
  if (p.excerpt) {
    out.excerpt_en = p.excerpt.en;
    out.excerpt_ar = p.excerpt.ar;
  }
  if (p.content) {
    out.content_en = p.content.en;
    out.content_ar = p.content.ar;
  }
  if (p.category !== undefined) out.category = p.category;
  if (p.author !== undefined) out.author = p.author;
  if (p.heroImage !== undefined) out.hero_image = p.heroImage;
  if (p.readingMinutes !== undefined) out.reading_minutes = p.readingMinutes;
  if (p.featured !== undefined) out.is_featured = p.featured;
  if (p.isPublished !== undefined) out.is_published = p.isPublished;
  if (p.publishedAt !== undefined) out.published_at = p.publishedAt;
  return out;
}

export function pageToRow(p: Partial<Page>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (p.slug !== undefined) out.slug = p.slug;
  if (p.title) {
    out.title_en = p.title.en;
    out.title_ar = p.title.ar;
  }
  if (p.description) {
    out.description_en = p.description.en;
    out.description_ar = p.description.ar;
  }
  if (p.blocks !== undefined) out.blocks = p.blocks;
  if (p.isPublished !== undefined) out.is_published = p.isPublished;
  return out;
}
