"use client";
import { getSupabaseClient } from "@/lib/supabase/client";
import { learningService } from "@/services/learning-service";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
export function useAuth() { const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(true); useEffect(() => { const supabase = getSupabaseClient(); const syncUser = async (nextUser: User | null) => { if (nextUser) await learningService.ensureProfile(nextUser); setUser(nextUser); setLoading(false); }; supabase.auth.getUser().then(({ data }) => syncUser(data.user)); const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { syncUser(session?.user ?? null); }); return () => subscription.unsubscribe(); }, []); return { user, loading }; }
