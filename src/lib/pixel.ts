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

export function productParams(p: {
  id: string;
  price: number;
  currency: string;
}): Record<string, unknown> {
  return {
    content_ids: [p.id],
    content_type: "product",
    value: p.price,
    currency: p.currency,
  };
}
