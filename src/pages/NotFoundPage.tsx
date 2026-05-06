import { useTranslation } from "react-i18next";
import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <>
      <SEO title={t("static.notFound.title")} description={t("static.notFound.lede")} path="/404" noindex />
      <Section variant="ink" pad="xl" className="min-h-[60vh] grid place-items-center">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <div className="display-serif text-[14rem] leading-none tracking-tightest text-coral-500">
              404
            </div>
            <Reveal as="h1" className="mt-4 display-serif text-display-lg tracking-tightest">
              {t("static.notFound.title")}
            </Reveal>
            <p className="mt-6 text-bone-200/70">{t("static.notFound.lede")}</p>
            <div className="mt-10">
              <Button to="/" variant="secondary" arrow>
                {t("static.notFound.cta")}
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
