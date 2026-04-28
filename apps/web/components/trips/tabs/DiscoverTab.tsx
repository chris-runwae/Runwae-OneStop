"use client";
import type { Doc } from "@/convex/_generated/dataModel";
import { DiscoverGrid } from "@/components/discover/DiscoverGrid";
import { nearestIata } from "@/lib/iata";

export function DiscoverTab({
  trip,
  viewer,
}: {
  trip: Doc<"trips">;
  viewer: Doc<"users"> | null;
}) {
  const city = trip.destinationLabel ?? "";
  const coords = trip.destinationCoords ?? undefined;

  // Origin = closest airport to the viewer's home (homeIata wins if set).
  // Destination = closest airport to the trip's destinationCoords. Both
  // feed Duffel so flight searches match the actual journey.
  const originIata =
    viewer?.homeIata ??
    (viewer?.homeCoords
      ? nearestIata(viewer.homeCoords, viewer.homeCity ?? undefined)
      : null);
  const destinationIata = coords ? nearestIata(coords, city) : null;

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
      originIata={originIata}
      destinationIata={destinationIata}
      checkin={trip.startDate}
      checkout={trip.endDate}
      presetTripId={trip._id}
    />
  );
}
