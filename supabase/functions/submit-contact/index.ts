// Supabase Edge Function: submit-contact
// - Inserts a contacts row (service-role, bypasses RLS but already-public insert)
// - Notifies the team via Resend (ADMIN_NOTIFY_EMAIL)
//
// Env required:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   RESEND_API_KEY, RESEND_FROM   (see _shared/resend.ts)
//   ADMIN_NOTIFY_EMAIL            (where the notification email is delivered)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmail, contactNotificationEmail, getAdminNotifyEmail } from "../_shared/resend.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-app",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ContactInput {
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
  locale?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const input = (await req.json()) as ContactInput;
    if (!input?.name || !input?.email || !input?.phone || !input?.message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { error: dbErr } = await sb.from("contacts").insert({
      name: input.name,
      email: input.email,
      phone: input.phone,
      subject: input.subject ?? null,
      message: input.message,
      locale: (input.locale ?? "en").startsWith("ar") ? "ar" : "en",
    });
    if (dbErr) throw dbErr;

    const adminTo = getAdminNotifyEmail();
    const { subject, html, text } = contactNotificationEmail({
      name: input.name,
      email: input.email,
      phone: input.phone,
      subject: input.subject,
      message: input.message,
    });
    await sendEmail({
      to: adminTo,
      subject,
      html,
      text,
      replyTo: input.email,
      tags: [{ name: "type", value: "contact-form" }],
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[submit-contact] error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
