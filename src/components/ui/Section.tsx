import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: "section" | "div" | "article";
  variant?: "default" | "raised" | "sunken" | "ink" | "forest";
  children: ReactNode;
  pad?: "sm" | "md" | "lg" | "xl";
}

const variants = {
  default: "bg-surface-base text-ink",
  raised: "bg-surface-raised text-ink",
  sunken: "bg-surface-sunken text-ink",
  ink: "bg-ink text-bone-50",
  forest: "bg-forest-500 text-bone-50",
} as const;

const pads = {
  sm: "py-12 md:py-16",
  md: "py-20 md:py-28",
  lg: "py-28 md:py-40",
  xl: "py-32 md:py-52",
} as const;

export function Section({
  as: Tag = "section",
  variant = "default",
  pad = "md",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Tag
      className={cn("relative overflow-hidden", variants[variant], pads[pad], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
