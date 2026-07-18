import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

interface Options {
  selector?: string;
  y?: number;
  opacity?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
  start?: string;
  once?: boolean;
}

/**
 * Reveals direct children (or matching selector) on scroll.
 * Returns a ref to attach to the container.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  selector = "[data-reveal]",
  y = 40,
  opacity = 0,
  duration = 1,
  stagger = 0.08,
  delay = 0,
  start = "top 85%",
  once = true,
}: Options = {}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    registerGsap();
    const node = ref.current;
    if (!node) return;
    if (prefersReducedMotion()) return;

    const targets = node.querySelectorAll<HTMLElement>(selector);
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { y, opacity, filter: "blur(8px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration,
          delay,
          stagger,
          ease: "power3.out",
          scrollTrigger: {
            trigger: node,
            start,
            toggleActions: once ? "play none none none" : "play none none reverse",
          },
        }
      );
    }, node);

    return () => ctx.revert();
  }, [selector, y, opacity, duration, stagger, delay, start, once]);

  return ref;
}
