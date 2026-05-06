import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Check, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { useDirection } from "@/hooks/useDirection";
import { useCart } from "@/lib/cart";

interface Props {
  product: Product;
  variant?: "default" | "wide" | "ink";
}

const accentBg = {
  forest: "from-forest-100 to-forest-200/60",
  coral: "from-coral-100 to-coral-200/60",
  bone: "from-bone-100 to-bone-200/70",
} as const;

const accentText = {
  forest: "text-forest-700",
  coral: "text-coral-600",
  bone: "text-bone-500",
} as const;

export function ProductCard({ product, variant = "default" }: Props) {
  const { t, i18n } = useTranslation();
  const { isRtl } = useDirection();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const accent = product.accent ?? "forest";

  return (
    <article
      className={cn(
        "group relative isolate overflow-hidden rounded-3xl bg-surface-raised border border-ink/10",
        "transition-all duration-500 ease-editorial hover:-translate-y-1 hover:shadow-elevation",
        variant === "wide" && "md:flex md:items-stretch"
      )}
    >
      <div
        className={cn(
          "relative aspect-[4/3] overflow-hidden bg-gradient-to-br",
          accentBg[accent],
          variant === "wide" && "md:w-[42%]"
        )}
      >
        {product.heroImage || product.images?.[0] ? (
          <img
            src={product.heroImage ?? product.images?.[0]}
            alt={product.title[lang]}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-grain opacity-40 mix-blend-multiply pointer-events-none" />
            <div className="absolute inset-0 grid place-items-center">
              <div
                className={cn(
                  "display-serif text-[14vw] sm:text-[16vw] md:text-[160px] leading-none font-bold tracking-tightest opacity-30 transition-transform duration-700 ease-editorial",
                  "group-hover:scale-110",
                  accentText[accent]
                )}
              >
                {product.title[lang].split(" ").pop()?.[0]}
              </div>
            </div>
          </>
        )}
        {product.badge && (
          <div className="absolute top-5 start-5 inline-flex items-center gap-1.5 rounded-full bg-ink/90 px-3 py-1.5 text-eyebrow uppercase text-bone-50">
            <span className="h-1.5 w-1.5 rounded-full bg-coral-500" />
            {product.badge[lang]}
          </div>
        )}
        <div className="absolute end-5 top-5 grid h-12 w-12 place-items-center rounded-full bg-bone-50/90 backdrop-blur-md text-ink transition-all duration-500 group-hover:bg-ink group-hover:text-bone-50 group-hover:rotate-45">
          <ArrowUpRight className={cn("h-5 w-5", isRtl && "flip-rtl")} strokeWidth={1.75} />
        </div>
      </div>

      <div className={cn("p-7", variant === "wide" && "md:flex-1 md:p-10")}>
        {product.format && (
          <div className="text-eyebrow uppercase text-ink-muted mb-3">
            {product.format} · {product.duration?.[lang]}
          </div>
        )}
        <h3 className="display-serif text-2xl tracking-tight">{product.title[lang]}</h3>
        <p className="mt-3 line-clamp-2 text-sm text-ink-muted leading-relaxed">
          {product.tagline[lang]}
        </p>

        <div className="mt-6 flex items-end justify-between border-t border-ink/10 pt-6">
          <div>
            <div className="text-eyebrow uppercase text-ink-muted">{t("common.from")}</div>
            <div className="display-serif text-2xl text-forest-700">
              {formatPrice(product.price, product.currency)}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addItem(product, 1);
              setAdded(true);
              setTimeout(() => setAdded(false), 1400);
            }}
            className={cn(
              "inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold transition-colors",
              added
                ? "bg-forest-500 text-bone-50"
                : "bg-ink text-bone-50 hover:bg-coral-600"
            )}
          >
            {added ? <Check className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
            {added
              ? t("cart.added", { defaultValue: "Added" })
              : t("cart.add", { defaultValue: "Add to cart" })}
          </button>
        </div>
      </div>
    </article>
  );
}
