"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { registerUser } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const registerSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const passwordValue = watch("password") ?? "";
  const confirmValue = watch("confirmPassword") ?? "";

  const extractError = (err) => {
    const data = err?.response?.data;
    if (!data) return "Something went wrong. Try again.";
    if (Array.isArray(data.errors) && data.errors.length > 0)
      return data.errors.map((e) => e.message).join(" · ");
    return data.message ?? "Something went wrong. Try again.";
  };

  const onSubmit = async (values) => {
    setServerError("");
    setSuccessMsg("");
    setIsLoading(true);
    try {
      const res = await registerUser(values);
      setSuccessMsg(
        res.message ?? "Account created! Check your email to verify.",
      );
      reset();
    } catch (err) {
      setServerError(extractError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div
        className="w-full px-8 py-10"
        aria-label="Register form"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-[#7e22ce]">
            Proctora
          </Link>
          <p className="mt-1 text-sm text-zinc-500">Create your account</p>
        </div>

        {/* Success state */}
        {successMsg ? (
          <div className="rounded-xl bg-[rgba(168,85,247,0.06)] border border-[rgba(168,85,247,0.2)] px-5 py-6 text-center space-y-3">
            <p className="text-sm text-zinc-700">{successMsg}</p>
            <Link
              href="/login"
              className="inline-block text-sm font-medium text-[#9333ea] hover:text-[#7e22ce] hover:underline"
            >
              Go to sign in →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-zinc-700 font-medium text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-describedby={errors.email ? "email-error" : undefined}
                className="border-[rgba(168,85,247,0.25)] focus-visible:ring-[rgba(168,85,247,0.4)]"
                {...register("email")}
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-red-500" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-zinc-700 font-medium text-sm">
                Password
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-zinc-700 font-medium text-sm">
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
                  className="pr-10 border-[rgba(168,85,247,0.25)] focus-visible:ring-[rgba(168,85,247,0.4)]"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmValue.length > 0 ? (
                <p
                  className={`text-xs font-medium ${
                    passwordValue === confirmValue ? "text-green-600" : "text-red-500"
                  }`}
                  role="status"
                >
                  {passwordValue === confirmValue ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              ) : (
                errors.confirmPassword && (
                  <p id="confirm-error" className="text-xs text-red-500" role="alert">
                    {errors.confirmPassword.message}
                  </p>
                )
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <div
                className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600"
                role="alert"
              >
                {serverError}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#9333ea] text-white hover:bg-[#7e22ce] font-medium shadow-[0_2px_12px_rgba(147,51,234,0.25)] min-h-11 disabled:opacity-60"
            >
              {isLoading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        )}

        {/* Footer */}
        {!successMsg && (
          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#9333ea] font-medium hover:text-[#7e22ce] hover:underline"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
