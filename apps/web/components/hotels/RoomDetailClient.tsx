"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAction } from "convex/react";
import { ArrowLeft, Check, Star, Users } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn, formatCurrency } from "@/lib/utils";

type Rate = {
  rateId: string;
  offerId: string;
  roomName: string;
  roomDescription?: string;
  boardName?: string;
  bedTypes?: string[];
  maxOccupancy?: number;
  adultCount?: number;
  childCount?: number;
  refundable: boolean;
  cancellationPolicy?: string;
  photos?: string[];
  amenities?: string[];
  remarks?: string;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
};

type HotelDetail = {
  apiRef: string;
  title: string;
  imageUrl?: string;
  gallery?: string[];
  address?: string;
  rating?: number;
};

export function RoomDetailClient({
  apiRef,
  rateId,
  checkin,
  checkout,
  adults,
  eventId,
  eventSlug,
  backHref,
}: {
  apiRef: string;
  rateId: string;
  checkin: string;
  checkout: string;
  adults: number;
  eventId?: Id<"events">;
  eventSlug?: string;
  backHref: string;
}) {
  const getDetail = useAction(api.hotels.getDetail);
  const getRates = useAction(api.hotels.getRates);
  const startBooking = useAction(api.hotels.startBooking);

  const [detail, setDetail] = useState<HotelDetail | null>(null);
  const [rate, setRate] = useState<Rate | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getDetail({ apiRef }),
      getRates({ apiRef, checkin, checkout, adults }),
    ])
      .then(([d, rates]) => {
        if (cancelled) return;
        setDetail(d as HotelDetail | null);
        const found = (rates as Rate[]).find((r) => r.rateId === rateId);
        setRate(found ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiRef, rateId, checkin, checkout, adults, getDetail, getRates]);

  async function book() {
    if (!rate || !detail) return;
    setReserving(true);
    setError(null);
    try {
      const { bookingId, finalPrice, currency } = await startBooking({
        apiRef,
        offerId: rate.offerId,
        hotelName: detail.title,
        checkin,
        checkout,
        eventId,
      });
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "hotel",
          bookingId,
          hotelName: detail.title,
          totalAmount: finalPrice,
          currency,
          backHref,
        }),
      });
      if (!res.ok) {
        const { error: msg } = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(msg ?? "Could not start checkout");
      }
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reservation failed");
    } finally {
      setReserving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-5">
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
      </main>
    );
  }
  if (!rate || !detail) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 text-center">
        <h1 className="font-display text-xl font-bold">Room no longer available</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This rate may have expired. Pick another room from the hotel page.
        </p>
        <Link
          href={backHref}
          className="mt-4 inline-flex text-sm font-semibold text-primary"
        >
          Back
        </Link>
      </main>
    );
  }

  // Build a gallery for this room: prefer room photos, fall back to the
  // hotel gallery so the page never looks empty.
  const photos = (rate.photos && rate.photos.length > 0
    ? rate.photos
    : (detail.gallery ?? []).slice(0, 6)).filter(Boolean);

  const occupancy =
    rate.adultCount !== undefined
      ? `${rate.adultCount} adult${rate.adultCount === 1 ? "" : "s"}${rate.childCount ? ` + ${rate.childCount} child${rate.childCount === 1 ? "" : "ren"}` : ""}`
      : rate.maxOccupancy !== undefined
        ? `Sleeps ${rate.maxOccupancy}`
        : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5 pb-20">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href={backHref}
          aria-label="Back"
          className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {detail.title}
          </div>
          <h1 className="truncate font-display text-2xl font-bold tracking-tight">
            {rate.roomName}
          </h1>
        </div>
        {detail.rating !== undefined && (
          <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
            <Star className="h-3.5 w-3.5 fill-primary" /> {detail.rating.toFixed(1)}
          </div>
        )}
      </div>

      {photos.length > 0 && (
        <div className="mb-4 grid grid-cols-4 gap-2">
          <div
            className="col-span-4 aspect-[16/9] rounded-2xl bg-muted bg-cover bg-center sm:col-span-3 sm:row-span-2 sm:aspect-auto"
            style={{ backgroundImage: `url(${photos[0]})` }}
          />
          {photos.slice(1, 5).map((p, i) => (
            <div
              key={i}
              className="aspect-[4/3] rounded-2xl bg-muted bg-cover bg-center"
              style={{ backgroundImage: `url(${p})` }}
            />
          ))}
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {occupancy && (
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4" /> {occupancy}
          </span>
        )}
        {rate.bedTypes && rate.bedTypes.length > 0 && (
          <span>{rate.bedTypes.join(", ")}</span>
        )}
        {rate.boardName && <span>{rate.boardName}</span>}
        {rate.refundable ? (
          <span className="inline-flex items-center gap-1 text-success">
            <Check className="h-4 w-4" /> Refundable
            {rate.cancellationPolicy && (
              <span className="text-muted-foreground">
                · until {fmtCancelDate(rate.cancellationPolicy)}
              </span>
            )}
          </span>
        ) : (
          <span className="text-foreground/60">Non-refundable</span>
        )}
      </div>

      {rate.roomDescription && (
        <div className="mb-5">
          <h2 className="mb-2 font-display text-lg font-bold tracking-tight">
            Room overview
          </h2>
          <div
            className="hotel-prose"
            dangerouslySetInnerHTML={{ __html: rate.roomDescription }}
          />
        </div>
      )}

      {rate.amenities && rate.amenities.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-2 font-display text-lg font-bold tracking-tight">
            Amenities
          </h2>
          <div className="flex flex-wrap gap-2">
            {rate.amenities.map((a, i) => (
              <span
                key={i}
                className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {rate.remarks && (
        <div className="mb-5 rounded-2xl border border-border bg-muted/40 p-4 text-[13px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Note: </span>
          {rate.remarks}
        </div>
      )}

      {error && (
        <div className="mb-3 rounded-xl border border-error/40 bg-error-light px-3 py-2 text-xs font-medium text-error">
          {error}
        </div>
      )}

      <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-3xl border border-border bg-card p-5 shadow-md">
        <div>
          <div className="text-xs text-muted-foreground">Total ({nights(checkin, checkout)} nights)</div>
          <div className="font-display text-2xl font-bold tracking-tight">
            {formatCurrency(rate.totalPrice, rate.currency)}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {formatCurrency(rate.pricePerNight, rate.currency)} per night
          </div>
        </div>
        <button
          type="button"
          onClick={book}
          disabled={reserving}
          className={cn(
            "inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60",
          )}
        >
          {reserving ? "Working…" : "Book now"}
        </button>
      </div>
    </main>
  );
}

function fmtCancelDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function nights(checkin: string, checkout: string): number {
  const ms = Date.parse(checkout) - Date.parse(checkin);
  return Math.max(1, Math.round(ms / 86_400_000));
}
