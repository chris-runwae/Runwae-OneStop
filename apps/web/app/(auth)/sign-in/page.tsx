"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/home";
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();

  // Once Convex Auth has confirmed we're signed in (e.g. after the Google
  // OAuth code has been exchanged), bounce to the next destination instead
  // of leaving the user staring at the sign-in form.
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(next);
    }
  }, [authLoading, isAuthenticated, next, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn("password", { email, password, flow: "signIn" });
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      await signIn("google", { redirectTo: `${window.location.origin}/sign-up` });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign in failed.");
      setGoogleLoading(false);
    }
  }

  const justDeleted = params.get("deleted") === "1";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center space-y-8 px-4 py-12">
      <div className="space-y-3 text-center">
        <Link href="/" className="inline-block">
          <span className="font-display text-3xl font-bold text-primary">Runwae</span>
        </Link>
        <h1 className="font-display text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to continue planning</p>
      </div>

      {justDeleted && (
        <div className="rounded-xl border border-border bg-muted/40 p-3 text-center text-xs text-muted-foreground">
          Your account is scheduled for deletion. Sign back in within 30 days
          to restore it.
        </div>
      )}

      <form onSubmit={handlePasswordSubmit} className="space-y-3">
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
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:border-primary focus:outline-none"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="w-full" isLoading={submitting} disabled={submitting}>
          Sign in
        </Button>
      </form>

      <div className="relative text-center text-xs text-muted-foreground">
        <span className="relative z-10 bg-background px-3">Or continue with</span>
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full gap-2.5"
        onClick={handleGoogle}
        isLoading={googleLoading}
        disabled={googleLoading}
      >
        {!googleLoading && (
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.79 2.73v2.27h2.9c1.7-1.57 2.69-3.87 2.69-6.64z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.27c-.81.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.97v2.34A9 9 0 0 0 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.95 10.69A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.69V4.97H.97A9 9 0 0 0 0 9c0 1.45.35 2.83.97 4.03l2.98-2.34z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .97 4.97l2.98 2.34C4.66 5.18 6.65 3.58 9 3.58z"
            />
          </svg>
        )}
        Continue with Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
