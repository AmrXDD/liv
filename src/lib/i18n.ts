import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "@/content/en.json";
import ar from "@/content/ar.json";

export const SUPPORTED_LANGS = ["en", "ar"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export const RTL_LANGS: Lang[] = ["ar"];
export const isRtl = (lang: string): boolean => RTL_LANGS.includes(lang as Lang);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGS as unknown as string[],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "liv-lang",
    },
    react: { useSuspense: false },
  });

const applyDirection = (lng: string) => {
  if (typeof document === "undefined") return;
  const dir = isRtl(lng) ? "rtl" : "ltr";
  document.documentElement.lang = lng;
  document.documentElement.dir = dir;
};

i18n.on("languageChanged", applyDirection);
applyDirection(i18n.language || "en");

export default i18n;
