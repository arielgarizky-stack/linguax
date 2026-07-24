import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "AI tutor is not configured yet." }, { status: 503 });
  const { message } = await request.json();
  if (typeof message !== "string" || message.trim().length < 2) return NextResponse.json({ error: "Please enter a question." }, { status: 400 });
  try {
    const model = new GoogleGenerativeAI(key).getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(`You are LinguaX, an encouraging expert English and TOEFL tutor. Reply in Indonesian. Use concise Markdown headings: Penjelasan, Contoh, Latihan, Kesalahan umum. Be accurate and do not claim a score without evidence. User: ${message.slice(0, 3000)}`);
    return NextResponse.json({ answer: result.response.text() });
  } catch { return NextResponse.json({ error: "Lingua AI could not respond. Please try again." }, { status: 502 }); }
}
