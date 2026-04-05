"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const DEFAULT_ERROR_MESSAGE = "Authentication failed. Please try again.";

const toLoginWithError = (errorMessage) =>
  `/login?${new URLSearchParams({ error: errorMessage }).toString()}`;

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const { login } = useAuth();
  const [statusMessage, setStatusMessage] = useState("Completing sign in...");

  useEffect(() => {
    let isActive = true;
    const run = async () => {
      const params = new URLSearchParams(queryString);

      const error = params.get("error");
      if (error) {
        router.replace(toLoginWithError(error));
        return;
      }

      const accessToken = params.get("accessToken");
      const refreshToken = params.get("refreshToken");
      const isNewUser = params.get("isNewUser");

      if (!accessToken || !refreshToken) {
        router.replace(toLoginWithError(DEFAULT_ERROR_MESSAGE));
        return;
      }

      try {
        // AuthContext login stores access/refresh tokens and sets the auth cookie.
        await login(accessToken, refreshToken);
      } catch {
        if (!isActive) return;
        router.replace(
          toLoginWithError("Could not save your session. Please sign in again."),
        );
        return;
      }

      if (!isActive) return;

      const destination = isNewUser === "true" ? "/on-boarding" : "/";
      setStatusMessage(
        isNewUser === "true"
          ? "Account created. Taking you to on-boarding..."
          : "Sign in successful. Redirecting to home...",
      );
      router.replace(destination);
    };

    run();

    return () => {
      isActive = false;
    };
  }, [login, queryString, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[rgba(168,85,247,0.18)] bg-white px-8 py-10 shadow-[0_8px_40px_rgba(168,85,247,0.14)] text-center">
        <p className="text-2xl font-bold tracking-tight text-[#7e22ce]">Proctora</p>
        <div className="mx-auto mt-6 h-10 w-10 rounded-full border-4 border-[rgba(168,85,247,0.18)] border-t-[#9333ea] animate-spin" />
        <p className="mt-4 text-sm text-zinc-600">{statusMessage}</p>
        <p className="mt-2 text-xs text-zinc-400">
          If nothing happens, return to{" "}
          <Link
            href="/login"
            className="text-[#9333ea] font-medium hover:text-[#7e22ce] hover:underline"
          >
            sign in
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
