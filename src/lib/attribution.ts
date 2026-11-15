/**
 * Campaign tags (UTM) for the current visit.
 *
 * Instagram DM links arrive as e.g. /quiz?utm_source=instagram&utm_medium=dm&utm_campaign=quiz_balloon.
 * The tags are only in the address bar of the first page, so they are saved here on landing and
 * read back later when a quiz lead or an order is created.
 *
 * - Saved in sessionStorage: lasts for this visit (this tab), including the trip to Stripe and back.
 * - First landing wins: later pages in the same visit never overwrite the saved tags.
 * - Only these marketing tags are kept. Never put health information in a tag.
 */

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "ref", "src"] as const;

export type Attribution = Partial<Record<(typeof UTM_KEYS)[number], string>>;

const STORAGE_KEY = "liv-utm-v1";
const MAX_LEN = 120;

/** In-memory copy, so the tags still work for this page load when storage is blocked. */
let memory: Attribution | null = null;

function fromSearch(search: string): Attribution {
  const params = new URLSearchParams(search);
  const out: Attribution = {};
  for (const k of UTM_KEYS) {
    const v = params.get(k)?.trim();
    if (v) out[k] = v.slice(0, MAX_LEN);
  }
  return out;
}

function readStored(): Attribution | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const out: Attribution = {};
    for (const k of UTM_KEYS) {
      const v = (parsed as Record<string, unknown>)[k];
      if (typeof v === "string" && v) out[k] = v.slice(0, MAX_LEN);
    }
    return Object.keys(out).length > 0 ? out : null;
  } catch {
    return null;
  }
}

/** Call once when the app starts, before the router can change the address. */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  const stored = readStored();
  if (stored) {
    memory = stored;
    return;
  }
  const found = fromSearch(window.location.search);
  if (Object.keys(found).length === 0) return;
  memory = found;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
  } catch {
    // storage blocked: the in-memory copy still covers this page load
  }
}

/** The tags saved for this visit ({} when the visitor did not arrive from a tagged link). */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  return { ...(readStored() ?? memory ?? {}) };
}
