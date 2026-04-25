"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { CategoryBadge } from "./CategoryBadge";

export function ItineraryCard({ item }: { item: Doc<"itinerary_items"> }) {
  const updateItem = useMutation(api.itinerary.updateItem);
  const [notes, setNotes] = useState(item.notes ?? "");
  const lastSaved = useRef(item.notes ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (notes === lastSaved.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void updateItem({ itemId: item._id, notes }).then(() => {
        lastSaved.current = notes;
      });
    }, 600);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [notes, item._id, updateItem]);

  return (
    <article className="overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-sm">
      {item.imageUrl && (
        <div className="relative aspect-[16/9] bg-foreground/5">
          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
          <div className="absolute left-2.5 top-2.5">
            <CategoryBadge type={item.type} />
          </div>
        </div>
      )}
      <div className="p-4">
        <h3 className="text-base font-semibold leading-tight">{item.title}</h3>
        {item.locationName && (
          <p className="mt-1 flex items-center gap-1 text-xs text-foreground/60">
            <MapPin className="h-3 w-3" /> {item.locationName}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add a note for the group…"
            className="h-9 flex-1 rounded-full bg-foreground/5 px-3 text-xs text-foreground placeholder:text-foreground/40 focus:bg-foreground/10 focus:outline-none"
          />
          <button aria-label="Open" className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
