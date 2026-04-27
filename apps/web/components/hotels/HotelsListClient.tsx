"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAction } from "convex/react";
import { ArrowLeft, Star } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn, formatCurrency } from "@/lib/utils";

type DiscoveryItem = {
  provider: string;
  apiRef: string;
  category: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  rating?: number;
  locationName?: string;
  coords?: { lat: number; lng: number };
};

type Sort = "best" | "price_asc" | "price_desc" | "rating";

const SORT_LABEL: Record<Sort, string> = {
  best: "Best match",
  price_asc: "Cheapest",
  price_desc: "Highest price",
  rating: "Best rated",
};

export function HotelsListClient({
  initialCheckin,
  initialCheckout,
  city,
  coords,
  backHref,
  eventId,
}: {
  initialCheckin: string;
  initialCheckout: string;
  city: string;
  coords?: { lat: number; lng: number };
  backHref: string;
  eventId?: Id<"events">;
}) {
  const search = useAction(api.hotels.search);
  const [checkin, setCheckin] = useState(initialCheckin);
  const [checkout, setCheckout] = useState(initialCheckout);
  const [adults, setAdults] = useState(2);
  const [sort, setSort] = useState<Sort>("best");
  const [results, setResults] = useState<DiscoveryItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  const sortBy = sort === "best" ? undefined : sort;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    search({
      term: city,
      lat: coords?.lat,
      lng: coords?.lng,
      checkin,
      checkout,
      adults,
      limit: 30,
      sortBy,
    })
      .then((items) => {
        if (!cancelled) setResults(items as DiscoveryItem[]);
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
  }, [search, city, coords?.lat, coords?.lng, checkin, checkout, adults, sortBy]);

  const detailHref = (apiRef: string) =>
    `/hotels/${encodeURIComponent(apiRef)}?checkin=${checkin}&checkout=${checkout}&adults=${adults}${eventId ? `&eventId=${eventId}` : ""}`;

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
            Hotels in {city}
          </h1>
          <div className="text-xs text-muted-foreground">
            {results?.length ?? 0} options
          </div>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <DateField label="Check-in" value={checkin} onChange={setCheckin} />
        <DateField label="Check-out" value={checkout} onChange={setCheckout} min={checkin} />
        <NumberField label="Adults" value={adults} min={1} max={6} onChange={setAdults} />
        <SelectField<Sort>
          label="Sort by"
          value={sort}
          onChange={setSort}
          options={Object.entries(SORT_LABEL).map(([v, l]) => ({ value: v as Sort, label: l }))}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {loading && results === null
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
            ))
          : (results ?? []).length === 0
            ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                No hotels match this search.
              </div>
            )
            : (results ?? []).map((h) => (
                <Link
                  key={h.apiRef}
                  href={detailHref(h.apiRef)}
                  className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <div
                    className="relative aspect-[4/3] w-full bg-muted bg-cover bg-center"
                    style={h.imageUrl ? { backgroundImage: `url(${h.imageUrl})` } : undefined}
                  >
                    {h.rating !== undefined && (
                      <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                        <Star className="h-2.5 w-2.5 fill-white" /> {h.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div className="px-3 pb-3 pt-2.5">
                    <div className="mb-0.5 line-clamp-1 text-sm font-semibold leading-snug">
                      {h.title}
                    </div>
                    {h.locationName && (
                      <div className="mb-1.5 line-clamp-1 text-[11.5px] text-muted-foreground">
                        {h.locationName}
                      </div>
                    )}
                    {h.price !== undefined && h.currency && (
                      <div className="text-xs text-muted-foreground">
                        <b className="mr-1 font-display text-base font-bold tracking-tight text-foreground">
                          {formatCurrency(h.price, h.currency)}
                        </b>
                        /night
                      </div>
                    )}
                  </div>
                </Link>
              ))}
      </div>
    </main>
  );
}

function DateField({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
}) {
  return (
    <label className="flex flex-col gap-1 rounded-xl border border-border bg-card px-3 py-2 text-xs">
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-sm font-semibold text-foreground outline-none"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <label className="flex flex-col gap-1 rounded-xl border border-border bg-card px-3 py-2 text-xs">
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value) || min)}
        className="bg-transparent text-sm font-semibold text-foreground outline-none"
      />
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <label className="flex flex-col gap-1 rounded-xl border border-border bg-card px-3 py-2 text-xs">
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn("bg-transparent text-sm font-semibold text-foreground outline-none")}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
