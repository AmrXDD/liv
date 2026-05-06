import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
  delay?: number;
  y?: number;
  className?: string;
  /** When true, splits text into per-line masked reveal */
  split?: boolean;
}

/**
 * Single-element scroll reveal. For text masks, set split.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  y = 30,
  className,
  split = false,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    registerGsap();
    const node = ref.current;
    if (!node) return;
    if (prefersReducedMotion()) return;

    const target = split ? node.querySelectorAll(".reveal-line > span") : node;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        target,
        { y: split ? "110%" : y, opacity: split ? 1 : 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: "power3.out",
          delay,
          stagger: split ? 0.06 : 0,
          scrollTrigger: { trigger: node, start: "top 88%", once: true },
        }
      );
    }, node);

    return () => ctx.revert();
  }, [delay, y, split]);

  // @ts-expect-error dynamic tag
  return <Tag ref={ref} className={className} data-reveal>{children}</Tag>;
}

/**
 * Per-line masked text reveal — each line wraps in overflow:hidden.
 */
export function MaskLines({
  lines,
  className,
  delay = 0,
}: {
  lines: ReactNode[];
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    registerGsap();
    const node = ref.current;
    if (!node) return;
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        node.querySelectorAll(".mask-inner"),
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.08,
          delay,
          scrollTrigger: { trigger: node, start: "top 88%", once: true },
        }
      );
    }, node);
    return () => ctx.revert();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden leading-[1.05]">
          <span className="mask-inner inline-block translate-y-[110%] will-change-transform">
            {line}
          </span>
        </span>
      ))}
    </div>
  );
}
