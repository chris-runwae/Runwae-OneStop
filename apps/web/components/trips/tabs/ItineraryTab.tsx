"use client";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { ItineraryCard } from "../ItineraryCard";
import { TravelConnector } from "../TravelConnector";

type Props = { trip: Doc<"trips">; viewer: Doc<"users"> | null };

type ItineraryDay = Doc<"itinerary_days"> & { items: Doc<"itinerary_items">[] };

export function ItineraryTab({ trip }: Props) {
  const data = useQuery(api.itinerary.getItinerary, { tripId: trip._id });
  const [mode, setMode] = useState<"day" | "all">("day");
  const [activeDayId, setActiveDayId] = useState<Id<"itinerary_days"> | null>(null);

  const days: ItineraryDay[] = data?.days ?? [];
  const activeDay = useMemo(() => {
    if (!days.length) return null;
    return days.find(d => d._id === activeDayId) ?? days[0];
  }, [days, activeDayId]);

  if (data === undefined) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (!days.length) {
    return (
      <div className="rounded-2xl border border-dashed border-foreground/15 px-6 py-10 text-center text-sm text-foreground/60">
        No days yet — add the first one to get started.
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setMode(m => m === "all" ? "day" : "all")}
          className={cn(
            "h-9 flex-shrink-0 rounded-full border px-4 text-xs font-semibold",
            mode === "all"
              ? "border-primary bg-primary/10 text-primary"
              : "border-foreground/15 text-foreground",
          )}
        >
          All days
        </button>
        {days.map(d => {
          const date = new Date(d.date);
          const dow = date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }).toUpperCase();
          const num = date.getUTCDate();
          const active = mode === "day" && (activeDay?._id === d._id);
          return (
            <button
              key={d._id}
              onClick={() => { setMode("day"); setActiveDayId(d._id); }}
              className="flex flex-shrink-0 flex-col items-center gap-1 px-1"
            >
              <span className={cn("text-[9.5px] font-semibold tracking-wider", active ? "text-primary" : "text-foreground/40")}>{dow}</span>
              <span className={cn(
                "grid h-9 w-9 place-items-center rounded-full text-sm font-semibold",
                active ? "bg-primary text-primary-foreground" : "text-foreground",
              )}>{num}</span>
            </button>
          );
        })}
      </div>

      {mode === "day" && activeDay ? (
        <DayView day={activeDay} />
      ) : (
        <div className="space-y-6">
          {days.map(d => <DayView key={d._id} day={d} />)}
        </div>
      )}
    </>
  );
}

function DayView({ day }: { day: ItineraryDay }) {
  const detail = useQuery(api.itinerary.getDayWithTravelTimes, { dayId: day._id });
  const items: Doc<"itinerary_items">[] = detail?.items ?? day.items ?? [];
  const legs = detail?.legs ?? [];

  return (
    <section className="mt-4">
      <header className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-xl font-bold">
          Day {day.dayNumber}{day.title ? ` — ${day.title}` : ""}
        </h2>
        <span className="text-xs text-foreground/60">{day.date}</span>
      </header>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={it._id}>
            <ItineraryCard item={it} />
            {i < items.length - 1 && <TravelConnector distanceKm={legs[i]?.distanceKm} durationMin={legs[i]?.durationMin} />}
          </div>
        ))}
        <button className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary text-sm font-semibold text-primary">
          <Plus className="h-4 w-4" /> Add to Day {day.dayNumber}
        </button>
      </div>
    </section>
  );
}
