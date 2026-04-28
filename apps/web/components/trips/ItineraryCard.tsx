"use client";
import { useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { ArrowRight, GripVertical, MapPin, Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { CategoryBadge } from "./CategoryBadge";
import { cn } from "@/lib/utils";

// Resolve an itinerary item to its in-app detail page based on type + provider.
// Hotels and flights use the booking flow; tours/activities use the unified
// /discover detail; events use the event slug if we have an apiRef.
function resolveDetailHref(item: Doc<"itinerary_items">): string | null {
  const provider = item.apiSource;
  const ref = item.apiRef;

  if (item.type === "hotel" && ref) {
    return `/hotels/${encodeURIComponent(ref)}`;
  }
  if (item.type === "flight" && ref) {
    return `/flights/${encodeURIComponent(ref)}`;
  }
  if (item.type === "event" && ref) {
    // Event apiRef stores the event slug (or fall back to /events listing).
    return `/events/${encodeURIComponent(ref)}`;
  }
  if (provider && ref) {
    return `/discover/${encodeURIComponent(provider)}/${encodeURIComponent(ref)}`;
  }
  return null;
}

interface ItineraryCardProps {
  item: Doc<"itinerary_items">;
  showDragHandle?: boolean;
  // Drag handlers wired by the parent ItineraryTab so reorder lives in one
  // place (sortOrder + dayId).
  onDragStart?: () => void;
  onDragOver?: () => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}

export function ItineraryCard({
  item,
  showDragHandle = true,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: ItineraryCardProps) {
  const deleteItem = useMutation(api.itinerary.deleteItem);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const detailHref = resolveDetailHref(item);

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteItem({ itemId: item._id });
    } finally {
      setBusy(false);
    }
  }

  return (
    <article
      draggable={showDragHandle}
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.();
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-sm transition-opacity",
        isDragging && "opacity-50"
      )}
    >
      {item.imageUrl && (
        <div className="relative max-h-[280px] w-full overflow-hidden bg-foreground/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt=""
            className="block h-full max-h-[280px] w-full object-cover"
            style={{ aspectRatio: "16/9" }}
          />
          <div className="absolute left-2.5 top-2.5">
            <CategoryBadge type={item.type} />
          </div>
        </div>
      )}
      <div className="flex items-start gap-2 p-4">
        {showDragHandle && (
          <span
            className="mt-1 grid h-7 w-5 cursor-grab place-items-center text-foreground/30 active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-tight">
            {item.title}
          </h3>
          {item.locationName && (
            <p className="mt-1 flex items-center gap-1 text-xs text-foreground/60">
              <MapPin className="h-3 w-3" /> {item.locationName}
            </p>
          )}
          {item.startTime && (
            <p className="mt-1 text-xs font-semibold text-foreground/70">
              {item.startTime}
              {item.endTime ? ` – ${item.endTime}` : ""}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {confirmingDelete ? (
            <>
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="rounded-full bg-error px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-60"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={busy}
                className="rounded-full bg-foreground/10 px-3 py-1.5 text-[11px] font-semibold text-foreground"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                aria-label="Remove from itinerary"
                className="grid h-9 w-9 place-items-center rounded-full text-foreground/40 transition-colors hover:bg-error/10 hover:text-error"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {detailHref ? (
                <Link
                  href={detailHref}
                  aria-label="Open detail"
                  className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
