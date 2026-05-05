"use client";
import { cn } from "@/lib/utils";

export function DateRangePicker({
  start, end, onChange, className,
}: {
  start: string;
  end: string;
  onChange: (v: { start: string; end: string }) => void;
  className?: string;
}) {
  const nights = computeNights(start, end);
  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Start">
          <input
            type="date"
            value={start}
            onChange={(e) => {
              const newStart = e.target.value;
              const newEnd = end && end < newStart ? newStart : end;
              onChange({ start: newStart, end: newEnd });
            }}
            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:border-primary focus:outline-none"
          />
        </Field>
        <Field label="End">
          <input
            type="date"
            value={end}
            min={start || undefined}
            onChange={(e) => onChange({ start, end: e.target.value })}
            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:border-primary focus:outline-none"
          />
        </Field>
      </div>
      {nights > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {nights} night{nights === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function computeNights(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = Date.parse(start);
  const e = Date.parse(end);
  if (Number.isNaN(s) || Number.isNaN(e) || e < s) return 0;
  return Math.round((e - s) / 86400000);
}
