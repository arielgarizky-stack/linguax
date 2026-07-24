import { getSupabaseClient } from "@/lib/supabase/client";

export const learningRepository = {
  profile: (userId: string) => getSupabaseClient().from("users").select("*").eq("id", userId).single(),
  lessons: () => getSupabaseClient().from("lessons").select("*").order("created_at", { ascending: false }),
  quizQuestions: (lessonId: string) => getSupabaseClient().from("quiz_questions").select("*").eq("lesson_id", lessonId),
  submitProgress: (userId: string, lessonId: string, score: number) =>
    getSupabaseClient().from("progress").insert({ user_id: userId, lesson_id: lessonId, score }),
  dailyChallenges: () => getSupabaseClient().from("daily_challenges").select("*").order("created_at", { ascending: false }),
};
