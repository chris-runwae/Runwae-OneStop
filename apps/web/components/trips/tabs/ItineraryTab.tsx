"use client";
import { useEffect, useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CalendarPlus, Plus } from "lucide-react";
import { ItineraryCard } from "../ItineraryCard";
import { TravelConnector } from "../TravelConnector";
import { AddItemModal } from "../AddItemModal";

type DayWeather = {
  date: string;
  tempMaxC: number | null;
  tempMinC: number | null;
  precipMm: number | null;
  code: number | null;
  label: string;
  emoji: string;
};

type Props = { trip: Doc<"trips">; viewer: Doc<"users"> | null };

type ItineraryDay = Doc<"itinerary_days"> & { items: Doc<"itinerary_items">[] };

export function ItineraryTab({ trip }: Props) {
  const data = useQuery(api.itinerary.getItinerary, { tripId: trip._id });
  const appendDay = useMutation(api.itinerary.appendDay);
  const reorderItem = useMutation(api.itinerary.reorderItem);
  const fetchWeather = useAction(api.weather.getDailyForecast);
  const [weatherByDate, setWeatherByDate] = useState<Record<string, DayWeather>>(
    {}
  );
  const [mode, setMode] = useState<"day" | "all">("day");
  const [activeDayId, setActiveDayId] = useState<Id<"itinerary_days"> | null>(
    null
  );
  const [addingDay, setAddingDay] = useState(false);
  const [draggingId, setDraggingId] =
    useState<Id<"itinerary_items"> | null>(null);

  const days: ItineraryDay[] = data?.days ?? [];

  // One Open-Meteo round-trip per trip — returns a date→forecast lookup we
  // splash onto the day pills. No-key, so it just works in dev.
  useEffect(() => {
    if (days.length === 0) return;
    const coords = trip.destinationCoords;
    if (!coords) return;
    const dates = days.map((d) => d.date);
    let cancelled = false;
    fetchWeather({ lat: coords.lat, lng: coords.lng, dates })
      .then((rows) => {
        if (cancelled) return;
        const map: Record<string, DayWeather> = {};
        for (const r of rows) map[r.date] = r;
        setWeatherByDate(map);
      })
      .catch(() => {
        /* swallow — chip just won't render */
      });
    return () => {
      cancelled = true;
    };
    // Dates are derived from days; depending on `days` directly would refetch
    // on every itinerary item edit, which we don't want.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    trip.destinationCoords?.lat,
    trip.destinationCoords?.lng,
    days.map((d) => d.date).join("|"),
  ]);

  const activeDay = useMemo(() => {
    if (!days.length) return null;
    return days.find((d) => d._id === activeDayId) ?? days[0];
  }, [days, activeDayId]);
  const [addDayId, setAddDayId] = useState<Id<"itinerary_days"> | null>(null);

  async function handleAddDay() {
    setAddingDay(true);
    try {
      await appendDay({ tripId: trip._id });
    } finally {
      setAddingDay(false);
    }
  }

  // Drop dragged item just below the targetItem (within the same day for now).
  // Uses a fractional sortOrder so we don't have to renumber siblings.
  async function handleDropOn(
    targetItem: Doc<"itinerary_items">,
    targetDayItems: Doc<"itinerary_items">[]
  ) {
    if (!draggingId || draggingId === targetItem._id) {
      setDraggingId(null);
      return;
    }
    const targetIndex = targetDayItems.findIndex(
      (i) => i._id === targetItem._id
    );
    const next = targetDayItems[targetIndex + 1];
    const newSortOrder = next
      ? (targetItem.sortOrder + next.sortOrder) / 2
      : targetItem.sortOrder + 1;

    await reorderItem({
      itemId: draggingId,
      sortOrder: newSortOrder,
      dayId: targetItem.dayId,
    });
    setDraggingId(null);
  }

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
        <p>No days yet on this itinerary.</p>
        <button
          type="button"
          onClick={handleAddDay}
          disabled={addingDay}
          className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground disabled:opacity-60"
        >
          <CalendarPlus className="h-4 w-4" />
          {addingDay ? "Adding…" : "Add Day 1"}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setMode((m) => (m === "all" ? "day" : "all"))}
          className={cn(
            "h-9 flex-shrink-0 rounded-full border px-4 text-xs font-semibold",
            mode === "all"
              ? "border-primary bg-primary/10 text-primary"
              : "border-foreground/15 text-foreground"
          )}
        >
          All days
        </button>
        {days.map((d) => {
          const date = new Date(d.date);
          const dow = date
            .toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })
            .toUpperCase();
          const num = date.getUTCDate();
          const active = mode === "day" && activeDay?._id === d._id;
          const weather = weatherByDate[d.date];
          return (
            <button
              key={d._id}
              onClick={() => {
                setMode("day");
                setActiveDayId(d._id);
              }}
              className="flex flex-shrink-0 flex-col items-center gap-1 px-1"
              title={
                weather
                  ? `${weather.label}${
                      weather.tempMaxC !== null
                        ? ` · ${Math.round(weather.tempMaxC)}°`
                        : ""
                    }`
                  : undefined
              }
            >
              <span
                className={cn(
                  "text-[9.5px] font-semibold tracking-wider",
                  active ? "text-primary" : "text-foreground/40"
                )}
              >
                {dow}
              </span>
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full text-sm font-semibold",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground"
                )}
              >
                {num}
              </span>
              {weather && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[10px] font-medium leading-none",
                    active ? "text-primary" : "text-foreground/60"
                  )}
                >
                  <span aria-hidden>{weather.emoji}</span>
                  {weather.tempMaxC !== null && (
                    <span>{Math.round(weather.tempMaxC)}°</span>
                  )}
                </span>
              )}
            </button>
          );
        })}
        {/* + day button — always visible, ends the day strip. */}
        <button
          type="button"
          onClick={handleAddDay}
          disabled={addingDay}
          aria-label="Add a day"
          className="ml-1 flex flex-shrink-0 flex-col items-center gap-1 px-1"
        >
          <span className="text-[9.5px] font-semibold tracking-wider text-foreground/40">
            ADD
          </span>
          <span className="grid h-9 w-9 place-items-center rounded-full border border-dashed border-foreground/30 text-foreground/60 transition-colors hover:border-primary hover:text-primary disabled:opacity-60">
            <Plus className="h-4 w-4" />
          </span>
        </button>
      </div>

      {mode === "day" && activeDay ? (
        <DayView
          day={activeDay}
          onAdd={() => setAddDayId(activeDay._id)}
          draggingId={draggingId}
          onDragStart={setDraggingId}
          onDragEnd={() => setDraggingId(null)}
          onDropOn={handleDropOn}
        />
      ) : (
        <div className="space-y-3">
          {days.map((d) => (
            <CollapsibleDayView
              key={d._id}
              day={d}
              onAdd={() => setAddDayId(d._id)}
              draggingId={draggingId}
              onDragStart={setDraggingId}
              onDragEnd={() => setDraggingId(null)}
              onDropOn={handleDropOn}
            />
          ))}
        </div>
      )}

      {addDayId && (
        <AddItemModal
          open
          onClose={() => setAddDayId(null)}
          target={{ kind: "itinerary", tripId: trip._id, dayId: addDayId }}
        />
      )}
    </>
  );
}

// Collapsible variant used in "All days" view — keeps the page short and
// makes drag-and-drop ergonomic. Single-day view uses DayView directly.
function CollapsibleDayView(props: {
  day: ItineraryDay;
  onAdd: () => void;
  draggingId: Id<"itinerary_items"> | null;
  onDragStart: (id: Id<"itinerary_items">) => void;
  onDragEnd: () => void;
  onDropOn: (
    target: Doc<"itinerary_items">,
    siblings: Doc<"itinerary_items">[]
  ) => void;
}) {
  const { day } = props;
  // Default open for the first 2 days; collapsed after that to reduce noise.
  const [open, setOpen] = useState(day.dayNumber <= 2);
  const itemCount = day.items?.length ?? 0;
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
      >
        <div className="flex items-baseline gap-2">
          <span className="font-display text-base font-bold text-foreground">
            Day {day.dayNumber}
            {day.title ? ` — ${day.title}` : ""}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {day.date} · {itemCount} item{itemCount === 1 ? "" : "s"}
          </span>
        </div>
        <span
          className={cn(
            "grid h-7 w-7 place-items-center rounded-full bg-foreground/5 text-foreground/60 transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="px-3 pb-3">
          <DayView {...props} hideHeader />
        </div>
      )}
    </section>
  );
}

function DayView({
  day,
  onAdd,
  draggingId,
  onDragStart,
  onDragEnd,
  onDropOn,
  hideHeader = false,
}: {
  day: ItineraryDay;
  onAdd: () => void;
  draggingId: Id<"itinerary_items"> | null;
  onDragStart: (id: Id<"itinerary_items">) => void;
  onDragEnd: () => void;
  onDropOn: (
    target: Doc<"itinerary_items">,
    siblings: Doc<"itinerary_items">[]
  ) => void;
  hideHeader?: boolean;
}) {
  const detail = useQuery(api.itinerary.getDayWithTravelTimes, {
    dayId: day._id,
  });
  const items: Doc<"itinerary_items">[] = detail?.items ?? day.items ?? [];
  const legs = detail?.legs ?? [];

  return (
    <section className={hideHeader ? "" : "mt-4"}>
      {!hideHeader && (
        <header className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold">
            Day {day.dayNumber}
            {day.title ? ` — ${day.title}` : ""}
          </h2>
          <span className="text-xs text-foreground/60">{day.date}</span>
        </header>
      )}
      <div className="space-y-3">
        {items.map((it, i) => (
          <div
            key={it._id}
            onDrop={(e) => {
              e.preventDefault();
              onDropOn(it, items);
            }}
          >
            <ItineraryCard
              item={it}
              isDragging={draggingId === it._id}
              onDragStart={() => onDragStart(it._id)}
              onDragEnd={onDragEnd}
            />
            {i < items.length - 1 && (
              <TravelConnector
                distanceKm={legs[i]?.distanceKm}
                durationMin={legs[i]?.durationMin}
              />
            )}
          </div>
        ))}
        <button
          onClick={onAdd}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary text-sm font-semibold text-primary"
        >
          <Plus className="h-4 w-4" /> Add to Day {day.dayNumber}
        </button>
      </div>
    </section>
  );
}
