"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Suspense } from "react";

import { resetPassword } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const passwordValue = watch("password") ?? "";

  const extractError = (err) => {
    const data = err?.response?.data;
    if (!data) return "Something went wrong. Try again.";
    if (Array.isArray(data.errors) && data.errors.length > 0)
      return data.errors.map((e) => e.message).join(" · ");
    return data.message ?? "Something went wrong. Try again.";
  };

  const onSubmit = async (values) => {
    if (!token) {
      setServerError("Reset token is missing. Please use the link from your email.");
      return;
    }

    setServerError("");
    setIsLoading(true);
    try {
      const res = await resetPassword({ token, password: values.password });
      setSuccessMsg(res.message ?? "Password updated! You can now sign in.");
    } catch (err) {
      setServerError(extractError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div
        className="w-full rounded-2xl bg-white px-8 py-10 shadow-[0_4px_32px_rgba(168,85,247,0.12)] border border-[rgba(168,85,247,0.15)]"
        aria-label="Reset password form"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-[#7e22ce]">
            Proctora
          </Link>
          <p className="mt-1 text-sm text-zinc-500">Set a new password</p>
        </div>

        {/* Missing token guard */}
        {!token ? (
          <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-6 text-center space-y-3">
            <p className="text-sm text-red-600">
              Invalid or missing reset link. Please request a new one.
            </p>
            <Link
              href="/forgot-password"
              className="inline-block text-sm font-medium text-[#9333ea] hover:text-[#7e22ce] hover:underline"
            >
              Request reset link →
            </Link>
          </div>
        ) : successMsg ? (
          <div className="rounded-xl bg-[rgba(168,85,247,0.06)] border border-[rgba(168,85,247,0.2)] px-5 py-6 text-center space-y-3">
            <p className="text-sm text-zinc-700">{successMsg}</p>
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-[#9333ea] text-white hover:bg-[#7e22ce] font-medium min-h-11"
            >
              Sign in
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-zinc-700 font-medium text-sm">
                New password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className="pr-10 border-[rgba(168,85,247,0.25)] focus-visible:ring-[rgba(168,85,247,0.4)]"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Live password rules */}
              {passwordValue.length > 0 ? (
                <ul className="mt-0.5 space-y-1">
                  <li
                    className={`flex items-center gap-1.5 text-xs ${
                      passwordValue.length >= 8 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    <span>{passwordValue.length >= 8 ? "✓" : "✗"}</span>
                    At least 8 characters
                  </li>
                </ul>
              ) : (
                errors.password && (
                  <p id="password-error" className="text-xs text-red-500" role="alert">
                    {errors.password.message}
                  </p>
                )
              )}
            </div>

            {serverError && (
              <div
                className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600"
                role="alert"
              >
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#9333ea] text-white hover:bg-[#7e22ce] font-medium shadow-[0_2px_12px_rgba(147,51,234,0.25)] min-h-11 disabled:opacity-60"
            >
              {isLoading ? "Updating…" : "Update password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

// useSearchParams requires a Suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
