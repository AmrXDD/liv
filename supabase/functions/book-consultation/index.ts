// Supabase Edge Function: book-consultation
// - Inserts the booking row
// - Creates a Google Calendar event on the OPERATOR's calendar (service account)
// - Adds the guest as an attendee

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TZ = "Asia/Kuwait";
const DURATION_MIN = 30;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-app",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface BookingInput {
  name: string;
  email: string;
  phone?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  topic?: string;
  message?: string;
  locale?: string;
}

// ---- Service-account JWT → access token ----
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

function b64url(bytes: Uint8Array | string): string {
  const str = typeof bytes === "string"
    ? btoa(bytes)
    : btoa(String.fromCharCode(...bytes));
  return str.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getAccessToken(saEmail: string, privateKeyPem: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({
    iss: saEmail,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );
  const jwt = `${unsigned}.${b64url(new Uint8Array(sig))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`);
  const json = await res.json();
  return json.access_token as string;
}

function isoLocal(date: string, time: string, addMinutes = 0): string {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, hh, mm + addMinutes));
  // Calendar API will respect timeZone field; pass naive ISO without Z.
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    dt.getUTCFullYear() + "-" +
    pad(dt.getUTCMonth() + 1) + "-" +
    pad(dt.getUTCDate()) + "T" +
    pad(dt.getUTCHours()) + ":" +
    pad(dt.getUTCMinutes()) + ":00"
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const input = (await req.json()) as BookingInput;
    if (!input?.name || !input?.email || !input?.date || !input?.time) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const calendarId = Deno.env.get("OPERATOR_CALENDAR_ID");
    const saJsonRaw = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    if (!calendarId || !saJsonRaw) throw new Error("Missing Google env vars");
    const sa = JSON.parse(saJsonRaw) as { client_email: string; private_key: string };

    // 1. Get Google access token
    const token = await getAccessToken(sa.client_email, sa.private_key);

    // 2. Create calendar event on operator's calendar
    const event = {
      summary: `Liv Functional — Consultation${input.topic ? `: ${input.topic}` : ""}`,
      description: [
        `Booked by ${input.name} (${input.email}${input.phone ? `, ${input.phone}` : ""})`,
        input.message ? `\nNotes:\n${input.message}` : "",
      ].join(""),
      start: { dateTime: isoLocal(input.date, input.time), timeZone: TZ },
      end:   { dateTime: isoLocal(input.date, input.time, DURATION_MIN), timeZone: TZ },
      attendees: [{ email: input.email, displayName: input.name }],
      reminders: { useDefault: true },
    };

    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      },
    );
    if (!calRes.ok) {
      const txt = await calRes.text();
      throw new Error(`Calendar insert failed: ${txt}`);
    }
    const created = await calRes.json();

    // 3. Insert booking row in Supabase (uses service-role key, bypasses RLS)
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { error: dbErr } = await sb.from("bookings").insert({
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      date: input.date,
      time: input.time,
      topic: input.topic ?? null,
      message: input.message ?? null,
      locale: input.locale ?? "en",
      status: "confirmed",
      google_event_id: created.id,
    });
    if (dbErr) console.error("[book-consultation] db insert failed:", dbErr);

    return new Response(JSON.stringify({
      ok: true,
      event_id: created.id,
      html_link: created.htmlLink,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
