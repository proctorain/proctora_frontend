"use client";

import Link from "next/link";
import AnimatedBackground from "@/components/custom/AnimatedBackground";

export default function EmailVerifiedPage() {
  return (
    <div className="min-h-screen relative font-sans flex items-center justify-center px-4">
      <AnimatedBackground />

      <main className="w-full max-w-sm">
        {/* Checkmark */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[rgba(168,85,247,0.08)] flex items-center justify-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9333ea"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
            You&apos; re verified
          </h1>
          <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
            Your email address has been confirmed.
            <br />
            You&apos; re good to go.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Link
            href="/login"
            className="w-full flex items-center justify-center rounded-lg bg-[#9333ea] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#7e22ce] transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/"
            className="w-full flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
