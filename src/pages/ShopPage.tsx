import { Link } from "react-router-dom";
import { ArrowDown, Globe, PenLine, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CollectionHero } from "@/components/product/CollectionHero";
import { ShopHeroShowcase } from "@/components/product/ShopHeroShowcase";
import { ProductCard } from "@/components/product/ProductCard";
import { Credentials } from "@/components/home/Credentials";
import { TestimonialsSlider } from "@/components/home/TestimonialsSlider";
import { useProducts } from "@/lib/queries";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { smoothScrollTo } from "@/hooks/useLenis";

const trust = [
  { key: "author", icon: PenLine },
  { key: "checkout", icon: ShieldCheck },
  { key: "shipping", icon: Globe },
] as const;

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
        wideSide
        side={<ShopHeroShowcase products={products} isLoading={isLoading} />}
        actions={
          <div className="flex flex-col gap-8">
            <a
              href="#shop-collection"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo("#shop-collection", -40);
              }}
              className="btn-primary w-fit"
            >
              {t("shop.hero.cta")}
              <ArrowDown className="h-4 w-4" />
            </a>
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-muted">
              {trust.map(({ key, icon: Icon }) => (
                <li key={key} className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-bone-400/60 bg-surface-raised/70 text-forest-700">
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </span>
                  {t(`shop.hero.trust.${key}`)}
                </li>
              ))}
            </ul>
          </div>
        }
      />

      <Section id="shop-collection" variant="default" pad="md">
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
