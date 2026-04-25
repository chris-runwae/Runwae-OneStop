"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { ALL_CATEGORIES, categoryFromType } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { SavedCard } from "../SavedCard";

type Props = { trip: Doc<"trips">; viewer: Doc<"users"> | null };

export function SavedTab({ trip, viewer }: Props) {
  const [activeCat, setActiveCat] = useState<string>("all");
  const items = useQuery(api.saved_items.getSavedItems, { tripId: trip._id });
  const days  = useQuery(api.itinerary.getItinerary, { tripId: trip._id });
  const counts = useQuery(
    api.posts.countBySavedItems,
    items ? { savedItemIds: items.map(i => i._id) } : "skip",
  );
  const promote = useMutation(api.saved_items.promoteToItinerary);

  if (items === undefined) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
      </div>
    );
  }

  const filtered = activeCat === "all"
    ? items
    : items.filter(i => categoryFromType(i.type).id === activeCat);

  const firstDayId: Id<"itinerary_days"> | undefined = days?.days?.[0]?._id;

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-3">
        <Chip on={activeCat === "all"} onClick={() => setActiveCat("all")}>All</Chip>
        {ALL_CATEGORIES.map(c => (
          <Chip key={c.id} on={activeCat === c.id} onClick={() => setActiveCat(c.id)}>
            {c.emoji} {c.label}
          </Chip>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-foreground/15 px-6 py-10 text-center text-sm text-foreground/60">
          {items.length === 0 ? "No saved items yet." : "No items in this category."}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(item => (
            <SavedCard
              key={item._id}
              item={item}
              commentCount={counts?.[item._id] ?? 0}
              displayCurrency={viewer?.preferredCurrency}
              onPromote={() => firstDayId && promote({ savedItemId: item._id, dayId: firstDayId })}
            />
          ))}
        </div>
      )}
    </>
  );
}

function Chip({ on, onClick, children }: React.PropsWithChildren<{ on: boolean; onClick: () => void }>) {
  return (
    <button onClick={onClick} className={cn(
      "h-9 flex-shrink-0 rounded-full px-4 text-xs font-medium",
      on ? "bg-primary text-primary-foreground" : "bg-foreground/5 text-foreground/70 hover:text-foreground",
    )}>{children}</button>
  );
}
