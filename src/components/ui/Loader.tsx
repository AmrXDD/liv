import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

/**
 * Premium intro loader. Counts up from 0 → 100, then masks open
 * to reveal the page. Mounts once on first load.
 */
export function Loader() {
  const ref = useRef<HTMLDivElement | null>(null);
  const numRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion()) {
      setDone(true);
      return;
    }
    const tl = gsap.timeline({ onComplete: () => setDone(true) });
    const counter = { v: 0 };

    tl.to(counter, {
      v: 100,
      duration: 1.6,
      ease: "power2.inOut",
      onUpdate: () => {
        if (numRef.current) numRef.current.textContent = String(Math.floor(counter.v));
        if (barRef.current) barRef.current.style.width = `${counter.v}%`;
      },
    })
      .to(ref.current, { yPercent: -100, duration: 1, ease: "expo.inOut" }, "+=0.15");
  }, []);

  if (done) return null;

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-ink text-bone-50"
      aria-hidden
    >
      <div className="absolute inset-0 bg-radial-forest opacity-50" />
      <div className="relative flex flex-col items-center gap-8">
        <div className="text-eyebrow uppercase opacity-70">Liv Functional</div>
        <div ref={numRef} className="display-serif text-display-2xl tracking-tightest">0</div>
        <div className="h-px w-64 bg-bone-50/15">
          <div ref={barRef} className="h-full bg-coral-500" style={{ width: 0 }} />
        </div>
      </div>
    </div>
  );
}
