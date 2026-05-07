import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { posts } from "@/data/posts";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useDirection } from "@/hooks/useDirection";
import { ArrowUpRight } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export function BlogPreview() {
  const { t, i18n } = useTranslation();
  const { isRtl } = useDirection();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const ref = useScrollReveal({ selector: "[data-post]", stagger: 0.12, y: 50 });

  const featured = posts.slice(0, 3);

  return (
    <Section variant="sunken" pad="lg">
      <Container>
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="eyebrow mb-5">{t("blogPreview.eyebrow")}</div>
            <h2 className="display-serif text-display-lg tracking-tightest text-balance">
              {t("blogPreview.title")}
            </h2>
          </div>
          <Button to="/blog" variant="ghost" arrow>
            {t("blogPreview.viewAll")}
          </Button>
        </div>

        <div ref={ref as React.RefObject<HTMLDivElement>} className="grid gap-8 md:grid-cols-3">
          {featured.map((p, i) => (
            <article
              key={p.id}
              data-post
              className={cn(
                "group relative overflow-hidden rounded-3xl bg-surface-raised border border-ink/10",
                "transition-all duration-500 hover:-translate-y-1 hover:shadow-elevation",
                i === 0 && "md:col-span-2 md:row-span-2"
              )}
            >
              <Link to={`/blog/${p.slug}`} className="block h-full">
                <div
                  className={cn(
                    "relative overflow-hidden bg-gradient-to-br from-forest-200 to-bone-100",
                    i === 0 ? "aspect-[16/10]" : "aspect-[4/3]"
                  )}
                >
                  <div className="absolute inset-0 bg-grain opacity-30 mix-blend-multiply" />
                  <div
                    className={cn(
                      "absolute inset-0 grid place-items-center display-serif font-bold leading-none text-forest-700/30 transition-transform duration-700 group-hover:scale-110",
                      i === 0 ? "text-[12rem]" : "text-[7rem]"
                    )}
                  >
                    {p.title[lang][0]}
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 text-eyebrow uppercase text-ink-muted">
                    <span className="rounded-full bg-coral-100 text-coral-700 px-3 py-1 font-semibold">
                      {t(`blog.categories.${p.category}` as never, { defaultValue: p.category })}
                    </span>
                    <span>{formatDate(p.publishedAt, lang === "ar" ? "ar-SA" : "en-US")}</span>
                  </div>
                  <h3
                    className={cn(
                      "mt-4 display-serif tracking-tight text-balance",
                      i === 0 ? "text-3xl md:text-4xl" : "text-xl"
                    )}
                  >
                    {p.title[lang]}
                  </h3>
                  <p className="mt-3 line-clamp-2 text-sm text-ink-muted leading-relaxed">
                    {p.excerpt[lang]}
                  </p>
                  <div className="mt-5 flex items-center justify-between text-xs text-ink-muted">
                    <span>{p.readingMinutes} {t("blog.minRead")}</span>
                    <ArrowUpRight
                      className={cn("h-4 w-4 transition-transform duration-300 group-hover:translate-x-1", isRtl && "flip-rtl")}
                    />
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
