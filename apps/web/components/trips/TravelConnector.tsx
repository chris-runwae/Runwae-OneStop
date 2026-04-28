import { Car } from "lucide-react";

export function TravelConnector({ distanceKm, durationMin }: {
  distanceKm?: number;
  durationMin?: number;
}) {
  if (distanceKm == null || durationMin == null) return null;
  return (
    <div className="my-2 ml-4 flex items-center gap-2 pl-4 text-xs text-foreground/60">
      <span className="grid h-6 w-6 place-items-center rounded-full border border-foreground/10 bg-foreground/5">
        <Car className="h-3 w-3" />
      </span>
      <span>{distanceKm} km · {durationMin} min</span>
    </div>
  );
}
