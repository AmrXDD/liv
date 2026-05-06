import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { useDirection } from "@/hooks/useDirection";

interface MarqueeProps {
  items: ReactNode[];
  speed?: number;
  className?: string;
  separator?: ReactNode;
}

export function Marquee({ items, speed = 60, className, separator }: MarqueeProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { isRtl } = useDirection();

  useEffect(() => {
    const track = ref.current;
    if (!track) return;
    if (prefersReducedMotion()) return;

    const totalWidth = track.scrollWidth / 2;
    const distance = totalWidth;
    const duration = distance / speed;

    const tween = gsap.to(track, {
      x: isRtl ? distance : -distance,
      duration,
      ease: "none",
      repeat: -1,
    });

    return () => {
      tween.kill();
    };
  }, [speed, items.length, isRtl]);

  const sep = separator ?? <span className="mx-6 opacity-40">✦</span>;

  return (
    <div className={cn("overflow-hidden", className)}>
      <div ref={ref} className="flex w-max items-center will-change-transform">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center text-display-md font-semibold tracking-tightest whitespace-nowrap"
          >
            {item}
            {sep}
          </span>
        ))}
      </div>
    </div>
  );
}
