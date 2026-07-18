import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

interface Options {
  selector?: string;
  y?: number;
  opacity?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
  /** @deprecated kept for API compatibility; use `rootMargin`. */
  start?: string;
  once?: boolean;
  rootMargin?: string;
}

/**
 * Reveals matching children on scroll.
 *
 * Deliberately does NOT rely on GSAP ScrollTrigger / Lenis to decide *when* to
 * play — that coupling could leave a section stuck at opacity:0 if a scroll
 * update was missed. Instead it uses two independent triggers (an
 * IntersectionObserver AND a passive scroll/resize check); whichever notices
 * the section enter the viewport first reveals it, exactly once. GSAP still
 * drives the actual entrance animation. Returns a ref for the container.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  selector = "[data-reveal]",
  y = 40,
  opacity = 0,
  duration = 1,
  stagger = 0.08,
  delay = 0,
  rootMargin = "0px 0px -10% 0px",
}: Options = {}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const targets = Array.from(node.querySelectorAll<HTMLElement>(selector));
    if (!targets.length) return;

    // Respect reduced-motion: show everything immediately, no animation.
    if (prefersReducedMotion()) {
      gsap.set(targets, { clearProps: "all" });
      return;
    }

    gsap.set(targets, { y, opacity, filter: "blur(8px)" });

    let done = false;

    const cleanup = () => {
      io?.disconnect();
      window.removeEventListener("scroll", onScrollResize);
      window.removeEventListener("resize", onScrollResize);
    };

    const reveal = () => {
      if (done) return;
      done = true;
      cleanup();
      gsap.to(targets, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration,
        delay,
        stagger,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const inView = () => {
      const r = node.getBoundingClientRect();
      return r.top < window.innerHeight * 0.9 && r.bottom > 0;
    };

    const onScrollResize = () => {
      if (inView()) reveal();
    };

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) reveal();
        },
        { rootMargin, threshold: 0.01 }
      );
      io.observe(node);
    }

    window.addEventListener("scroll", onScrollResize, { passive: true });
    window.addEventListener("resize", onScrollResize);

    // Reveal immediately if the section is already in view at mount
    // (above the fold, short pages, or a restored scroll position).
    const raf = requestAnimationFrame(onScrollResize);

    return () => {
      cancelAnimationFrame(raf);
      cleanup();
    };
  }, [selector, y, opacity, duration, stagger, delay, rootMargin]);

  return ref;
}
