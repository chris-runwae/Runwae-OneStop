"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { AddDiscoveryItemSheet } from "../AddDiscoveryItemSheet";

type DiscoveryItem = {
  provider: string;
  apiRef: string;
  category: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
};

const RAILS = [
  { id: "stay",      label: "Where to stay" },
  { id: "tour",      label: "Tours & experiences" },
  { id: "adventure", label: "Adventure" },
  { id: "eat",       label: "Where to eat" },
  { id: "event",     label: "Events" },
];

export function DiscoverTab({
  trip, viewer,
}: { trip: Doc<"trips">; viewer: Doc<"users"> | null }) {
  const search = useAction(api.discovery.searchByCategory);
  const [byCategory, setByCategory] = useState<Record<string, DiscoveryItem[] | undefined>>({});
  const [active, setActive] = useState<DiscoveryItem | null>(null);
  const term = trip.destinationLabel ?? "";
  const lat = trip.destinationCoords?.lat;
  const lng = trip.destinationCoords?.lng;
  const checkin = trip.startDate;
  const checkout = trip.endDate;
  const displayCurrency = viewer?.preferredCurrency;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      for (const rail of RAILS) {
        try {
          const items = await search({
            category: rail.id,
            term,
            lat,
            lng,
            limit: 10,
            checkin,
            checkout,
          });
          if (!cancelled) {
            setByCategory((prev) => ({ ...prev, [rail.id]: items as DiscoveryItem[] }));
          }
        } catch (err) {
          console.error("[discover] failed", rail.id, err);
          if (!cancelled) setByCategory((prev) => ({ ...prev, [rail.id]: [] }));
        }
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [search, term, lat, lng, checkin, checkout]);

  return (
    <div className="space-y-6">
      {!term && (
        <div className="rounded-2xl border border-dashed border-foreground/15 px-6 py-8 text-center text-sm text-foreground/60">
          Set a destination on this trip to tailor suggestions, or browse popular picks below.
        </div>
      )}
      {RAILS.map((rail) => {
        const items = byCategory[rail.id];
        return (
          <section key={rail.id}>
            <header className="mb-2 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-foreground">{rail.label}</h3>
            </header>
            {items === undefined ? (
              <div className="flex gap-3 overflow-x-auto pb-2">
                <Skeleton className="h-44 w-52 shrink-0 rounded-xl" />
                <Skeleton className="h-44 w-52 shrink-0 rounded-xl" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nothing yet for this category.</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {items.map((item) => (
                  <Link
                    key={`${item.provider}:${item.apiRef}`}
                    href={`/discover/${item.provider}/${encodeURIComponent(item.apiRef)}?category=${item.category}&tripId=${trip._id}`}
                    className="block w-52 shrink-0 overflow-hidden rounded-xl border border-border bg-card transition-transform hover:-translate-y-0.5"
                  >
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
                    )}
                    <div className="p-3">
                      <div className="text-sm font-semibold text-foreground">{item.title}</div>
                      {item.description && (
                        <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        {item.price != null && item.currency ? (
                          <span className="text-sm font-semibold text-foreground">
                            {formatCurrency(item.price, item.currency, displayCurrency)}
                          </span>
                        ) : <span />}
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActive(item); }}
                          className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <AddDiscoveryItemSheet
        open={active !== null}
        onClose={() => setActive(null)}
        tripId={trip._id}
        item={active}
      />
    </div>
  );
}
