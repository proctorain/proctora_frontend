"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Binary,
  Bot,
  Camera,
  Code2,
  FileText,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import Navbar from "@/components/common/Navbar";
import { useAuth } from "@/context/AuthContext";

const AVAILABLE_SERVICES = [
  {
    title: "Compiler Playground",
    description: "Execute Java and Python code with controlled runtime limits.",
    Icon: Code2,
  },
  {
    title: "Profile + Onboarding",
    description: "Set up identity, profile data, and guided onboarding flow.",
    Icon: UserRound,
  },
];

const COMING_SOON = [
  {
    title: "Conduct quizes and exams",
    description: "Session-level integrity checks and suspicious event tracking.",
    Icon: ShieldCheck,
  },
];

const MOTION_ICONS = [
  { Icon: Code2, label: "compiler" },
  { Icon: FileText, label: "quiz" },
  { Icon: ShieldCheck, label: "security" },
  { Icon: Binary, label: "execution" },
  { Icon: Sparkles, label: "automation" },
];

/**
 * HomePage — landing page component.
 * All page logic lives here; app/page.js only imports and renders this.
 */
export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const isLoggedIn = !!(user && typeof user === "object");
  const firstName =
    isLoggedIn && typeof user?.profile?.name === "string"
      ? user.profile.name.trim().split(" ")[0]
      : "";

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
    <div className="relative min-h-screen font-sans">
      <div className="relative z-10">
        <Navbar />

        <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col px-5 pb-14 pt-10 sm:px-8 lg:px-10">
          <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7e22ce]">
                Proctora Platform
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
                Assessments, online compiler playground.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
                Build quizzes, run code, and ship secure learner experiences from a single workspace.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {loading ? (
                  <span className="inline-flex rounded-lg border border-[rgba(126,34,206,0.28)] bg-white/70 px-4 py-2 text-sm font-medium text-[#7e22ce]">
                    Checking session...
                  </span>
                ) : isLoggedIn ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#7e22ce] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(126,34,206,0.25)] transition hover:bg-[#6d28d9]"
                    >
                      {firstName ? `Go to Dashboard, ${firstName}` : "Go to Dashboard"}
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      href="/dashboard/compiler"
                      className="inline-flex items-center gap-2 rounded-lg border border-[rgba(126,34,206,0.28)] bg-white/70 px-5 py-2.5 text-sm font-semibold text-[#7e22ce] transition hover:bg-white"
                    >
                      Open Compiler
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 rounded-lg border border-[rgba(126,34,206,0.28)] bg-white/70 px-5 py-2.5 text-sm font-semibold text-[#7e22ce] transition hover:bg-white"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#7e22ce] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(126,34,206,0.25)] transition hover:bg-[#6d28d9]"
                    >
                      Sign up
                      <ArrowRight size={16} />
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="hero-scene rounded-2xl border border-[rgba(126,34,206,0.18)] bg-white/65 p-5 shadow-[0_12px_36px_rgba(126,34,206,0.12)] backdrop-blur">
              <div className="space-y-3">
                {AVAILABLE_SERVICES.slice(0, 3).map(({ title, Icon }) => (
                  <div
                    key={title}
                    className="scene-row flex items-center gap-3 rounded-xl border border-[rgba(126,34,206,0.14)] bg-white/85 px-3 py-2.5"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(126,34,206,0.12)] text-[#7e22ce]">
                      <Icon size={16} />
                    </span>
                    <span className="text-sm font-medium text-zinc-700">{title}</span>
                  </div>
                ))}
              </div>

              {MOTION_ICONS.map(({ Icon, label }, idx) => (
                <span
                  key={label}
                  className={`floating-chip chip-${idx + 1}`}
                  aria-hidden="true"
                >
                  <Icon size={15} />
                </span>
              ))}
            </div>
          </section>

          <section className="mt-10 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-[rgba(126,34,206,0.16)] bg-white/70 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7e22ce]">
                Available Now
              </p>
              <div className="mt-4 space-y-3">
                {AVAILABLE_SERVICES.map(({ title, description, Icon }) => (
                  <div
                    key={title}
                    className="rounded-xl border border-[rgba(126,34,206,0.13)] bg-white/90 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="text-[#7e22ce]" />
                      <h3 className="text-sm font-semibold text-zinc-800">{title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600">{description}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-[rgba(126,34,206,0.16)] bg-white/70 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7e22ce]">
                In Progress / Soon
              </p>
              <div className="mt-4 space-y-3">
                {COMING_SOON.map(({ title, description, Icon }) => (
                  <div
                    key={title}
                    className="rounded-xl border border-dashed border-[rgba(126,34,206,0.2)] bg-white/80 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="text-[#7e22ce]" />
                      <h3 className="text-sm font-semibold text-zinc-800">{title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600">{description}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </main>
      </div>

      <style jsx>{`
        .hero-scene {
          position: relative;
          overflow: hidden;
        }

        .scene-row:nth-child(1) {
          animation: scene-slide 7s ease-in-out infinite;
        }

        .scene-row:nth-child(2) {
          animation: scene-slide 7s ease-in-out infinite 0.25s;
        }

        .scene-row:nth-child(3) {
          animation: scene-slide 7s ease-in-out infinite 0.5s;
        }

        .floating-chip {
          position: absolute;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 999px;
          background: rgba(126, 34, 206, 0.12);
          color: #7e22ce;
          border: 1px solid rgba(126, 34, 206, 0.18);
          animation: floaty 6s ease-in-out infinite;
        }

        .chip-1 {
          top: 16px;
          right: 20px;
          animation-delay: 0s;
        }

        .chip-2 {
          top: 68px;
          right: 52px;
          animation-delay: 0.9s;
        }

        .chip-3 {
          bottom: 82px;
          right: 26px;
          animation-delay: 1.7s;
        }

        .chip-4 {
          bottom: 24px;
          right: 68px;
          animation-delay: 2.2s;
        }

        .chip-5 {
          top: 118px;
          right: 8px;
          animation-delay: 2.8s;
        }

        @keyframes floaty {
          0%,
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.95;
          }
          50% {
            transform: translateY(-8px) scale(1.04);
            opacity: 1;
          }
        }

        @keyframes scene-slide {
          0%,
          100% {
            transform: translateX(0px);
          }
          50% {
            transform: translateX(4px);
          }
        }
      `}</style>
    </div>
  );
}
