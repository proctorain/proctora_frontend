"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";

import { resendOtp, verifyEmailOtp } from "@/api/auth.api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  otp: z
    .string()
    .length(4, "OTP must be 4 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

const extractError = (err) => {
  const data = err?.response?.data;
  if (!data) return "Something went wrong. Try again.";
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map((e) => e.message).join(" · ");
  }
  return data.message ?? "Something went wrong. Try again.";
};

const getWaitSeconds = (text) => {
  const match = text?.match(/(\d+)\s*seconds?/i);
  return match ? Number(match[1]) : 0;
};

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryEmail = searchParams.get("email") ?? "";
  const sentFlag = searchParams.get("sent") === "1";
  const fromFlow = searchParams.get("from");
  const isRegisterFlow = fromFlow === "register";

  const { login } = useAuth();
  const [serverError, setServerError] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(sentFlag ? 35 : 0);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: queryEmail,
      otp: "",
    },
  });

  useEffect(() => {
    if (queryEmail) setValue("email", queryEmail);
  }, [queryEmail, setValue]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown((s) => s - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const onSubmit = async (values) => {
    setServerError("");
    setServerMessage("");
    setIsVerifying(true);

    try {
      const res = await verifyEmailOtp(values);
      const {
        accessToken,
        refreshToken,
        requiresOnboarding,
        isNewUser,
      } = res.data;
      await login(accessToken, refreshToken);
      const shouldOnboard =
        typeof requiresOnboarding === "boolean"
          ? requiresOnboarding
          : Boolean(isNewUser);
      router.push(shouldOnboard ? "/on-boarding" : "/dashboard");
    } catch (err) {
      setServerError(extractError(err));
    } finally {
      setIsVerifying(false);
    }
  };

  const onResend = async () => {
    const email = getValues("email");
    if (!email) {
      setServerError("Please enter your email first.");
      return;
    }
    if (resendCooldown > 0) return;

    setServerError("");
    setServerMessage("");
    setIsResending(true);

    try {
      await resendOtp({ email, type: "verification" });
      setServerMessage("A new OTP has been sent to your email.");
      setResendCooldown(35);
    } catch (err) {
      const message = extractError(err);
      setServerError(message);
      const waitSeconds = getWaitSeconds(message);
      if (waitSeconds > 0) setResendCooldown(waitSeconds);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div
        className="w-full rounded-2xl bg-white px-8 py-10 shadow-[0_4px_32px_rgba(168,85,247,0.12)] border border-[rgba(168,85,247,0.15)]"
        aria-label="OTP verification form"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-[#7e22ce]">
            Proctora
          </Link>
          <p className="mt-1 text-sm text-zinc-500">Verify your email</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {isRegisterFlow && queryEmail ? (
            <div className="space-y-1.5">
              <Label className="text-zinc-700 font-medium text-sm">Email</Label>
              <div className="rounded-md border border-[rgba(168,85,247,0.2)] bg-[rgba(168,85,247,0.04)] px-3 py-2.5 text-sm text-zinc-700">
                {queryEmail}
              </div>
              <input type="hidden" {...register("email")} />
            </div>
          ) : (
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

          {serverError && (
            <div
              className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600"
              role="alert"
            >
              {serverError}
            </div>
          )}

          {serverMessage && (
            <div
              className="rounded-lg bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.2)] px-4 py-3 text-sm text-[#7e22ce]"
              role="status"
            >
              {serverMessage}
            </div>
          )}

          <Button
            type="submit"
            disabled={isVerifying}
            className="w-full bg-[#9333ea] text-white hover:bg-[#7e22ce] font-medium shadow-[0_2px_12px_rgba(147,51,234,0.25)] min-h-11 disabled:opacity-60"
          >
            {isVerifying ? "Verifying…" : "Verify OTP"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onResend}
            disabled={isResending || resendCooldown > 0}
            className="w-full min-h-11 border-[rgba(168,85,247,0.28)] text-zinc-700 hover:bg-[rgba(168,85,247,0.06)]"
          >
            {isResending
              ? "Sending..."
              : resendCooldown > 0
                ? `Resend OTP in ${resendCooldown}s`
                : "Resend OTP"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Back to{" "}
          <Link
            href="/login"
            className="text-[#9333ea] font-medium hover:text-[#7e22ce] hover:underline"
          >
            sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
