"use client";
import type { Doc } from "@/convex/_generated/dataModel";
export function ItineraryTab(_: { trip: Doc<"trips">; viewer: Doc<"users"> | null }) {
  return <div className="py-8 text-sm text-foreground/60">Itinerary coming up…</div>;
}
