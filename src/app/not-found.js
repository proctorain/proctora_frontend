"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AnimatedBackground from "@/components/custom/AnimatedBackground";

export default function NotFound() {
  const [visible, setVisible] = useState(false);

  // Fade in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen relative font-sans flex items-center justify-center px-4">
      <AnimatedBackground />

      <main
        className="w-full max-w-sm text-center transition-all duration-700 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0px)" : "translateY(16px)",
        }}
      >
        {/* 404 number */}
        <p className="text-[96px] font-bold leading-none tracking-tighter text-[rgba(105,13,191,0.66)] select-none">
          404
        </p>

        {/* Text */}
        <div className="-mt-2 mb-8">
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
            Page not found
          </h1>
          <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
            This page doesn&apos; t exist or was moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="w-full flex items-center justify-center rounded-lg bg-[#9333ea] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#7e22ce] transition-colors"
          >
            Back to home
          </Link>
        
        </div>
      </main>
    </div>
  );
}
