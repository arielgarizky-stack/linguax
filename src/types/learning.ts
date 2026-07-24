export type Profile = { id: string; email: string; username: string | null; avatar: string | null; level: number; exp: number; coins: number; streak: number; created_at: string };
export type LessonContent = { overview?: string; explanation?: string; examples?: { english: string; translation?: string }[]; objectives?: string[] };
export type Lesson = { id: string; title: string; category: string; difficulty: string; content: LessonContent; created_at: string };
export type QuizQuestion = { id: string; lesson_id: string; question: string; options: string[]; answer: string; explanation: string };
export type Progress = { id: string; user_id: string; lesson_id: string; score: number; completed_at: string };
export type Achievement = { id: string; name: string; description: string; reward: number };
export type DailyChallenge = { id: string; title: string; reward_exp: number; reward_coin: number; created_at: string };
