// Supabase Edge Function: stripe-webhook
//   - Verifies Stripe signature using STRIPE_WEBHOOK_SECRET.
//   - On checkout.session.completed: marks order paid + creates digital_orders
//     rows for each DIY line item (so the success page can serve downloads).
//   - On checkout.session.expired / async_payment_failed: marks order cancelled.
//
// IMPORTANT: deploy this function with `--no-verify-jwt` so Stripe (an
// unauthenticated source) can hit it. Do NOT add CORS headers — webhooks are
// server-to-server only.
//
// Env required:
//   STRIPE_SECRET_KEY            (read scope on Checkout Sessions / line items)
//   STRIPE_WEBHOOK_SECRET        (whsec_…)
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  sendEmail,
  sendTemplate,
  digitalOrderEmail,
  orderConfirmationEmail,
  adminOrderAlertEmail,
  getAdminNotifyEmail,
  getTemplateAlias,
} from "../_shared/resend.ts";

const DOWNLOAD_TTL_DAYS = 7;

// ---- Stripe signature verification (manual; no SDK) ----
async function verifyStripeSignature(
  rawBody: string,
  sigHeader: string | null,
  secret: string,
  toleranceSeconds = 300,
): Promise<boolean> {
  if (!sigHeader) return false;
  const parts = Object.fromEntries(
    sigHeader.split(",").map((kv) => kv.split("=").map((s) => s.trim()) as [string, string]),
  );
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;

  const ts = Number(t);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Date.now() / 1000 - ts) > toleranceSeconds) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${rawBody}`));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time compare
  if (expected.length !== v1.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  }
  return mismatch === 0;
}

interface StripeSession {
  id: string;
  payment_intent?: string | null;
  payment_status?: string;
  customer_email?: string | null;
  customer_details?: { email?: string | null; name?: string | null } | null;
  metadata?: Record<string, string>;
  amount_total?: number | null;
  currency?: string | null;
}

async function listSessionLineItems(
  sessionId: string,
  stripeKey: string,
): Promise<Array<{ price?: { product?: string }; quantity?: number }>> {
  const items: Array<{ price?: { product?: string }; quantity?: number }> = [];
  let url = `https://api.stripe.com/v1/checkout/sessions/${sessionId}/line_items?limit=100&expand[]=data.price.product`;
  while (url) {
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${stripeKey}`, "Stripe-Version": "2024-06-20" },
    });
    if (!r.ok) throw new Error(`stripe line_items failed: ${await r.text()}`);
    const j = await r.json();
    for (const x of j.data ?? []) items.push(x);
    if (j.has_more && j.data?.length) {
      const last = j.data[j.data.length - 1];
      url = `https://api.stripe.com/v1/checkout/sessions/${sessionId}/line_items?limit=100&starting_after=${last.id}&expand[]=data.price.product`;
    } else {
      url = "";
    }
  }
  return items;
}

async function fulfillCheckoutSession(
  sb: SupabaseClient,
  session: StripeSession,
  stripeKey: string,
): Promise<void> {
  const orderId = session.metadata?.order_id;
  const sessionId = session.id;
  if (!orderId) {
    console.warn("[stripe-webhook] session missing order_id metadata", sessionId);
    return;
  }

  // Idempotency — if already paid, no-op.
  const { data: existing } = await sb
    .from("orders")
    .select("id, status, items, locale, email, name, total, currency")
    .eq("id", orderId)
    .maybeSingle();
  if (!existing) {
    console.warn("[stripe-webhook] order not found", orderId);
    return;
  }
  if (existing.status === "paid") return;

  // Mark order paid
  const { error: updErr } = await sb
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_payment_intent: session.payment_intent ?? null,
      stripe_session_id: sessionId,
    })
    .eq("id", orderId);
  if (updErr) throw updErr;

  // Create digital_orders rows for each DIY item so the success page can show
  // downloads + the customer has a permanent record.
  const items = (existing.items as Array<{
    product_id: string;
    slug: string;
    category: string;
    title_en?: string;
    title_ar?: string;
    price: number;
    currency: string;
    quantity: number;
  }>) ?? [];

  // Pre-fetch product download URLs (so the confirmation email + Thank You page
  // can both surface a download button for any product that has a file attached,
  // not just DIY plans). NOTE: the products table has split title_en/title_ar
  // columns — selecting a non-existent "title" column makes PostgREST return an
  // error and `data` becomes null, which previously caused every digital_orders
  // row to be inserted with download_url=null (no email attachment, no button).
  const productIds = Array.from(new Set(items.map((i) => i.product_id))).filter(Boolean);
  let downloadByProductId = new Map<string, string | null>();
  let prodRows: Array<{ id: string; slug: string; download_url: string | null; title_en: string | null; title_ar: string | null }> = [];
  if (productIds.length > 0) {
    const { data, error: prodErr } = await sb
      .from("products")
      .select("id, slug, download_url, title_en, title_ar")
      .in("id", productIds);
    if (prodErr) {
      console.error("[stripe-webhook] products select failed", prodErr);
    }
    prodRows = (data ?? []) as typeof prodRows;
    downloadByProductId = new Map(prodRows.map((p) => [p.id, p.download_url ?? null]));
    console.log("[stripe-webhook] product downloads resolved", {
      productIds,
      resolved: Array.from(downloadByProductId.entries()),
    });
  }

  // Insert digital_orders rows FIRST so the Thank You page (which polls by
  // stripe_session_id) can render the download button immediately, before the
  // slower Resend email round-trips below. One row per item; download_url
  // can be null (UI then shows "Sent by email").
  const expiresAt = new Date(Date.now() + DOWNLOAD_TTL_DAYS * 24 * 3600 * 1000).toISOString();
  const rows = items.map((i) => ({
    email: existing.email,
    product_slug: i.slug,
    locale: existing.locale ?? "en",
    amount_paid: i.price * i.quantity,
    payment_ref: session.payment_intent ?? null,
    download_url: downloadByProductId.get(i.product_id) ?? null,
    download_expires_at: expiresAt,
    fulfilled: true,
    order_id: orderId,
    stripe_session_id: sessionId,
  }));
  if (rows.length > 0) {
    const { error: dErr } = await sb.from("digital_orders").insert(rows);
    if (dErr) console.error("[stripe-webhook] digital_orders insert failed", dErr);
    console.log("[stripe-webhook] digital_orders inserted", {
      count: rows.length,
      withDownload: rows.filter((r) => r.download_url).length,
      urls: rows.map((r) => r.download_url),
    });
  }

  // ---- Customer order-confirmation email (every purchase, any category) ----
  if (existing.email && items.length > 0) {
    const locale = existing.locale === "ar" ? "ar" : "en";
    const summary = items.map((i) => ({
      title: (locale === "ar" ? i.title_ar : i.title_en) ?? i.slug,
      quantity: i.quantity,
      price: i.price,
      downloadUrl: downloadByProductId.get(i.product_id) ?? null,
    }));
    const total = Number(existing.total ?? summary.reduce((s, i) => s + i.price * i.quantity, 0));
    const currency = existing.currency ?? items[0]?.currency ?? "USD";
    const confirm = orderConfirmationEmail({
      name: (existing as { name?: string | null }).name ?? session.customer_details?.name ?? null,
      orderId,
      items: summary,
      total,
      currency,
      locale,
    });
    // Attach the actual product file(s) so the customer receives the PDF/zip
    // directly in their inbox (not just a link). Resend fetches each `path`
    // server-side and inlines it as a real email attachment. The URL MUST be
    // absolute (https://…); relative paths like "/downloads/foo.pdf" will be
    // dropped here because Resend can't reach them.
    const attachments = summary
      .filter((i) => typeof i.downloadUrl === "string" && /^https?:\/\//i.test(i.downloadUrl as string))
      .map((i) => {
        const url = (i.downloadUrl as string).trim();
        const filename = (url.split("/").pop() ?? "download").split("?")[0];
        return { filename, path: url };
      });
    console.log("[stripe-webhook] attachments planned", {
      totalItems: summary.length,
      attached: attachments.length,
      list: attachments,
      droppedBecauseRelativeOrEmpty: summary
        .filter((i) => !i.downloadUrl || !/^https?:\/\//i.test(i.downloadUrl as string))
        .map((i) => ({ title: i.title, url: i.downloadUrl })),
    });

    const customerSend = await sendEmail({
      to: existing.email,
      subject: confirm.subject,
      html: confirm.html,
      text: confirm.text,
      attachments: attachments.length > 0 ? attachments : undefined,
      tags: [{ name: "type", value: "order-confirmation" }],
    });
    console.log("[stripe-webhook] customer email", { to: existing.email, ok: customerSend.ok, id: customerSend.id, error: customerSend.error, attachments: attachments.length });

    // Admin alert — fire-and-forget
    const alert = adminOrderAlertEmail({
      orderId,
      customerEmail: existing.email,
      customerName: (existing as { name?: string | null }).name ?? session.customer_details?.name ?? null,
      items: summary,
      total,
      currency,
    });
    const adminSend = await sendEmail({
      to: getAdminNotifyEmail(),
      subject: alert.subject,
      html: alert.html,
      text: alert.text,
      tags: [{ name: "type", value: "admin-order-alert" }],
    });
    console.log("[stripe-webhook] admin email", { to: getAdminNotifyEmail(), ok: adminSend.ok, id: adminSend.id, error: adminSend.error });
  } else {
    console.warn("[stripe-webhook] skipped emails", { hasEmail: !!existing.email, itemCount: items.length });
  }

  // Email the download link(s) to the customer via Resend (non-blocking on
  // failure — the success page is still the source of truth).
  if (existing.email) {
    const titleBySlug = new Map(
      prodRows.map((p) => [p.slug, p.title_en ?? p.title_ar ?? p.slug]),
    );
    const diyTemplate = getTemplateAlias("DIGITAL_DOWNLOAD");
    for (const row of rows) {
      if (!row.download_url) continue;
      const productTitle = titleBySlug.get(row.product_slug) ?? row.product_slug;
      const customerName = session.customer_details?.name ?? null;
      const locale = row.locale === "ar" ? "ar" : "en";

      if (diyTemplate) {
        await sendTemplate({
          to: existing.email,
          templateId: diyTemplate,
          variables: {
            CUSTOMER_NAME: customerName ?? "",
            PRODUCT_TITLE: productTitle,
            DOWNLOAD_URL: row.download_url,
            EXPIRES_AT: new Date(row.download_expires_at).toLocaleDateString(
              locale === "ar" ? "ar" : "en-GB",
            ),
            ORDER_ID: orderId,
          },
          tags: [{ name: "type", value: "digital-order" }],
        });
      } else {
        const { subject, html, text } = digitalOrderEmail({
          name: customerName,
          productTitle,
          downloadUrl: row.download_url,
          expiresAt: row.download_expires_at,
          locale,
        });
        await sendEmail({
          to: existing.email,
          subject,
          html,
          text,
          tags: [{ name: "type", value: "digital-order" }],
        });
      }
    }
  }

  // Touch line items via Stripe API to keep an audit trail in logs (best-effort).
  try {
    await listSessionLineItems(sessionId, stripeKey);
  } catch (e) {
    console.warn("[stripe-webhook] line items fetch failed", e);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!secret || !stripeKey) return new Response("Server misconfigured", { status: 500 });

  const sigHeader = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  const ok = await verifyStripeSignature(rawBody, sigHeader, secret);
  if (!ok) {
    // TEMP DIAGNOSTIC — remove after signing secret is confirmed working
    const trimmedSecret = secret.trim();
    console.error("[stripe-webhook] signature verification failed", {
      secretLength: secret.length,
      secretTrimmedLength: trimmedSecret.length,
      secretPrefix: secret.slice(0, 8),
      secretSuffix: secret.slice(-4),
      hadWhitespace: secret !== trimmedSecret,
      startsWithWhsec: trimmedSecret.startsWith("whsec_"),
      sigHeaderPresent: !!sigHeader,
      sigHeaderSample: sigHeader?.slice(0, 40),
      bodyLength: rawBody.length,
    });
    return new Response("Invalid signature", { status: 400 });
  }

  let event: { type: string; data: { object: StripeSession } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        await fulfillCheckoutSession(sb, event.data.object, stripeKey);
        break;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object;
        const orderId = session.metadata?.order_id;
        if (orderId) {
          await sb.from("orders").update({ status: "cancelled" }).eq("id", orderId);
        }
        break;
      }
      default:
        // Acknowledge — Stripe expects a 2xx for events we don't handle.
        break;
    }
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[stripe-webhook] handler error", e);
    // Returning 500 makes Stripe retry, which is what we want for transient errors.
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
