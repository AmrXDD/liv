import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useDirection } from "@/hooks/useDirection";

type Variant = "primary" | "secondary" | "ghost" | "link";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  to?: string;
  href?: string;
  arrow?: boolean;
  children: ReactNode;
  className?: string;
}

const variantClass: Record<Variant, string> = {
  primary: "bg-forest-500 text-bone-50 hover:bg-forest-600 shadow-glow",
  secondary: "bg-coral-500 text-bone-50 hover:bg-coral-600 shadow-coral",
  ghost: "border border-ink/15 text-ink hover:bg-ink hover:text-bone-50 hover:border-ink",
  link: "text-forest-700 hover:text-forest-900 underline-offset-4 hover:underline px-0",
};

const sizeClass: Record<Size, string> = {
  sm: "px-4 py-2.5 text-xs",
  md: "px-6 py-3.5 text-sm",
  lg: "px-8 py-4 text-base",
};

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">
>(
  (
    { variant = "primary", size = "md", to, href, arrow, children, className, ...rest },
    ref
  ) => {
    const { isRtl } = useDirection();
    const classes = cn(
      "group inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide",
      "transition-all duration-300 ease-editorial relative overflow-hidden",
      variant !== "link" && sizeClass[size],
      variantClass[variant],
      className
    );

    const inner = (
      <>
        <span className="relative z-10 flex items-center gap-2">
          {children}
          {arrow && (
            <ArrowUpRight
              className={cn(
                "h-4 w-4 transition-transform duration-300 ease-editorial",
                "group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                isRtl && "flip-rtl"
              )}
              strokeWidth={2.25}
            />
          )}
        </span>
      </>
    );

    if (to) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          to={to}
          className={classes}
          {...(rest as Record<string, unknown>)}
        >
          {inner}
        </Link>
      );
    }
    if (href) {
      return (
        <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={classes}>
          {inner}
        </a>
      );
    }
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} className={classes} {...rest}>
        {inner}
      </button>
    );
  }
);
Button.displayName = "Button";
