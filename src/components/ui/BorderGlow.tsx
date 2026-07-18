import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BorderGlowProps {
  children: ReactNode;
  /** How far (px) from an edge the cursor must be for the glow to react. */
  edgeSensitivity?: number;
  /** Glow color as an "R G B" triplet (space-separated). Defaults to forest. */
  glowColor?: string;
  /** Card background — a dark surface makes the glow read best. */
  backgroundColor?: string;
  /** Corner radius in px. */
  borderRadius?: number;
  /** Radius (px) of the cursor light travelling along the border. */
  glowRadius?: number;
  /** Opacity multiplier for the glow (crank up to make it pop). */
  glowIntensity?: number;
  /** Softness of the cursor cone, 0–100. */
  coneSpread?: number;
  /** Continuously flow the border colors even without hovering. */
  animated?: boolean;
  /** Colors used for the animated flowing border. */
  colors?: string[];
  /** Border thickness in px. */
  borderWidth?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * BorderGlow — a card whose border lights up under the cursor near its edges,
 * with an ambient halo behind it. Retuned to the Liv Functional palette
 * (forest / coral / gold on ink). React Bits-inspired, rebuilt in TS + Tailwind.
 */
export function BorderGlow({
  children,
  edgeSensitivity = 60,
  glowColor = "0 108 69",
  backgroundColor = "#0a1612",
  borderRadius = 28,
  glowRadius = 120,
  glowIntensity = 1,
  coneSpread = 25,
  animated = false,
  colors = ["#006c45", "#ff5757", "#a89160"],
  borderWidth = 1.5,
  className,
  style,
}: BorderGlowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState({ x: 0, y: 0, o: 0 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    // Distance to the nearest edge → proximity ramps up as we approach a border.
    const edge = Math.min(x, y, r.width - x, r.height - y);
    const prox = Math.max(0, 1 - edge / Math.max(1, edgeSensitivity));
    setGlow({ x, y, o: prox });
  };

  const spread = 40 + (100 - coneSpread) * 0.4; // % where the cursor light fades out
  const cursorGradient = `radial-gradient(${glowRadius}px circle at ${glow.x}px ${glow.y}px, rgb(${glowColor} / ${0.9 * glowIntensity}), rgb(${glowColor} / 0.12) ${spread}%, transparent 78%)`;
  const flowGradient = `linear-gradient(90deg, ${colors.join(", ")}, ${colors[0]})`;

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setGlow((g) => ({ ...g, o: 0 }))}
      className={cn("relative isolate", className)}
      style={{ background: backgroundColor, borderRadius, ...style }}
    >
      {/* Ambient halo behind the card */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-1 -z-10 blur-2xl transition-opacity duration-300",
          animated && "animate-shimmer"
        )}
        style={{
          borderRadius: borderRadius + 6,
          opacity: (animated ? 0.5 : 0.28) + glow.o * 0.6 * glowIntensity,
          background: animated ? flowGradient : `radial-gradient(60% 60% at 50% 50%, rgb(${glowColor} / 0.55), transparent 70%)`,
          backgroundSize: animated ? "200% 100%" : undefined,
        }}
      />

      {/* Glowing border ring (mask keeps only the border area painted) */}
      <div
        aria-hidden
        className={cn("pointer-events-none absolute inset-0", animated && "animate-shimmer")}
        style={{
          borderRadius,
          padding: borderWidth,
          background: animated ? flowGradient : cursorGradient,
          backgroundSize: animated ? "200% 100%" : undefined,
          opacity: animated ? 1 : 0.35 + glow.o * glowIntensity,
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* Extra cursor light on top of an animated border, so it still tracks */}
      {animated && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            borderRadius,
            padding: borderWidth,
            background: cursorGradient,
            opacity: glow.o * glowIntensity,
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default BorderGlow;
