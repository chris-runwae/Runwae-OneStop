"use client";
import type { Doc } from "@/convex/_generated/dataModel";

export function TripDetailClient({ slug, initialTrip }: {
  slug: string;
  initialTrip: Doc<"trips">;
}) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold">{initialTrip.title}</h1>
      <p className="text-sm text-foreground/60">{slug}</p>
    </main>
  );
}
