"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import {
  forgotPassword,
  resetPassword,
  verifyResetOtp,
} from "@/api/auth.api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const tokenFlowSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

const otpFlowSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  otp: z
    .string()
    .length(4, "OTP must be 4 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

const otpOwnAccountSchema = z.object({
  otp: z
    .string()
    .length(4, "OTP must be 4 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailFromQuery = searchParams.get("email") ?? "";
  const flow = searchParams.get("flow") ?? "";
  const hasInitialOtp = searchParams.get("otpSent") === "1";
  const isTokenFlow = Boolean(token);
  const { user, loading, logout } = useAuth();

  const isLoggedInUser = user && typeof user === "object";
  const isGoogleLoggedInUser = isLoggedInUser && user.authMethod === "google";
  const isLoggedInEmailFlow =
    !isTokenFlow && isLoggedInUser && user.authMethod === "email";
  const isQueryLockedEmailFlow =
    !isTokenFlow && !isLoggedInEmailFlow && Boolean(emailFromQuery);
  const isLoggedInFlowRequested = !isTokenFlow && flow === "logged-in";

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [serverInfo, setServerInfo] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(Boolean(isTokenFlow || hasInitialOtp));

  const resolverSchema = useMemo(() => {
    if (isTokenFlow) return tokenFlowSchema;
    if (isLoggedInEmailFlow) return otpOwnAccountSchema;
    return otpFlowSchema;
  }, [isLoggedInEmailFlow, isTokenFlow]);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resolverSchema),
    defaultValues: {
      email: emailFromQuery,
      otp: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isTokenFlow) return;

    if (isLoggedInEmailFlow && isLoggedInUser && user.email) {
      setValue("email", user.email);
      return;
    }

    if (emailFromQuery) {
      setValue("email", emailFromQuery);
    }
  }, [emailFromQuery, isLoggedInEmailFlow, isLoggedInUser, isTokenFlow, setValue, user]);

  useEffect(() => {
    if (!loading && isGoogleLoggedInUser) {
      router.replace("/dashboard");
    }
  }, [isGoogleLoggedInUser, loading, router]);

  useEffect(() => {
    if (isTokenFlow) return;

    if (isLoggedInEmailFlow) {
      setServerInfo(
        "We will reset password for your signed-in account email.",
      );
      return;
    }

    if (hasInitialOtp && flow === "forgot") {
      setServerInfo(
        "Use the OTP from forgot-password email and continue below. Resend only if needed.",
      );
      return;
    }

    if (flow === "logged-in") {
      setServerInfo(
        "Send OTP once, then enter OTP and your new password to complete reset.",
      );
    }
  }, [flow, hasInitialOtp, isLoggedInEmailFlow, isTokenFlow]);

  const passwordValue = watch("password") ?? "";
  const emailValue = watch("email") ?? "";
  const effectiveEmailValue =
    isLoggedInEmailFlow && isLoggedInUser
      ? user.email || ""
      : emailFromQuery || emailValue;

  const extractError = (err) => {
    const data = err?.response?.data;
    if (err?.message && !data) return err.message;
    if (!data) return "Something went wrong. Try again.";
    if (Array.isArray(data.errors) && data.errors.length > 0)
      return data.errors.map((e) => e.message).join(" · ");
    return data.message ?? "Something went wrong. Try again.";
  };

  const logoutIfEmailAuthUser = async () => {
    if (user && typeof user === "object" && user.authMethod === "email") {
      await logout();
    }
  };

  const handleSendOtp = async () => {
    const email = (
      isLoggedInEmailFlow && isLoggedInUser ? user.email : getValues("email")
    )?.trim();

    if (!email) {
      setServerError("Enter your email first.");
      return;
    }

    const parsed = z.string().email("Enter a valid email address").safeParse(email);
    if (!parsed.success) {
      setServerError(parsed.error.issues[0]?.message ?? "Enter a valid email address.");
      return;
    }

    setServerError("");
    setServerInfo("");
    setIsSendingOtp(true);

    try {
      await forgotPassword({ email });
      setOtpSent(true);
      setServerInfo(
        "A 4-digit OTP has been sent to your email. Enter OTP and your new password below.",
      );
    } catch (err) {
      setServerError(extractError(err));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onSubmit = async (values) => {
    if (!isTokenFlow && !otpSent) {
      setServerError("Send OTP first to continue.");
      return;
    }

    setServerError("");
    setServerInfo("");
    setIsLoading(true);

    try {
      // If the user is logged in with email auth, log out immediately on confirm.
      await logoutIfEmailAuthUser();

      let resetToken = token;

      if (!isTokenFlow) {
        const resetEmail =
          isLoggedInEmailFlow && isLoggedInUser
            ? user.email
            : values.email;

        if (!resetEmail) {
          throw new Error("Unable to resolve reset email. Please try again.");
        }

        const verifyResult = await verifyResetOtp({
          email: resetEmail,
          otp: values.otp,
        });

        resetToken = verifyResult?.data?.resetToken;
        if (!resetToken) {
          throw new Error("Could not verify OTP. Please request a new OTP.");
        }
      }

      const res = await resetPassword({ token: resetToken, password: values.password });
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
          <p className="mt-1 text-sm text-zinc-500">
            {isTokenFlow
              ? "Set a new password"
              : "Reset your password on this screen"}
          </p>
        </div>

        {isLoggedInFlowRequested && loading ? (
          <div className="rounded-xl bg-[rgba(168,85,247,0.06)] border border-[rgba(168,85,247,0.2)] px-5 py-6 text-center">
            <p className="text-sm text-zinc-700">Checking account...</p>
          </div>
        ) : isLoggedInFlowRequested && !isLoggedInUser ? (
          <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-6 text-center space-y-3">
            <p className="text-sm text-red-600">
              Please sign in to reset your account password.
            </p>
            <Link
              href="/login"
              className="inline-block text-sm font-medium text-[#9333ea] hover:text-[#7e22ce] hover:underline"
            >
              Go to sign in →
            </Link>
          </div>
        ) : isGoogleLoggedInUser ? (
          <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-6 text-center">
            <p className="text-sm text-red-600">
              Google accounts do not support password reset here. Redirecting...
            </p>
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
            {!isTokenFlow && !isLoggedInEmailFlow && !isQueryLockedEmailFlow && (
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
            )}

            {!isTokenFlow && isQueryLockedEmailFlow && (
              <div className="space-y-1.5">
                <Label className="text-zinc-700 font-medium text-sm">
                  Email
                </Label>
                <div className="rounded-md border border-[rgba(168,85,247,0.2)] bg-[rgba(168,85,247,0.05)] px-3 py-2.5 text-sm text-zinc-700">
                  {effectiveEmailValue}
                </div>
              </div>
            )}

            {!isTokenFlow && !otpSent && (
              <Button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp || isLoading}
                className="w-full bg-[#9333ea] text-white hover:bg-[#7e22ce] font-medium shadow-[0_2px_12px_rgba(147,51,234,0.25)] min-h-11 disabled:opacity-60"
              >
                {isSendingOtp ? "Sending OTP…" : "Send OTP"}
              </Button>
            )}

            {!isTokenFlow && otpSent && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSendOtp}
                disabled={isSendingOtp || isLoading}
                className="w-full min-h-11 border-[rgba(168,85,247,0.28)] text-zinc-700 hover:bg-[rgba(168,85,247,0.06)]"
              >
                {isSendingOtp ? "Resending OTP…" : "Resend OTP"}
              </Button>
            )}

            {!isTokenFlow && otpSent && (
              <div className="space-y-1.5">
                <Label htmlFor="otp" className="text-zinc-700 font-medium text-sm">
                  4-digit OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="1234"
                  aria-describedby={errors.otp ? "otp-error" : undefined}
                  className="tracking-[0.35em] text-center text-lg border-[rgba(168,85,247,0.25)] focus-visible:ring-[rgba(168,85,247,0.4)]"
                  {...register("otp")}
                />
                {errors.otp && (
                  <p id="otp-error" className="text-xs text-red-500" role="alert">
                    {errors.otp.message}
                  </p>
                )}
              </div>
            )}

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

            {serverInfo && (
              <div
                className="rounded-lg bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.2)] px-4 py-3 text-sm text-[#7e22ce]"
                role="status"
              >
                {serverInfo}
              </div>
            )}

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
              disabled={isLoading || (!isTokenFlow && !otpSent)}
              className="w-full bg-[#9333ea] text-white hover:bg-[#7e22ce] font-medium shadow-[0_2px_12px_rgba(147,51,234,0.25)] min-h-11 disabled:opacity-60"
            >
              {isLoading ? "Updating…" : "Update password"}
            </Button>

            {!isTokenFlow && effectiveEmailValue && (
              <p className="text-center text-xs text-zinc-500">
                Resetting password for <span className="font-medium text-zinc-700">{effectiveEmailValue}</span>
              </p>
            )}

            <p className="text-center text-sm text-zinc-500">
              Back to{" "}
              <Link
                href="/login"
                className="text-[#9333ea] font-medium hover:text-[#7e22ce] hover:underline"
              >
                sign in
              </Link>
            </p>
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
