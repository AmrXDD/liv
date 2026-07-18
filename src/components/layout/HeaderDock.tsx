import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "@/components/ui/Button";
import { CartButton } from "@/components/cart/CartButton";
import { CartDrawer } from "@/components/cart/CartDrawer";

/**
 * Slim header for the dock-navigation experience: centred logo with the
 * language switcher, cart and "book" CTA kept in the bar. Main navigation
 * lives in the floating <NavDock />. Shorter than the original header.
 */
export function HeaderDock() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-editorial",
          scrolled
            ? "bg-surface-base/80 backdrop-blur-xl border-b border-ink/5 py-2"
            : "bg-transparent py-2.5"
        )}
      >
        <div
          dir="ltr"
          className="relative mx-auto flex max-w-[1440px] items-center justify-between px-4 md:justify-end md:px-8 lg:px-12"
        >
          <Link
            to="/"
            dir="ltr"
            aria-label="Liv Functional"
            className="group flex shrink-0 items-center gap-1.5 md:absolute md:left-1/2 md:-translate-x-1/2"
          >
            <img
              src="/liv-logo.png"
              alt="Liv"
              className="h-9 w-auto transition-transform duration-700 ease-editorial group-hover:scale-[1.06] group-hover:rotate-[-3deg] sm:h-10"
            />
            <span className="display-serif hidden min-[380px]:inline-block text-lg font-semibold tracking-tight leading-none text-coral-500 transition-all duration-700 ease-editorial group-hover:translate-x-0.5 group-hover:text-forest-600 sm:text-xl">
              Functional
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            <LanguageSwitcher className="hidden md:inline-flex" />
            <LanguageSwitcher compact className="md:hidden" />
            <CartButton />
            <Button
              to="/consultations"
              variant="primary"
              size="sm"
              arrow
              className="hidden md:inline-flex"
            >
              {t("nav.bookFree")}
            </Button>
            <Button
              to="/consultations"
              variant="primary"
              size="sm"
              arrow
              className="md:hidden"
            >
              {t("nav.book", { defaultValue: "Book" })}
            </Button>
          </div>
        </div>
      </header>

      <CartDrawer />
    </>
  );
}
