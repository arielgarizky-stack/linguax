"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function Home() { const { user, loading } = useAuth(); const router = useRouter(); useEffect(() => { if (!loading) router.replace(user ? "/dashboard" : "/login"); }, [loading, user, router]); return <main className="grid min-h-screen place-items-center bg-[#09111f] text-cyan-300">Loading LinguaX…</main>; }
