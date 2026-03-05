"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

import { forgotPassword } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export default function ForgotPasswordPage() {
  const [serverMsg, setServerMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setServerMsg("");
    setIsLoading(true);
    try {
      const res = await forgotPassword(values);
      // Backend always returns the same neutral message for security
      setServerMsg(
        res.message ??
          "If an account with that email exists, a reset link has been sent.",
      );
      setSubmitted(true);
    } catch (err) {
      const data = err?.response?.data;
      setServerMsg(
        Array.isArray(data?.errors) && data.errors.length > 0
          ? data.errors.map((e) => e.message).join(" · ")
          : data?.message ?? "Something went wrong. Try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div
        className="w-full rounded-2xl bg-white px-8 py-10 shadow-[0_4px_32px_rgba(168,85,247,0.12)] border border-[rgba(168,85,247,0.15)]"
        aria-label="Forgot password form"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-[#7e22ce]">
            Proctora
          </Link>
          <p className="mt-1 text-sm text-zinc-500">Reset your password</p>
        </div>

        {submitted ? (
          <div className="rounded-xl bg-[rgba(168,85,247,0.06)] border border-[rgba(168,85,247,0.2)] px-5 py-6 text-center space-y-3">
            <p className="text-sm text-zinc-700">{serverMsg}</p>
            <Link
              href="/login"
              className="inline-block text-sm font-medium text-[#9333ea] hover:text-[#7e22ce] hover:underline"
            >
              Back to sign in →
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-zinc-500 text-center">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
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

              {serverMsg && !submitted && (
                <div
                  className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600"
                  role="alert"
                >
                  {serverMsg}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#9333ea] text-white hover:bg-[#7e22ce] font-medium shadow-[0_2px_12px_rgba(147,51,234,0.25)] min-h-11 disabled:opacity-60"
              >
                {isLoading ? "Sending…" : "Send reset link"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500">
              Remembered it?{" "}
              <Link
                href="/login"
                className="text-[#9333ea] font-medium hover:text-[#7e22ce] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
