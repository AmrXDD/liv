import { SEO } from "@/components/seo/SEO";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { MarqueeBand } from "@/components/home/MarqueeBand";
import { ServicesPillars } from "@/components/home/ServicesPillars";
import { Credentials } from "@/components/home/Credentials";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { TestimonialsSlider } from "@/components/home/TestimonialsSlider";
import { GlowNewsletter } from "@/components/home/GlowNewsletter";
import { ConversionFunnel } from "@/components/home/ConversionFunnel";
import { useTranslation } from "react-i18next";

export function HomePage() {
  const { t } = useTranslation();
  return (
    <>
      <SEO
        title={`${t("brand.name")} — ${t("brand.tagline")}`}
        description="Bilingual functional wellness studio offering DIY plans, 1:1 coaching, and free consultations grounded in functional medicine and behavior change."
        path="/"
        schema={{
          "@context": "https://schema.org",
          "@graph": [organizationSchema(), websiteSchema()],
        }}
      />
      <Hero />
      <MarqueeBand />
      <ServicesPillars />
      <Credentials />
      <FeaturedProducts />
      <HowItWorks />
      <TestimonialsSlider />
      <GlowNewsletter />
      <ConversionFunnel />
    </>
  );
}
