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

export function ShopPage() {
  const { t } = useTranslation();
  const ref = useScrollReveal({ selector: "[data-prod]", stagger: 0.1, y: 50 });
  const { data: products = [], isLoading } = useProducts("physical");

  return (
    <>
      <SEO title={t("shop.hero.title")} description={t("shop.hero.lede")} path="/shop" />

      <CollectionHero
        eyebrow={t("shop.hero.eyebrow")}
        title={t("shop.hero.title")}
        lede={t("shop.hero.lede")}
        accent="coral"
      />

      <Section variant="default" pad="md">
        <Container>
          <div ref={ref as React.RefObject<HTMLDivElement>} className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {isLoading && <div className="col-span-full text-sm text-ink-muted">Loading…</div>}
            {!isLoading && products.length === 0 && (
              <div className="col-span-full rounded-3xl border border-dashed border-ink/15 p-12 text-center text-ink-muted">
                Nothing in the shop yet — check back soon.
              </div>
            )}
            {products.map((p) => (
              <div key={p.id} data-prod>
                <Link to={`/shop/${p.slug}`}>
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
