"use client";
import Link from "next/link";
import { ArrowLeft, Share2, MoreHorizontal, MapPin, Calendar } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";
import { formatDateRange } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  trip: Doc<"trips">;
  destinationLabel?: string;
  timezone?: string;
};

export function TripHero({ trip, destinationLabel, timezone = "UTC" }: Props) {
  const startMs = Date.parse(trip.startDate);
  const endMs   = Date.parse(trip.endDate);
  return (
    <section className={cn(
      "relative isolate overflow-hidden rounded-2xl",
      "h-72 md:h-96 lg:h-[420px]",
      "bg-foreground/5",
    )}>
      {trip.coverImageUrl && (
        <img
          src={trip.coverImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/30" />

      <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between">
        <Link href="/home" aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-black backdrop-blur">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex gap-2">
          <button aria-label="Share" className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-black backdrop-blur">
            <Share2 className="h-4 w-4" />
          </button>
          <button aria-label="Options" className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-black backdrop-blur">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-5 left-5 right-5 z-10 text-white">
        <h1 className="font-display text-2xl font-bold leading-tight md:text-4xl">
          {trip.title}
        </h1>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {(destinationLabel ?? trip.destinationLabel) && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-3 py-1 backdrop-blur">
              <MapPin className="h-3 w-3" /> {destinationLabel ?? trip.destinationLabel}
            </span>
          )}
          {!Number.isNaN(startMs) && !Number.isNaN(endMs) && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-3 py-1 backdrop-blur">
              <Calendar className="h-3 w-3" /> {formatDateRange(startMs, endMs, timezone)}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
