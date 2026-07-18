import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { cn, formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const { isOpen, close, items, subtotal, currency, updateQty, removeItem } = useCart();
  const { pathname } = useLocation();

  // Cart open state lives in context above <Routes>, so it persists across
  // navigation. Auto-close only on actual pathname change — not on every
  // re-render. (close's identity changes when isOpen flips, so we cannot
  // depend on it directly without auto-closing the drawer we just opened.)
  const prevPath = useRef(pathname);
  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      close();
    }
  }, [pathname, close]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  return (
    <>
      <div
        onClick={close}
        className={cn(
          "fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />
      <aside
        aria-label="Cart"
        className={cn(
          "fixed top-0 end-0 z-[61] h-full w-full max-w-md bg-surface-base shadow-2xl transition-transform duration-500 ease-editorial",
          "flex flex-col",
          isOpen ? "translate-x-0" : "rtl:-translate-x-full ltr:translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <div>
            <div className="text-eyebrow uppercase text-ink-muted">
              {t("cart.title", { defaultValue: "Your cart" })}
            </div>
            <div className="display-serif text-2xl">
              {items.length} {items.length === 1 ? "item" : "items"}
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 hover:bg-ink hover:text-bone-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="display-serif text-2xl mb-2">
                {t("cart.empty", { defaultValue: "Your cart is empty" })}
              </div>
              <p className="mb-6 max-w-xs text-sm text-ink-muted">
                {t("cart.emptyHint", {
                  defaultValue: "Browse our DIY plans and coaching to get started.",
                })}
              </p>
              <Link
                to="/diy-plans"
                onClick={close}
                className="rounded-full bg-forest-500 px-5 py-2.5 text-sm font-semibold text-bone-50 hover:bg-forest-600"
              >
                {t("cart.shop", { defaultValue: "Shop plans" })}
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-4 rounded-2xl border border-ink/10 bg-surface-raised p-3"
                >
                  <div className="grid h-20 w-20 flex-shrink-0 place-items-center overflow-hidden rounded-xl bg-bone-100">
                    {item.image ? (
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="display-serif text-2xl text-forest-700">
                        {item.title[lang][0]}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/${item.category === "diy" ? "diy-plans" : "coaching"}/${item.slug}`}
                        onClick={close}
                        className="text-sm font-semibold leading-snug hover:text-coral-600"
                      >
                        {item.title[lang]}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        aria-label="Remove"
                        className="text-ink-muted hover:text-coral-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-xs text-ink-muted">
                      {item.category === "diy" ? "DIY plan" : "Coaching"}
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="inline-flex items-center rounded-full border border-ink/10">
                        <button
                          type="button"
                          onClick={() => updateQty(item.productId, item.qty - 1)}
                          className="grid h-8 w-8 place-items-center hover:text-coral-600"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.productId, item.qty + 1)}
                          className="grid h-8 w-8 place-items-center hover:text-coral-600"
                          aria-label="Increase"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-sm font-semibold text-forest-700">
                        {formatPrice(item.price * item.qty, item.currency)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-ink/10 px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-ink-muted">
                {t("cart.subtotal", { defaultValue: "Subtotal" })}
              </span>
              <span className="display-serif text-2xl text-forest-700">
                {formatPrice(subtotal, currency)}
              </span>
            </div>
            <Link
              to="/checkout"
              onClick={close}
              className="block w-full rounded-full bg-forest-500 px-6 py-3.5 text-center text-sm font-semibold text-bone-50 transition-colors hover:bg-forest-600"
            >
              {t("cart.checkout", { defaultValue: "Checkout" })}
            </Link>
            <p className="mt-3 text-center text-xs text-ink-muted">
              {t("cart.taxNote", { defaultValue: "Taxes and fees calculated at checkout." })}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
