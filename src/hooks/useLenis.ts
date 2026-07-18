import { useEffect } from "react";
import Lenis from "lenis";
import { ScrollTrigger, registerGsap } from "@/lib/gsap";
import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/utils";

/**
 * Smooth-scroll wired to GSAP ScrollTrigger.
 * Mounts once at app root.
 */
export function useLenis() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    registerGsap();

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    function onScroll() {
      ScrollTrigger.update();
    }
    lenis.on("scroll", onScroll);

    const tickerHandler = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerHandler);
    gsap.ticker.lagSmoothing(0);

    // Recalculate ScrollTrigger positions once the layout, fonts and images
    // have settled — otherwise reveal triggers created too early can keep
    // below-the-fold sections stuck at opacity:0.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => {});
    const timers = [setTimeout(refresh, 300), setTimeout(refresh, 1200)];

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tickerHandler);
      window.removeEventListener("load", refresh);
      timers.forEach(clearTimeout);
      lenis.destroy();
    };
  }, []);
}
