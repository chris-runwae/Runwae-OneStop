"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction } from "convex/react";
import { ArrowLeft, ArrowRight, Plane } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatCurrency } from "@/lib/utils";

type Offer = {
  apiRef: string;
  carrier: string;
  carrierLogo?: string;
  totalAmount: number;
  currency: string;
  segments: Array<{
    origin: string;
    destination: string;
    depart: string;
    arrive: string;
    carrier: string;
    flightNumber: string;
  }>;
};

export function FlightDetailClient({
  apiRef,
  eventId,
  backHref,
}: {
  apiRef: string;
  eventId?: Id<"events">;
  backHref: string;
}) {
  const router = useRouter();
  const getOffer = useAction(api.flights.getOffer);
  const startBooking = useAction(api.flights.startBooking);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOffer({ apiRef })
      .then((o) => {
        if (!cancelled) setOffer(o as Offer | null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiRef, getOffer]);

  async function reserve() {
    if (!offer) return;
    setReserving(true);
    setError(null);
    try {
      const { bookingId, totalAmount, currency, summary } = await startBooking({
        offerId: apiRef,
        eventId,
      });
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "flight",
          bookingId,
          summary: `${offer.carrier} — ${summary}`,
          totalAmount,
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

  if (loading && !offer) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-5">
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
      </main>
    );
  }
  if (!offer) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-10 text-center">
        <h1 className="font-display text-xl font-bold">Offer expired</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Flight prices change quickly. Search again to see fresh fares.
        </p>
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
    <main className="mx-auto w-full max-w-2xl px-4 py-5 pb-20">
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
            {offer.carrier}
          </h1>
          <div className="text-xs text-muted-foreground">
            {offer.segments.length} flight{offer.segments.length === 1 ? "" : "s"}
          </div>
        </div>
        {offer.carrierLogo && (
          <img
            src={offer.carrierLogo}
            alt=""
            className="h-10 w-10 shrink-0 object-contain"
          />
        )}
      </div>

      <div className="mb-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
        {offer.segments.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 py-3 ${
              i !== 0 ? "border-t border-border" : ""
            } ${i === 0 ? "pt-0" : ""} ${
              i === offer.segments.length - 1 ? "pb-0" : ""
            }`}
          >
            <Plane className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
                {s.origin}
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                {s.destination}
              </div>
              <div className="text-[11.5px] text-muted-foreground">
                {fmtTime(s.depart)} → {fmtTime(s.arrive)} · {s.carrier} {s.flightNumber}
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-3 rounded-xl border border-error/40 bg-error-light px-3 py-2 text-xs font-medium text-error">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div>
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="font-display text-2xl font-bold tracking-tight">
            {formatCurrency(offer.totalAmount, offer.currency)}
          </div>
        </div>
        <button
          type="button"
          onClick={reserve}
          disabled={reserving}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {reserving ? "Reserving…" : "Reserve & pay"}
          <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
        </button>
      </div>
    </main>
  );
}

function fmtTime(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    }).format(d);
  } catch {
    return iso;
  }
}
