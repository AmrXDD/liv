import { useTranslation } from "react-i18next";
import { SEO } from "@/components/seo/SEO";
import { CollectionHero } from "@/components/product/CollectionHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function B2BPage() {
  const { t } = useTranslation();
  const ref = useScrollReveal({ selector: "[data-pillar]", stagger: 0.12, y: 40 });

  const pillars = [
    { tag: "01", title: "Keynote", body: "An opening keynote that resets how your team thinks about energy and recovery." },
    { tag: "02", title: "Cohort program", body: "12 weekly group sessions delivered bilingually for up to 25 seats." },
    { tag: "03", title: "Leadership 1:1", body: "Three high-touch coaching seats for executives who set the tone." },
  ];

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

          <div ref={ref as React.RefObject<HTMLDivElement>} className="mt-16 grid gap-6 md:grid-cols-3">
            {pillars.map((p) => (
              <div
                key={p.tag}
                data-pillar
                className="rounded-3xl border border-ink/10 bg-surface-raised p-8 hover:shadow-elevation transition-all duration-500"
              >
                <div className="font-mono text-eyebrow uppercase text-coral-500">{p.tag}</div>
                <div className="mt-4 display-serif text-2xl">{p.title}</div>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{p.body}</p>
              </div>
            ))}
          </div>

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
