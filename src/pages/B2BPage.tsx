import { useTranslation } from "react-i18next";
import { SEO } from "@/components/seo/SEO";
import { CollectionHero } from "@/components/product/CollectionHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useB2bPillars } from "@/lib/queries";

export function B2BPage() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const ref = useScrollReveal({ selector: "[data-pillar]", stagger: 0.12, y: 40 });
  const { data: pillars = [] } = useB2bPillars();

  const pick = (en: string | null, ar: string | null) =>
    lang === "ar" ? (ar?.trim() || en || "") : (en || "");

  return (
    <>
      <SEO title={t("static.b2b.title")} description={t("static.b2b.lede")} path="/b2b" />
      <CollectionHero
        eyebrow={t("nav.b2b")}
        title={t("static.b2b.title")}
        lede={t("static.b2b.lede")}
        accent="coral"
      />

      <Section variant="default" pad="md">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Reveal as="p" className="text-xl text-ink leading-relaxed text-pretty">
              {t("static.b2b.body")}
            </Reveal>
          </div>

          {pillars.length > 0 && (
            <div ref={ref as React.RefObject<HTMLDivElement>} className="mt-16 grid gap-6 md:grid-cols-3">
              {pillars.map((p) => {
                const card = (
                  <div className="rounded-3xl border border-ink/10 bg-surface-raised p-8 hover:shadow-elevation transition-all duration-500 h-full">
                    <div className="font-mono text-eyebrow uppercase text-coral-500">{p.tag}</div>
                    <div className="mt-4 display-serif text-2xl">{pick(p.title_en, p.title_ar)}</div>
                    {pick(p.body_en, p.body_ar) && (
                      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                        {pick(p.body_en, p.body_ar)}
                      </p>
                    )}
                  </div>
                );
                return p.link_url ? (
                  <a
                    key={p.id}
                    href={p.link_url}
                    target={p.link_url.startsWith("http") ? "_blank" : undefined}
                    rel={p.link_url.startsWith("http") ? "noreferrer" : undefined}
                    data-pillar
                    className="block"
                  >
                    {card}
                  </a>
                ) : (
                  <div key={p.id} data-pillar>
                    {card}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-16 rounded-3xl bg-ink p-10 text-bone-50 md:p-16">
            <div className="grid gap-8 md:grid-cols-12 md:items-end">
              <div className="md:col-span-8">
                <div className="text-eyebrow uppercase opacity-70 mb-4">Partner inquiries</div>
                <h2 className="display-serif text-display-md tracking-tightest">
                  Let's design a program your team will actually run.
                </h2>
              </div>
              <div className="md:col-span-4 md:text-end">
                <Button to="/contact" variant="secondary" arrow>
                  Start the conversation
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
