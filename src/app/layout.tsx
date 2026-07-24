import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "LinguaX — Learn English. Score Higher.", description: "AI-powered TOEFL learning platform" };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html> }
