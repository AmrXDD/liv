import { useEffect, useRef, type ReactNode } from "react";
import { gsap, registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { Container } from "@/components/ui/Container";

interface Props {
  eyebrow: string;
  title: string;
  lede: string;
  accent?: "forest" | "coral";
  side?: ReactNode;
}

export function CollectionHero({ eyebrow, title, lede, accent = "forest", side }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    registerGsap();
    if (!ref.current) return;
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-coll-eyebrow]",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, delay: 0.2 }
      );
      const words = ref.current!.querySelectorAll<HTMLSpanElement>(".coll-word > span");
      gsap.fromTo(
        words,
        { yPercent: 110 },
        { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.07, delay: 0.3 }
      );
      gsap.fromTo(
        "[data-coll-lede]",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.85 }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-editorial pb-24 pt-12 md:pt-20">
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute -top-20 -end-20 h-[70vw] max-h-[350px] w-[70vw] max-w-[350px] rounded-full blur-3xl md:-top-40 md:-end-40 md:h-[60vw] md:max-h-[700px] md:w-[60vw] md:max-w-[700px] ${
            accent === "forest"
              ? "bg-gradient-to-br from-forest-300/40 to-transparent"
              : "bg-gradient-to-br from-coral-300/40 to-transparent"
          }`}
        />
        <div className="absolute inset-0 bg-grain opacity-30 pointer-events-none" />
      </div>
      <Container className="relative">
        <div ref={ref} className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <div data-coll-eyebrow className="eyebrow mb-6">{eyebrow}</div>
            <h1 className="display-serif text-display-xl tracking-tightest text-balance">
              {title.split(" ").map((w, i) => (
                <span key={i} className="coll-word inline-block overflow-hidden me-2 align-baseline">
                  <span className="inline-block translate-y-[110%] will-change-transform">{w}</span>
                </span>
              ))}
            </h1>
            <p data-coll-lede className="mt-8 max-w-2xl text-lg text-ink-muted leading-relaxed">
              {lede}
            </p>
          </div>
          {side && <div className="lg:col-span-4">{side}</div>}
        </div>
      </Container>
    </section>
  );
}
