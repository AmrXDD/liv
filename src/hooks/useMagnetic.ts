import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

interface MagneticOptions {
  strength?: number;
  scale?: number;
}

/**
 * Magnetic hover effect — element follows pointer with eased translation.
 */
export function useMagnetic<T extends HTMLElement = HTMLDivElement>({
  strength = 0.4,
  scale = 1.04,
}: MagneticOptions = {}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (prefersReducedMotion()) return;

    const onMove = (e: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(node, {
        x: x * strength,
        y: y * strength,
        scale,
        duration: 0.6,
        ease: "power3.out",
      });
    };

    const onLeave = () => {
      gsap.to(node, { x: 0, y: 0, scale: 1, duration: 0.7, ease: "elastic.out(1, 0.5)" });
    };

    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);

    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, [strength, scale]);

  return ref;
}
