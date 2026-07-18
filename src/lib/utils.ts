import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CURRENCY_ALIASES: Record<string, string> = {
  KD: "KWD",
  DH: "AED",
  SR: "SAR",
  LE: "EGP",
  EGP$: "EGP",
};

function normalizeCurrency(currency: string): string {
  const code = (currency ?? "").trim().toUpperCase();
  return CURRENCY_ALIASES[code] ?? code;
}

export function formatPrice(amount: number, currency = "USD", locale = "en-US") {
  if (!amount || amount <= 0) {
    return locale.startsWith("ar") ? "حسب الطلب" : "On quote";
  }
  const code = normalizeCurrency(currency) || "USD";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    const num = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(amount);
    return `${num} ${code}`.trim();
  }
}

export function slugify(text: string) {
  const base = (text ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  // Arabic-only or all-punctuation titles strip to empty above; fall back to a
  // stable random suffix so the post still gets a routable URL.
  if (base) return base;
  return `post-${Math.random().toString(36).slice(2, 8)}`;
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export const isBrowser = typeof window !== "undefined";

export function prefersReducedMotion(): boolean {
  if (!isBrowser) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function formatDate(iso: string, locale = "en-US") {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}
