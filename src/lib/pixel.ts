type Fbq = (
  command: string,
  event: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string }
) => void;

export type PixelEvent =
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase"
  | "Lead";

/**
 * Fire a standard Meta Pixel event. Safe if the pixel is blocked or not loaded.
 *
 * Privacy rule (same as index.html): send IDs, values and currency only. Never send
 * product titles, quiz answers, lab values or anything that describes a health condition.
 */
export function trackPixel(
  event: PixelEvent,
  params?: Record<string, unknown>,
  eventID?: string
): void {
  try {
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    if (!fbq) return;
    if (eventID) fbq("track", event, params, { eventID });
    else if (params) fbq("track", event, params);
    else fbq("track", event);
  } catch {
    // Tracking must never break the page.
  }
}

/**
 * Quiz finished and contact details submitted. Sends only which quiz it was:
 * never answers, score, result band, name or phone number.
 * Fires at most once per quiz per visit, so a refresh or a retake does not count twice.
 */
export function trackQuizLead(quiz: string): void {
  const key = `liv-lead-tracked-${quiz}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    // storage blocked: fall through and fire for this submit
  }
  trackPixel("Lead", { content_category: "quiz", content_name: quiz });
}

/** Product slug as the content id, the same id InitiateCheckout and Purchase send. */
export function productParams(p: {
  slug: string;
  price: number;
  currency: string;
}): Record<string, unknown> {
  return {
    content_ids: [p.slug],
    content_type: "product",
    value: p.price,
    currency: p.currency,
  };
}
