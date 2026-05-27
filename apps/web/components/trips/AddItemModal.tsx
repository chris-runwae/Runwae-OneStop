"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { ArrowRight, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { LocationPicker, type LocationValue } from "@/components/ui/location-picker";
import { ALL_CATEGORIES } from "@/lib/categories";
import { UnsplashPicker } from "./wizard/UnsplashPicker";
import { cn } from "@/lib/utils";

type Target =
  | { kind: "saved"; tripId: Id<"trips"> }
  | { kind: "itinerary"; tripId: Id<"trips">; dayId: Id<"itinerary_days"> };

function uiCategoryToType(id: string): Doc<"saved_items">["type"] {
  switch (id) {
    case "fly":
      return "flight";
    case "stay":
      return "hotel";
    case "eat":
      return "restaurant";
    case "tour":
      return "tour";
    case "ride":
      return "transport";
    case "event":
      return "event";
    case "adventure":
      return "activity";
    default:
      return "other";
  }
}

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  target: Target;
}

// Manual-entry modal for adding a saved item or itinerary slot. The previous
// search/manual split is gone — discovery lives in the Discover tab. Title +
// location are required; location flows through Nominatim so the routing
// matrix has coords to work with. Cover image uses the same Unsplash picker
// as trip creation.
export function AddItemModal({ open, onClose, target }: AddItemModalProps) {
  const addSaved = useMutation(api.saved_items.addSavedItem);
  const addItem = useMutation(api.itinerary.addItem);

  const [type, setType] = useState<Doc<"saved_items">["type"]>("activity");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState<LocationValue>({
    destinationLabel: "",
  });
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputCls =
    "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none";

  function reset() {
    setType("activity");
    setTitle("");
    setLocation({ destinationLabel: "" });
    setDate("");
    setTime("");
    setEndTime("");
    setPrice("");
    setImageUrl("");
    setError(null);
  }

  function handleClose() {
    onClose();
    setTimeout(reset, 250);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!location.destinationLabel.trim() || !location.coords) {
      setError(
        "Pick a location from the dropdown so travel times work — typing isn't enough."
      );
      return;
    }
    setSubmitting(true);
    try {
      const priceNum = price ? Number(price) : undefined;
      if (target.kind === "itinerary") {
        await addItem({
          tripId: target.tripId,
          dayId: target.dayId,
          type,
          title: title.trim(),
          startTime: time || undefined,
          endTime: endTime || undefined,
          price: priceNum,
          locationName: location.destinationLabel,
          coords: location.coords,
          imageUrl: imageUrl || undefined,
        });
      } else {
        await addSaved({
          tripId: target.tripId,
          type,
          title: title.trim(),
          date: date || undefined,
          price: priceNum,
          locationName: location.destinationLabel,
          coords: location.coords,
          imageUrl: imageUrl || undefined,
          isManual: true,
        });
      }
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add item.");
    } finally {
      setSubmitting(false);
    }
  }

  // Right-panel slide-in animation
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMounted(false), 280);
    return () => { if (closeTimer.current) window.clearTimeout(closeTimer.current); };
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [mounted]);

  if (!mounted) return null;

  const panelTitle = target.kind === "itinerary" ? "Add to itinerary" : "Save to trip";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={handleClose}
        className={cn(
          "absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-[280ms] ease-out",
          visible ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={panelTitle}
        className={cn(
          "relative flex h-full w-full flex-col bg-card shadow-2xl transition-transform duration-[280ms] ease-out sm:max-w-[480px]",
          visible ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="shrink-0 px-5 pb-4 pt-5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 shrink-0" />
            <h2 className="flex-1 text-center font-display text-[17px] font-bold leading-tight text-foreground">
              {panelTitle}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground/[0.06] text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 pb-4 pt-1">
            {error && (
              <div className="mb-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Field label="Category">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as typeof type)}
                  className={inputCls}
                >
                  {ALL_CATEGORIES.filter((c) => c.id !== "shop").map((c) => (
                    <option key={c.id} value={uiCategoryToType(c.id)}>
                      {c.emoji} {c.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Title">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Time Out Market dinner"
                  required
                  className={inputCls}
                />
              </Field>

              <Field label="Location" hint="Required — used for routing and travel times.">
                <LocationPicker
                  value={location}
                  onChange={setLocation}
                  placeholder="Search for a place…"
                />
              </Field>

              <div className="grid grid-cols-2 gap-2">
                {target.kind === "itinerary" ? (
                  <>
                    <Field label="Start time">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="End time">
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                  </>
                ) : (
                  <Field label="Date">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                )}
                <Field label="Price (optional)">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="—"
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="Cover image (optional)" hint="Search Unsplash or paste a URL.">
                {imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt="Cover preview"
                    className="mb-2 h-24 w-full rounded-xl object-cover"
                  />
                )}
                <UnsplashPicker
                  seedQuery={title || location.destinationLabel}
                  selectedUrl={imageUrl}
                  onSelect={setImageUrl}
                />
              </Field>
            </div>
          </div>

          {/* Pinned footer */}
          <div className="shrink-0 border-t border-border bg-card px-5 pb-12 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-[14.5px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            >
              {submitting ? "Saving…" : target.kind === "itinerary" ? "Add to itinerary" : "Save to trip"}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-[11px] text-muted-foreground">
          {hint}
        </span>
      )}
    </label>
  );
}
