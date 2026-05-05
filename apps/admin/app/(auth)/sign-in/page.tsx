"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";

export default function AdminSignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace(next);
  }, [isLoading, isAuthenticated, next, router]);

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      await signIn("google", {
        redirectTo: `${window.location.origin}${next}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Runwae Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your Google account.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full gap-2.5"
          onClick={handleGoogle}
          disabled={loading}
        >
          {!loading && (
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
          {loading ? "Redirecting…" : "Continue with Google"}
        </Button>

        {error && (
          <p className="rounded-md bg-destructive/10 p-3 text-center text-xs text-destructive">
            {error}
          </p>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Internal tool. Access is limited to the founders.
        </p>
      </div>
    </div>
  );
}
