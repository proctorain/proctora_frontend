"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Sparkles, UserRound } from "lucide-react";

import Navbar from "@/components/common/Navbar";
import AnimatedBackground from "@/components/custom/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeOnboarding, getMyProfile } from "@/api/profile.api";
import { useAuth } from "@/context/AuthContext";

const MAX_AVATAR_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const isProfileComplete = (profile) =>
  typeof profile?.name === "string" && profile.name.trim().length > 0;

export default function OnboardingPage({ label = "On-boarding" }) {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let alive = true;

    const bootstrap = async () => {
      if (loading) return;

      if (user === false) {
        router.replace("/login");
        return;
      }

      try {
        const result = await getMyProfile();
        if (!alive) return;

        const profile = result?.data?.profile;

        if (isProfileComplete(profile)) {
          router.replace("/dashboard");
          return;
        }

        setName(profile?.name ?? "");
        setAvatarPreview(profile?.avatarUrl ?? "");
      } catch (err) {
        if (!alive) return;
        if (err?.response?.status !== 404) {
          setErrorMessage(
            err?.response?.data?.message ||
              "Could not load your profile. You can still continue onboarding.",
          );
        }
      } finally {
        if (alive) setIsBootstrapping(false);
      }
    };

    bootstrap();

    return () => {
      alive = false;
    };
  }, [loading, router, user]);

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const avatarAltText = useMemo(() => {
    const trimmed = name.trim();
    return trimmed ? `${trimmed} avatar preview` : "Avatar preview";
  }, [name]);

  const onAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setErrorMessage("Please upload a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setErrorMessage("Avatar file is too large. Maximum size is 10MB.");
      event.target.value = "";
      return;
    }

    if (avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(previewUrl);
    setErrorMessage("");
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setErrorMessage("Name must be at least 2 characters.");
      return;
    }

    if (trimmedName.length > 100) {
      setErrorMessage("Name must be under 100 characters.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await completeOnboarding({
        name: trimmedName,
        avatarFile,
      });

      if (typeof refreshUser === "function") {
        try {
          await refreshUser();
        } catch {
          // Ignore refresh failures — onboarding data was already saved.
        }
      }

      router.replace("/dashboard");
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message ||
          "Failed to complete onboarding. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white font-sans">
      <AnimatedBackground />

      <div className="relative z-10">
        <Navbar />

        <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-20 sm:px-6 lg:px-8">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-[#9333ea]">{label}</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              Set up your <span className="text-[#9333ea]">Proctora</span> profile
            </h1>
            <p className="mt-4 text-zinc-500">
              Add your display name and avatar to finish onboarding and unlock your dashboard.
            </p>
          </div>

          <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-3xl border border-[rgba(168,85,247,0.22)] bg-white/85 p-6 shadow-[0_18px_40px_rgba(147,51,234,0.12)] backdrop-blur sm:p-8">
              {isBootstrapping ? (
                <div className="flex min-h-64 items-center justify-center text-sm text-zinc-500">
                  <Loader2 className="mr-2 animate-spin text-[#9333ea]" size={18} />
                  Loading your profile...
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-6" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-zinc-700">
                      Display name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      maxLength={100}
                      placeholder="Enter your full name"
                      className="h-11 border-[rgba(168,85,247,0.25)] bg-white focus-visible:ring-[rgba(168,85,247,0.45)]"
                      required
                    />
                    <p className="text-xs text-zinc-500">This name will appear across your dashboard.</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="avatar" className="text-sm font-medium text-zinc-700">
                      Avatar (optional)
                    </Label>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[rgba(168,85,247,0.25)] bg-[rgba(168,85,247,0.06)]">
                        {avatarPreview ? (
                          <div
                            role="img"
                            aria-label={avatarAltText}
                            className="h-full w-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${avatarPreview})` }}
                          />
                        ) : (
                          <UserRound className="text-[#a855f7]" size={30} />
                        )}
                      </div>

                      <div className="flex-1">
                        <label
                          htmlFor="avatar"
                          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[rgba(168,85,247,0.25)] bg-white px-4 py-2 text-sm font-medium text-[#7e22ce] transition-colors hover:bg-[rgba(168,85,247,0.08)]"
                        >
                          <Camera size={16} />
                          Choose image
                        </label>
                        <input
                          id="avatar"
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={onAvatarChange}
                          className="hidden"
                        />
                        <p className="mt-2 text-xs text-zinc-500">JPG, PNG or WebP up to 10MB.</p>
                      </div>
                    </div>
                  </div>

                  {errorMessage && (
                    <div
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                      role="alert"
                    >
                      {errorMessage}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 w-full bg-[#9333ea] text-white hover:bg-[#7e22ce] shadow-[0_8px_20px_rgba(147,51,234,0.28)] disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Saving profile...
                      </>
                    ) : (
                      "Complete onboarding"
                    )}
                  </Button>
                </form>
              )}
            </section>

            <aside className="rounded-3xl border border-[rgba(168,85,247,0.18)] bg-linear-to-b from-[rgba(168,85,247,0.13)] via-white to-white p-6 shadow-[0_14px_30px_rgba(168,85,247,0.1)] sm:p-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(147,51,234,0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#7e22ce]">
                <Sparkles size={14} />
                Quick setup
              </div>

              <h2 className="mt-4 text-lg font-semibold text-zinc-900">Almost done</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Completing this step helps personalize your account and prevents future redirects to
                onboarding.
              </p>

              <ul className="mt-5 space-y-3 text-sm text-zinc-700">
                <li className="rounded-lg border border-[rgba(168,85,247,0.15)] bg-white px-3 py-2">
                  Name is required for profile completion.
                </li>
                <li className="rounded-lg border border-[rgba(168,85,247,0.15)] bg-white px-3 py-2">
                  Avatar is optional and can be changed anytime.
                </li>
                <li className="rounded-lg border border-[rgba(168,85,247,0.15)] bg-white px-3 py-2">
                  After save, you will be redirected to your dashboard.
                </li>
              </ul>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
