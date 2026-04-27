"use client";
import type { Doc } from "@/convex/_generated/dataModel";
import { DiscoverGrid } from "@/components/discover/DiscoverGrid";
import { nearestIata } from "@/lib/iata";

export function DiscoverTab({
  trip,
  viewer: _viewer,
}: {
  trip: Doc<"trips">;
  viewer: Doc<"users"> | null;
}) {
  const city = trip.destinationLabel ?? "";
  const coords = trip.destinationCoords ?? undefined;
  // Trip context lets us derive an IATA from coords + label for Duffel.
  const iata = coords ? nearestIata(coords, city) : null;

  if (!city) {
    return (
      <div className="rounded-2xl border border-dashed border-foreground/15 px-6 py-8 text-center text-sm text-foreground/60">
        Set a destination on this trip to see tailored Discover suggestions.
      </div>
    );
  }

  return (
    <DiscoverGrid
      city={city}
      coords={coords}
      iata={iata}
      checkin={trip.startDate}
      checkout={trip.endDate}
      presetTripId={trip._id}
    />
  );
}
