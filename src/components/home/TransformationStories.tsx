import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { testimonials } from "@/data/testimonials";
import { useDirection } from "@/hooks/useDirection";

export function TransformationStories() {
  const { t, i18n } = useTranslation();
  const { isRtl } = useDirection();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    registerGsap();
    const node = root.current;
    if (!node) return;
    if (prefersReducedMotion()) return;

    const track = node.querySelector<HTMLElement>("[data-story-track]");
    if (!track) return;

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {

      // Desktop: pin the section and scrub the track horizontally.
      mm.add("(min-width: 1024px)", () => {
        // Use a getter so invalidateOnRefresh recomputes after fonts/images
        // load or the viewport resizes. Returning 1 (not 0) when not yet
        // measured keeps the ScrollTrigger alive — a 0-distance ST gets
        // skipped and never re-evaluates.
        const getDistance = () => {
          const overflow = track.scrollWidth - window.innerWidth + 80;
          return overflow > 0 ? overflow : 1;
        };

        const tween = gsap.to(track, {
          x: () => (isRtl ? getDistance() : -getDistance()),
          ease: "none",
          scrollTrigger: {
            trigger: node,
            start: "top top",
            end: () => `+=${getDistance()}`,
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Re-measure when fonts, images, or layout settle.
        const refresh = () => ScrollTrigger.refresh();
        const ro = new ResizeObserver(refresh);
        ro.observe(track);
        window.addEventListener("load", refresh);
        if (document.fonts && "ready" in document.fonts) {
          document.fonts.ready.then(refresh).catch(() => {});
        }
        // Late-loading images inside cards (no width until decoded).
        track.querySelectorAll("img").forEach((img) => {
          if (!img.complete) img.addEventListener("load", refresh, { once: true });
        });
        // One deferred refresh for the very first paint.
        const raf = requestAnimationFrame(refresh);

        return () => {
          ro.disconnect();
          window.removeEventListener("load", refresh);
          cancelAnimationFrame(raf);
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });

    }, node);

    return () => {
      mm.revert();
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [isRtl]);

  return (
    <Section variant="ink" pad="xl" className="!py-0">
      <div
        ref={root}
        className="relative overflow-x-clip overflow-y-hidden py-20 lg:flex lg:h-screen lg:flex-col lg:py-0"
      >
        <div className="absolute inset-0 bg-radial-forest opacity-50" />

        <Container className="relative lg:flex-shrink-0 lg:pt-24">
          <div className="eyebrow mb-6 text-bone-200/70">
            {t("stories.eyebrow")}
          </div>
          <h2 className="display-serif text-display-lg tracking-tightest max-w-3xl text-balance">
            {t("stories.title")}
          </h2>
          <p className="mt-6 max-w-md text-bone-200/70">{t("stories.lede")}</p>
        </Container>

        <div className="relative mt-12 overflow-x-auto overscroll-x-contain snap-x snap-mandatory lg:mt-0 lg:flex lg:flex-1 lg:items-center lg:overflow-visible">
          <div
            data-story-track
            className="flex w-max items-stretch gap-8 px-8 will-change-transform lg:flex-shrink-0"
          >
            {testimonials.map((tt) => (
              <article
                key={tt.id}
                data-story
                className="relative w-[85vw] max-w-[520px] flex-shrink-0 snap-center rounded-3xl bg-bone-50 p-6 sm:p-8 md:p-10 text-ink shadow-elevation sm:w-[70vw] md:w-[55vw] lg:w-[80vw]"
              >
                <div className="display-serif text-coral-500 text-6xl leading-none mb-4">"</div>
                <p className="text-2xl leading-snug text-balance">{tt.quote[lang]}</p>
                <div className="mt-8 flex items-end justify-between gap-6">
                  <div>
                    <div className="font-semibold">{tt.name}</div>
                    {tt.location && (
                      <div className="text-eyebrow uppercase text-ink-muted">{tt.location}</div>
                    )}
                  </div>
                  {tt.result && (
                    <div className="text-end text-sm text-forest-700 max-w-[220px]">
                      {tt.result[lang]}
                    </div>
                  )}
                </div>
              </article>
            ))}
            <div className="w-24 flex-shrink-0" />
          </div>
        </div>
      </div>
    </Section>
  );
}
