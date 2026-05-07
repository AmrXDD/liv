import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "@/components/ui/Button";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const items = [
    { to: "/diy-plans", label: t("nav.diy") },
    { to: "/consultations", label: t("nav.consultations") },
    { to: "/coaching", label: t("nav.coaching") },
    { to: "/why-us", label: t("nav.whyUs") },
    { to: "/my-story", label: t("nav.myStory") },
    { to: "/contact", label: t("nav.contact") },
    { to: "/blog", label: t("nav.blog") },
    { to: "/how-it-works", label: t("nav.howItWorks") },
    { to: "/faq", label: t("nav.faq") },
    { to: "/b2b", label: t("nav.b2b") },
    { to: "/recommended", label: t("nav.recommended") },
  ];

  return (
    <div
      className={cn(
        "fixed inset-0 z-[150] lg:hidden transition-opacity duration-500",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("nav.close")}
      />
      <div
        className={cn(
          "absolute inset-y-0 end-0 flex w-full max-w-sm flex-col bg-surface-base shadow-elevation transition-transform duration-500 ease-editorial",
          open ? "translate-x-0" : "rtl:-translate-x-full ltr:translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-ink/5 px-6 py-5">
          <span className="display-serif text-lg font-semibold">
            Liv <span className="text-coral-500">Functional</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-ink/15"
            aria-label={t("nav.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-8" aria-label="Mobile">
          <ul className="space-y-1">
            {items.map((it, idx) => (
              <li key={it.to}>
                <Link
                  to={it.to}
                  onClick={onClose}
                  className="group flex min-h-[44px] items-center justify-between rounded-2xl px-4 py-3 text-xl sm:text-2xl font-semibold tracking-tight hover:bg-bone-100"
                >
                  <span className="display-serif">{it.label}</span>
                  <span className="text-eyebrow text-forest-500">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-ink/5 px-6 py-6 space-y-4">
          <LanguageSwitcher />
          <Button to="/consultations" variant="primary" arrow className="w-full">
            {t("nav.bookFree")}
          </Button>
        </div>
      </div>
    </div>
  );
}
