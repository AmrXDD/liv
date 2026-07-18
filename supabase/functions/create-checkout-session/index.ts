// Supabase Edge Function: create-checkout-session
//   - Re-validates each line item against the products table (DIY only).
//   - Creates a Stripe Checkout Session with metadata referencing our order id.
//   - Inserts a pending order row keyed by stripe_session_id.
//   - Returns { url } for the browser to redirect to.
//
// Env required:
//   STRIPE_SECRET_KEY            (sk_live_… or rk_live_… with Checkout write scope)
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   SITE_URL                     e.g. https://livfunctional.com
//   ALLOWED_ORIGINS  (optional)  comma-separated CORS allowlist; defaults to SITE_URL only
//
// Stripe API is called via REST + fetch to avoid bundling an SDK.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---- CORS: allowlist only ----
function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = (req.headers.get("origin") ?? "").replace(/\/+$/, "");
  const siteUrl = (Deno.env.get("SITE_URL") ?? "").replace(/\/+$/, "");
  const extra = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  const allowed = new Set<string>([siteUrl, ...extra].filter(Boolean));
  // Auto-include the www. counterpart of SITE_URL (and vice versa) so
  // www. and apex variants both work without env-var gymnastics.
  for (const e of [siteUrl, ...extra]) {
    if (!e) continue;
    if (e.includes("://www.")) allowed.add(e.replace("://www.", "://"));
    else allowed.add(e.replace("://", "://www."));
  }

  const allowOrigin = allowed.has(origin) ? origin : siteUrl;

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-app",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

// Currencies whose smallest unit is *not* 1/100 of the major unit.
// https://stripe.com/docs/currencies#zero-decimal
const ZERO_DECIMAL = new Set([
  "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf",
  "ugx", "vnd", "vuv", "xaf", "xof", "xpf",
]);
const THREE_DECIMAL = new Set(["bhd", "jod", "kwd", "omr", "tnd"]);

function toMinorUnits(amount: number, currency: string): number {
  const c = currency.toLowerCase();
  if (ZERO_DECIMAL.has(c)) return Math.round(amount);
  if (THREE_DECIMAL.has(c)) return Math.round(amount * 1000);
  return Math.round(amount * 100);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface IncomingItem {
  product_id: string;
  qty: number;
}

interface IncomingPayload {
  items: IncomingItem[];
  email: string;
  name: string;
  phone?: string;
  notes?: string;
  locale?: "en" | "ar";
}

Deno.serve(async (req) => {
  const cors = buildCorsHeaders(req);

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: cors });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const siteUrl = Deno.env.get("SITE_URL");
    if (!stripeKey) throw new Error("Missing STRIPE_SECRET_KEY");
    if (!siteUrl) throw new Error("Missing SITE_URL");

    let payload: IncomingPayload;
    try {
      payload = (await req.json()) as IncomingPayload;
    } catch {
      return jsonError("Invalid JSON", 400, cors);
    }

    // ---- Input validation ----
    if (!payload?.items || !Array.isArray(payload.items) || payload.items.length === 0) {
      return jsonError("No items", 400, cors);
    }
    if (payload.items.length > 20) {
      return jsonError("Too many items", 400, cors);
    }
    const email = String(payload.email ?? "").trim().toLowerCase();
    const name = String(payload.name ?? "").trim();
    if (!email || !EMAIL_RE.test(email) || email.length > 200) {
      return jsonError("Invalid email", 400, cors);
    }
    if (!name || name.length < 2 || name.length > 120) {
      return jsonError("Invalid name", 400, cors);
    }
    const phone = payload.phone ? String(payload.phone).trim().slice(0, 40) : null;
    const notes = payload.notes ? String(payload.notes).trim().slice(0, 2000) : null;
    const locale: "en" | "ar" = payload.locale === "ar" ? "ar" : "en";

    for (const it of payload.items) {
      if (!it || typeof it.product_id !== "string" || !it.product_id) {
        return jsonError("Invalid item", 400, cors);
      }
      const q = Number(it.qty);
      if (!Number.isFinite(q) || q < 1 || q > 99) {
        return jsonError("Invalid quantity", 400, cors);
      }
    }

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Server-side price + product validation
    const ids = Array.from(new Set(payload.items.map((i) => i.product_id)));
    const { data: products, error: prodErr } = await sb
      .from("products")
      .select("id, slug, category, title_en, title_ar, price, currency, is_published, hero_image, download_url")
      .in("id", ids);
    if (prodErr) throw prodErr;
    if (!products?.length) return jsonError("Products not found", 400, cors);

    const byId = new Map(products.map((p) => [p.id as string, p]));

    // Only DIY products go through this checkout. Coaching/consultations use /apply.
    const validated = payload.items.map((item) => {
      const p = byId.get(item.product_id);
      if (!p) throw new Error(`Unknown product: ${item.product_id}`);
      if (p.is_published === false) throw new Error(`Product not available: ${p.slug}`);
      if (p.category !== "diy") throw new Error(`Only DIY products are sold via cart: ${p.slug}`);
      const qty = Math.max(1, Math.min(99, Math.floor(item.qty || 1)));
      return {
        product: p,
        qty,
        line_total: Number(p.price) * qty,
      };
    });

    const currency = (validated[0]?.product.currency ?? "USD").toLowerCase();
    if (validated.some((v) => (v.product.currency ?? "USD").toLowerCase() !== currency)) {
      return jsonError("Cart contains mixed currencies", 400, cors);
    }
    const subtotal = validated.reduce((s, v) => s + v.line_total, 0);

    // 2. Insert pending order — store the *server-validated* line items.
    const orderRow = {
      email,
      name,
      phone,
      items: validated.map((v) => ({
        product_id: v.product.id,
        slug: v.product.slug,
        category: v.product.category,
        title_en: v.product.title_en,
        title_ar: v.product.title_ar,
        price: Number(v.product.price),
        currency: v.product.currency,
        quantity: v.qty,
        hero_image: v.product.hero_image,
      })),
      subtotal,
      total: subtotal,
      currency: (currency.toUpperCase()),
      notes,
      status: "pending",
      locale,
    };

    const { data: order, error: orderErr } = await sb
      .from("orders")
      .insert(orderRow)
      .select("id")
      .single();
    if (orderErr) throw orderErr;

    // 3. Build Stripe Checkout Session via REST API (form-encoded).
    const form = new URLSearchParams();
    form.append("mode", "payment");
    form.append("ui_mode", "hosted");
    form.append("customer_email", email);
    form.append("success_url", `${siteUrl.replace(/\/+$/, "")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`);
    form.append("cancel_url", `${siteUrl.replace(/\/+$/, "")}/checkout/cancel`);
    form.append("payment_intent_data[metadata][order_id]", order.id as string);
    form.append("metadata[order_id]", order.id as string);
    form.append("metadata[locale]", locale);

    validated.forEach((v, i) => {
      const titleEn = (v.product.title_en as string) || v.product.slug;
      const titleAr = (v.product.title_ar as string) || "";
      form.append(`line_items[${i}][quantity]`, String(v.qty));
      form.append(`line_items[${i}][price_data][currency]`, currency);
      form.append(`line_items[${i}][price_data][unit_amount]`, String(toMinorUnits(Number(v.product.price), currency)));
      form.append(`line_items[${i}][price_data][product_data][name]`, titleEn);
      if (titleAr) {
        form.append(`line_items[${i}][price_data][product_data][description]`, titleAr);
      }
      if (v.product.hero_image) {
        form.append(`line_items[${i}][price_data][product_data][images][0]`, v.product.hero_image as string);
      }
      form.append(`line_items[${i}][price_data][product_data][metadata][slug]`, v.product.slug as string);
      form.append(`line_items[${i}][price_data][product_data][metadata][product_id]`, v.product.id as string);
    });

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Stripe-Version": "2024-06-20",
      },
      body: form.toString(),
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok) {
      // Mark order as failed so it doesn't sit pending forever.
      await sb.from("orders").update({ status: "cancelled" }).eq("id", order.id);
      console.error("[create-checkout-session] stripe error", session);
      return jsonError(session?.error?.message ?? "Stripe session failed", 502, cors);
    }

    // 4. Persist the session id back on the order
    await sb.from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id, order_id: order.id }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[create-checkout-session]", e);
    return jsonError((e as Error).message ?? "Server error", 500, cors);
  }
});

function jsonError(message: string, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
