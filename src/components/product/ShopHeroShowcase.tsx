import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { useDirection } from "@/hooks/useDirection";

const coverShadow =
  "shadow-[0_45px_80px_-30px_rgba(0,40,25,0.55),0_14px_28px_-14px_rgba(0,40,25,0.35)]";

/**
 * Shop hero visual: the shop's product covers fanned like books on a table,
 * framed by hairline rings, with a glass card for the featured product.
 */
export function ShopHeroShowcase({ products, isLoading }: { products: Product[]; isLoading: boolean }) {
  const { t, i18n } = useTranslation();
  const { isRtl } = useDirection();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";

  const withCover = products.filter((p) => p.heroImage || p.images?.[0]);
  const featured = withCover.find((p) => p.badge?.en?.toLowerCase() === "new") ?? withCover[0];
  const second = withCover.find((p) => p !== featured);

  if (!isLoading && !featured) return null;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[480px] lg:me-0">
      {/* Frame: gold hairline ring, slow dashed orbit, soft light */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="absolute aspect-square w-[96%] rounded-full border border-bone-400/50" />
        <div className="absolute aspect-square w-[78%] rounded-full border border-dashed border-forest-500/25 motion-safe:animate-[spin_90s_linear_infinite]" />
        <div className="absolute aspect-square w-[70%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0)_70%)]" />
        <Sparkle className="absolute start-[8%] top-[18%] h-3.5 w-3.5" />
        <Sparkle className="absolute end-[6%] top-[46%] h-2.5 w-2.5" />
        <Sparkle className="absolute bottom-[10%] start-[30%] h-2 w-2" />
      </div>

      {isLoading ? (
        <>
          <div className="absolute left-[12%] top-[15%] aspect-[2/3] w-[44%] -rotate-[8deg] animate-pulse rounded-[10px] bg-bone-200" />
          <div className="absolute right-[12%] top-[9%] aspect-[2/3] w-[46%] rotate-[5deg] animate-pulse rounded-[10px] bg-bone-300/70" />
        </>
      ) : (
        <>
          {second && (
            <Link
              to={`/shop/${second.slug}`}
              aria-label={second.title[lang]}
              className="group absolute left-[10%] top-[15%] w-[44%] motion-safe:animate-floaty [animation-delay:-3s]"
            >
              <Cover
                product={second}
                lang={lang}
                className="-rotate-[8deg] transition-transform duration-700 ease-editorial group-hover:-translate-y-2 group-hover:-rotate-[5deg]"
              />
            </Link>
          )}
          {featured && (
            <Link
              to={`/shop/${featured.slug}`}
              aria-label={featured.title[lang]}
              className={cn(
                "group absolute top-[9%] w-[46%] motion-safe:animate-floaty",
                second ? "right-[10%]" : "left-[27%]"
              )}
            >
              <Cover
                product={featured}
                lang={lang}
                className={cn(
                  "transition-transform duration-700 ease-editorial group-hover:-translate-y-2",
                  second && "rotate-[5deg] group-hover:rotate-[2deg]"
                )}
              />
            </Link>
          )}

          {featured && (
            <Link
              to={`/shop/${featured.slug}`}
              className="group absolute bottom-[4%] start-0 flex w-[78%] items-center gap-4 rounded-lg border border-white/70 bg-white/70 p-4 shadow-elevation backdrop-blur-xl transition-transform duration-500 ease-editorial hover:-translate-y-1"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-eyebrow uppercase text-bone-500">
                  <Sparkle className="h-2.5 w-2.5" />
                  {featured.badge?.[lang] || t("shop.hero.featured")}
                </div>
                <div className="mt-1.5 truncate text-sm font-semibold text-ink">{featured.title[lang]}</div>
                <div className="mt-0.5 text-xs text-ink-muted">
                  {t("shop.hero.from")}{" "}
                  <span className="font-bold text-forest-700">{formatPrice(featured.price, featured.currency)}</span>
                </div>
              </div>
              <span
                aria-hidden
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-bone-50 transition-all duration-500 group-hover:rotate-45 group-hover:bg-forest-500"
              >
                <ArrowUpRight className={cn("h-4 w-4", isRtl && "flip-rtl")} strokeWidth={2} />
              </span>
            </Link>
          )}
        </>
      )}
    </div>
  );
}

function Cover({ product, lang, className }: { product: Product; lang: "en" | "ar"; className?: string }) {
  return (
    <div className={cn("relative aspect-[2/3] overflow-hidden rounded-[10px] bg-bone-100 ring-1 ring-black/5", coverShadow, className)}>
      <img
        src={product.heroImage ?? product.images?.[0]}
        alt={product.title[lang]}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Spine shading + page sheen so the cover reads as a physical book */}
      <div className="absolute inset-y-0 left-0 w-[9%] bg-gradient-to-r from-black/30 via-white/15 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/20" />
    </div>
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("text-bone-400", className)} fill="currentColor">
      <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z" />
    </svg>
  );
}
