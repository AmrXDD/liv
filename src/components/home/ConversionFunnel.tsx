import { useTranslation } from "react-i18next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function ConversionFunnel() {
  const { t } = useTranslation();
  const ref = useScrollReveal({ selector: "[data-fn]", stagger: 0.1, y: 40 });

  return (
    <Section variant="default" pad="lg" className="bg-editorial">
      <Container>
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className="relative mx-auto max-w-4xl text-center"
        >
          <div data-fn className="eyebrow justify-center mb-6">{t("funnel.eyebrow")}</div>
          <h2 data-fn className="display-serif text-display-xl tracking-tightest text-balance">
            {t("funnel.title")}
          </h2>
          <p data-fn className="mt-6 mx-auto max-w-xl text-ink-muted leading-relaxed">
            {t("funnel.lede")}
          </p>
          <div data-fn className="mt-10 inline-block">
            <MagneticButton to="/consultations">{t("funnel.button")}</MagneticButton>
          </div>
        </div>
      </Container>
    </Section>
  );
}
