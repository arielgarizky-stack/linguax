# LinguaX

AI-powered English and TOEFL learning platform built with Next.js 15, TypeScript, Tailwind, Supabase, and Google Gemini.

## Run locally

1. Copy `.env.example` to `.env.local` and add a Supabase project URL, anonymous key, and Gemini free-tier API key.
2. In Supabase Auth, enable Google and Email providers and add your local/Vercel URLs to the redirect allow list.
3. Run `supabase/migrations/202607240001_initial_schema.sql` in the Supabase SQL Editor.
3. Run `npm run dev`.

## Architecture

- `src/app`: App Router views and secure API routes.
- `src/app/api/ai`: Gemini gateway; the API key only exists on the server.
- `src/lib/supabase`: browser and request-scoped Supabase clients.
- `src/lib/auth.ts`: Supabase Auth operations for Google OAuth, email/password, logout, and current-user lookup.
- `src/lib/learning.ts`: Supabase PostgreSQL data access for profiles, lessons, quizzes, progress, and challenges.
- `supabase/migrations`: PostgreSQL schema, automatic profile trigger, RLS policies, and private avatar storage policies.

Deploy to Vercel's free tier after defining the same environment variables in the project settings.
