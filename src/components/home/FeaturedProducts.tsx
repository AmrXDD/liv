import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { useFeaturedProducts } from "@/lib/queries";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function FeaturedProducts() {
  const { t } = useTranslation();
  const ref = useScrollReveal({ selector: "[data-featured]", stagger: 0.12, y: 50 });
  const { data: featured = [] } = useFeaturedProducts(3);

  if (featured.length === 0) return null;

  return (
    <Section variant="default" pad="lg">
      <Container>
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="eyebrow mb-5">{t("featuredProducts.eyebrow")}</div>
            <h2 className="display-serif text-display-lg tracking-tightest max-w-2xl text-balance">
              {t("featuredProducts.title")}
            </h2>
            <p className="mt-4 max-w-md text-ink-muted">{t("featuredProducts.lede")}</p>
          </div>
          <Button to="/diy-plans" variant="ghost" arrow>
            {t("featuredProducts.viewAll")}
          </Button>
        </div>

        <div ref={ref as React.RefObject<HTMLDivElement>} className="grid gap-8 md:grid-cols-3">
          {featured.map((p) => (
            <div key={p.id} data-featured>
              <Link to={`/diy-plans/${p.slug}`}>
                <ProductCard product={p} />
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
