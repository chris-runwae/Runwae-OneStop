"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import {
  Bookmark,
  Building2,
  Compass,
  Heart,
  Map as MapIcon,
  MapPin,
  Plane,
  Ticket,
  UtensilsCrossed,
  Sparkles,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { AddToTripModal, type DiscoverPayload } from "@/components/discover/AddToTripModal";

type Cat = Doc<"user_saves">["category"];

const GROUPS: Array<{ key: Cat | "all"; label: string; Icon: typeof Heart }> = [
  { key: "all",         label: "All",          Icon: Heart },
  { key: "trip",        label: "Trips",        Icon: MapIcon },
  { key: "destination", label: "Destinations", Icon: Compass },
  { key: "hotel",       label: "Hotels",       Icon: Building2 },
  { key: "tour",        label: "Tours",        Icon: Sparkles },
  { key: "activity",    label: "Activities",   Icon: Sparkles },
  { key: "restaurant",  label: "Restaurants",  Icon: UtensilsCrossed },
  { key: "event",       label: "Events",       Icon: Ticket },
  { key: "flight",      label: "Flights",      Icon: Plane },
  { key: "other",       label: "Other",        Icon: Bookmark },
];

const CAT_LABEL: Record<Cat, string> = {
  trip: "Trip",
  destination: "Destination",
  hotel: "Hotel",
  tour: "Tour",
  activity: "Activity",
  restaurant: "Restaurant",
  event: "Event",
  flight: "Flight",
  other: "Saved",
};

export default function SavedPage() {
  const saves = useQuery(api.user_saves.listGrouped, {});
  const [active, setActive] = useState<Cat | "all">("all");
  const [addItem, setAddItem] = useState<DiscoverPayload | null>(null);

  const grouped = useMemo(() => {
    if (!saves) return null;
    const map = new Map<Cat, Doc<"user_saves">[]>();
    for (const r of saves) {
      const list = map.get(r.category) ?? [];
      list.push(r);
      map.set(r.category, list);
    }
    return map;
  }, [saves]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 lg:px-7">
      <header className="mb-4">
        <h1 className="font-display text-2xl font-bold text-foreground">Saved</h1>
        <p className="text-sm text-muted-foreground">
          Everything you&apos;ve hearted across Runwae.
        </p>
      </header>

      {saves !== undefined && saves.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {GROUPS.filter(
            (g) => g.key === "all" || (grouped && grouped.has(g.key as Cat))
          ).map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className={
                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors " +
                (active === key
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground")
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      )}

      {saves === undefined ? (
        <div className="space-y-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : saves.length === 0 ? (
        <EmptyState />
      ) : active === "all" ? (
        <AllGroups grouped={grouped} onAdd={setAddItem} />
      ) : (
        <SingleGroup
          rows={grouped?.get(active) ?? []}
          label={GROUPS.find((g) => g.key === active)?.label ?? "Saved"}
          onAdd={setAddItem}
        />
      )}

      <AddToTripModal
        open={addItem !== null}
        onClose={() => setAddItem(null)}
        item={addItem}
      />
    </main>
  );
}

function AllGroups({
  grouped,
  onAdd,
}: {
  grouped: Map<Cat, Doc<"user_saves">[]> | null;
  onAdd: (item: DiscoverPayload) => void;
}) {
  if (!grouped) return null;
  const order: Cat[] = ["trip", "destination", "hotel", "tour", "activity", "restaurant", "event", "flight", "other"];
  return (
    <div className="space-y-7">
      {order
        .filter((k) => grouped.has(k))
        .map((k) => {
          const rows = grouped.get(k)!;
          const label = GROUPS.find((g) => g.key === k)?.label ?? CAT_LABEL[k];
          return (
            <SingleGroup key={k} label={label} rows={rows} onAdd={onAdd} compact />
          );
        })}
    </div>
  );
}

function SingleGroup({
  label,
  rows,
  onAdd,
  compact,
}: {
  label: string;
  rows: Doc<"user_saves">[];
  onAdd: (item: DiscoverPayload) => void;
  compact?: boolean;
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-bold tracking-tight">{label}</h2>
        <span className="text-xs text-muted-foreground">{rows.length}</span>
      </div>
      <div className={"grid gap-3 " + (compact ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2 lg:grid-cols-3")}>
        {rows.map((r) => (
          <SaveCard key={r._id} row={r} onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}

function SaveCard({
  row,
  onAdd,
}: {
  row: Doc<"user_saves">;
  onAdd: (item: DiscoverPayload) => void;
}) {
  const removeSave = useMutation(api.user_saves.remove);
  const price =
    row.price !== undefined && row.currency
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: row.currency,
          maximumFractionDigits: 0,
        }).format(row.price)
      : null;

  const Wrapper = row.externalUrl ? "a" : "div";
  const wrapperProps: { href?: string; target?: string; rel?: string } = row.externalUrl
    ? { href: row.externalUrl, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-transform hover:-translate-y-0.5">
      <Wrapper {...wrapperProps} className="block">
        <div className="relative aspect-[4/3] w-full bg-muted">
          {row.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.imageUrl}
              alt={row.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-foreground/10 to-foreground/5" />
          )}
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
            {CAT_LABEL[row.category]}
          </span>
          {price && (
            <span className="absolute bottom-2 left-2 inline-flex rounded-full bg-white/95 px-2 py-1 text-[10.5px] font-bold text-[#0F0F0F]">
              From {price}
            </span>
          )}
        </div>
      </Wrapper>
      <div className="px-3 pb-3 pt-2.5">
        <div className="mb-0.5 line-clamp-1 text-sm font-semibold">{row.title}</div>
        {row.locationName && (
          <div className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {row.locationName}
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() =>
              removeSave({ provider: row.provider, apiRef: row.apiRef })
            }
            className="text-xs font-semibold text-muted-foreground hover:text-destructive"
          >
            Remove
          </button>
          <button
            type="button"
            onClick={() =>
              onAdd({
                provider: row.provider,
                apiRef: row.apiRef,
                category: row.category,
                title: row.title,
                description: row.description ?? undefined,
                imageUrl: row.imageUrl ?? undefined,
                price: row.price ?? undefined,
                currency: row.currency ?? undefined,
                locationName: row.locationName ?? undefined,
                coords: row.coords ?? undefined,
                externalUrl: row.externalUrl ?? undefined,
              })
            }
            className="inline-flex h-7 items-center gap-1 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            + Add to Trip
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <Heart className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
      <h2 className="font-display text-base font-bold text-foreground">
        Nothing saved yet
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Tap the heart on any Discover card to save it here.
      </p>
      <Link
        href="/explore"
        className="mt-4 inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Browse Discover
      </Link>
    </div>
  );
}
