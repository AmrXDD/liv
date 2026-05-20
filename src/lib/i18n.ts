import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "@/content/en.json";
import ar from "@/content/ar.json";
import {
  getOverride,
  loadOverrides,
  subscribeOverrides,
  getContentManifest,
} from "@/lib/content";

export const SUPPORTED_LANGS = ["en", "ar"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export const RTL_LANGS: Lang[] = ["ar"];
export const isRtl = (lang: string): boolean => RTL_LANGS.includes(lang as Lang);

// PostProcessor that lets a Supabase `site_content` row override the JSON value.
// Runs after i18next has resolved the key against the JSON resources.
const siteContentPostProcessor = {
  type: "postProcessor" as const,
  name: "siteContent",
  process(
    value: string,
    key: string | string[],
    options: Record<string, unknown> | undefined,
    translator: { language: string }
  ) {
    const k = Array.isArray(key) ? key[0] : key;
    if (!k) return value;
    const lang = (translator?.language ?? i18n.language ?? "en").startsWith("ar") ? "ar" : "en";
    const override = getOverride(k, lang);
    if (override == null) return value;
    if (typeof override !== "string" || !override.includes("{{")) return override;
    // Re-run interpolation on the override so placeholders like {{product}}
    // resolve against the same options i18next received.
    return override.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, name: string) => {
      const v = options?.[name];
      return v == null ? "" : String(v);
    });
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(siteContentPostProcessor)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGS as unknown as string[],
    interpolation: { escapeValue: false },
    detection: {
      order: ["querystring", "localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupQuerystring: "lang",
      lookupLocalStorage: "liv-lang",
    },
    react: { useSuspense: false },
    postProcess: ["siteContent"],
  });

// Sync override Map → i18next resource tree, so `returnObjects: true` reads
// also pick up admin overrides (e.g. hero.metrics, services.items).
function syncOverridesToResources() {
  const manifest = getContentManifest();
  for (const entry of manifest) {
    const en = getOverride(entry.contentKey, "en");
    const ar = getOverride(entry.contentKey, "ar");
    if (en !== null) i18n.addResource("en", "translation", entry.contentKey, en);
    if (ar !== null) i18n.addResource("ar", "translation", entry.contentKey, ar);
  }
}

// Kick off override fetch (non-blocking). Once it resolves, push overrides
// into the resource tree and re-emit so consumers re-render.
void loadOverrides().then(() => {
  syncOverridesToResources();
  i18n.emit("languageChanged", i18n.language);
});

// Whenever an override is added/changed/cleared from the admin, push the
// change into the resource tree and force consumers to re-render.
subscribeOverrides(() => {
  syncOverridesToResources();
  i18n.emit("languageChanged", i18n.language);
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
