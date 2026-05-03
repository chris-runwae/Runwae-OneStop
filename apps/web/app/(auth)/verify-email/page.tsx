"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";

function VerifyEmailInner() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/home";

  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentNotice, setResentNotice] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn("password", {
        email,
        code,
        flow: "email-verification",
      });
      router.replace(next);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't verify that code. Try again.",
      );
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    setError(null);
    setResending(true);
    setResentNotice(false);
    try {
      await signIn("password", { email, flow: "email-verification" });
      setResentNotice(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't resend the code.",
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center space-y-8 px-4 py-12">
      <div className="space-y-3 text-center">
        <Link href="/" className="inline-block">
          <span className="font-display text-3xl font-bold text-primary">
            Runwae
          </span>
        </Link>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Verify your email
        </h1>
        <p className="text-sm text-muted-foreground">
          We sent an 8-digit code to {email || "your email"}. It expires in 15
          minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:border-primary focus:outline-none"
        />
        <input
          type="text"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={8}
          pattern="\d{8}"
          placeholder="8-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm tracking-widest focus:border-primary focus:outline-none"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        {resentNotice && !error && (
          <p className="text-xs text-emerald-600">A new code is on its way.</p>
        )}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={submitting}
          disabled={submitting}
        >
          Verify email
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Didn&apos;t get a code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="font-semibold text-primary hover:underline disabled:opacity-50"
        >
          {resending ? "Sending…" : "Resend"}
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}
