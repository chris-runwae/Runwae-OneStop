"use client";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";

export function StepDates({
  value,
  onChange,
  error,
  onNext,
  onBack,
}: {
  value: { start: string; end: string };
  onChange: (v: { start: string; end: string }) => void;
  error: string | null;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <header className="space-y-1 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">When are you going?</h2>
        <p className="text-sm text-muted-foreground">Choose your travel dates.</p>
      </header>
      <DateRangePicker start={value.start} end={value.end} onChange={onChange} />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button type="button" size="lg" className="flex-1" onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}
