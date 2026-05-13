import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { Button } from "@/components/ui/Button";
import { CartButton } from "@/components/cart/CartButton";
import { CartDrawer } from "@/components/cart/CartDrawer";

export function Header() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAboutOpen(false);
  }, [location.pathname]);

  const aboutItems = [
    { href: "/about", label: t("nav.about") },
    { href: "/why-us", label: t("nav.whyUs") },
    { href: "/my-story", label: t("nav.myStory") },
    { href: "/contact", label: t("nav.contact") },
  ];

  const navItem = (to: string, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "relative text-sm font-medium transition-colors",
          "after:absolute after:start-0 after:-bottom-1 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300",
          "hover:after:w-full",
          isActive && "after:w-full"
        )
      }
    >
      {label}
    </NavLink>
  );

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-editorial",
          scrolled
            ? "bg-surface-base/80 backdrop-blur-xl border-b border-ink/5 py-3"
            : "bg-transparent py-5"
        )}
      >
        <div dir="ltr" className="mx-auto flex max-w-[1440px] items-center justify-between px-5 md:px-8 lg:px-12 xl:px-16">
          <Link
            to="/"
            dir="ltr"
            className="group flex items-center gap-1.5"
            aria-label="Liv Functional"
          >
            <img
              src="/liv-logo.png"
              alt="Liv"
              className="h-11 w-auto transition-transform duration-700 ease-editorial group-hover:scale-[1.06] group-hover:rotate-[-3deg]"
            />
            <span
              className="display-serif text-xl font-semibold tracking-tight leading-none inline-block text-coral-500 transition-all duration-700 ease-editorial group-hover:translate-x-0.5 group-hover:text-forest-600"
            >
              Functional
            </span>
          </Link>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
            {navItem("/diy-plans", t("nav.diy"))}
            {navItem("/consultations", t("nav.consultations"))}
            {navItem("/coaching", t("nav.coaching"))}

            <div
              className="relative"
              onMouseEnter={() => setAboutOpen(true)}
              onMouseLeave={() => setAboutOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-sm font-medium"
                onClick={() => setAboutOpen((o) => !o)}
                aria-expanded={aboutOpen}
              >
                {t("nav.about")}
                <ChevronDown
                  className={cn("h-3.5 w-3.5 transition-transform duration-300", aboutOpen && "rotate-180")}
                />
              </button>
              <div
                className={cn(
                  "absolute start-0 top-full w-56 pt-3",
                  "transition-all duration-300 ease-editorial origin-top",
                  aboutOpen
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 -translate-y-2 pointer-events-none"
                )}
                role="menu"
              >
                <div className="rounded-2xl bg-surface-raised p-2 shadow-elevation border border-ink/5">
                  {aboutItems.map((it) => (
                    <Link
                      key={it.href}
                      to={it.href}
                      className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-bone-100 transition-colors"
                      role="menuitem"
                    >
                      {it.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {navItem("/blog", t("nav.blog"))}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher className="hidden md:inline-flex" />
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
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden grid h-10 w-10 place-items-center rounded-full border border-ink/15"
              aria-label={t("nav.menu")}
            >
              <span className="sr-only">{t("nav.menu")}</span>
              <span className="flex flex-col gap-1.5">
                <span className="block h-px w-5 bg-current" />
                <span className="block h-px w-5 bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CartDrawer />
    </>
  );
}
