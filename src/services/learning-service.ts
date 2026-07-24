import { getSupabaseClient } from "@/lib/supabase/client";
import type { Achievement, DailyChallenge, Lesson, Profile, Progress, QuizQuestion } from "@/types/learning";

// Database types can be generated with `supabase gen types typescript`; until then,
// keep the client untyped so the existing database schema remains the source of truth.
const db = () => getSupabaseClient() as any;
export const learningService = {
  async ensureProfile(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
    const existing = await db().from("users").select("*").eq("id", user.id).maybeSingle();
    if (existing.data) return { data: existing.data as Profile, error: null };
    const username = String(user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Learner");
    const avatar = typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null;
    // New Auth accounts are normally inserted by the database trigger. This fallback
    // supports projects whose RLS policy permits a user to create their own profile.
    const { data, error } = await db().from("users").insert({ id: user.id, email: user.email || "", username, avatar }).select().single();
    return { data: data as Profile | null, error };
  },
  async getDashboard(userId: string) {
    // `maybeSingle` avoids PostgREST's single-object error while the Auth profile
    // trigger or fallback profile insert is completing.
    const [profile, progress, awards, challenges] = await Promise.all([
      db().from("users").select("*").eq("id", userId).maybeSingle(),
      db().from("progress").select("id,lesson_id,score,completed_at,lessons(category,title)").eq("user_id", userId),
      db().from("user_achievements").select("achievement_id,achievements(id,name,description,reward)").eq("user_id", userId),
      db().from("daily_challenges").select("*").order("created_at", { ascending: false }).limit(3),
    ]);
    return { profile: profile.data as Profile | null, progress: (progress.data || []) as (Progress & { lessons: Pick<Lesson, "category" | "title"> | null })[], achievements: awards.data || [], challenges: (challenges.data || []) as DailyChallenge[], error: profile.error || progress.error };
  },
  async getLessons(category?: string, difficulty?: string) {
    let query = db().from("lessons").select("*").order("created_at", { ascending: false });
    if (category && category !== "All") query = query.eq("category", category);
    if (difficulty && difficulty !== "All") query = query.eq("difficulty", difficulty);
    const { data, error } = await query;
    return { data: (data || []) as Lesson[], error };
  },
  async getLesson(id: string) { const { data, error } = await db().from("lessons").select("*").eq("id", id).single(); return { data: data as Lesson | null, error }; },
  async getQuestions(lessonId: string) { const { data, error } = await db().from("quiz_questions").select("*").eq("lesson_id", lessonId); return { data: (data || []) as QuizQuestion[], error }; },
  async recordQuiz(userId: string, lessonId: string, score: number) {
    const xp = 50 + (score >= 80 ? 20 : 0); const coins = 10 + (score >= 80 ? 5 : 0);
    const { error: progressError } = await db().from("progress").upsert({ user_id: userId, lesson_id: lessonId, score, completed_at: new Date().toISOString() }, { onConflict: "user_id,lesson_id" });
    if (progressError) return { error: progressError, xp: 0, coins: 0 };
    const { data: profile } = await db().from("users").select("exp,coins,streak").eq("id", userId).single();
    const totalExp = (profile?.exp || 0) + xp;
    const { error } = await db().from("users").update({ exp: totalExp, coins: (profile?.coins || 0) + coins, level: Math.floor(totalExp / 500) + 1 }).eq("id", userId);
    if (!error) await this.checkAchievements(userId, totalExp, lessonId, profile?.streak || 0);
    return { error, xp, coins };
  },
  async checkAchievements(userId: string, exp: number, lessonId: string, streak: number) {
    const [{ count }, { data: lesson }, { data: achievements }] = await Promise.all([
      db().from("progress").select("id", { count: "exact", head: true }).eq("user_id", userId), db().from("lessons").select("category").eq("id", lessonId).single(), db().from("achievements").select("id,name")
    ]);
    const names = new Set<string>(); if ((count || 0) >= 1) names.add("First Lesson"); if (lesson?.category === "Grammar") names.add("Grammar Beginner"); if (lesson?.category === "Vocabulary") names.add("Vocabulary Master"); if (streak >= 7) names.add("7 Days Streak"); if (exp >= 1000) names.add("TOEFL Starter");
    const ids = (achievements || []).filter((a: Pick<Achievement, "id" | "name">) => names.has(a.name)).map((a: Pick<Achievement, "id">) => ({ user_id: userId, achievement_id: a.id }));
    if (ids.length) await db().from("user_achievements").upsert(ids, { onConflict: "user_id,achievement_id", ignoreDuplicates: true });
  },
};
