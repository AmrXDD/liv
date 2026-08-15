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
  format?: "PDF" | "1:1" | "Group" | "Hybrid" | "Physical" | string;
  badge?: LocalizedString;
  heroImage?: string;
  images?: string[];
  accent?: Accent;
  isPublished?: boolean;
  position?: number;
  downloadUrl?: string;
  seoKeywords?: string;
  // ---- Physical-product attributes (used when format === "Physical") ----
  sku?: string;
  weightGrams?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  stock?: number;
  requiresShipping?: boolean;
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
  | "richText"
  | "image"
  | "button"
  | "productGrid"
  | "coachingGrid"
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

/** Rich-text (HTML) block — produced by the Tiptap WYSIWYG editor. */
export interface RichTextBlock extends BaseBlock {
  type: "richText";
  html: LocalizedString;
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

export interface CoachingGridBlock extends BaseBlock {
  type: "coachingGrid";
  columns?: 2 | 3 | 4;
  heading?: LocalizedString;
  /** Optional override — when empty, renders all published coaching products. */
  productIds?: string[];
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
}

export type Block =
  | HeadingBlock
  | TextBlock
  | RichTextBlock
  | ImageBlock
  | ButtonBlock
  | ProductGridBlock
  | CoachingGridBlock
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
  phone: string;
  subject?: string;
  message: string;
  locale: Locale;
}

export interface NewsletterPayload {
  email: string;
  locale: Locale;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
}

export interface OrderItem {
  product_id: string;
  slug: string;
  category: ProductCategory | string;
  title_en?: string;
  title_ar?: string;
  price: number;
  currency: string;
  quantity: number;
  hero_image?: string | null;
  is_physical?: boolean;
}

export interface Order {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  items: OrderItem[];
  subtotal: number;
  total: number;
  currency: string;
  notes?: string | null;
  status: "pending" | "paid" | "fulfilled" | "cancelled" | "refunded" | string;
  payment_ref?: string | null;
  stripe_payment_intent?: string | null;
  stripe_session_id?: string | null;
  paid_at?: string | null;
  locale: Locale;
  shipping_address?: ShippingAddress | null;
  shipping_line1?: string | null;
  shipping_line2?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_postal_code?: string | null;
  shipping_country?: string | null;
  has_physical?: boolean;
  created_at: string;
  updated_at?: string;
}

