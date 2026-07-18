import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CollectionHero } from "@/components/product/CollectionHero";
import { CalEmbed } from "@/components/booking/CalEmbed";
import { TestimonialsSlider } from "@/components/home/TestimonialsSlider";
import { useProducts } from "@/lib/queries";
import { Button } from "@/components/ui/Button";

export function ConsultationsPage() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const trust = (t("consultations.trust", { returnObjects: true }) as string[]) || [];
  const { data: consultations = [] } = useProducts("consultation");

  return (
    <>
      <SEO
        title={t("consultations.hero.title")}
        description={t("consultations.hero.lede")}
        path="/consultations"
      />

      <CollectionHero
        eyebrow={t("consultations.hero.eyebrow")}
        title={t("consultations.hero.title")}
        lede={t("consultations.hero.lede")}
        accent="forest"
        side={
          <div className="rounded-3xl bg-ink p-8 text-bone-50">
            <div className="text-eyebrow uppercase opacity-70 mb-4">
              {t("brand.tagline")}
            </div>
            <ul className="space-y-3">
              {trust.map((trustLine) => (
                <li key={trustLine} className="flex items-center gap-3 text-sm">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-coral-500">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {trustLine}
                </li>
              ))}
            </ul>
          </div>
        }
      />

      {consultations.length > 0 && (
        <Section variant="default" pad="md">
          <Container>
            <div className="grid gap-8 md:grid-cols-2">
              {consultations.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col rounded-3xl border border-ink/10 bg-surface-raised p-8 shadow-elevation"
                >
                  {p.badge?.[lang] && (
                    <div
                      className={`mb-4 inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        p.accent === "coral"
                          ? "bg-coral-500/15 text-coral-700"
                          : "bg-forest-500/15 text-forest-700"
                      }`}
                    >
                      {p.badge[lang]}
                    </div>
                  )}
                  <h3 className="display-serif text-3xl tracking-tightest">
                    {p.title[lang]}
                  </h3>
                  <p className="mt-3 text-sm text-ink-muted">{p.tagline[lang]}</p>
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="display-serif text-4xl text-forest-700">
                      {p.price === 0 ? t("common.free", { defaultValue: "Free" }) : `$${p.price}`}
                    </span>
                    {p.duration?.[lang] && (
                      <span className="text-xs text-ink-muted">· {p.duration[lang]}</span>
                    )}
                  </div>
                  {p.inclusions?.length > 0 && (
                    <ul className="mt-6 space-y-2">
                      {p.inclusions.slice(0, 5).map((inc, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <Check className="h-4 w-4 mt-0.5 shrink-0 text-forest-600" />
                          <span>{inc[lang]}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-8">
                    <Button
                      href="#booking"
                      variant={p.price === 0 ? "primary" : "ghost"}
                      arrow
                    >
                      {p.price === 0
                        ? t("consultations.bookFree", { defaultValue: "Book the free call" })
                        : t("consultations.bookPaid", { defaultValue: `Book — $${p.price}` })}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section variant="default" pad="md" id="booking">
        <Container>
          <CalEmbed />
        </Container>
      </Section>

      <TestimonialsSlider />
    </>
  );
}
