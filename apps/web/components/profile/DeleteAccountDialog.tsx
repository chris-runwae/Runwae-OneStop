"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { AlertTriangle, ArrowRight, ExternalLink } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

type Step = "blockers" | "subscription" | "confirm" | "submitting";

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

export function DeleteAccountDialog({ open, onClose }: DeleteAccountDialogProps) {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const blockers = useQuery(
    api.account_deletion.getDeletionBlockers,
    open ? {} : "skip",
  );
  const requestDeletion = useMutation(api.account_deletion.requestAccountDeletion);
  const deleteImmediate = useMutation(api.account_deletion.deleteAccountImmediate);

  const [step, setStep] = useState<Step>("blockers");
  const [confirmCancelSub, setConfirmCancelSub] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const hasBlockers = useMemo(() => {
    if (!blockers) return false;
    return (
      blockers.futureBookings.length > 0 ||
      blockers.hostedUpcomingEventsWithAttendees.length > 0
    );
  }, [blockers]);

  const hasActiveSub = blockers?.activeSubscription != null;

  // Reset internal state whenever the dialog reopens.
  useEffect(() => {
    if (open) {
      setStep("blockers");
      setConfirmCancelSub(false);
      setConfirmText("");
      setError(null);
    }
  }, [open]);

  function handleAdvance() {
    setError(null);
    if (step === "blockers") {
      if (hasBlockers) return;
      setStep(hasActiveSub ? "subscription" : "confirm");
    } else if (step === "subscription") {
      if (!confirmCancelSub) return;
      setStep("confirm");
    }
  }

  async function handleSubmit() {
    if (confirmText.trim().toUpperCase() !== "DELETE") return;
    setStep("submitting");
    setError(null);
    try {
      await requestDeletion({
        confirmCancelSubscription: hasActiveSub ? true : undefined,
      });
      try {
        await signOut();
      } catch {
        // If sign-out fails, still navigate; middleware will handle the
        // soft-deleted state on next request.
      }
      router.push("/sign-in?deleted=1");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't schedule account deletion. Try again.",
      );
      setStep(hasActiveSub ? "subscription" : "confirm");
    }
  }

  async function handleImmediateDelete() {
    if (confirmText.trim().toUpperCase() !== "DELETE") return;
    setStep("submitting");
    setError(null);
    try {
      await deleteImmediate({});
      try {
        await signOut();
      } catch {
        // ignore — the user record is already gone
      }
      router.push("/sign-in?deleted=1");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't delete account.",
      );
      setStep("confirm");
    }
  }

  const title =
    step === "blockers"
      ? "Delete account"
      : step === "subscription"
        ? "Active subscription"
        : "Confirm deletion";

  const description =
    step === "blockers"
      ? "Your account, trips you solely own, and all your activity will be removed after a 30-day grace period."
      : step === "subscription"
        ? "Your subscription will be cancelled at the end of the current billing period."
        : "This is the final confirmation. You can still restore your account within 30 days by signing back in.";

  return (
    <Modal
      open={open}
      onClose={step === "submitting" ? () => undefined : onClose}
      title={title}
      description={description}
      footer={renderFooter()}
    >
      {step === "blockers" && renderBlockers()}
      {step === "subscription" && renderSubscription()}
      {step === "confirm" && renderConfirm()}
      {step === "submitting" && (
        <div className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Scheduling deletion…
        </div>
      )}
    </Modal>
  );

  function renderBlockers() {
    if (blockers === undefined) {
      return (
        <div className="space-y-3">
          <div className="h-12 animate-pulse rounded-lg bg-muted" />
          <div className="h-12 animate-pulse rounded-lg bg-muted" />
        </div>
      );
    }

    if (!hasBlockers) {
      return (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          No active obligations. You can proceed with deletion.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-error/40 bg-error/5 p-3">
          <div className="flex items-start gap-2 text-sm text-error">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Resolve these before continuing. Cancel each active booking, and
              cancel or hand over any event you&apos;re hosting that has
              other attendees going.
            </span>
          </div>
        </div>

        {blockers.futureBookings.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active bookings ({blockers.futureBookings.length})
            </h3>
            <ul className="space-y-2">
              {blockers.futureBookings.map((b) => (
                <li
                  key={b._id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-foreground">
                      {b.type.replace("_", " ")} · {b.apiSource}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {b.status} · {b.currency} {b.grossAmount.toFixed(2)}
                    </div>
                  </div>
                  <Link
                    href="/profile/bookings"
                    className="shrink-0 text-xs font-semibold text-primary hover:underline"
                  >
                    Manage <ExternalLink className="inline h-3 w-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {blockers.hostedUpcomingEventsWithAttendees.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Events you&apos;re hosting (
              {blockers.hostedUpcomingEventsWithAttendees.length})
            </h3>
            <ul className="space-y-2">
              {blockers.hostedUpcomingEventsWithAttendees.map((e) => (
                <li
                  key={e._id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-foreground">
                      {e.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(e.startDateUtc).toLocaleString()}
                    </div>
                  </div>
                  <Link
                    href={`/e/${e.slug}`}
                    className="shrink-0 text-xs font-semibold text-primary hover:underline"
                  >
                    Manage <ExternalLink className="inline h-3 w-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  function renderSubscription() {
    const sub = blockers?.activeSubscription;
    if (!sub) return null;
    const periodEnd = new Date(sub.currentPeriodEnd).toLocaleDateString();
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-background p-4 text-sm">
          <div className="font-semibold text-foreground">
            {sub.plan.toUpperCase()} subscription
          </div>
          <div className="mt-1 text-muted-foreground">
            Active until {periodEnd}. We&apos;ll set it to cancel at the end of
            the current billing period — no further charges.
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-3">
          <input
            type="checkbox"
            checked={confirmCancelSub}
            onChange={(e) => setConfirmCancelSub(e.target.checked)}
            className="mt-0.5 h-4 w-4"
          />
          <span className="text-sm text-foreground">
            Cancel my subscription at the end of the current period.
          </span>
        </label>
      </div>
    );
  }

  function renderConfirm() {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-error/40 bg-error/5 p-4 text-sm text-error">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">What happens next:</p>
              <ul className="list-disc space-y-0.5 pl-4 text-error/90">
                <li>Your account is locked for 30 days.</li>
                <li>Sign back in within 30 days to restore.</li>
                <li>
                  Trips you solely own are deleted. Co-owned trips transfer to
                  the next member.
                </li>
                <li>
                  Past bookings are anonymised but kept for tax records.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Type DELETE to confirm
          </span>
          <input
            type="text"
            autoFocus
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-mono uppercase tracking-wider focus:border-error focus:outline-none"
            placeholder="DELETE"
          />
        </label>

        {error && (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  function renderFooter() {
    const cancelButton = (
      <button
        type="button"
        onClick={onClose}
        disabled={step === "submitting"}
        className="h-10 flex-1 rounded-full bg-foreground/5 text-sm font-semibold text-foreground disabled:opacity-60"
      >
        Cancel
      </button>
    );

    if (step === "blockers") {
      return (
        <div className="flex gap-2">
          {cancelButton}
          <button
            type="button"
            onClick={handleAdvance}
            disabled={blockers === undefined || hasBlockers}
            className={cn(
              "h-10 flex-1 rounded-full text-sm font-semibold disabled:opacity-60",
              hasBlockers
                ? "bg-foreground/10 text-muted-foreground"
                : "bg-error text-white hover:bg-error/90",
            )}
          >
            Continue <ArrowRight className="inline h-4 w-4" />
          </button>
        </div>
      );
    }

    if (step === "subscription") {
      return (
        <div className="flex gap-2">
          {cancelButton}
          <button
            type="button"
            onClick={handleAdvance}
            disabled={!confirmCancelSub}
            className="h-10 flex-1 rounded-full bg-error text-sm font-semibold text-white hover:bg-error/90 disabled:opacity-60"
          >
            Continue <ArrowRight className="inline h-4 w-4" />
          </button>
        </div>
      );
    }

    if (step === "confirm") {
      const ready = confirmText.trim().toUpperCase() === "DELETE";
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            {cancelButton}
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!ready}
              className="h-10 flex-1 rounded-full bg-error text-sm font-semibold text-white hover:bg-error/90 disabled:opacity-60"
            >
              Delete account
            </button>
          </div>
          <button
            type="button"
            onClick={() => void handleImmediateDelete()}
            disabled={!ready}
            className="h-9 w-full rounded-full border border-dashed border-error/60 text-xs font-semibold text-error hover:bg-error/5 disabled:opacity-60"
          >
            Dev: delete immediately (skip blockers + grace period)
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        disabled
        className="h-10 w-full rounded-full bg-error/60 text-sm font-semibold text-white"
      >
        Working…
      </button>
    );
  }
}
