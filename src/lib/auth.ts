"use client";

import { getSupabaseClient } from "@/lib/supabase/client";

export async function signInWithGoogle() {
  return getSupabaseClient().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/` },
  });
}

export async function signInWithEmail(email: string, password: string) {
  return getSupabaseClient().auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  return getSupabaseClient().auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/` } });
}

export async function signOut() { return getSupabaseClient().auth.signOut(); }
export async function getCurrentUser() { const { data } = await getSupabaseClient().auth.getUser(); return data.user; }
