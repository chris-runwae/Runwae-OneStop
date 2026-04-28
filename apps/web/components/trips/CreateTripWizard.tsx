"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import type { LocationValue } from "@/components/ui/location-picker";
import { StepDestination } from "./wizard/StepDestination";
import { StepDates } from "./wizard/StepDates";
import { StepDetails, type DetailsValue } from "./wizard/StepDetails";
import { StepInvite } from "./wizard/StepInvite";
import { StepReview } from "./wizard/StepReview";

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 pb-2">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-2 w-2 rounded-full transition-colors",
            i <= current ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  );
}

export function CreateTripWizard() {
  const router = useRouter();
  const createTrip = useMutation(api.trips.createTrip);
  const inviteToTrip = useMutation(api.trips.inviteToTrip);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [destination, setDestination] = useState<LocationValue>({
    destinationLabel: "",
  });
  const [dates, setDates] = useState({ start: "", end: "" });
  const [details, setDetails] = useState<DetailsValue>({
    title: "",
    description: "",
    coverImageUrl: "",
    currency: "GBP",
    visibility: "private",
  });
  const [inviteIds, setInviteIds] = useState<Id<"users">[]>([]);

  function clearError() {
    setError(null);
  }

  function handleBack() {
    clearError();
    setStep((s) => Math.max(0, s - 1));
  }

  function handleStep0Next() {
    clearError();
    if (!destination.destinationLabel.trim()) {
      setError("Please enter a destination.");
      return;
    }
    setStep(1);
  }

  function handleStep1Next() {
    clearError();
    if (!dates.start || !dates.end) {
      setError("Please select both a start and end date.");
      return;
    }
    if (dates.end < dates.start) {
      setError("End date must be on or after the start date.");
      return;
    }
    setStep(2);
  }

  function handleStep2Next() {
    clearError();
    if (!details.title.trim()) {
      setError("Please give your trip a title.");
      return;
    }
    setStep(3);
  }

  function handleStep3Next() {
    // Invite step is optional; just advance.
    clearError();
    setStep(4);
  }

  async function handleCreate() {
    setSubmitting(true);
    setError(null);
    try {
      const result = await createTrip({
        title: details.title.trim(),
        description: details.description.trim() || undefined,
        destinationLabel: destination.destinationLabel,
        destinationCoords: destination.coords,
        startDate: dates.start,
        endDate: dates.end,
        visibility: details.visibility,
        currency: details.currency,
        coverImageUrl: details.coverImageUrl.trim() || undefined,
      });

      // Fire-and-forget invites — failures here shouldn't block trip creation,
      // we just log them. The invitee gets a `trip_invite` notification +
      // a pending `trip_members` row from `trips.inviteToTrip`.
      if (inviteIds.length > 0) {
        await Promise.allSettled(
          inviteIds.map((id) =>
            inviteToTrip({ tripId: result.tripId, inviteeId: id })
          )
        );
      }

      router.push(`/trips/${result.slug}/share`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create trip.");
      setSubmitting(false);
    }
  }

  const totalSteps = 5;

  return (
    <div className="space-y-6">
      <ProgressDots current={step} total={totalSteps} />

      {step === 0 && (
        <StepDestination
          value={destination}
          onChange={(v) => {
            setDestination(v);
            clearError();
          }}
          error={error}
          onNext={handleStep0Next}
        />
      )}

      {step === 1 && (
        <StepDates
          value={dates}
          onChange={(v) => {
            setDates(v);
            clearError();
          }}
          error={error}
          onNext={handleStep1Next}
          onBack={handleBack}
        />
      )}

      {step === 2 && (
        <StepDetails
          value={details}
          onChange={(v) => {
            setDetails(v);
            clearError();
          }}
          error={error}
          onNext={handleStep2Next}
          onBack={handleBack}
          seedQuery={destination.destinationLabel}
        />
      )}

      {step === 3 && (
        <StepInvite
          selectedIds={inviteIds}
          onChange={setInviteIds}
          onNext={handleStep3Next}
          onBack={handleBack}
        />
      )}

      {step === 4 && (
        <StepReview
          destination={destination}
          dates={dates}
          details={details}
          error={error}
          submitting={submitting}
          onCreate={handleCreate}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
