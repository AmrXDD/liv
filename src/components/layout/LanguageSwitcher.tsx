import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const next = i18n.language?.startsWith("ar") ? "en" : "ar";

  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(next)}
      className={cn(
        "group inline-flex items-center gap-1.5 text-eyebrow uppercase font-semibold",
        "px-3 py-1.5 rounded-full border border-current/15 hover:border-current/50 transition-colors",
        className
      )}
      aria-label={t("nav.language")}
    >
      <span className="opacity-70 group-hover:opacity-100">{i18n.language?.startsWith("ar") ? "AR" : "EN"}</span>
      <span aria-hidden className="opacity-40">/</span>
      <span>{t("nav.language")}</span>
    </button>
  );
}
