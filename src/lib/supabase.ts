import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  if (!url || !anon) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn("[Liv Functional] Supabase env not set.");
    }
    return null;
  }
  client = createClient(url, anon, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: { headers: { "x-app": "liv-functional-web" } },
  });
  return client;
}

/** Throws if not configured — for admin code paths. */
export function requireSupabase(): SupabaseClient {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  return sb;
}

export const SUPABASE_READY = Boolean(url && anon);
