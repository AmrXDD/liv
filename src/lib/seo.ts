export interface SeoMeta {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "product";
  noindex?: boolean;
  schema?: Record<string, unknown>;
  keywords?: string;
}

const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://www.livfunctional.com";

export function buildCanonical(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function buildLangUrl(path = "/", lang: "en" | "ar" = "en") {
  const base = new URL(path, SITE_URL);
  if (lang === "ar") base.searchParams.set("lang", "ar");
  return base.toString();
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Liv Functional",
    url: SITE_URL,
    logo: new URL("/liv-logo.png", SITE_URL).toString(),
    sameAs: [
      "https://instagram.com/livfunctional",
      "https://www.linkedin.com/company/liv-functional",
      "https://tiktok.com/@livfunctional",
      "https://www.threads.net/@livfunctional",
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Liv Functional",
    url: SITE_URL,
    inLanguage: ["en", "ar"],
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL.replace(/\/$/, "")}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  author: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    image: opts.image,
    datePublished: opts.datePublished,
    author: { "@type": "Person", name: opts.author },
    mainEntityOfPage: opts.url,
  };
}

export function productSchema(opts: {
  name: string;
  description: string;
  image?: string;
  price: number;
  currency?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    description: opts.description,
    image: opts.image,
    offers: {
      "@type": "Offer",
      price: opts.price,
      priceCurrency: opts.currency ?? "USD",
      url: opts.url,
      availability: "https://schema.org/InStock",
    },
  };
}
