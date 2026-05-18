import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CollectionHero } from "@/components/product/CollectionHero";
import { ProductCard } from "@/components/product/ProductCard";
import { Credentials } from "@/components/home/Credentials";
import { TestimonialsSlider } from "@/components/home/TestimonialsSlider";
import { useProducts } from "@/lib/queries";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

const FILTERS = ["all", "hormones", "gut", "metabolic", "energy"] as const;

const filterMap: Record<(typeof FILTERS)[number], (slug: string) => boolean> = {
  all: () => true,
  hormones: (slug) => slug.includes("hormone"),
  gut: (slug) => slug.includes("gut"),
  metabolic: (slug) => slug.includes("metabolic"),
  energy: (slug) => slug.includes("energy"),
};

export function DIYPlansPage() {
  const { t } = useTranslation();
  const [active, setActive] = useState<(typeof FILTERS)[number]>("all");
  const ref = useScrollReveal({ selector: "[data-prod]", stagger: 0.1, y: 50 });
  const { data: products = [], isLoading } = useProducts("diy");

  const filtered = useMemo(
    () => products.filter((p) => filterMap[active](p.slug)),
    [active, products]
  );

  return (
    <>
      <SEO
        title={t("diy.hero.title")}
        description={t("diy.hero.lede")}
        path="/diy-plans"
        keywords="10 day reset plan, insulin sensitivity reset, insulin resistance protocol, lower fasting insulin, lower A1C naturally, fasting glucose protocol, blood sugar stabilization, prediabetes plan, PCOS nutrition plan, pcos, no medication for diabetes prevention, metabolic health program, gut health insulin resistance, functional nutrition protocol, مقاومه الأنسولين, علاج السكري من غير دوا, علاج السكري الكويت, دايت لعلاج السكري, تكيس المبايض"
      />

      <CollectionHero
        eyebrow={t("diy.hero.eyebrow")}
        title={t("diy.hero.title")}
        lede={t("diy.hero.lede")}
        accent="forest"
      />

      <Section variant="default" pad="md">
        <Container>
          <div className="flex flex-wrap items-center gap-3">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={cn(
                  "rounded-full border px-5 py-2.5 text-sm font-medium transition-all",
                  active === f
                    ? "bg-ink text-bone-50 border-ink"
                    : "bg-transparent text-ink border-ink/15 hover:border-ink"
                )}
              >
                {t(`diy.filters.${f}`)}
              </button>
            ))}
          </div>

          <div ref={ref as React.RefObject<HTMLDivElement>} className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {isLoading && (
              <div className="col-span-full text-sm text-ink-muted">Loading…</div>
            )}
            {!isLoading && filtered.length === 0 && (
              <div className="col-span-full rounded-3xl border border-dashed border-ink/15 p-12 text-center text-ink-muted">
                No plans yet. Add some in the admin.
              </div>
            )}
            {filtered.map((p) => (
              <div key={p.id} data-prod>
                <Link to={`/diy-plans/${p.slug}`}>
                  <ProductCard product={p} />
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Credentials />
      <TestimonialsSlider />
    </>
  );
}
