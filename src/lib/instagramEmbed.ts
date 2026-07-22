import { useEffect } from "react";

// Instagram's embed.js exposes window.instgrm.Embeds.process().
declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const EMBED_SRC = "https://www.instagram.com/embed.js";
let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.instgrm?.Embeds) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${EMBED_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      // If it already loaded, resolve on next tick.
      if (window.instgrm?.Embeds) resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = EMBED_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.body.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Turn any `<blockquote class="instagram-media">` currently in the DOM into a
 * live Instagram embed. Loads embed.js on first use. Instagram forbids raw
 * iframes (X-Frame-Options: DENY), so this script-based flow is the only way
 * their reels/posts render on a third-party site — and it also auto-sizes them.
 */
export function processInstagramEmbeds(): void {
  if (typeof document === "undefined") return;
  if (!document.querySelector(".instagram-media")) return;
  if (window.instgrm?.Embeds) {
    window.instgrm.Embeds.process();
  } else {
    loadScript().then(() => window.instgrm?.Embeds?.process());
  }
}

/**
 * Re-run Instagram embed processing whenever `dep` changes (e.g. a blog post's
 * body HTML, or a page's blocks). A short delay lets the injected HTML land in
 * the DOM first.
 */
export function useInstagramEmbeds(dep?: unknown): void {
  useEffect(() => {
    const t = window.setTimeout(processInstagramEmbeds, 50);
    return () => window.clearTimeout(t);
  }, [dep]);
}
