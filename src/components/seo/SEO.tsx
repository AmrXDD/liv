import { Helmet } from "react-helmet-async";
import { useDirection } from "@/hooks/useDirection";
import { buildCanonical, type SeoMeta } from "@/lib/seo";

const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://livfunctional.com";
const DEFAULT_OG_IMAGE = `${SITE_URL.replace(/\/$/, "")}/liv-logo.png`;
const TWITTER_HANDLE = "@livfunctional";

export function SEO({ title, description, path = "/", image, type = "website", noindex, schema, keywords }: SeoMeta) {
  const { lang } = useDirection();
  const isAr = lang.startsWith("ar");
  const htmlLang = isAr ? "ar" : "en";
  const url = buildCanonical(path);
  const fullTitle = title.includes("Liv Functional") ? title : `${title} · Liv Functional`;
  const ogImage = image ?? DEFAULT_OG_IMAGE;
  const ogLocale = isAr ? "ar_KW" : "en_US";
  const ogLocaleAlt = isAr ? "en_US" : "ar_KW";
  const enUrl = buildCanonical(path);
  const arUrl = buildCanonical(path);

  return (
    <Helmet>
      <html lang={htmlLang} dir={isAr ? "rtl" : "ltr"} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      <meta
        name="robots"
        content={noindex ? "noindex,nofollow" : "index,follow,max-image-preview:large,max-snippet:-1"}
      />

      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="ar" href={arUrl} />
      <link rel="alternate" hrefLang="x-default" href={enUrl} />

      <meta property="og:site_name" content="Liv Functional" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:locale:alternate" content={ogLocaleAlt} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
}
