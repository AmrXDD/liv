// Resend transactional email helper for Supabase Edge Functions.
//
// Required secrets (set with `supabase secrets set ...`):
//   RESEND_API_KEY        — Resend API key (re_...)
//   RESEND_FROM           — Verified "from" address
//   RESEND_REPLY_TO       — optional reply-to address
//   ADMIN_NOTIFY_EMAIL    — internal address for admin notifications
//
// Optional template aliases — when set, the corresponding event uses the
// Resend-hosted template instead of the inline HTML below:
//   RESEND_TEMPLATE_DIGITAL_DOWNLOAD                  (DIY purchase)
//   RESEND_TEMPLATE_BOOKING_CONFIRMATION              (consultation)
//   RESEND_TEMPLATE_COACHING_APPLICATION_CONFIRMATION (Apply form)
//   RESEND_TEMPLATE_CONTACT_US_REPLY                  (generic contact form)
//   RESEND_TEMPLATE_WELCOME_NEWSLETTER                (newsletter signup)
//   RESEND_TEMPLATE_ORDER_CONFIRMATION                (any paid order — optional)
//   RESEND_TEMPLATE_ADMIN_ORDER_ALERT                 (admin alert — optional)

const DEFAULT_FROM = "Liv Functional <info@livfunctional.com>";
const DEFAULT_REPLY_TO = "info@livfunctional.com";
const DEFAULT_ADMIN = "info@livfunctional.com";

export function getAdminNotifyEmail(): string {
  return Deno.env.get("ADMIN_NOTIFY_EMAIL") ?? DEFAULT_ADMIN;
}

export function getTemplateAlias(
  key:
    | "DIGITAL_DOWNLOAD"
    | "BOOKING_CONFIRMATION"
    | "COACHING_APPLICATION_CONFIRMATION"
    | "CONTACT_US_REPLY"
    | "WELCOME_NEWSLETTER"
    | "ORDER_CONFIRMATION"
    | "ADMIN_ORDER_ALERT",
): string | undefined {
  const v = Deno.env.get(`RESEND_TEMPLATE_${key}`);
  return v && v.length > 0 ? v : undefined;
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
  bcc?: string | string[];
  tags?: Array<{ name: string; value: string }>;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email via Resend's REST API. Returns { ok: false } instead of
 * throwing — callers should never let a failed email break the primary
 * action (order fulfilment, booking, etc.).
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("[resend] RESEND_API_KEY not set — skipping send");
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }
  const defaultFrom = Deno.env.get("RESEND_FROM") ?? DEFAULT_FROM;
  const defaultReply = Deno.env.get("RESEND_REPLY_TO") ?? DEFAULT_REPLY_TO;

  const body = {
    from: input.from ?? defaultFrom,
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject: input.subject,
    html: input.html,
    text: input.text,
    reply_to: input.replyTo ?? defaultReply,
    bcc: input.bcc,
    tags: input.tags,
  };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[resend] send failed", res.status, text);
      return { ok: false, error: `${res.status}: ${text}` };
    }
    const json = (await res.json()) as { id?: string };
    return { ok: true, id: json.id };
  } catch (e) {
    console.error("[resend] send threw", e);
    return { ok: false, error: (e as Error).message };
  }
}

export interface SendTemplateInput {
  to: string | string[];
  templateId: string;
  variables: Record<string, string | number>;
  subject?: string;
  replyTo?: string;
  from?: string;
  bcc?: string | string[];
  tags?: Array<{ name: string; value: string }>;
}

/**
 * Send via a Resend-hosted template (Dashboard → Templates). The template body
 * cannot be combined with html/text/react. `id` accepts either the template's
 * UUID or its alias. Variable values must be strings ≤ 2000 chars or numbers.
 */
export async function sendTemplate(input: SendTemplateInput): Promise<SendEmailResult> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("[resend] RESEND_API_KEY not set — skipping template send");
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }
  const defaultFrom = Deno.env.get("RESEND_FROM") ?? DEFAULT_FROM;
  const defaultReply = Deno.env.get("RESEND_REPLY_TO") ?? DEFAULT_REPLY_TO;

  // Coerce values to strings/numbers and clip strings to Resend's 2000-char cap.
  const variables: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(input.variables)) {
    if (typeof v === "number") {
      variables[k] = v;
    } else {
      const s = String(v ?? "");
      variables[k] = s.length > 2000 ? s.slice(0, 2000) : s;
    }
  }

  const body: Record<string, unknown> = {
    from: input.from ?? defaultFrom,
    to: Array.isArray(input.to) ? input.to : [input.to],
    reply_to: input.replyTo ?? defaultReply,
    bcc: input.bcc,
    tags: input.tags,
    template: { id: input.templateId, variables },
  };
  if (input.subject) body.subject = input.subject;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[resend] template send failed", res.status, text);
      return { ok: false, error: `${res.status}: ${text}` };
    }
    const json = (await res.json()) as { id?: string };
    return { ok: true, id: json.id };
  } catch (e) {
    console.error("[resend] template send threw", e);
    return { ok: false, error: (e as Error).message };
  }
}

// ---- Minimal, brand-aware templates ------------------------------------------

const BRAND_PRIMARY = "#006c45";
const BRAND_CORAL = "#ff5757";

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;background:#faf7f2;font-family:'Cairo',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1c1c1c;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="font-size:22px;font-weight:700;letter-spacing:-0.01em;">
      Liv <span style="color:${BRAND_CORAL};">Functional</span>
    </div>
    <div style="margin-top:24px;background:#ffffff;border-radius:20px;padding:32px;box-shadow:0 1px 0 rgba(0,0,0,0.04);">
      ${bodyHtml}
    </div>
    <div style="margin-top:24px;font-size:12px;color:#7a756c;text-align:center;">
      © ${new Date().getFullYear()} Liv Functional · livfunctional.com
    </div>
  </div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function digitalOrderEmail(opts: {
  name?: string | null;
  productTitle: string;
  downloadUrl: string;
  expiresAt: string;
  locale: "en" | "ar";
}): { subject: string; html: string; text: string } {
  const isAr = opts.locale === "ar";
  const subject = isAr
    ? `تنزيلك جاهز: ${opts.productTitle}`
    : `Your download is ready: ${opts.productTitle}`;
  const greeting = opts.name
    ? (isAr ? `مرحباً ${opts.name}،` : `Hi ${opts.name},`)
    : (isAr ? "مرحباً،" : "Hi there,");
  const body = isAr
    ? `<p>${greeting}</p>
       <p>شكراً لشرائك <strong>${escapeHtml(opts.productTitle)}</strong>. اضغطي على الزر أدناه لتنزيل ملفك. الرابط فعّال حتى ${new Date(opts.expiresAt).toLocaleDateString("ar")}.</p>`
    : `<p>${greeting}</p>
       <p>Thanks for purchasing <strong>${escapeHtml(opts.productTitle)}</strong>. Tap the button below to download your file. The link is active until ${new Date(opts.expiresAt).toLocaleDateString("en-GB")}.</p>`;

  const html = layout(subject, `
    ${body}
    <p style="margin:28px 0;">
      <a href="${opts.downloadUrl}"
         style="display:inline-block;background:${BRAND_PRIMARY};color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:600;">
        ${isAr ? "تنزيل الملف" : "Download your file"}
      </a>
    </p>
    <p style="font-size:13px;color:#7a756c;">
      ${isAr
        ? "إذا لم يعمل الزر، انسخي هذا الرابط:"
        : "If the button doesn't work, copy this link:"}<br>
      <a href="${opts.downloadUrl}" style="color:${BRAND_PRIMARY};word-break:break-all;">${opts.downloadUrl}</a>
    </p>
  `);
  const text = `${greeting}\n\n${isAr ? "تنزيلك" : "Your download"}: ${opts.downloadUrl}\n${isAr ? "ينتهي" : "Expires"}: ${opts.expiresAt}\n`;
  return { subject, html, text };
}

export function bookingConfirmationEmail(opts: {
  name: string;
  date: string;
  time: string;
  locale: "en" | "ar";
  htmlLink?: string;
  topic?: string;
}): { subject: string; html: string; text: string } {
  const isAr = opts.locale === "ar";
  const subject = isAr
    ? `تم تأكيد جلستك — ${opts.date} ${opts.time}`
    : `Your consultation is confirmed — ${opts.date} ${opts.time}`;
  const body = isAr
    ? `<p>مرحباً ${escapeHtml(opts.name)}،</p>
       <p>تم تأكيد جلستك المجانية في <strong>${opts.date}</strong> الساعة <strong>${opts.time}</strong> (توقيت الكويت).</p>`
    : `<p>Hi ${escapeHtml(opts.name)},</p>
       <p>Your free consultation is confirmed for <strong>${opts.date}</strong> at <strong>${opts.time}</strong> (Asia/Kuwait).</p>`;
  const html = layout(subject, `
    ${body}
    ${opts.topic ? `<p style="color:#7a756c;font-size:13px;">${isAr ? "الموضوع" : "Topic"}: ${escapeHtml(opts.topic)}</p>` : ""}
    ${opts.htmlLink
      ? `<p style="margin:24px 0;">
          <a href="${opts.htmlLink}" style="display:inline-block;background:${BRAND_PRIMARY};color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:600;">
            ${isAr ? "إضافة إلى التقويم" : "Add to calendar"}
          </a>
         </p>`
      : ""}
  `);
  const text = `${isAr ? "تم تأكيد جلستك" : "Confirmed"}: ${opts.date} ${opts.time}${opts.htmlLink ? `\n${opts.htmlLink}` : ""}`;
  return { subject, html, text };
}

export function orderConfirmationEmail(opts: {
  name?: string | null;
  orderId: string;
  items: Array<{ title: string; quantity: number; price: number }>;
  total: number;
  currency: string;
  locale: "en" | "ar";
}): { subject: string; html: string; text: string } {
  const isAr = opts.locale === "ar";
  const subject = isAr
    ? `تأكيد طلبك — Liv Functional`
    : `Order confirmed — Liv Functional`;
  const greeting = opts.name
    ? (isAr ? `مرحباً ${escapeHtml(opts.name)}،` : `Hi ${escapeHtml(opts.name)},`)
    : (isAr ? "مرحباً،" : "Hi there,");
  const lede = isAr
    ? `<p>${greeting}</p><p>شكراً لطلبك. إليك ملخص ما اشتريت:</p>`
    : `<p>${greeting}</p><p>Thanks for your order. Here's what you bought:</p>`;
  const rows = opts.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${escapeHtml(i.title)} × ${i.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:end;">${(i.price * i.quantity).toFixed(2)} ${opts.currency}</td>
      </tr>`,
    )
    .join("");
  const html = layout(subject, `
    ${lede}
    <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px;">
      ${rows}
      <tr><td style="padding:12px 0;font-weight:700;">${isAr ? "الإجمالي" : "Total"}</td>
          <td style="padding:12px 0;font-weight:700;text-align:end;color:${BRAND_PRIMARY};">${opts.total.toFixed(2)} ${opts.currency}</td></tr>
    </table>
    <p style="font-size:12px;color:#7a756c;margin-top:20px;">${isAr ? "رقم الطلب" : "Order ID"}: ${escapeHtml(opts.orderId)}</p>
  `);
  const text = `${greeting}\n\n${isAr ? "تأكيد طلبك" : "Order confirmed"}: ${opts.orderId}\n${isAr ? "الإجمالي" : "Total"}: ${opts.total.toFixed(2)} ${opts.currency}`;
  return { subject, html, text };
}

export function adminOrderAlertEmail(opts: {
  orderId: string;
  customerEmail: string;
  customerName?: string | null;
  items: Array<{ title: string; quantity: number; price: number }>;
  total: number;
  currency: string;
}): { subject: string; html: string; text: string } {
  const subject = `💰 New order: ${opts.total.toFixed(2)} ${opts.currency} — ${opts.customerEmail}`;
  const rows = opts.items
    .map((i) => `<tr><td>${escapeHtml(i.title)} × ${i.quantity}</td><td style="text-align:end;">${(i.price * i.quantity).toFixed(2)} ${opts.currency}</td></tr>`)
    .join("");
  const html = layout(subject, `
    <p><strong>${escapeHtml(opts.customerName ?? opts.customerEmail)}</strong> just placed an order.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:14px;">${rows}
      <tr><td style="padding-top:8px;font-weight:700;">Total</td><td style="text-align:end;font-weight:700;color:${BRAND_PRIMARY};">${opts.total.toFixed(2)} ${opts.currency}</td></tr>
    </table>
    <p style="font-size:12px;color:#7a756c;margin-top:16px;">Order ${escapeHtml(opts.orderId)} · <a href="mailto:${opts.customerEmail}" style="color:${BRAND_PRIMARY};">${escapeHtml(opts.customerEmail)}</a></p>
  `);
  const text = `New order ${opts.orderId} from ${opts.customerEmail}: ${opts.total.toFixed(2)} ${opts.currency}`;
  return { subject, html, text };
}

export function contactNotificationEmail(opts: {
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
}): { subject: string; html: string; text: string } {
  const subject = `New contact form: ${opts.name}`;
  const html = layout(subject, `
    <p><strong>${escapeHtml(opts.name)}</strong> sent a message via the contact form.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px;">
      <tr><td style="padding:6px 0;color:#7a756c;width:80px;">Email</td><td><a href="mailto:${opts.email}" style="color:${BRAND_PRIMARY};">${escapeHtml(opts.email)}</a></td></tr>
      <tr><td style="padding:6px 0;color:#7a756c;">Phone</td><td><a href="tel:${opts.phone}" style="color:${BRAND_PRIMARY};">${escapeHtml(opts.phone)}</a></td></tr>
      ${opts.subject ? `<tr><td style="padding:6px 0;color:#7a756c;">Subject</td><td>${escapeHtml(opts.subject)}</td></tr>` : ""}
    </table>
    <div style="margin-top:20px;padding:16px;background:#faf7f2;border-radius:12px;white-space:pre-wrap;">${escapeHtml(opts.message)}</div>
  `);
  const text = `${opts.name} <${opts.email}> (${opts.phone})\n\n${opts.message}`;
  return { subject, html, text };
}
