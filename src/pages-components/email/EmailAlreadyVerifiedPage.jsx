"use client";

import Link from "next/link";
import AnimatedBackground from "@/components/custom/AnimatedBackground";

export default function EmailAlreadyVerifiedPage() {
  return (
    <div className="min-h-screen relative font-sans flex items-center justify-center px-4">
      <AnimatedBackground />

      <main className="w-full max-w-sm">
        {/* Info icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[rgba(168,85,247,0.08)] flex items-center justify-center">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9333ea"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
            Already verified
          </h1>
          <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
            This email was already confirmed.
            <br />
            Just log in to continue.
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
