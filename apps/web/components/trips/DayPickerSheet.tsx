"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

export function DayPickerSheet({
  open, onClose, tripId, onPick,
}: {
  open: boolean;
  onClose: () => void;
  tripId: Id<"trips">;
  onPick: (dayId: Id<"itinerary_days">) => void;
}) {
  const data = useQuery(api.itinerary.getItinerary, open ? { tripId } : "skip");
  return (
    <Sheet open={open} onClose={onClose} title="Add to which day?">
      {data === undefined ? (
        <div className="space-y-2"><Skeleton className="h-10" /><Skeleton className="h-10" /></div>
      ) : !data || data.days.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          This trip has no days yet. Open the itinerary tab to add one.
        </p>
      ) : (
        <ul className="space-y-2">
          {data.days.map((d) => (
            <li key={d._id}>
              <button
                type="button"
                onClick={() => { onPick(d._id); onClose(); }}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-background p-3 text-left transition-colors hover:bg-muted"
              >
                <span className="text-sm font-medium">
                  Day {d.dayNumber}{d.title ? ` — ${d.title}` : ""}
                </span>
                <span className="text-xs text-muted-foreground">{d.date}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
