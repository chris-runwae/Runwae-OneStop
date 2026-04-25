"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Plus, MapPin } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateRange } from "@/lib/format";

export default function TripsPage() {
  const trips = useQuery(api.trips.getMyTrips, {});

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My trips</h1>
          <p className="text-sm text-muted-foreground">Plans you&apos;re part of.</p>
        </div>
        <Link
          href="/trips/new"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> New trip
        </Link>
      </header>

      {trips === undefined ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : trips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
          <h2 className="font-display text-lg font-bold text-foreground">No trips yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Start planning your first adventure.
          </p>
          <Link
            href="/trips/new"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Create a trip
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((t) => {
            const startMs = Date.parse(t.startDate);
            const endMs = Date.parse(t.endDate);
            const dateText =
              !Number.isNaN(startMs) && !Number.isNaN(endMs)
                ? formatDateRange(startMs, endMs, "UTC")
                : "";
            return (
              <li key={t._id}>
                <Link
                  href={`/trips/${t.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-border bg-card transition-transform hover:-translate-y-0.5"
                >
                  {t.coverImageUrl && (
                    <img
                      src={t.coverImageUrl}
                      alt=""
                      className="h-40 w-full object-cover transition-transform group-hover:scale-105"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="line-clamp-1 font-display text-base font-bold text-foreground">
                      {t.title}
                    </h3>
                    {t.destinationLabel && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {t.destinationLabel}
                      </p>
                    )}
                    {dateText && (
                      <p className="mt-2 text-xs text-foreground/70">{dateText}</p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
