import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

/** Short medical disclaimer shown next to purchase, application, and consultation CTAs. */
export function MedicalDisclaimer({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <p className={cn("text-xs leading-relaxed text-ink-muted", className)}>{t("disclaimer")}</p>
  );
}
