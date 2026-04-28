"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { ShieldCheck, LogOut } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

export function RestoreAccountCard({
  deletedAt,
  deletionScheduledFor,
}: {
  deletedAt: number;
  deletionScheduledFor: number | undefined;
}) {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const restoreAccount = useMutation(api.account_deletion.restoreAccount);

  const [restoring, setRestoring] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scheduledLabel = deletionScheduledFor
    ? new Date(deletionScheduledFor).toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const requestedLabel = new Date(deletedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  async function handleRestore() {
    setRestoring(true);
    setError(null);
    try {
      await restoreAccount({});
      router.push("/home");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't restore. Try again.",
      );
      setRestoring(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/sign-in");
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">
            Account scheduled for deletion
          </h1>
          <p className="text-xs text-muted-foreground">
            Requested {requestedLabel}
          </p>
        </div>
      </div>

      <p className="mt-5 text-sm text-foreground">
        Your account is locked while it waits for permanent deletion
        {scheduledLabel ? (
          <>
            {" "}on <span className="font-semibold">{scheduledLabel}</span>.
          </>
        ) : (
          "."
        )}{" "}
        Restore it to keep your trips, friends, and bookings.
      </p>

      {error && (
        <p className="mt-3 text-sm text-error" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-2">
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={handleRestore}
          isLoading={restoring}
          disabled={restoring || signingOut}
        >
          Restore my account
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={handleSignOut}
          isLoading={signingOut}
          disabled={restoring || signingOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
