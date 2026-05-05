"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction } from "convex/react";
import { ArrowLeft, Check, MapPin, Star, Users, Wifi } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn, formatCurrency } from "@/lib/utils";
import { stashRoomRate } from "@/lib/roomRateCache";

type HotelDetail = {
  apiRef: string;
  title: string;
  description?: string;
  imageUrl?: string;
  gallery?: string[];
  amenities?: string[];
  address?: string;
  rating?: number;
  reviewCount?: number;
};

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

export function HotelDetailClient({
  apiRef,
  initialCheckin,
  initialCheckout,
  initialAdults,
  eventId,
  eventSlug,
  backHref,
}: {
  apiRef: string;
  initialCheckin: string;
  initialCheckout: string;
  initialAdults: number;
  eventId?: Id<"events">;
  eventSlug?: string;
  backHref: string;
}) {
  const router = useRouter();
  const getDetail = useAction(api.hotels.getDetail);
  const getRates = useAction(api.hotels.getRates);
  const startBooking = useAction(api.hotels.startBooking);

  const [detail, setDetail] = useState<HotelDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [checkin, setCheckin] = useState(initialCheckin);
  const [checkout, setCheckout] = useState(initialCheckout);
  const [adults, setAdults] = useState(initialAdults);
  const [rates, setRates] = useState<Rate[] | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [reserving, setReserving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setDetailLoading(true);
    getDetail({ apiRef })
      .then((d) => {
        if (!cancelled) setDetail(d as HotelDetail | null);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiRef, getDetail]);

  useEffect(() => {
    let cancelled = false;
    setRatesLoading(true);
    // Don't blanket-clear error here — the refresh-after-failed-reserve flow
    // bumps refreshTick to fetch fresh offerIds, and we want the failure
    // message to stay visible so the user knows why their click did nothing.
    // Errors are cleared explicitly when the user retries or changes inputs.
    getRates({ apiRef, checkin, checkout, adults })
      .then((r) => {
        if (!cancelled) setRates(r as Rate[]);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load rates");
          setRates([]);
        }
      })
      .finally(() => {
        if (!cancelled) setRatesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiRef, checkin, checkout, adults, getRates, refreshTick]);

  async function reserve(rate: Rate) {
    if (!detail) return;
    setReserving(rate.rateId);
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
      const msg = err instanceof Error ? err.message : "Reservation failed";
      setError(`${msg}. Refreshing rooms…`);
      // Drop the failed rate immediately, then re-fetch the full list. LiteAPI
      // rates expire within minutes and the same rateId will keep failing —
      // refreshing gives the user fresh, bookable options.
      const failedId = rate.rateId;
      setRates((prev) => (prev ?? []).filter((r) => r.rateId !== failedId));
      setRefreshTick((n) => n + 1);
    } finally {
      setReserving(null);
    }
  }

  if (detailLoading && !detail) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-5">
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
      </main>
    );
  }
  if (!detail) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 text-center">
        <h1 className="font-display text-xl font-bold">Hotel not found</h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 text-sm font-semibold text-primary"
        >
          Go back
        </button>
      </main>
    );
  }

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
          <h1 className="truncate font-display text-2xl font-bold tracking-tight text-foreground">
            {detail.title}
          </h1>
          {detail.address && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {detail.address}
            </div>
          )}
        </div>
        {detail.rating !== undefined && (
          <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
            <Star className="h-3.5 w-3.5 fill-primary" /> {detail.rating.toFixed(1)}
            {detail.reviewCount && (
              <span className="text-xs text-primary/70">({detail.reviewCount})</span>
            )}
          </div>
        )}
      </div>

      {detail.imageUrl && (
        <div
          className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded-3xl bg-muted bg-cover bg-center"
          style={{ backgroundImage: `url(${detail.imageUrl})` }}
        />
      )}

      {detail.description && (
        <div
          className="mb-5 hotel-prose"
          dangerouslySetInnerHTML={{ __html: detail.description }}
        />
      )}

      {detail.amenities && detail.amenities.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 font-display text-lg font-bold tracking-tight">
            Amenities
          </h2>
          <div className="flex flex-wrap gap-2">
            {detail.amenities.slice(0, 12).map((a, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground"
              >
                <Wifi className="h-3 w-3 text-muted-foreground" /> {a}
              </span>
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-3 font-display text-lg font-bold tracking-tight">
        Choose your stay
      </h2>
      <div className="mb-3 grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card p-3">
        <Field label="Check-in">
          <input
            type="date"
            value={checkin}
            onChange={(e) => {
              setCheckin(e.target.value);
              setError(null);
            }}
            className="w-full bg-transparent text-sm font-semibold outline-none"
          />
        </Field>
        <Field label="Check-out">
          <input
            type="date"
            value={checkout}
            min={checkin}
            onChange={(e) => {
              setCheckout(e.target.value);
              setError(null);
            }}
            className="w-full bg-transparent text-sm font-semibold outline-none"
          />
        </Field>
        <Field label="Adults">
          <input
            type="number"
            value={adults}
            min={1}
            max={6}
            onChange={(e) => {
              setAdults(Number(e.target.value) || 1);
              setError(null);
            }}
            className="w-full bg-transparent text-sm font-semibold outline-none"
          />
        </Field>
      </div>

      {error && (
        <div className="mb-3 rounded-xl border border-error/40 bg-error-light px-3 py-2 text-xs font-medium text-error">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {ratesLoading && rates === null ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
          ))
        ) : (rates ?? []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            No bookable rooms for these dates.
          </div>
        ) : (
          (rates ?? []).map((r, idx) => {
            // Per-room photos from /hotels/rates aren't always populated by
            // LiteAPI; fall back to the hotel's gallery so cards never look
            // empty. Cycling through the gallery gives variety across rooms.
            const fallback =
              detail.gallery && detail.gallery.length > 0
                ? detail.gallery[idx % detail.gallery.length]
                : detail.imageUrl;
            const roomImage =
              r.photos && r.photos.length > 0 ? r.photos[0] : fallback;
            const roomHref = `/hotels/${encodeURIComponent(apiRef)}/rooms/${encodeURIComponent(r.rateId)}?checkin=${checkin}&checkout=${checkout}&adults=${adults}${eventId ? `&eventId=${eventId}` : ""}${eventSlug ? `&eventSlug=${eventSlug}` : ""}`;
            return (
            <Link
              key={r.rateId}
              href={roomHref}
              onClick={() =>
                stashRoomRate(apiRef, checkin, checkout, adults, r.rateId, r)
              }
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-transform hover:-translate-y-0.5 sm:flex-row sm:gap-4"
            >
              {roomImage && (
                <div
                  className="aspect-[4/3] w-full shrink-0 rounded-xl bg-muted bg-cover bg-center sm:h-32 sm:w-44"
                  style={{ backgroundImage: `url(${roomImage})` }}
                />
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-snug">{r.roomName}</div>
                  {r.roomDescription && (
                    <div className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-muted-foreground">
                      {r.roomDescription}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted-foreground">
                  {r.maxOccupancy !== undefined && (
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" /> Sleeps {r.maxOccupancy}
                    </span>
                  )}
                  {r.bedTypes && r.bedTypes.length > 0 && (
                    <span>{r.bedTypes.join(", ")}</span>
                  )}
                  {r.boardName && <span>{r.boardName}</span>}
                  {r.refundable ? (
                    <span className="inline-flex items-center gap-0.5 text-success">
                      <Check className="h-3 w-3" /> Refundable
                      {r.cancellationPolicy && (
                        <span className="ml-0.5 text-muted-foreground">
                          · until {fmtCancelDate(r.cancellationPolicy)}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-foreground/50">Non-refundable</span>
                  )}
                </div>
                {r.amenities && r.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {r.amenities.slice(0, 4).map((a, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-muted px-2 py-0.5 text-[10.5px] text-muted-foreground"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-auto flex items-end justify-between gap-3 pt-1">
                  <div>
                    <div className="font-display text-lg font-bold tracking-tight">
                      {formatCurrency(r.totalPrice, r.currency)}
                    </div>
                    <div className="text-[10.5px] text-muted-foreground">
                      {formatCurrency(r.pricePerNight, r.currency)} per night · total
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      reserve(r);
                    }}
                    disabled={reserving !== null}
                    className={cn(
                      "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60",
                    )}
                  >
                    {reserving === r.rateId ? "Reserving…" : "Reserve"}
                  </button>
                </div>
              </div>
            </Link>
            );
          })
        )}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 rounded-xl border border-border bg-background px-3 py-2 text-xs">
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
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
