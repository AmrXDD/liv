import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { CollectionHero } from "@/components/product/CollectionHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useDirection } from "@/hooks/useDirection";
import { useRecommendedProducts } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function RecommendedProductsPage() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const { isRtl } = useDirection();
  const ref = useScrollReveal({ selector: "[data-rec]", stagger: 0.06, y: 30 });
  const { data: items = [], isLoading } = useRecommendedProducts();

  const pick = (en: string, ar: string | null) => (lang === "ar" ? (ar?.trim() || en) : en);

  return (
    <>
      <SEO
        title={t("static.recommended.title")}
        description={t("static.recommended.lede")}
        path="/recommended"
      />
      <CollectionHero
        eyebrow={t("nav.recommended")}
        title={t("static.recommended.title")}
        lede={t("static.recommended.lede")}
      />
      <Section variant="default" pad="md">
        <Container>
          {isLoading ? (
            <p className="text-sm text-ink-muted">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-ink-muted">
              {lang === "ar" ? "لا توجد توصيات بعد." : "No recommendations yet."}
            </p>
          ) : (
            <ul ref={ref as React.RefObject<HTMLUListElement>} className="divide-y divide-ink/10 border-y border-ink/10">
              {items.map((it) => (
                <li key={it.id} data-rec>
                  <a
                    href={it.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group grid grid-cols-12 items-start gap-6 py-8 transition-colors hover:bg-bone-100/60"
                  >
                    <div className="col-span-2 text-eyebrow uppercase font-mono text-forest-500">
                      {pick(it.category_en, it.category_ar)}
                    </div>
                    <div className="col-span-9 md:col-span-7">
                      <div className="display-serif text-2xl tracking-tight">
                        {pick(it.name_en, it.name_ar)}
                        {it.is_affiliate && (
                          <span className="ms-2 align-middle text-eyebrow uppercase text-coral-500">
                            {lang === "ar" ? "تابع" : "affiliate"}
                          </span>
                        )}
                      </div>
                      {pick(it.why_en ?? "", it.why_ar) && (
                        <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-xl">
                          {pick(it.why_en ?? "", it.why_ar)}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1 md:col-span-3 flex items-center justify-end">
                      <span className="grid h-12 w-12 place-items-center rounded-full border border-ink/15 transition-all duration-500 group-hover:bg-ink group-hover:text-bone-50 group-hover:border-ink group-hover:rotate-45">
                        <ArrowUpRight className={cn("h-4 w-4", isRtl && "flip-rtl")} />
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </>
  );
}
