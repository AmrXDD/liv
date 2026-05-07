export type Locale = "en" | "ar";

export interface LocalizedString {
  en: string;
  ar: string;
}

export type ProductCategory = "diy" | "coaching" | "consultation" | "physical";
export type Accent = "forest" | "coral" | "bone";

export interface Product {
  id: string;
  slug: string;
  category: ProductCategory;
  title: LocalizedString;
  tagline: LocalizedString;
  description: LocalizedString;
  longDescription?: LocalizedString;
  price: number;
  currency: string;
  duration?: LocalizedString;
  outcomes: LocalizedString[];
  inclusions: LocalizedString[];
  format?: "PDF" | "1:1" | "Group" | "Hybrid" | string;
  badge?: LocalizedString;
  heroImage?: string;
  images?: string[];
  accent?: Accent;
  isPublished?: boolean;
  position?: number;
  downloadUrl?: string;
  seoKeywords?: string;
}

export interface Collection {
  id: string;
  slug: string;
  title: LocalizedString;
  description?: LocalizedString;
  coverImage?: string;
  accent?: Accent;
  isPublished: boolean;
  position: number;
  products?: Product[];
}

// ---- Page builder blocks ----
export type BlockType =
  | "heading"
  | "text"
  | "image"
  | "button"
  | "productGrid"
  | "divider";

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  level: 1 | 2 | 3;
  text: LocalizedString;
  align?: "start" | "center";
}

export interface TextBlock extends BaseBlock {
  type: "text";
  text: LocalizedString;
  align?: "start" | "center";
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  url: string;
  alt?: string;
  rounded?: boolean;
  caption?: LocalizedString;
}

export interface ButtonBlock extends BaseBlock {
  type: "button";
  label: LocalizedString;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  align?: "start" | "center";
}

export interface ProductGridBlock extends BaseBlock {
  type: "productGrid";
  productIds: string[];
  columns?: 2 | 3 | 4;
  heading?: LocalizedString;
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
}

export type Block =
  | HeadingBlock
  | TextBlock
  | ImageBlock
  | ButtonBlock
  | ProductGridBlock
  | DividerBlock;

export interface Page {
  id: string;
  slug: string;
  title: LocalizedString;
  description?: LocalizedString;
  blocks: Block[];
  isPublished: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  location?: string;
  quote: LocalizedString;
  result?: LocalizedString;
  avatar?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString;
  category: string;
  author: string;
  publishedAt: string;
  readingMinutes: number;
  heroImage?: string;
  featured?: boolean;
}

export interface BookingPayload {
  name: string;
  email: string;
  phone?: string;
  date: string;
  time: string;
  topic?: string;
  message?: string;
  locale: Locale;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
  locale: Locale;
}

export interface NewsletterPayload {
  email: string;
  locale: Locale;
}
