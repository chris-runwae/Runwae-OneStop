"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Bookmark, CalendarDays, Check, MapPin } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Universal payload for any Discover item (Viator/Duffel/LiteAPI/static).
export type DiscoverPayload = {
  provider: string;
  apiRef: string;
  category: string; // viator returns "tour"; duffel "fly"; liteapi "stay"; etc
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  locationName?: string;
  coords?: { lat: number; lng: number };
  externalUrl?: string;
};

// Maps Discover category → saved_items.type / itinerary_items.type union.
function categoryToItemType(
  category: string
):
  | "flight"
  | "hotel"
  | "tour"
  | "car_rental"
  | "event"
  | "restaurant"
  | "activity"
  | "transport"
  | "other" {
  switch (category) {
    case "fly":
    case "flight":
      return "flight";
    case "stay":
    case "hotel":
      return "hotel";
    case "tour":
    case "explore":
    case "adventure":
      return "tour";
    case "ride":
    case "car_rental":
      return "car_rental";
    case "event":
    case "attend":
      return "event";
    case "eat":
    case "restaurant":
      return "restaurant";
    case "do":
    case "activity":
      return "activity";
    case "transport":
      return "transport";
    default:
      return "other";
  }
}

type Step = "choose" | "pick-trip" | "pick-day" | "done";
type Mode = "save" | "itinerary";

export function AddToTripModal({
  open,
  onClose,
  item,
  presetTripId,
}: {
  open: boolean;
  onClose: () => void;
  item: DiscoverPayload | null;
  // When set, skips the "pick a trip" step and uses this trip directly.
  // Used by the trip-detail Discover tab where the trip is already known.
  presetTripId?: Id<"trips">;
}) {
  const [step, setStep] = useState<Step>("choose");
  const [mode, setMode] = useState<Mode>("save");
  const [tripId, setTripId] = useState<Id<"trips"> | null>(presetTripId ?? null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trips = useQuery(
    api.trips.getMyTrips,
    open && !presetTripId ? {} : "skip"
  );
  const itinerary = useQuery(
    api.itinerary.getItinerary,
    open && step === "pick-day" && tripId ? { tripId } : "skip"
  );
  const addSavedItem = useMutation(api.saved_items.addSavedItem);
  const addItineraryItem = useMutation(api.itinerary.addItem);

  function reset() {
    setStep("choose");
    setMode("save");
    setTripId(presetTripId ?? null);
    setPending(false);
    setError(null);
  }

  function handleClose() {
    onClose();
    setTimeout(reset, 250);
  }

  async function handleSaveToTrip(targetTripId: Id<"trips">) {
    if (!item) return;
    setPending(true);
    setError(null);
    try {
      await addSavedItem({
        tripId: targetTripId,
        type: categoryToItemType(item.category),
        apiSource: item.provider,
        apiRef: item.apiRef,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        price: item.price,
        currency: item.currency,
        locationName: item.locationName,
        coords: item.coords,
        externalUrl: item.externalUrl,
        isManual: false,
      });
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setPending(false);
    }
  }

  async function handleAddToDay(dayId: Id<"itinerary_days">) {
    if (!item || !tripId) return;
    setPending(true);
    setError(null);
    try {
      await addItineraryItem({
        tripId,
        dayId,
        type: categoryToItemType(item.category),
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        price: item.price,
        currency: item.currency,
        locationName: item.locationName,
        coords: item.coords,
        apiSource: item.provider,
        apiRef: item.apiRef,
      });
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add to itinerary.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={step === "done" ? "Added!" : "Add to trip"}
      description={item?.title}
    >
      {error && (
        <div className="mb-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {step === "choose" && item && (
        <ChooseStep
          item={item}
          onPick={(m) => {
            setMode(m);
            // When the trip is already known (trip-detail page), skip the
            // picker and act on it directly.
            if (presetTripId) {
              if (m === "save") {
                handleSaveToTrip(presetTripId);
              } else {
                setStep("pick-day");
              }
            } else {
              setStep("pick-trip");
            }
          }}
        />
      )}

      {step === "pick-trip" && !presetTripId && (
        <PickTrip
          trips={trips}
          mode={mode}
          onBack={() => setStep("choose")}
          pending={pending}
          onPick={(id) => {
            setTripId(id);
            if (mode === "save") {
              handleSaveToTrip(id);
            } else {
              setStep("pick-day");
            }
          }}
        />
      )}

      {step === "pick-day" && tripId && (
        <PickDay
          itinerary={itinerary}
          pending={pending}
          onBack={() => setStep("pick-trip")}
          onPick={(dayId) => handleAddToDay(dayId)}
        />
      )}

      {step === "done" && <DoneStep mode={mode} onClose={handleClose} />}
    </Modal>
  );
}

function ChooseStep({
  item,
  onPick,
}: {
  item: DiscoverPayload;
  onPick: (mode: Mode) => void;
}) {
  const price =
    item.price !== undefined && item.currency
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: item.currency,
          maximumFractionDigits: 0,
        }).format(item.price)
      : null;

  return (
    <>
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-3">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            className="h-14 w-14 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="h-14 w-14 shrink-0 rounded-lg bg-foreground/10" />
        )}
        <div className="min-w-0 flex-1">
          <div className="line-clamp-2 text-sm font-semibold">{item.title}</div>
          {item.locationName && (
            <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {item.locationName}
            </div>
          )}
          {price && (
            <div className="mt-1 text-xs font-semibold text-primary">
              From {price}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => onPick("save")}
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 text-left transition-colors hover:bg-muted/50"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
            <Bookmark className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">Save to trip</div>
            <div className="text-xs text-muted-foreground">
              Add to a trip&apos;s wishlist — decide where to slot it later.
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onPick("itinerary")}
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 text-left transition-colors hover:bg-muted/50"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
            <CalendarDays className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">Add to itinerary</div>
            <div className="text-xs text-muted-foreground">
              Slot directly into a specific day on a trip.
            </div>
          </div>
        </button>
      </div>
    </>
  );
}

function PickTrip({
  trips,
  mode,
  onBack,
  onPick,
  pending,
}: {
  trips: Doc<"trips">[] | undefined;
  mode: Mode;
  onBack: () => void;
  onPick: (id: Id<"trips">) => void;
  pending: boolean;
}) {
  const sorted = useMemo(() => {
    if (!trips) return undefined;
    return [...trips].sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));
  }, [trips]);

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back
      </button>
      <h3 className="mb-3 text-sm font-semibold">
        {mode === "save" ? "Save to which trip?" : "Add to which trip?"}
      </h3>
      <div className="max-h-[55vh] space-y-1 overflow-y-auto">
        {sorted === undefined ? (
          <>
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </>
        ) : sorted.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
            You don&apos;t have any trips yet. Create one first.
          </div>
        ) : (
          sorted.map((t) => (
            <button
              key={t._id}
              type="button"
              disabled={pending}
              onClick={() => onPick(t._id)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted/40 disabled:opacity-60"
            >
              {t.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.coverImageUrl}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <Avatar name={t.title} size="md" />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{t.title}</div>
                {t.destinationLabel && (
                  <div className="truncate text-xs text-muted-foreground">
                    {t.destinationLabel}
                  </div>
                )}
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  t.status === "ongoing" && "bg-emerald-500/15 text-emerald-700",
                  t.status === "upcoming" && "bg-amber-500/15 text-amber-700",
                  t.status === "planning" && "bg-violet-500/15 text-violet-700",
                  (t.status === "completed" || t.status === "cancelled") &&
                    "bg-foreground/10 text-foreground/60"
                )}
              >
                {t.status}
              </span>
            </button>
          ))
        )}
      </div>
    </>
  );
}

type ItineraryReturn = ReturnType<typeof useQuery<typeof api.itinerary.getItinerary>>;

function PickDay({
  itinerary,
  onBack,
  onPick,
  pending,
}: {
  itinerary: ItineraryReturn;
  onBack: () => void;
  onPick: (dayId: Id<"itinerary_days">) => void;
  pending: boolean;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back
      </button>
      <h3 className="mb-3 text-sm font-semibold">Pick a day</h3>
      <div className="max-h-[55vh] space-y-1 overflow-y-auto">
        {itinerary === undefined ? (
          <>
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </>
        ) : !itinerary || itinerary.days.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
            No days yet on this trip&apos;s itinerary.
          </div>
        ) : (
          itinerary.days.map((d) => (
            <button
              key={d._id}
              type="button"
              disabled={pending}
              onClick={() => onPick(d._id)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted/40 disabled:opacity-60"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                D{d.dayNumber}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">
                  {d.title ?? `Day ${d.dayNumber}`}
                </div>
                <div className="truncate text-xs text-muted-foreground">{d.date}</div>
              </div>
            </button>
          ))
        )}
      </div>
    </>
  );
}

function DoneStep({ mode, onClose }: { mode: Mode; onClose: () => void }) {
  return (
    <div className="py-4 text-center">
      <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
        <Check className="h-6 w-6" />
      </span>
      <h3 className="font-display text-lg font-bold">
        {mode === "save" ? "Saved to trip" : "Added to itinerary"}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {mode === "save"
          ? "You can promote it to a specific day from the trip's saved tab."
          : "Open the trip's itinerary to reorder or add notes."}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-4 inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Done
      </button>
    </div>
  );
}
