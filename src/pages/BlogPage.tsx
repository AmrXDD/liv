import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CollectionHero } from "@/components/product/CollectionHero";
import { posts as fallbackPosts } from "@/data/posts";
import { useBlogPosts } from "@/lib/queries";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn, formatDate } from "@/lib/utils";
import { useDirection } from "@/hooks/useDirection";
import { useCart } from "@/lib/cart";

const CATS = ["all", "hormones", "gut", "metabolic", "mindset", "habits", "energy"] as const;

export function BlogPage() {
  const { t, i18n } = useTranslation();
  const { isRtl } = useDirection();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const [active, setActive] = useState<(typeof CATS)[number]>("all");
  const ref = useScrollReveal({ selector: "[data-post]", stagger: 0.1, y: 40 });
  const { data: dbPosts = [] } = useBlogPosts();
  const { close: closeCart } = useCart();

  // Defensive: cart drawer is global state above <Routes>. If a mistap on the
  // cart icon (which sits next to the mobile menu trigger in <Header>) opens
  // it during navigation, this kills the symptom for /blog and /blog/<slug>.
  useEffect(() => {
    closeCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const rawPosts = dbPosts.length > 0 ? dbPosts : fallbackPosts;
  // Drop posts with empty/whitespace slugs — they'd link to /blog/ and bounce.
  const posts = useMemo(() => rawPosts.filter((p) => p.slug && p.slug.trim()), [rawPosts]);

  const filtered = useMemo(() => {
    if (active === "all") return posts;
    return posts.filter((p) => p.category === active);
  }, [active, posts]);

  const featured = posts.find((p) => p.featured) ?? posts[0];

  return (
    <>
      <SEO
        title={t("blog.hero.title")}
        description={t("blog.hero.lede")}
        path="/blog"
      />

      <CollectionHero
        eyebrow={t("blog.hero.eyebrow")}
        title={t("blog.hero.title")}
        lede={t("blog.hero.lede")}
        accent="forest"
      />

      {featured && (
        <Section variant="default" pad="md">
          <Container>
            <Link
              to={`/blog/${featured.slug}`}
              className="group grid gap-10 overflow-hidden rounded-3xl border border-ink/10 bg-surface-raised p-8 md:grid-cols-12 md:p-12 hover:shadow-elevation transition-shadow duration-500"
            >
              <div className="md:col-span-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-forest-200 to-bone-100 aspect-[4/3]">
                {featured.heroImage ? (
                  <img
                    src={featured.heroImage}
                    alt={featured.title[lang]}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 grid place-items-center display-serif text-[14rem] font-bold leading-none text-forest-700/30 transition-transform duration-700 group-hover:scale-110">
                      {featured.title[lang][0]}
                    </div>
                    <div className="absolute inset-0 bg-grain opacity-30 mix-blend-multiply" />
                  </>
                )}
              </div>
              <div className="md:col-span-6 flex flex-col justify-center">
                <div className="text-eyebrow uppercase text-coral-600 mb-3">Featured</div>
                <h2 className="display-serif text-display-md tracking-tightest text-balance">
                  {featured.title[lang]}
                </h2>
                <p className="mt-5 max-w-md text-ink-muted leading-relaxed">
                  {featured.excerpt[lang]}
                </p>
                <div className="mt-8 flex items-center gap-3 text-sm text-ink-muted">
                  <span>{formatDate(featured.publishedAt, lang === "ar" ? "ar-SA" : "en-US")}</span>
                  <span>·</span>
                  <span>{featured.readingMinutes} {t("blog.minRead")}</span>
                  <ArrowUpRight className={cn("h-4 w-4 ms-auto transition-transform duration-300 group-hover:translate-x-1", isRtl && "flip-rtl")} />
                </div>
              </div>
            </Link>
          </Container>
        </Section>
      )}

      <Section variant="default" pad="md">
        <Container>
          <div className="mb-10 flex flex-wrap items-center gap-2">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  active === c
                    ? "bg-ink text-bone-50 border-ink"
                    : "border-ink/15 hover:border-ink"
                )}
              >
                {t(`blog.categories.${c}` as never, { defaultValue: c })}
              </button>
            ))}
          </div>

          <div ref={ref as React.RefObject<HTMLDivElement>} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Link
                key={p.id}
                to={`/blog/${p.slug}`}
                data-post
                className="group block overflow-hidden rounded-3xl border border-ink/10 bg-surface-raised transition-all duration-500 hover:-translate-y-1 hover:shadow-elevation"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-bone-100 to-forest-100">
                  {p.heroImage ? (
                    <img
                      src={p.heroImage}
                      alt={p.title[lang]}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center display-serif text-[8rem] font-bold leading-none text-forest-700/30 transition-transform duration-700 group-hover:scale-110">
                      {p.title[lang][0]}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-eyebrow uppercase text-ink-muted">
                    <span className="rounded-full bg-coral-100 text-coral-700 px-3 py-1">
                      {t(`blog.categories.${p.category}` as never, { defaultValue: p.category })}
                    </span>
                    <span>{p.readingMinutes} {t("blog.minRead")}</span>
                  </div>
                  <h3 className="mt-4 display-serif text-xl tracking-tight">{p.title[lang]}</h3>
                  <p className="mt-3 line-clamp-2 text-sm text-ink-muted">{p.excerpt[lang]}</p>
                </div>
              </Link>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-ink-muted py-20">{t("blog.empty")}</p>
          )}
        </Container>
      </Section>
    </>
  );
}
