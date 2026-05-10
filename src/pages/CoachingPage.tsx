import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Check } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CollectionHero } from "@/components/product/CollectionHero";
import { Credentials } from "@/components/home/Credentials";
import { TestimonialsSlider } from "@/components/home/TestimonialsSlider";
import { ConversionFunnel } from "@/components/home/ConversionFunnel";
import { useProducts } from "@/lib/queries";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn, formatPrice } from "@/lib/utils";
import { useDirection } from "@/hooks/useDirection";

export function CoachingPage() {
  const { t, i18n } = useTranslation();
  const { isRtl } = useDirection();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const ref = useScrollReveal({ selector: "[data-program]", stagger: 0.12, y: 50 });
  const { data: products = [], isLoading } = useProducts("coaching");

  return (
    <>
      <SEO
        title={t("coaching.hero.title")}
        description={t("coaching.hero.lede")}
        path="/coaching"
        keywords="metabolic health program, insulin sensitivity reset, insulin resistance protocol, lower fasting insulin, lower A1C naturally, fasting glucose protocol, blood sugar stabilization, gut health insulin resistance, functional nutrition protocol, no medication for diabetes prevention, prediabetes plan, PCOS nutrition plan, pcos, مقاومه الأنسولين, علاج السكري من غير دوا, علاج السكري الكويت, دايت لعلاج السكري, تكيس المبايض"
      />

      <CollectionHero
        eyebrow={t("coaching.hero.eyebrow")}
        title={t("coaching.hero.title")}
        lede={t("coaching.hero.lede")}
        accent="coral"
      />

      <Section variant="default" pad="md">
        <Container>
          <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-6">
            {isLoading && <div className="text-sm text-ink-muted">Loading…</div>}
            {!isLoading && products.length === 0 && (
              <div className="rounded-3xl border border-dashed border-ink/15 p-12 text-center text-ink-muted">
                No coaching programs yet. Add some in the admin.
              </div>
            )}
            {products.map((p, i) => {
              const isDiy = p.category === "diy";
              const ctaHref = isDiy ? `/diy-plans/${p.slug}` : `/apply/${p.slug}`;
              const ctaText = isDiy
                ? t("coaching.apply")
                : t("apply.cta", {
                    product: p.title[lang],
                    defaultValue: `Apply for ${p.title[lang]}`,
                  });
              return (
                <article
                  key={p.id}
                  data-program
                  className={cn(
                    "group relative overflow-hidden rounded-3xl border border-ink/10 bg-surface-raised",
                    "transition-all duration-500 hover:shadow-elevation"
                  )}
                >
                  <div className="grid gap-8 p-8 md:grid-cols-12 md:p-12">
                    <div className="md:col-span-4">
                      <Link
                        to={`/coaching/${p.slug}`}
                        className="text-eyebrow uppercase font-mono text-coral-500 mb-3 block"
                      >
                        {String(i + 1).padStart(2, "0")} · {p.format}
                      </Link>
                      <Link to={`/coaching/${p.slug}`}>
                        <h3 className="display-serif text-3xl tracking-tight text-balance">
                          {p.title[lang]}
                        </h3>
                      </Link>
                      {p.badge && (
                        <span className="mt-3 inline-flex rounded-full bg-coral-100 text-coral-700 px-3 py-1 text-eyebrow uppercase">
                          {p.badge[lang]}
                        </span>
                      )}
                      <p className="mt-4 text-sm text-ink-muted leading-relaxed">{p.tagline[lang]}</p>
                    </div>

                    <div className="md:col-span-5 grid gap-5 sm:grid-cols-2">
                      <div>
                        <div className="text-eyebrow uppercase text-forest-700 mb-2">
                          {t("common.duration")}
                        </div>
                        <div className="text-base font-medium">{p.duration?.[lang]}</div>
                      </div>
                      <div>
                        <div className="text-eyebrow uppercase text-forest-700 mb-2">
                          {t("common.investment")}
                        </div>
                        <div className="text-base font-semibold text-forest-700">
                          {formatPrice(p.price, p.currency)}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="text-eyebrow uppercase text-forest-700 mb-2">
                          {t("common.outcomes")}
                        </div>
                        <ul className="space-y-2">
                          {p.outcomes.slice(0, 3).map((o, idx) => (
                            <li key={idx} className="flex gap-2 text-sm">
                              <Check className="h-4 w-4 flex-shrink-0 text-coral-500" />
                              <span>{o[lang]}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="md:col-span-3 flex md:items-end md:justify-end">
                      <Link
                        to={ctaHref}
                        className="inline-flex items-center gap-3 rounded-full border border-ink/15 px-5 py-3 text-sm font-medium transition-all duration-500 group-hover:bg-ink group-hover:text-bone-50 group-hover:border-ink"
                      >
                        {ctaText}
                        <ArrowUpRight className={cn("h-4 w-4", isRtl && "flip-rtl")} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </Section>

      <Credentials />
      <TestimonialsSlider />
      <ConversionFunnel />
    </>
  );
}
