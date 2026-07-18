import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

/**
 * Custom premium cursor — a soft forest dot with a trailing ring.
 * Hidden on touch devices.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    document.documentElement.style.cursor = "none";

    const xTo = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const rxTo = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const ryTo = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      rxTo(e.clientX);
      ryTo(e.clientY);
    };

    const grow = () => gsap.to(ring, { scale: 1.6, duration: 0.4, ease: "power3.out" });
    const shrink = () => gsap.to(ring, { scale: 1, duration: 0.4, ease: "power3.out" });

    window.addEventListener("pointermove", onMove);
    document.querySelectorAll<HTMLElement>("a,button,[data-magnetic]").forEach((el) => {
      el.addEventListener("pointerenter", grow);
      el.addEventListener("pointerleave", shrink);
    });

    return () => {
      document.documentElement.style.cursor = "";
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[200] hidden h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-forest-500 mix-blend-difference md:block"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[199] hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-forest-500/50 mix-blend-difference md:block"
      />
    </>
  );
}
