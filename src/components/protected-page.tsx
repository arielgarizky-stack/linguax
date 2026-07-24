"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export function ProtectedPage({ children }: { children: React.ReactNode }) { const { user, loading } = useAuth(); const router = useRouter(); useEffect(() => { if (!loading && !user) router.replace("/login"); }, [loading, user, router]); if (loading || !user) return <main className="grid min-h-screen place-items-center bg-[#09111f] text-cyan-300">Loading LinguaX…</main>; return <>{children}</>; }
