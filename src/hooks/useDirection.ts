import { useTranslation } from "react-i18next";
import { isRtl } from "@/lib/i18n";

export function useDirection() {
  const { i18n } = useTranslation();
  const lang = i18n.language || "en";
  return {
    lang,
    dir: isRtl(lang) ? ("rtl" as const) : ("ltr" as const),
    isRtl: isRtl(lang),
  };
}
