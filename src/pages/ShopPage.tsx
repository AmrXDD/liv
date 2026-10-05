import { useSearchParams } from "react-router-dom";
import { Link } from "@/lib/langRouting";
import { ArrowDown, Globe, PenLine, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CollectionHero } from "@/components/product/CollectionHero";
import { HeroActions, HeroShowcase, productShowcaseItems } from "@/components/product/HeroShowcase";
import { ProductCard } from "@/components/product/ProductCard";
import { Credentials } from "@/components/home/Credentials";
import { TestimonialsSlider } from "@/components/home/TestimonialsSlider";
import { useProducts } from "@/lib/queries";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { SELF_GUIDED_PATH } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

type GroupId = "books" | "programs" | "tools" | "physical";

const GROUPS: { id: GroupId; label: { en: string; ar: string } }[] = [
  { id: "books", label: { en: "Books", ar: "الكتب" } },
  { id: "programs", label: { en: "Self-Guided Programs", ar: "برامج التنفيذ الشخصي" } },
  { id: "tools", label: { en: "Tools", ar: "الأدوات" } },
  { id: "physical", label: { en: "Physical Products", ar: "المنتجات" } },
];

const allLabel = { en: "All", ar: "الكل" };

export function ShopPage() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const ref = useScrollReveal({ selector: "[data-prod]", stagger: 0.1, y: 50 });
  const { data: physical = [], isLoading: loadingPhysical } = useProducts("physical");
  const { data: programs = [], isLoading: loadingPrograms } = useProducts("diy");
  const isLoading = loadingPhysical || loadingPrograms;
  const [params, setParams] = useSearchParams();

  const byGroup: Record<GroupId, Product[]> = {
    books: physical.filter((p) => p.shopGroup === "book"),
    programs,
    tools: physical.filter((p) => p.shopGroup === "tool"),
    physical: physical.filter((p) => !p.shopGroup),
  };
  const visibleGroups = GROUPS.filter((g) => byGroup[g.id].length > 0);
  const requested = params.get("cat") as GroupId | null;
  const active: GroupId | "all" =
    requested && visibleGroups.some((g) => g.id === requested) ? requested : "all";
  const shown = active === "all" ? visibleGroups : visibleGroups.filter((g) => g.id === active);
  const showcase = [...byGroup.books, ...byGroup.physical, ...byGroup.tools];

  const setActive = (id: GroupId | "all") => {
    const next = new URLSearchParams(params);
    if (id === "all") next.delete("cat");
    else next.set("cat", id);
    setParams(next, { replace: true });
  };

  const chip = (selected: boolean) =>
    cn(
      "rounded-full border px-5 py-2.5 text-sm font-medium transition-colors",
      selected ? "border-forest-500 bg-forest-500 text-white" : "border-ink/15 hover:border-ink/40"
    );

  return (
    <>
      <SEO title={t("shop.hero.title")} description={t("shop.hero.lede")} path="/shop" />

      <CollectionHero
        eyebrow={t("shop.hero.eyebrow")}
        title={t("shop.hero.title")}
        lede={t("shop.hero.lede")}
        accent="coral"
        wideSide
        side={
          <HeroShowcase
            shape="book"
            isLoading={isLoading}
            items={productShowcaseItems(showcase, lang, t("heroExtras.from"))}
            fallbackLabel={t("heroExtras.featured")}
          />
        }
        actions={
          <HeroActions
            cta={{ label: t("shop.hero.cta"), icon: ArrowDown, scrollTo: "shop-collection" }}
            points={[
              { icon: PenLine, label: t("shop.hero.trust.author") },
              { icon: ShieldCheck, label: t("shop.hero.trust.checkout") },
              { icon: Globe, label: t("shop.hero.trust.shipping") },
            ]}
          />
        }
      />

      <Section id="shop-collection" variant="default" pad="md">
        <Container>
          {visibleGroups.length > 1 && (
            <div className="mb-10 flex flex-wrap gap-2" role="tablist">
              <button type="button" className={chip(active === "all")} onClick={() => setActive("all")}>
                {allLabel[lang]}
              </button>
              {visibleGroups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={chip(active === g.id)}
                  onClick={() => setActive(g.id)}
                >
                  {g.label[lang]}
                </button>
              ))}
            </div>
          )}

          <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-14">
            {isLoading && <div className="text-sm text-ink-muted">Loading…</div>}
            {!isLoading && visibleGroups.length === 0 && (
              <div className="rounded-3xl border border-dashed border-ink/15 p-12 text-center text-ink-muted">
                Nothing in the shop yet — check back soon.
              </div>
            )}
            {shown.map((g) => (
              <div key={g.id}>
                {active === "all" && visibleGroups.length > 1 && (
                  <h2 className="display-serif mb-6 text-2xl tracking-tight">{g.label[lang]}</h2>
                )}
                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {byGroup[g.id].map((p) => (
                    <div key={p.id} data-prod>
                      <Link to={g.id === "programs" ? `${SELF_GUIDED_PATH}/${p.slug}` : `/shop/${p.slug}`}>
                        <ProductCard product={p} />
                      </Link>
                    </div>
                  ))}
                </div>
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
