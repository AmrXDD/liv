import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import type { Product } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { useDirection } from "@/hooks/useDirection";
import { smoothScrollTo } from "@/hooks/useLenis";
import { SELF_GUIDED_PATH } from "@/lib/routes";

/* ------------------------------------------------------------------
   Shared "luxury" pieces for the right-hand side of CollectionHero:
   a hairline-ring frame, a fanned image showcase, glass cards and the
   CTA + trust row that sits under the lede.
   ------------------------------------------------------------------ */

const liftShadow =
  "shadow-[0_45px_80px_-30px_rgba(0,40,25,0.55),0_14px_28px_-14px_rgba(0,40,25,0.35)]";

export interface ShowcaseItem {
  id: string;
  image: string;
  title: string;
  href: string;
  /** Small caps line above the title in the glass card (badge, category…). */
  label?: string;
  /** Line under the title (price, reading time…). */
  meta?: ReactNode;
}

/** Public URL for a product, by category. */
export function productHref(p: Product): string {
  if (p.category === "physical") return `/shop/${p.slug}`;
  if (p.category === "diy") return `${SELF_GUIDED_PATH}/${p.slug}`;
  return `/coaching/${p.slug}`;
}

/** Map products with an image into showcase items: "New" first, then paid, then free. */
export function productShowcaseItems(
  products: Product[],
  lang: "en" | "ar",
  fromLabel: string
): ShowcaseItem[] {
  const rank = (p: Product) => (p.badge?.en?.trim().toLowerCase() === "new" ? 2 : 0) + (p.price > 0 ? 1 : 0);
  return products
    .filter((p) => p.heroImage || p.images?.[0])
    .sort((a, b) => rank(b) - rank(a))
    .map((p) => ({
      id: p.id,
      image: (p.heroImage ?? p.images?.[0]) as string,
      title: p.title[lang],
      href: productHref(p),
      label: p.badge?.[lang],
      meta:
        p.price > 0 ? (
          <>
            {fromLabel} <span className="font-bold text-forest-700">{formatPrice(p.price, p.currency)}</span>
          </>
        ) : undefined,
    }));
}

/** Square stage with a gold hairline ring, slow dashed orbit, soft light and sparkles. */
export function HeroFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-[480px] [container-type:inline-size] lg:me-0", className)}>
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="absolute aspect-square w-[96%] rounded-full border border-bone-400/50" />
        <div className="absolute aspect-square w-[78%] rounded-full border border-dashed border-forest-500/25 motion-safe:animate-[spin_90s_linear_infinite]" />
        <div className="absolute aspect-square w-[70%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0)_70%)]" />
        <Sparkle className="absolute start-[8%] top-[18%] h-3.5 w-3.5" />
        <Sparkle className="absolute end-[6%] top-[46%] h-2.5 w-2.5" />
        <Sparkle className="absolute bottom-[10%] start-[30%] h-2 w-2" />
      </div>
      {children}
    </div>
  );
}

/**
 * Two images fanned like objects on a table plus a glass card for the
 * featured one. `book` = 2:3 covers with a spine shade; `tile` = images at their own shape.
 */
export function HeroShowcase({
  items,
  isLoading,
  shape = "tile",
  fallbackLabel,
}: {
  items: ShowcaseItem[];
  isLoading: boolean;
  shape?: "book" | "tile";
  /** Card label when the featured item has none. */
  fallbackLabel: string;
}) {
  const [featured, second] = items;
  if (!isLoading && !featured) return null;

  const isBook = shape === "book";
  const radius = isBook ? "rounded-[10px]" : "rounded-[1.1rem]";
  // Books fan side by side at a fixed 2:3. Tiles keep each image's own shape
  // (plan graphics are full of text, so never crop them) and step diagonally —
  // back one top-left, front one lower-right — so both headlines stay readable.
  const layout = isBook
    ? {
        back: "left-[10%] top-[15%] w-[44%]",
        backTilt: "-rotate-[8deg] group-hover:-rotate-[5deg]",
        front: second ? "right-[10%] top-[9%] w-[46%]" : "left-[27%] top-[9%] w-[46%]",
        frontTilt: second ? "rotate-[5deg] group-hover:rotate-[2deg]" : "",
        skeleton: "aspect-[2/3]",
      }
    : {
        back: "left-[3%] top-[7%] w-[54%]",
        backTilt: "-rotate-[6deg] group-hover:-rotate-[3deg]",
        front: second ? "right-[3%] top-[27%] w-[54%]" : "left-[20%] top-[14%] w-[60%]",
        frontTilt: second ? "rotate-[4deg] group-hover:rotate-[2deg]" : "",
        skeleton: "aspect-[5/4]",
      };

  return (
    <HeroFrame>
      {isLoading ? (
        <>
          <div className={cn("absolute -rotate-[6deg] animate-pulse bg-bone-200", layout.back, layout.skeleton, radius)} />
          <div className={cn("absolute rotate-[4deg] animate-pulse bg-bone-300/70", layout.front, layout.skeleton, radius)} />
        </>
      ) : (
        <>
          {second && (
            <Link
              to={second.href}
              aria-label={second.title}
              className={cn("group absolute motion-safe:animate-floaty [animation-delay:-3s]", layout.back)}
            >
              <Tile item={second} book={isBook} className={cn(radius, layout.backTilt, "group-hover:-translate-y-2")} />
            </Link>
          )}
          <Link
            to={featured.href}
            aria-label={featured.title}
            className={cn("group absolute motion-safe:animate-floaty", layout.front)}
          >
            <Tile item={featured} book={isBook} className={cn(radius, layout.frontTilt, "group-hover:-translate-y-2")} />
          </Link>
          <GlassLinkCard
            to={featured.href}
            label={featured.label || fallbackLabel}
            title={featured.title}
            meta={featured.meta}
            className="absolute bottom-[2%] start-0 z-10 w-[74%]"
          />
        </>
      )}
    </HeroFrame>
  );
}

function Tile({ item, className, book }: { item: ShowcaseItem; className?: string; book: boolean }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-bone-100 ring-1 ring-black/5 transition-transform duration-700 ease-editorial",
        liftShadow,
        book ? "aspect-[2/3]" : "w-fit max-w-full",
        className
      )}
    >
      <img
        src={item.image}
        alt={item.title}
        className={book ? "absolute inset-0 h-full w-full object-cover" : "block h-auto max-h-[56cqw] w-auto max-w-full"}
      />
      {book && (
        <div className="absolute inset-y-0 left-0 w-[9%] bg-gradient-to-r from-black/30 via-white/15 to-transparent" />
      )}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/20" />
    </div>
  );
}

/** Frosted card with a label, title, meta line and a round arrow. */
export function GlassLinkCard({
  to,
  label,
  title,
  meta,
  className,
  external = false,
}: {
  to: string;
  label: string;
  title: string;
  meta?: ReactNode;
  className?: string;
  external?: boolean;
}) {
  const { isRtl } = useDirection();
  const cls = cn(
    "group flex items-center gap-4 rounded-lg border border-white/70 bg-white/70 p-4 shadow-elevation backdrop-blur-xl transition-transform duration-500 ease-editorial hover:-translate-y-1",
    className
  );
  const body = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-eyebrow uppercase text-bone-500">
          <Sparkle className="h-2.5 w-2.5" />
          <span className="truncate">{label}</span>
        </div>
        <div className="mt-1.5 truncate text-sm font-semibold text-ink">{title}</div>
        {meta && <div className="mt-0.5 truncate text-xs text-ink-muted">{meta}</div>}
      </div>
      <span
        aria-hidden
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-bone-50 transition-all duration-500 group-hover:rotate-45 group-hover:bg-forest-500"
      >
        <ArrowUpRight className={cn("h-4 w-4", isRtl && "flip-rtl")} strokeWidth={2} />
      </span>
    </>
  );
  return external ? (
    <a href={to} target="_blank" rel="noopener noreferrer" className={cls}>
      {body}
    </a>
  ) : (
    <Link to={to} className={cls}>
      {body}
    </Link>
  );
}

/** CTA button + small icon trust points shown under the hero lede. */
export function HeroActions({
  cta,
  points = [],
}: {
  cta: { label: string; icon: LucideIcon } & ({ scrollTo: string } | { to: string });
  points?: { icon: LucideIcon; label: string }[];
}) {
  const Icon = cta.icon;
  const { isRtl } = useDirection();
  return (
    <div className="flex flex-col gap-8">
      {"scrollTo" in cta ? (
        <a
          href={`#${cta.scrollTo}`}
          onClick={(e) => {
            e.preventDefault();
            smoothScrollTo(`#${cta.scrollTo}`, -40);
          }}
          className="btn-primary w-fit"
        >
          {cta.label}
          <Icon className={cn("h-4 w-4", isRtl && "flip-rtl")} />
        </a>
      ) : (
        <Link to={cta.to} className="btn-primary w-fit">
          {cta.label}
          <Icon className={cn("h-4 w-4", isRtl && "flip-rtl")} />
        </Link>
      )}
      {points.length > 0 && (
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-muted">
          {points.map(({ icon: PointIcon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-bone-400/60 bg-surface-raised/70 text-forest-700">
                <PointIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
              {label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("text-bone-400", className)} fill="currentColor">
      <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z" />
    </svg>
  );
}
