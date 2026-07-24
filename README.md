# LinguaX

AI-powered English and TOEFL learning platform built with Next.js 15, TypeScript, Tailwind, Firebase, and Google Gemini.

## Run locally

1. Copy `.env.example` to `.env.local` and add a Firebase web app configuration plus a Gemini free-tier API key.
2. Enable Google and Email/Password providers in Firebase Authentication.
3. Run `npm run dev`.

## Architecture

- `src/app`: App Router views and secure API routes.
- `src/app/api/ai`: Gemini gateway; the API key only exists on the server.
- `src/lib/firebase.ts`: shared Firebase client initialization for Auth and Firestore.
- UI state remains client-side; persisted profiles, learning records, levels, challenges, and leaderboards belong in Firestore collections specified in the product brief.

Deploy to Vercel's free tier after defining the same environment variables in the project settings.
