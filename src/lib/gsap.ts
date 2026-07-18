import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

let registered = false;

export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  gsap.defaults({
    ease: "power3.out",
    duration: 0.9,
  });
  ScrollTrigger.config({
    ignoreMobileResize: true,
  });
  registered = true;
}

export { gsap, ScrollTrigger };

/**
 * Stagger preset for editorial entrance animations.
 */
export const editorialStagger = {
  amount: 0.6,
  from: "start" as const,
  ease: "power2.out",
};
