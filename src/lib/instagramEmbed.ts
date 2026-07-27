import { useEffect } from "react";

// Instagram's embed.js exposes window.instgrm.Embeds.process().
declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const EMBED_SRC = "https://www.instagram.com/embed.js";
const IG_BQ_STYLE =
  "background:#FFF;border:0;border-radius:3px;box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15);margin:1px auto;max-width:540px;min-width:326px;padding:0;width:99.375%;";

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.instgrm?.Embeds) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve) => {
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
 * Upgrade any *legacy* raw Instagram <iframe> (from earlier versions) into the
 * official blockquote. Instagram blocks raw iframes with X-Frame-Options: DENY,
 * so those never played — converting them lets embed.js render them properly.
 * embed.js's own generated iframes carry the `instagram-media` class and are
 * skipped, so this never fights the script.
 */
function upgradeLegacyIframes(): void {
  const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe[src*="instagram.com"]');
  iframes.forEach((f) => {
    if (f.className.includes("instagram-media")) return; // embed.js-rendered — leave it
    const src = f.getAttribute("src") || "";
    const m = src.match(/instagram\.com\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
    if (!m) return;
    const type = m[1].toLowerCase() === "reels" ? "reel" : m[1].toLowerCase();
    const permalink = `https://www.instagram.com/${type}/${m[2]}/`;

    const bq = document.createElement("blockquote");
    bq.className = "instagram-media";
    bq.setAttribute("data-instgrm-permalink", permalink);
    bq.setAttribute("data-instgrm-version", "14");
    bq.setAttribute("style", IG_BQ_STYLE);
    const a = document.createElement("a");
    a.href = permalink;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = "View this post on Instagram";
    bq.appendChild(a);

    // Replace the iframe (and our old aspect wrapper if present).
    const wrapper = f.closest("div[data-embed]");
    (wrapper ?? f).replaceWith(bq);
  });
}

/**
 * Turn any Instagram embed in the DOM into a live, playable embed. Handles both
 * the current blockquote markup and legacy raw iframes. Loads embed.js on first
 * use. This is the only way Instagram reels/posts render on a third-party site.
 */
export function processInstagramEmbeds(): void {
  if (typeof document === "undefined") return;
  upgradeLegacyIframes();
  if (!document.querySelector("blockquote.instagram-media")) return;
  const run = () => window.instgrm?.Embeds?.process();
  if (window.instgrm?.Embeds) run();
  else loadScript().then(run);
}

/**
 * Re-run Instagram embed processing whenever `dep` changes (a post's body, a
 * page's blocks). Fires a few times so late-injected or re-rendered content
 * (e.g. content fetched from Supabase after mount) still gets processed.
 */
export function useInstagramEmbeds(dep?: unknown): void {
  useEffect(() => {
    const timers = [50, 400, 1200, 2500].map((ms) =>
      window.setTimeout(processInstagramEmbeds, ms)
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [dep]);
}
