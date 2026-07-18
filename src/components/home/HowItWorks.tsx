import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

interface Step { n: string; title: string; body: string }

export function HowItWorks() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement | null>(null);
  const steps = (t("howItWorks.steps", { returnObjects: true }) as Step[]) || [];

  useEffect(() => {
    registerGsap();
    const node = ref.current;
    if (!node) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const items = node.querySelectorAll<HTMLElement>("[data-step]");
      gsap.fromTo(
        items,
        { opacity: 0.15, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: node, start: "top 70%", once: true },
        }
      );

      const line = node.querySelector<HTMLElement>("[data-step-line]");
      if (line) {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: node, start: "top 60%", end: "bottom 60%", scrub: true },
          }
        );
      }
    }, node);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <Section variant="default" pad="lg">
      <Container>
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="eyebrow mb-6">{t("howItWorks.eyebrow")}</div>
            <h2 className="display-serif text-display-lg tracking-tightest text-balance">
              {t("howItWorks.title")}
            </h2>
          </div>

          <div ref={ref} className="relative lg:col-span-8">
            <div
              data-step-line
              className="absolute start-6 top-3 h-[calc(100%-2rem)] w-px origin-top bg-forest-500/40"
            />
            <ol className="space-y-12">
              {steps.map((s) => (
                <li key={s.n} data-step className="relative grid grid-cols-12 items-start gap-6">
                  <div className="col-span-2 md:col-span-1 relative">
                    <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full bg-forest-500 text-bone-50 font-mono text-eyebrow shadow-glow">
                      {s.n}
                    </span>
                  </div>
                  <div className="col-span-10 md:col-span-11">
                    <div className="display-serif text-2xl md:text-3xl">{s.title}</div>
                    <p className="mt-3 max-w-xl text-ink-muted leading-relaxed">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </Section>
  );
}
