"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { CalendarDays, Bookmark } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Sheet } from "@/components/ui/sheet";
import { DayPickerSheet } from "./DayPickerSheet";

type DiscoveryItem = {
  provider: string;
  apiRef: string;
  category: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  externalUrl?: string;
  locationName?: string;
  coords?: { lat: number; lng: number };
};

function uiCategoryToType(cat: string): Doc<"saved_items">["type"] {
  switch (cat) {
    case "stay": return "hotel";
    case "tour": return "tour";
    case "adventure": return "activity";
    case "event": return "event";
    case "eat": return "restaurant";
    case "ride": return "transport";
    case "fly": return "flight";
    case "shop": return "other";
    default: return "other";
  }
}

export function AddDiscoveryItemSheet({
  open, onClose, tripId, item,
}: {
  open: boolean;
  onClose: () => void;
  tripId: Id<"trips">;
  item: DiscoveryItem | null;
}) {
  const [pickingDay, setPickingDay] = useState(false);
  const addSaved = useMutation(api.saved_items.addSavedItem);
  const addItineraryItem = useMutation(api.itinerary.addItem);

  if (!item) return null;

  async function saveItem(target: { kind: "saved" } | { kind: "itinerary"; dayId: Id<"itinerary_days"> }) {
    const type = uiCategoryToType(item!.category);
    if (target.kind === "saved") {
      await addSaved({
        tripId,
        type,
        title: item!.title,
        description: item!.description,
        imageUrl: item!.imageUrl,
        price: item!.price,
        currency: item!.currency,
        externalUrl: item!.externalUrl,
        locationName: item!.locationName,
        coords: item!.coords,
        apiSource: item!.provider,
        apiRef: item!.apiRef,
        isManual: false,
      });
    } else {
      await addItineraryItem({
        tripId,
        dayId: target.dayId,
        type,
        title: item!.title,
        description: item!.description,
        imageUrl: item!.imageUrl,
        price: item!.price,
        currency: item!.currency,
        locationName: item!.locationName,
        coords: item!.coords,
        apiSource: item!.provider,
        apiRef: item!.apiRef,
      });
    }
    onClose();
  }

  return (
    <>
      <Sheet open={open && !pickingDay} onClose={onClose} title={item.title}>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setPickingDay(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:bg-muted"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
              <CalendarDays className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-foreground">Add to itinerary</span>
              <span className="block text-xs text-muted-foreground">Pin to a specific day</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => saveItem({ kind: "saved" })}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:bg-muted"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
              <Bookmark className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-foreground">Add to Saved</span>
              <span className="block text-xs text-muted-foreground">Decide which day later</span>
            </span>
          </button>
        </div>
      </Sheet>

      <DayPickerSheet
        open={open && pickingDay}
        onClose={() => setPickingDay(false)}
        tripId={tripId}
        onPick={(dayId) => {
          void saveItem({ kind: "itinerary", dayId });
          setPickingDay(false);
        }}
      />
    </>
  );
}
