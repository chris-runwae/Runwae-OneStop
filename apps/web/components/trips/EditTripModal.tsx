"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Modal } from "@/components/ui/modal";
import { LocationPicker, type LocationValue } from "@/components/ui/location-picker";

interface EditTripModalProps {
  open: boolean;
  onClose: () => void;
  trip: Doc<"trips">;
}

export function EditTripModal({ open, onClose, trip }: EditTripModalProps) {
  const updateTrip = useMutation(api.trips.updateTrip);

  const [title, setTitle] = useState(trip.title);
  const [coverImageUrl, setCoverImageUrl] = useState(trip.coverImageUrl ?? "");
  const [startDate, setStartDate] = useState(trip.startDate);
  const [endDate, setEndDate] = useState(trip.endDate);
  const [location, setLocation] = useState<LocationValue>({
    destinationLabel: trip.destinationLabel ?? "",
    coords: trip.destinationCoords,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset drafts whenever the modal reopens with a possibly-different trip.
  useEffect(() => {
    if (open) {
      setTitle(trip.title);
      setCoverImageUrl(trip.coverImageUrl ?? "");
      setStartDate(trip.startDate);
      setEndDate(trip.endDate);
      setLocation({
        destinationLabel: trip.destinationLabel ?? "",
        coords: trip.destinationCoords,
      });
      setError(null);
    }
  }, [
    open,
    trip.title,
    trip.coverImageUrl,
    trip.startDate,
    trip.endDate,
    trip.destinationLabel,
    trip.destinationCoords,
  ]);

  async function handleSave() {
    setError(null);
    if (!title.trim()) {
      setError("Title can't be empty.");
      return;
    }
    if (endDate < startDate) {
      setError("End date must be on or after the start date.");
      return;
    }
    setSaving(true);
    try {
      await updateTrip({
        tripId: trip._id,
        title: title.trim(),
        coverImageUrl: coverImageUrl.trim() || undefined,
        startDate,
        endDate,
        destinationLabel: location.destinationLabel || undefined,
        destinationCoords: location.coords,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit trip">
      {error && (
        <div className="mb-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <Field label="Trip name">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
          />
        </Field>

        <Field label="Cover image URL">
          <input
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://…"
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Start date">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
            />
          </Field>
          <Field label="End date">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
            />
          </Field>
        </div>

        <Field label="Destination">
          <LocationPicker value={location} onChange={setLocation} />
        </Field>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-10 flex-1 rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="h-10 rounded-full bg-foreground/5 px-4 text-sm font-semibold text-foreground"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
