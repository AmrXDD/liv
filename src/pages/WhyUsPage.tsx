import { useTranslation } from "react-i18next";
import { ArrowUpRight, Brain, Languages, Microscope } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { CollectionHero } from "@/components/product/CollectionHero";
import { HeroActions } from "@/components/product/HeroShowcase";
import { HeroPortrait } from "@/components/product/HeroSideCards";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ConversionFunnel } from "@/components/home/ConversionFunnel";
import { TestimonialsSlider } from "@/components/home/TestimonialsSlider";
import { Credentials } from "@/components/home/Credentials";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { usePage } from "@/lib/queries";
import { resizedImageUrl } from "@/lib/storage";
import type { ImageBlock } from "@/types";

interface Item { title: string; body: string }

export function WhyUsPage() {
  const { t } = useTranslation();
  const items = (t("static.whyUs.items", { returnObjects: true }) as Item[]) || [];
  const ref = useScrollReveal({ selector: "[data-why]", stagger: 0.12, y: 50 });
  // Reuse the founder portrait managed on the My Story page.
  const { data: story, isLoading: storyLoading } = usePage("my-story");
  const storyImages = story?.blocks.filter((b): b is ImageBlock => b.type === "image" && !!b.url) ?? [];
  const portrait = storyImages.find((b) => b.id === "founder-portrait") ?? storyImages[0];
  const pointIcons = [Languages, Brain, Microscope];

  return (
    <>
      <SEO title={t("static.whyUs.title")} description={t("static.whyUs.lede")} path="/why-us" />
      <CollectionHero
        eyebrow={t("nav.whyUs")}
        title={t("static.whyUs.title")}
        lede={t("static.whyUs.lede")}
        wideSide
        side={
          <HeroPortrait
            src={portrait ? resizedImageUrl(portrait.url, 1600) : undefined}
            isLoading={storyLoading}
            alt={portrait?.alt || t("heroExtras.whyUs.name")}
            objectPosition="53% 18%"
            zoom={1.8}
            name={t("heroExtras.whyUs.name")}
            role={t("heroExtras.whyUs.role")}
            href="/my-story"
          />
        }
        actions={
          <HeroActions
            cta={{ label: t("heroExtras.whyUs.cta"), icon: ArrowUpRight, to: "/consultations" }}
            points={items.slice(0, 3).map((it, i) => ({ icon: pointIcons[i], label: it.title }))}
          />
        }
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
