import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "AI tutor is not configured yet." }, { status: 503 });
  const { message } = await request.json();
  if (typeof message !== "string" || message.trim().length < 2) return NextResponse.json({ error: "Please enter a question." }, { status: 400 });
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    let context = "No authenticated learner profile is available.";
    if (token) { const db = createServerSupabaseClient(token); const { data: { user } } = await db.auth.getUser(token); if (user) { const [{ data: profile }, { data: progress }] = await Promise.all([db.from("users").select("level,exp,streak").eq("id", user.id).single(), db.from("progress").select("score,lessons(category)").eq("user_id", user.id)]); const weak = (progress || []).sort((a,b)=>a.score-b.score)[0]?.lessons as {category?:string}|null; context = `Learner level ${profile?.level || 1}, EXP ${profile?.exp || 0}, streak ${profile?.streak || 0}; weakest observed topic: ${weak?.category || "not enough data"}.`; } }
    const model = new GoogleGenerativeAI(key).getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(`You are LinguaX, an encouraging expert English and TOEFL tutor. Reply in Indonesian. Use concise Markdown headings: Penjelasan, Contoh, Latihan, Kesalahan umum. Be accurate and do not claim a score without evidence. Personalize recommendations with this learner context: ${context}. User: ${message.slice(0, 3000)}`);
    return NextResponse.json({ answer: result.response.text() });
  } catch { return NextResponse.json({ error: "Lingua AI could not respond. Please try again." }, { status: 502 }); }
}
