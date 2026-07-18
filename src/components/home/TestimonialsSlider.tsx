import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { testimonials } from "@/data/testimonials";
import { cn } from "@/lib/utils";
import { useDirection } from "@/hooks/useDirection";
import { gsap } from "@/lib/gsap";

export function TestimonialsSlider() {
  const { t, i18n } = useTranslation();
  const { isRtl } = useDirection();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const [active, setActive] = useState(0);
  const slideRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!slideRef.current) return;
    gsap.fromTo(
      slideRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
  }, [active]);

  const next = () => setActive((i) => (i + 1) % testimonials.length);
  const prev = () => setActive((i) => (i - 1 + testimonials.length) % testimonials.length);
  const current = testimonials[active];

  return (
    <Section variant="forest" pad="lg" className="relative">
      <div className="absolute inset-0 bg-grain opacity-20 mix-blend-overlay" />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="text-eyebrow uppercase opacity-70 mb-6">{t("stories.eyebrow")}</div>
            <h2 className="display-serif text-display-lg tracking-tightest text-balance">
              {t("stories.voices", { defaultValue: "Voices that stayed." })}
            </h2>
            <div dir="ltr" className="mt-8 flex items-center gap-3">
              <button
                onClick={isRtl ? next : prev}
                className="grid h-12 w-12 place-items-center rounded-full border border-bone-50/30 hover:bg-bone-50 hover:text-forest-700 transition-colors"
                aria-label={t("common.previous")}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={isRtl ? prev : next}
                className="grid h-12 w-12 place-items-center rounded-full border border-bone-50/30 hover:bg-bone-50 hover:text-forest-700 transition-colors"
                aria-label={t("common.next")}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="ms-4 font-mono text-eyebrow opacity-70">
                {String(active + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div ref={slideRef}>
              <p className="display-serif text-2xl sm:text-3xl md:text-4xl leading-tight tracking-tight text-balance">
                "{current.quote[lang]}"
              </p>
              <div className="mt-10 flex items-end justify-between gap-6 border-t border-bone-50/15 pt-6">
                <div>
                  <div className="font-semibold">{current.name}</div>
                  {current.location && (
                    <div className="text-eyebrow uppercase opacity-70">{current.location}</div>
                  )}
                </div>
                {current.result && (
                  <div className="text-end text-sm opacity-90 max-w-[260px]">
                    {current.result[lang]}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    active === i ? "w-12 bg-coral-500" : "w-6 bg-bone-50/30 hover:bg-bone-50/60"
                  )}
                  aria-label={`Go to ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
