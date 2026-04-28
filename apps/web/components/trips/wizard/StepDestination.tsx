"use client";
import { LocationPicker, type LocationValue } from "@/components/ui/location-picker";
import { Button } from "@/components/ui/button";

export function StepDestination({
  value,
  onChange,
  error,
  onNext,
}: {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
  error: string | null;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <header className="space-y-1 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">Where to?</h2>
        <p className="text-sm text-muted-foreground">Pick a destination — search or type your own.</p>
      </header>
      <LocationPicker value={value} onChange={onChange} />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="button" size="lg" className="w-full" onClick={onNext}>
        Continue
      </Button>
    </div>
  );
}
