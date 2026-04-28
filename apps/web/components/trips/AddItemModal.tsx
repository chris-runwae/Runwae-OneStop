"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Modal } from "@/components/ui/modal";
import { LocationPicker, type LocationValue } from "@/components/ui/location-picker";
import { ALL_CATEGORIES } from "@/lib/categories";
import { UnsplashPicker } from "./wizard/UnsplashPicker";

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

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={target.kind === "itinerary" ? "Add to itinerary" : "Save to trip"}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

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

        <Field
          label="Location"
          hint="Required — used for routing and travel times."
        >
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

        <Field
          label="Cover image (optional)"
          hint="Search Unsplash or paste a URL."
        >
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

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="h-10 flex-1 rounded-full bg-foreground/5 text-sm font-semibold text-foreground disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="h-10 flex-1 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Add"}
          </button>
        </div>
      </form>
    </Modal>
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
