"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Button } from "@runwae/ui/components/button";
import { Input } from "@runwae/ui/components/input";
import { Label } from "@runwae/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@runwae/ui/components/card";

export default function HostSignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"google" | "password" | null>(
    null
  );

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace(next);
  }, [isLoading, isAuthenticated, next, router]);

  async function handleGoogle() {
    setError(null);
    setSubmitting("google");
    try {
      await signIn("google", {
        redirectTo: `${window.location.origin}${next}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
      setSubmitting(null);
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting("password");
    try {
      await signIn("password", { email, password, flow: "signIn" });
      router.replace(next);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid email or password."
      );
      setSubmitting(null);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">
            Runwae for Hosts
          </CardTitle>
          <CardDescription>
            Sign in to manage your events and earnings.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full gap-2.5"
            onClick={handleGoogle}
            disabled={submitting !== null}
          >
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
            {submitting === "google" ? "Redirecting…" : "Continue with Google"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-xs uppercase tracking-wide text-muted-foreground">
                or
              </span>
            </div>
          </div>

          <form className="space-y-3" onSubmit={handlePassword}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting !== null}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting !== null}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={submitting !== null}
            >
              {submitting === "password" ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          {error && (
            <p className="rounded-md bg-destructive/10 p-3 text-center text-xs text-destructive">
              {error}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 text-center text-xs text-muted-foreground">
          <Link
            href="/forgot-password"
            className="text-primary hover:underline"
          >
            Forgot your password?
          </Link>
          <p>
            Don&apos;t have a host account?{" "}
            <Link href="/sign-up" className="text-primary hover:underline">
              Apply to host
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
