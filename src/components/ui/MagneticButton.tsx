import { type ReactNode } from "react";
import { useMagnetic } from "@/hooks/useMagnetic";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface Props {
  to?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
  strength?: number;
}

export function MagneticButton({ to, href, onClick, className, children, strength }: Props) {
  const ref = useMagnetic<HTMLAnchorElement | HTMLButtonElement>({ strength });
  const cls = cn(
    "btn-primary relative isolate",
    "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-forest-400/0 before:to-forest-400/40 before:opacity-0 before:transition-opacity before:duration-500",
    "hover:before:opacity-100",
    className
  );

  if (to) {
    return (
      <Link
        to={to}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={cls}
        onClick={onClick}
      >
        <span className="relative z-10">{children}</span>
      </Link>
    );
  }
  if (href) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={cls}
        onClick={onClick}
      >
        <span className="relative z-10">{children}</span>
      </a>
    );
  }
  return (
    <button
      type="button"
      ref={ref as React.Ref<HTMLButtonElement>}
      onClick={onClick}
      className={cls}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
