"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn("password", { email, flow: "reset" });
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't send the reset email.",
      );
      setSubmitting(false);
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
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a code to reset it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          autoComplete="email"
          autoFocus
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:border-primary focus:outline-none"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={submitting}
          disabled={submitting}
        >
          Send reset code
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
