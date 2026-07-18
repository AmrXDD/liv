import { useTranslation } from "react-i18next";
import { SEO } from "@/components/seo/SEO";
import { CollectionHero } from "@/components/product/CollectionHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ConversionFunnel } from "@/components/home/ConversionFunnel";
import { TestimonialsSlider } from "@/components/home/TestimonialsSlider";
import { Credentials } from "@/components/home/Credentials";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface Item { title: string; body: string }

export function WhyUsPage() {
  const { t } = useTranslation();
  const items = (t("static.whyUs.items", { returnObjects: true }) as Item[]) || [];
  const ref = useScrollReveal({ selector: "[data-why]", stagger: 0.12, y: 50 });

  return (
    <>
      <SEO title={t("static.whyUs.title")} description={t("static.whyUs.lede")} path="/why-us" />
      <CollectionHero
        eyebrow={t("nav.whyUs")}
        title={t("static.whyUs.title")}
        lede={t("static.whyUs.lede")}
      />
      <Section variant="default" pad="md">
        <Container>
          <div ref={ref as React.RefObject<HTMLDivElement>} className="grid gap-6 md:grid-cols-3">
            {items.map((it, i) => (
              <div
                key={it.title}
                data-why
                className="card-glow rounded-3xl border border-ink/10 bg-surface-raised p-8 transition-all duration-500"
              >
                <div className="font-mono text-eyebrow uppercase text-coral-500">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="mt-4 display-serif text-2xl">{it.title}</div>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{it.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
      <Credentials />
      <TestimonialsSlider />
      <ConversionFunnel />
    </>
  );
}
