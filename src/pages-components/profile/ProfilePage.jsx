"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Save, Trash2, UserRound } from "lucide-react";

import Navbar from "@/components/common/Navbar";
import AnimatedBackground from "@/components/custom/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteProfileAvatar,
  getMyProfile,
  updateProfileAvatar,
  updateProfileName,
} from "@/api/profile.api";
import { useAuth } from "@/context/AuthContext";

const MAX_AVATAR_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();

  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);

  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
        setName(profile?.name ?? "");
        setAvatarPreview(profile?.avatarUrl ?? "");
      } catch (err) {
        if (!alive) return;
        setErrorMessage(
          err?.response?.data?.message ||
            "Failed to load your profile. Please refresh and try again.",
        );
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
    return trimmed ? `${trimmed} avatar` : "Profile avatar";
  }, [name]);

  const handleAvatarFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setErrorMessage("Please choose a JPG, PNG, or WebP image.");
      setSuccessMessage("");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setErrorMessage("Avatar file is too large. Maximum size is 10MB.");
      setSuccessMessage("");
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
    setSuccessMessage("Image selected. Click upload avatar to save.");
  };

  const handleNameSubmit = async (event) => {
    event.preventDefault();

    const trimmed = name.trim();

    if (trimmed.length < 2) {
      setErrorMessage("Name must be at least 2 characters.");
      setSuccessMessage("");
      return;
    }

    if (trimmed.length > 100) {
      setErrorMessage("Name must be under 100 characters.");
      setSuccessMessage("");
      return;
    }

    setIsSavingName(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await updateProfileName({ name: trimmed });
      if (typeof refreshUser === "function") await refreshUser();
      setSuccessMessage("Name updated successfully.");
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message ||
          "Could not update name. Please try again.",
      );
    } finally {
      setIsSavingName(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setErrorMessage("Choose an image first, then upload.");
      setSuccessMessage("");
      return;
    }

    setIsUploadingAvatar(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await updateProfileAvatar({ avatarFile });
      const nextAvatarUrl = result?.data?.profile?.avatarUrl || "";

      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }

      setAvatarPreview(nextAvatarUrl);
      setAvatarFile(null);
      if (typeof refreshUser === "function") await refreshUser();
      setSuccessMessage("Avatar updated successfully.");
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message ||
          "Could not upload avatar. Please try again.",
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!avatarPreview) {
      setErrorMessage("No avatar to delete.");
      setSuccessMessage("");
      return;
    }

    setIsDeletingAvatar(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await deleteProfileAvatar();
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview("");
      setAvatarFile(null);
      if (typeof refreshUser === "function") await refreshUser();
      setSuccessMessage("Avatar deleted.");
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message ||
          "Could not delete avatar. Please try again.",
      );
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white font-sans">
      <AnimatedBackground />

      <div className="relative z-10">
        <Navbar />

        <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-20 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-[#9333ea]">Profile</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              Manage your <span className="text-[#9333ea]">Proctora</span> profile
            </h1>
            <p className="mt-4 text-zinc-500">
              Update your display name and avatar used across the platform.
            </p>
          </div>

          <section className="rounded-3xl border border-[rgba(168,85,247,0.22)] bg-white/90 p-6 shadow-[0_18px_40px_rgba(147,51,234,0.12)] backdrop-blur sm:p-8">
            {isBootstrapping ? (
              <div className="flex min-h-56 items-center justify-center text-sm text-zinc-500">
                <Loader2 className="mr-2 animate-spin text-[#9333ea]" size={18} />
                Loading profile...
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
                <form onSubmit={handleNameSubmit} className="space-y-5" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="profile-name" className="text-sm font-medium text-zinc-700">
                      Display name
                    </Label>
                    <Input
                      id="profile-name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      maxLength={100}
                      placeholder="Enter your full name"
                      className="h-11 border-[rgba(168,85,247,0.25)] bg-white focus-visible:ring-[rgba(168,85,247,0.45)]"
                      required
                    />
                    <p className="text-xs text-zinc-500">Visible in your account and navbar menu.</p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSavingName}
                    className="h-11 w-full bg-[#9333ea] text-white hover:bg-[#7e22ce] shadow-[0_8px_20px_rgba(147,51,234,0.28)] disabled:opacity-60"
                  >
                    {isSavingName ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Saving name...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save name
                      </>
                    )}
                  </Button>
                </form>

                <div className="space-y-4 rounded-2xl border border-[rgba(168,85,247,0.16)] bg-[rgba(168,85,247,0.03)] p-5">
                  <p className="text-sm font-medium text-zinc-700">Avatar</p>

                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[rgba(168,85,247,0.25)] bg-white">
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
                        htmlFor="profile-avatar"
                        className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[rgba(168,85,247,0.25)] bg-white px-4 py-2 text-sm font-medium text-[#7e22ce] transition-colors hover:bg-[rgba(168,85,247,0.08)]"
                      >
                        <Camera size={16} />
                        Choose image
                      </label>
                      <input
                        id="profile-avatar"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                      />
                      <p className="mt-2 text-xs text-zinc-500">JPG, PNG, or WebP up to 10MB.</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      onClick={handleAvatarUpload}
                      disabled={isUploadingAvatar || !avatarFile}
                      className="h-10 flex-1 bg-[#9333ea] text-white hover:bg-[#7e22ce] disabled:opacity-60"
                    >
                      {isUploadingAvatar ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera size={16} />
                          Upload avatar
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDeleteAvatar}
                      disabled={isDeletingAvatar || !avatarPreview}
                      className="h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
                    >
                      {isDeletingAvatar ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          Delete avatar
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {(errorMessage || successMessage) && (
                  <div className="md:col-span-2">
                    {errorMessage && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {errorMessage}
                      </div>
                    )}
                    {!errorMessage && successMessage && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {successMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
