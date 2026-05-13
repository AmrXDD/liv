import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CollectionHero } from "@/components/product/CollectionHero";
import { ProductCard } from "@/components/product/ProductCard";
import { useCollection } from "@/lib/queries";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const { i18n, t } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const { data: collection, isLoading } = useCollection(slug);
  const ref = useScrollReveal({ selector: "[data-prod]", stagger: 0.1, y: 50 });

  if (isLoading) {
    return (
      <Section variant="default" pad="md">
        <Container>
          <div className="text-sm text-ink-muted">Loading…</div>
        </Container>
      </Section>
    );
  }
  if (!collection || !collection.isPublished) {
    return <Navigate to="/" replace />;
  }

  const products = collection.products ?? [];

  return (
    <>
      <SEO
        title={collection.title[lang]}
        description={collection.description?.[lang] ?? ""}
        path={`/collections/${collection.slug}`}
      />

      <CollectionHero
        eyebrow={t("nav.recommended", { defaultValue: "Collection" })}
        title={collection.title[lang]}
        lede={collection.description?.[lang] ?? ""}
        accent={collection.accent === "coral" ? "coral" : "forest"}
      />

      <Section variant="default" pad="md">
        <Container>
          <div
            ref={ref as React.RefObject<HTMLDivElement>}
            className="grid gap-8 md:grid-cols-2 xl:grid-cols-3"
          >
            {products.length === 0 && (
              <div className="col-span-full rounded-3xl border border-dashed border-ink/15 p-12 text-center text-ink-muted">
                No products in this collection yet.
              </div>
            )}
            {products.map((p) => {
              const href =
                p.category === "diy" ? `/diy-plans/${p.slug}` : `/coaching/${p.slug}`;
              return (
                <div key={p.id} data-prod>
                  <Link to={href}>
                    <ProductCard product={p} />
                  </Link>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>
    </>
  );
}
