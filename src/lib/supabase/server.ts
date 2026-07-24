import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Creates a request-scoped server client. Pass a user access token from an
 * Authorization header when querying protected data in Route Handlers.
 */
export function createServerSupabaseClient(accessToken?: string) {
  if (!url || !anonKey) throw new Error("Missing Supabase environment variables.");
  return createClient(url, anonKey, {
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
