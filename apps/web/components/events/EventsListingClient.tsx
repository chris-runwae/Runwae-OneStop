"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Calendar, Search } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { EventCard } from "./EventCard";

const CATEGORY_FILTERS = [
  { k: "all", label: "All" },
  { k: "music", label: "Music" },
  { k: "food", label: "Food" },
  { k: "culture", label: "Culture" },
  { k: "sport", label: "Sport" },
  { k: "adventure", label: "Adventure" },
] as const;

export function EventsListingClient() {
  const events = useQuery(api.events.listPublished, { limit: 60 });
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!events) return undefined;
    let rows = events;
    if (filter !== "all") {
      rows = rows.filter((e) =>
        (e.category ?? "").toLowerCase().includes(filter)
      );
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.locationName.toLowerCase().includes(q) ||
          (e.category ?? "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [events, filter, query]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 lg:px-0">
      <header className="mb-4">
        <div className="flex items-center gap-2 text-[12.5px] font-semibold uppercase tracking-wider text-primary">
          <Calendar className="h-4 w-4" /> Events
        </div>
        <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
          What&apos;s happening
        </h1>
        <p className="mt-1 max-w-xl text-[14px] text-muted-foreground">
          Festivals, gigs, food markets and gatherings — pick something and
          plan a trip around it.
        </p>
      </header>

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events…"
            className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-[14px] text-foreground shadow-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORY_FILTERS.map((f) => {
            const on = filter === f.k;
            return (
              <button
                key={f.k}
                type="button"
                onClick={() => setFilter(f.k)}
                className={cn(
                  "h-9 shrink-0 rounded-full border px-3 text-[12.5px] font-medium transition-colors",
                  on
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {filtered === undefined ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="aspect-[4/4.5] w-full rounded-[15px]"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-center text-[13px] text-muted-foreground">
          No events match those filters yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((e, i) => (
            <EventCard key={e._id} event={e} index={i} fullWidth />
          ))}
        </div>
      )}
    </main>
  );
}
