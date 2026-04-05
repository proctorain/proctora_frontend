"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import AnimatedBackground from "@/components/custom/AnimatedBackground";
import { useAuth } from "@/context/AuthContext";

/**
 * HomePage — landing page component.
 * All page logic lives here; app/page.js only imports and renders this.
 */
export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user || typeof user !== "object") return;

    const name = user?.profile?.name;
    const isProfileComplete =
      typeof name === "string" && name.trim().length > 0;

    if (!isProfileComplete) {
      router.replace("/on-boarding");
    }
  }, [loading, router, user]);

  return (
    <div className="relative min-h-screen bg-white font-sans">
      {/* Floating purple bubbles behind everything */}
      <AnimatedBackground />

      {/* Content layer above the background */}
      <div className="relative z-10">
        <Navbar />

        {/* Placeholder hero — replace with real content as needed */}
        <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-20 text-center sm:px-10">
          <h1
            className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            Welcome to{" "}
            <span className="text-[#9333ea]">Proctora</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-500">
            Your all-in-one platform. Get started today.
          </p>
        </main>
      </div>
    </div>
  );
}
