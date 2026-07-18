// Supabase Edge Function: subscribe-newsletter
//   - Inserts a row into `newsletter` (idempotent — unique on email).
//   - Sends the welcome email via the Resend template
//     RESEND_TEMPLATE_WELCOME_NEWSLETTER.
//
// Env required:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   RESEND_API_KEY
//   RESEND_TEMPLATE_WELCOME_NEWSLETTER  (template alias)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendTemplate, getTemplateAlias } from "../_shared/resend.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-app",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface NewsletterInput {
  email: string;
  locale?: string;
  source?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const input = (await req.json()) as NewsletterInput;
    const email = (input?.email ?? "").trim().toLowerCase();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const locale = (input.locale ?? "en").startsWith("ar") ? "ar" : "en";

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Upsert by email — if they already subscribed, keep their original row but
    // clear any unsubscribed_at so the welcome can re-fire on resubscribe.
    const { error: dbErr } = await sb
      .from("newsletter")
      .upsert(
        { email, locale, source: input.source ?? "site", unsubscribed_at: null },
        { onConflict: "email" },
      );
    if (dbErr) throw dbErr;

    const welcomeTemplate = getTemplateAlias("WELCOME_NEWSLETTER");
    if (welcomeTemplate) {
      await sendTemplate({
        to: email,
        templateId: welcomeTemplate,
        variables: { LOCALE: locale },
        tags: [{ name: "type", value: "welcome-newsletter" }],
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[subscribe-newsletter] error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
