"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/home";

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
      await signIn("google");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign in failed.");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <Link href="/" className="inline-block">
          <span className="font-display text-3xl font-bold text-primary">Runwae</span>
        </Link>
        <h1 className="font-display text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to continue planning</p>
      </div>

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
        className="w-full"
        onClick={handleGoogle}
        isLoading={googleLoading}
        disabled={googleLoading}
      >
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
