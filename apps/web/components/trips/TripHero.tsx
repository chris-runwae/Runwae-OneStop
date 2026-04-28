"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { formatDateRange } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ShareTripModal } from "./ShareTripModal";
import { EditTripModal } from "./EditTripModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Props = {
  trip: Doc<"trips">;
  destinationLabel?: string;
  timezone?: string;
};

export function TripHero({ trip, destinationLabel, timezone = "UTC" }: Props) {
  const router = useRouter();
  const deleteTrip = useMutation(api.trips.deleteTrip);
  const startMs = Date.parse(trip.startDate);
  const endMs = Date.parse(trip.endDate);

  const [shareOpen, setShareOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Close the ellipses menu on outside click + Esc.
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTrip({ tripId: trip._id });
      router.push("/trips");
    } catch {
      setDeleting(false);
    }
  }

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-2xl",
        "h-72 md:h-96 lg:h-[420px]",
        "bg-foreground/5"
      )}
    >
      {trip.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={trip.coverImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/30" />

      <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between">
        <Link
          href="/trips"
          aria-label="Back"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-black backdrop-blur"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Share trip"
            onClick={() => setShareOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-black backdrop-blur transition-transform hover:scale-105"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="Trip options"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-black backdrop-blur transition-transform hover:scale-105"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-12 z-20 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setEditOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                  Edit trip
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmDelete(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-error transition-colors hover:bg-error/5"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete trip
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-5 right-5 z-10 text-white">
        <h1 className="font-display text-2xl font-bold leading-tight md:text-4xl">
          {trip.title}
        </h1>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {(destinationLabel ?? trip.destinationLabel) && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-3 py-1 backdrop-blur">
              <MapPin className="h-3 w-3" />{" "}
              {destinationLabel ?? trip.destinationLabel}
            </span>
          )}
          {!Number.isNaN(startMs) && !Number.isNaN(endMs) && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-3 py-1 backdrop-blur">
              <Calendar className="h-3 w-3" />{" "}
              {formatDateRange(startMs, endMs, timezone)}
            </span>
          )}
        </div>
      </div>

      <ShareTripModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        trip={trip}
      />
      <EditTripModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        trip={trip}
      />
      <ConfirmDialog
        open={confirmDelete}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        busy={deleting}
        variant="destructive"
        title="Delete this trip?"
        description="All days, items, saved places, posts and members will be removed. This can't be undone."
        confirmLabel="Delete trip"
      />
    </section>
  );
}
