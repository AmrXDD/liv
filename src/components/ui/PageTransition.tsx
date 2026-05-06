import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

/**
 * Premium page-transition cover. On route change, slides a forest panel
 * up over the page, then back down to reveal the new view.
 */
export function PageTransitionCover() {
  const location = useLocation();

  useEffect(() => {
    if (prefersReducedMotion()) {
      window.scrollTo(0, 0);
      return;
    }
    const cover = document.getElementById("page-transition");
    if (!cover) return;

    gsap.set(cover, { yPercent: 100, display: "block" });
    gsap.to(cover, {
      yPercent: 0,
      duration: 0.55,
      ease: "expo.inOut",
      onComplete: () => {
        window.scrollTo(0, 0);
        gsap.to(cover, {
          yPercent: -100,
          duration: 0.55,
          ease: "expo.inOut",
          delay: 0.05,
          onComplete: () => gsap.set(cover, { display: "none" }),
        });
      },
    });
  }, [location.pathname]);

  return (
    <div
      id="page-transition"
      className="pointer-events-none fixed inset-0 z-[180] hidden bg-forest-700"
      aria-hidden
    />
  );
}
