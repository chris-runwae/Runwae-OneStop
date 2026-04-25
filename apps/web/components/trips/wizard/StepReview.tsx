"use client";
import { Button } from "@/components/ui/button";
import type { LocationValue } from "@/components/ui/location-picker";
import type { DetailsValue } from "./StepDetails";

function computeNights(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = Date.parse(start);
  const e = Date.parse(end);
  if (Number.isNaN(s) || Number.isNaN(e) || e < s) return 0;
  return Math.round((e - s) / 86400000);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function StepReview({
  destination,
  dates,
  details,
  error,
  submitting,
  onCreate,
  onBack,
}: {
  destination: LocationValue;
  dates: { start: string; end: string };
  details: DetailsValue;
  error: string | null;
  submitting: boolean;
  onCreate: () => void;
  onBack: () => void;
}) {
  const nights = computeNights(dates.start, dates.end);

  return (
    <div className="space-y-4">
      <header className="space-y-1 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">Review your trip</h2>
        <p className="text-sm text-muted-foreground">Everything look good? Let&apos;s go.</p>
      </header>

      {/* Summary card */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3 text-sm">
        {/* Cover image preview */}
        {details.coverImageUrl.trim() && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={details.coverImageUrl.trim()}
            alt="Cover"
            className="h-36 w-full rounded-xl object-cover"
          />
        )}

        <Row label="Destination" value={destination.destinationLabel || "—"} />
        <Row
          label="Dates"
          value={
            dates.start && dates.end
              ? `${formatDate(dates.start)} → ${formatDate(dates.end)} (${nights} night${nights === 1 ? "" : "s"})`
              : "—"
          }
        />
        <Row label="Title" value={details.title || "—"} />
        <Row label="Description" value={details.description.trim() || "—"} />
        <Row label="Currency" value={details.currency} />
        <Row
          label="Visibility"
          value={details.visibility.charAt(0).toUpperCase() + details.visibility.slice(1)}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={onCreate}
        isLoading={submitting}
        disabled={submitting}
      >
        Create trip
      </Button>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={onBack}
        disabled={submitting}
      >
        Back
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
      <span className="flex-1 font-medium text-foreground break-words">{value}</span>
    </div>
  );
}
