"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { getGoogleAuthUrl, registerUser } from "@/api/auth.api";
import LogoAnimation from "@/components/custom/LogoAnimation";
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
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const googleAuthUrl = getGoogleAuthUrl();

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
    setIsLoading(true);
    try {
      await registerUser(values);
      reset();
      const query = new URLSearchParams({
        email: values.email,
        sent: "1",
        from: "register",
      }).toString();
      router.push(`/verify-otp?${query}`);
    } catch (err) {
      setServerError(extractError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    if (!googleAuthUrl) {
      setServerError(
        "Google sign-up is unavailable. Configure NEXT_PUBLIC_API_URL.",
      );
      return;
    }
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="w-full max-w-sm">
      <div
        className="w-full px-8 py-10"
        aria-label="Register form"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="mx-auto block w-44" aria-label="Proctora home">
            <LogoAnimation showTagline={false} className="w-full" />
          </Link>
          <p className="mt-2 text-sm text-zinc-500">Create your account</p>
        </div>

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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[rgba(168,85,247,0.18)]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-zinc-400 tracking-wide">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              className="w-full min-h-11 border-[rgba(168,85,247,0.28)] text-zinc-700 hover:bg-[rgba(168,85,247,0.06)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.3l-6.3-5.2C29.3 35 26.8 36 24 36c-5.3 0-9.6-3.3-11.3-8l-6.5 5C9.4 39.6 16.1 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.4 4.5-4.7 5.8l.1.1 6.3 5.2C36.5 39.5 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
              </svg>
              Continue with Google
            </Button>
          </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#9333ea] font-medium hover:text-[#7e22ce] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
