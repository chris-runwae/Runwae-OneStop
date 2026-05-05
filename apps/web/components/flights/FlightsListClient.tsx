"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAction } from "convex/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatCurrency } from "@/lib/utils";

type Flight = {
  apiRef: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
};

type Sort = "price_asc" | "price_desc";

const SORTS: Array<{ id: Sort; label: string }> = [
  { id: "price_asc", label: "Cheapest" },
  { id: "price_desc", label: "Highest" },
];

export function FlightsListClient({
  initialOrigin,
  initialDest,
  initialDepart,
  initialReturn,
  backHref,
  eventId,
  eventSlug,
}: {
  initialOrigin: string;
  initialDest: string;
  initialDepart: string;
  initialReturn?: string;
  backHref: string;
  eventId?: Id<"events">;
  eventSlug?: string;
}) {
  const search = useAction(api.flights.search);
  const [origin, setOrigin] = useState(initialOrigin);
  const [dest, setDest] = useState(initialDest);
  const [depart, setDepart] = useState(initialDepart);
  const [ret, setRet] = useState(initialReturn ?? "");
  const [adults, setAdults] = useState(1);
  const [tripType, setTripType] = useState<"return" | "oneway">(
    initialReturn ? "return" : "oneway",
  );
  const [sort, setSort] = useState<Sort>("price_asc");
  const [results, setResults] = useState<Flight[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    search({
      originIata: origin.toUpperCase(),
      destinationIata: dest.toUpperCase(),
      depart,
      returnDate: tripType === "return" ? ret : undefined,
      adults,
      limit: 20,
      sortBy: sort,
    })
      .then((items) => {
        if (!cancelled) setResults(items as Flight[]);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, origin, dest, depart, ret, tripType, adults, sort]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href={backHref}
          aria-label="Back"
          className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Flights {origin.toUpperCase()} → {dest.toUpperCase()}
          </h1>
          <div className="text-xs text-muted-foreground">
            {results?.length ?? 0} options
          </div>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Field label="Trip">
          <select
            value={tripType}
            onChange={(e) => setTripType(e.target.value as "return" | "oneway")}
            className="bg-transparent text-sm font-semibold outline-none"
          >
            <option value="return">Return</option>
            <option value="oneway">One way</option>
          </select>
        </Field>
        <Field label="From">
          <input
            value={origin}
            onChange={(e) => setOrigin(e.target.value.toUpperCase().slice(0, 3))}
            className="bg-transparent text-sm font-semibold outline-none"
          />
        </Field>
        <Field label="To">
          <input
            value={dest}
            onChange={(e) => setDest(e.target.value.toUpperCase().slice(0, 3))}
            className="bg-transparent text-sm font-semibold outline-none"
          />
        </Field>
        <Field label="Adults">
          <input
            type="number"
            value={adults}
            min={1}
            max={6}
            onChange={(e) => setAdults(Number(e.target.value) || 1)}
            className="bg-transparent text-sm font-semibold outline-none"
          />
        </Field>
        <Field label="Depart">
          <input
            type="date"
            value={depart}
            onChange={(e) => setDepart(e.target.value)}
            className="bg-transparent text-sm font-semibold outline-none"
          />
        </Field>
        {tripType === "return" && (
          <Field label="Return">
            <input
              type="date"
              value={ret}
              min={depart}
              onChange={(e) => setRet(e.target.value)}
              className="bg-transparent text-sm font-semibold outline-none"
            />
          </Field>
        )}
        <Field label="Sort">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="bg-transparent text-sm font-semibold outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex flex-col gap-2">
        {loading && results === null
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
            ))
          : (results ?? []).length === 0
            ? (
              <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                No flights for this search.
              </div>
            )
            : (results ?? []).map((f) => (
                <Link
                  key={f.apiRef}
                  href={`/flights/${encodeURIComponent(f.apiRef)}${eventId ? `?eventId=${eventId}${eventSlug ? `&eventSlug=${eventSlug}` : ""}` : ""}`}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  {f.imageUrl && (
                    <img
                      src={f.imageUrl}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-md object-contain"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold leading-tight">{f.title}</div>
                    {f.description && (
                      <div className="mt-0.5 line-clamp-1 text-[11.5px] text-muted-foreground">
                        {f.description}
                      </div>
                    )}
                  </div>
                  {f.price !== undefined && f.currency && (
                    <div className="text-right">
                      <div className="font-display text-base font-bold tracking-tight">
                        {formatCurrency(f.price, f.currency)}
                      </div>
                      <div className="text-[10.5px] text-muted-foreground">total</div>
                    </div>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 rounded-xl border border-border bg-card px-3 py-2 text-xs">
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
