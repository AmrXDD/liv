import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Button } from "@/components/ui/Button";
import { ChevronDown } from "lucide-react";
import { BloodSugarAnimation } from "./BloodSugarAnimation";
import { useDirection } from "@/hooks/useDirection";
import { cn } from "@/lib/utils";

export function Hero() {
  const { t } = useTranslation();
  const { isRtl } = useDirection();
  const root = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    registerGsap();
    const node = root.current;
    if (!node) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Eyebrow + meta
      gsap.from("[data-hero-eyebrow]", { y: 20, opacity: 0, duration: 0.9, delay: 0.4 });

      // Word-by-word stagger on the title.
      // Start state is set imperatively here (NOT via Tailwind class) so the
      // title remains visible if JS fails or reduced-motion is on.
      const words = titleRef.current?.querySelectorAll<HTMLSpanElement>(".hero-word > span");
      if (words?.length) {
        gsap.set(words, { yPercent: 110 });
        gsap.to(words, {
          yPercent: 0,
          duration: 1.3,
          ease: "expo.out",
          stagger: 0.08,
          delay: 0.55,
        });
      }

      gsap.from("[data-hero-lede]", { y: 20, opacity: 0, duration: 0.9, delay: 1.1 });
      gsap.from("[data-hero-cta]", {
        y: 16,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        delay: 1.25,
      });
      gsap.from("[data-hero-metric]", {
        y: 20,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        delay: 1.45,
      });

      // Background shapes parallax
      gsap.to("[data-hero-blob='1']", {
        yPercent: -20,
        scale: 1.06,
        ease: "none",
        scrollTrigger: { trigger: node, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to("[data-hero-blob='2']", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: { trigger: node, start: "top top", end: "bottom top", scrub: true },
      });

      // Mouse parallax on hero shapes
      const onMove = (e: PointerEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 30;
        gsap.to("[data-hero-shape]", { x, y, duration: 1.2, ease: "power3.out" });
      };
      window.addEventListener("pointermove", onMove);
      return () => window.removeEventListener("pointermove", onMove);
    }, node);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  const titleWords = [
    t("hero.titleA"),
    t("hero.titleB"),
    t("hero.titleC"),
    t("hero.titleD"),
  ];
  const metrics = (t("hero.metrics", { returnObjects: true }) as { value: string; label: string }[]) || [];

  return (
    <section
      ref={root}
      className="relative isolate overflow-hidden bg-surface-base bg-editorial pb-24 pt-16 lg:pt-24"
    >
      {/* Background visual layer */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          data-hero-blob="1"
          data-hero-shape
          className="absolute -top-20 -end-20 h-[70vw] max-h-[400px] w-[70vw] max-w-[400px] rounded-full bg-gradient-to-br from-forest-300/40 via-forest-500/20 to-transparent blur-3xl md:-top-40 md:-end-40 md:h-[60vw] md:max-h-[800px] md:w-[60vw] md:max-w-[800px]"
        />
        <div
          data-hero-blob="2"
          data-hero-shape
          className="absolute -bottom-16 -start-16 h-[60vw] max-h-[350px] w-[60vw] max-w-[350px] rounded-full bg-gradient-to-tr from-coral-400/40 via-coral-300/20 to-transparent blur-3xl md:-bottom-32 md:-start-32 md:h-[50vw] md:max-h-[700px] md:w-[50vw] md:max-w-[700px]"
        />
        <div className="absolute inset-0 bg-grain opacity-40" />
      </div>

      <Container className="relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <header className="lg:col-span-8">
            <div data-hero-eyebrow className="eyebrow mb-8">
              {t("hero.eyebrow")}
            </div>

            <h1
              ref={titleRef}
              className={cn(
                "display-serif text-display-2xl text-balance",
                isRtl ? "tracking-normal leading-[1.15]" : "tracking-tightest"
              )}
              aria-label={titleWords.join(" ")}
            >
              {titleWords.map((word, i) => (
                <span key={i} className="hero-word inline-block overflow-hidden align-baseline mx-1.5">
                  <span className="inline-block will-change-transform">
                    {i === 1 ? (
                      isRtl ? (
                        <em className="not-italic text-forest-600">{word}</em>
                      ) : (
                        <em className="text-gradient-forest not-italic">{word}</em>
                      )
                    ) : (
                      word
                    )}
                  </span>
                </span>
              ))}
            </h1>

            <p
              data-hero-lede
              className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-muted text-pretty"
            >
              {t("hero.lede")}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <div data-hero-cta>
                <MagneticButton to="/consultations">{t("cta.primary")}</MagneticButton>
              </div>
              <div data-hero-cta>
                <Button to="/diy-plans" variant="ghost" arrow>
                  {t("cta.secondary")}
                </Button>
              </div>
            </div>
          </header>

          <div className="lg:col-span-4" data-hero-shape>
            <BloodSugarAnimation />
          </div>
        </div>

        <div className="mt-20 grid grid-cols-3 gap-6 border-t border-ink/10 pt-10">
          {metrics.map((m, i) => (
            <div key={i} data-hero-metric>
              <div className="display-serif text-display-md tracking-tightest text-forest-500">
                {m.value}
              </div>
              <div className="mt-2 text-sm font-medium uppercase tracking-wider text-ink-muted">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </Container>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-eyebrow uppercase text-ink-muted">
        {t("hero.scrollHint")}
        <ChevronDown className="h-4 w-4 animate-floaty" />
      </div>
    </section>
  );
}
