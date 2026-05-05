"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { Heart, MapPin, Plus } from "lucide-react";
import Image from "next/image";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AddToTripModal, type DiscoverPayload } from "./AddToTripModal";
import { bookingHrefFor } from "@/lib/bookingHref";
import type { Id } from "@/convex/_generated/dataModel";

// ───────────────────────────────────────────────────────────
//  Categories + chip → provider mapping
// ───────────────────────────────────────────────────────────

export const DISCOVER_CATEGORIES = [
  { k: "all", label: "All", emoji: "✨" },
  { k: "fly", label: "Fly", emoji: "✈️" },
  { k: "stay", label: "Stay", emoji: "🏨" },
  { k: "do", label: "Do", emoji: "🎯" },
  { k: "explore", label: "Explore", emoji: "🧭" },
  { k: "adv", label: "Adventure", emoji: "⛰" },
  { k: "eat", label: "Eat/Drink", emoji: "🍽" },
  { k: "attend", label: "Attend", emoji: "🎟" },
  { k: "shop", label: "Shop", emoji: "🛍" },
  { k: "relax", label: "Relax", emoji: "🌊" },
] as const;

const CHIP_QUERY: Record<
  string,
  { providerCategory: string; term: (city: string) => string }
> = {
  fly:    { providerCategory: "fly",       term: (c) => c },
  do:     { providerCategory: "tour",      term: (c) => c },
  explore:{ providerCategory: "tour",      term: (c) => c },
  adv:    { providerCategory: "adventure", term: (c) => c },
  eat:    { providerCategory: "eat",       term: (c) => c },
  stay:   { providerCategory: "stay",      term: (c) => c },
  attend: { providerCategory: "event",     term: (c) => c },
  shop:   { providerCategory: "tour",      term: (c) => c },
  relax:  { providerCategory: "tour",      term: (c) => c },
};

const DISCOVER_SAMPLES = [
  {
    id: "d1",
    cat: "eat",
    catLabel: "Eat/Drink",
    catEmoji: "🍽",
    title: "Tresind Studio",
    desc: "Theatrical 14-course Indian tasting menu in DIFC.",
    loc: "Dubai, UAE",
    img: "https://picsum.photos/seed/tresind-runwae/600/450",
  },
  {
    id: "d2",
    cat: "stay",
    catLabel: "Stay",
    catEmoji: "🏨",
    title: "Bvlgari Resort",
    desc: "Private island, Mediterranean elegance, infinity pool.",
    loc: "Jumeira Bay",
    img: "https://picsum.photos/seed/bvlgari-runwae/600/450",
  },
  {
    id: "d3",
    cat: "do",
    catLabel: "Do",
    catEmoji: "🎯",
    title: "Aura Skypool",
    desc: "Infinity glass pool 50 floors above Palm Jumeirah.",
    loc: "Palm Jumeirah",
    img: "https://picsum.photos/seed/aurapool-runwae/600/450",
  },
  {
    id: "d4",
    cat: "explore",
    catLabel: "Explore",
    catEmoji: "🧭",
    title: "Hatta Mountains",
    desc: "Kayak the dam, hike the wadis, swim turquoise water.",
    loc: "Hatta, UAE",
    img: "https://picsum.photos/seed/hatta-runwae/600/450",
  },
] as const;

type DiscoverItem = {
  provider: string;
  apiRef: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  rating?: number;
  externalUrl?: string;
  category: string;
  // Set by providers whose card represents a different city than the search
  // city (e.g. Duffel exploration cards from LBA → LIS, BCN, …). Falls back
  // to the grid's `city` prop when missing.
  locationName?: string;
};

// Default search dates ~14d → 21d out so providers needing a window work.
function defaultSearchDates() {
  const now = new Date();
  const out = new Date(now.getTime() + 14 * 86_400_000);
  const back = new Date(now.getTime() + 21 * 86_400_000);
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  return { checkin: fmt(out), checkout: fmt(back) };
}

function discoverCategoryToSave(
  category: string
):
  | "hotel"
  | "flight"
  | "tour"
  | "activity"
  | "restaurant"
  | "event"
  | "destination"
  | "trip"
  | "other" {
  switch (category) {
    case "stay":
    case "hotel":
      return "hotel";
    case "fly":
    case "flight":
      return "flight";
    case "tour":
    case "explore":
      return "tour";
    case "do":
    case "adventure":
    case "activity":
    case "adv":
    case "relax":
      return "activity";
    case "eat":
    case "restaurant":
      return "restaurant";
    case "attend":
    case "event":
      return "event";
    case "destination":
      return "destination";
    case "trip":
      return "trip";
    default:
      return "other";
  }
}

// ───────────────────────────────────────────────────────────
//  Shared DiscoverGrid
//
//  Used by:
//  - apps/web home page (city = viewer.homeCity, no presetTrip)
//  - trip-detail Discover tab (city = trip.destinationLabel,
//                              dates = trip.start/endDate, presetTripId)
// ───────────────────────────────────────────────────────────

export function DiscoverGrid({
  city,
  coords,
  // `iata` (single value) was the legacy prop — prefer the explicit
  // origin/destination split below. We accept both so callers can migrate
  // gradually; when only `iata` is supplied we treat it as the origin.
  iata,
  originIata,
  destinationIata,
  checkin,
  checkout,
  presetTripId,
  showHeading = true,
  initialCategory = "all",
  excludeCategories,
  className,
}: {
  city: string;
  coords?: { lat: number; lng: number };
  iata?: string | null;
  originIata?: string | null;
  destinationIata?: string | null;
  checkin?: string;
  checkout?: string;
  presetTripId?: Id<"trips">;
  showHeading?: boolean;
  initialCategory?: string;
  excludeCategories?: readonly string[];
  className?: string;
}) {
  const resolvedOrigin = originIata ?? iata ?? null;
  const resolvedDestination = destinationIata ?? null;
  const visibleCategories = excludeCategories
    ? DISCOVER_CATEGORIES.filter((c) => !excludeCategories.includes(c.k))
    : DISCOVER_CATEGORIES;
  const search = useAction(api.discovery.searchByCategory);
  const savedKeys = useQuery(api.user_saves.listKeys, {});
  const addSave = useMutation(api.user_saves.add);
  const removeSave = useMutation(api.user_saves.remove);

  const [active, setActive] = useState<string>(initialCategory);
  const [results, setResults] = useState<DiscoverItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [addToTripItem, setAddToTripItem] = useState<DiscoverPayload | null>(null);

  const savedSet = new Set<string>();
  for (const k of savedKeys ?? []) savedSet.add(`${k.provider}:${k.apiRef}`);

  const saveControls: SaveControls = {
    isSaved: (provider, apiRef) => savedSet.has(`${provider}:${apiRef}`),
    toggle: async (item) => {
      const key = `${item.provider}:${item.apiRef}`;
      if (savedSet.has(key)) {
        await removeSave({ provider: item.provider, apiRef: item.apiRef });
      } else {
        await addSave({
          provider: item.provider,
          apiRef: item.apiRef,
          category: discoverCategoryToSave(item.category),
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl,
          price: item.price,
          currency: item.currency,
          locationName: item.locationName,
          coords: item.coords,
          externalUrl: item.externalUrl,
        });
      }
    },
  };

  useEffect(() => {
    if (active === "all") {
      setResults([]);
      setError(null);
      return;
    }
    const cfg = CHIP_QUERY[active];
    if (!cfg) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fallbackDates = defaultSearchDates();
    const args: Parameters<typeof search>[0] = {
      category: cfg.providerCategory,
      term: cfg.term(city),
      lat: coords?.lat,
      lng: coords?.lng,
      limit: 6,
      checkin: checkin ?? fallbackDates.checkin,
      checkout: checkout ?? fallbackDates.checkout,
      forceRefresh: refreshTick > 0,
    };

    if (cfg.providerCategory === "fly") {
      if (!resolvedOrigin) {
        setLoading(false);
        setResults([]);
        setError("Set your home airport to see flight deals.");
        return;
      }
      args.originIata = resolvedOrigin;
      // Destination IATA is derived server-side from trip.destinationCoords
      // (DiscoverTab) or viewer.homeCoords (HomePageClient) — never hardcoded.
      // If we still don't have one, omit it and let Duffel pick by city.
      if (resolvedDestination) args.destinationIata = resolvedDestination;
    }

    search(args)
      .then((items) => {
        if (cancelled) return;
        setResults(items as DiscoverItem[]);
      })
      .catch((err) => {
        if (cancelled) return;
        setResults([]);
        setError(err instanceof Error ? err.message : "Search failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    active,
    city,
    coords?.lat,
    coords?.lng,
    resolvedOrigin,
    resolvedDestination,
    checkin,
    checkout,
    refreshTick,
    search,
  ]);

  return (
    <div className={className}>
      {showHeading && (
        <div className="flex items-center justify-between pb-3 pt-2">
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
            Discover
          </h2>
          <div className="flex items-center gap-3 text-[12.5px] font-semibold">
            {active !== "all" && (
              <button
                type="button"
                onClick={() => setRefreshTick((n) => n + 1)}
                className="text-muted-foreground hover:text-foreground"
              >
                Refresh
              </button>
            )}
          </div>
        </div>
      )}
      <div className="flex gap-2 overflow-x-auto pb-1.5 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visibleCategories.map((c) => {
          const on = active === c.k;
          return (
            <button
              key={c.k}
              type="button"
              onClick={() => setActive(c.k)}
              className={cn(
                "inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-medium transition-colors",
                on
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-foreground/5 text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-[13px]">{c.emoji}</span>
              {c.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mt-2 rounded-2xl border border-dashed border-border px-4 py-4 text-center text-[12.5px] text-muted-foreground">
          {error}
        </div>
      )}

      {active === "all" ? (
        <div className="grid grid-cols-2 gap-3 pt-2 lg:gap-4">
          {DISCOVER_SAMPLES.map((d) => {
            const payload: DiscoverPayload = {
              provider: "static",
              apiRef: d.id,
              category: d.cat,
              title: d.title,
              description: d.desc,
              imageUrl: d.img,
              locationName: d.loc,
            };
            return (
              <DiscoverCard
                key={d.id}
                payload={payload}
                catLabel={d.catLabel}
                catEmoji={d.catEmoji}
                imageOptimized
                saveControls={saveControls}
                onAddToTrip={setAddToTripItem}
              />
            );
          })}
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-3 pt-2 lg:gap-4">
          <Skeleton className="aspect-[4/3] rounded-[14px]" />
          <Skeleton className="aspect-[4/3] rounded-[14px]" />
          <Skeleton className="aspect-[4/3] rounded-[14px]" />
          <Skeleton className="aspect-[4/3] rounded-[14px]" />
        </div>
      ) : results.length === 0 && !error ? (
        <div className="mt-2 rounded-2xl border border-dashed border-border px-4 py-6 text-center text-[12.5px] text-muted-foreground">
          No results for {DISCOVER_CATEGORIES.find((c) => c.k === active)?.label}{" "}
          near {city}.
          <button
            type="button"
            onClick={() => setRefreshTick((n) => n + 1)}
            className="ml-2 font-semibold text-primary"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 pt-2 lg:gap-4">
          {results.map((r) => {
            const cfg = DISCOVER_CATEGORIES.find((c) => c.k === active);
            const payload: DiscoverPayload = {
              provider: r.provider,
              apiRef: r.apiRef,
              category: active,
              title: r.title,
              description: r.description,
              imageUrl: r.imageUrl,
              price: r.price,
              currency: r.currency,
              locationName: r.locationName ?? city,
              externalUrl: r.externalUrl,
            };
            return (
              <DiscoverCard
                key={`${r.provider}:${r.apiRef}`}
                payload={payload}
                catLabel={cfg?.label ?? r.category}
                catEmoji={cfg?.emoji ?? "✨"}
                saveControls={saveControls}
                onAddToTrip={setAddToTripItem}
                checkin={checkin}
                checkout={checkout}
              />
            );
          })}
        </div>
      )}

      <AddToTripModal
        open={addToTripItem !== null}
        onClose={() => setAddToTripItem(null)}
        item={addToTripItem}
        presetTripId={presetTripId}
      />
    </div>
  );
}

// ───────────────────────────────────────────────────────────
//  Card
// ───────────────────────────────────────────────────────────

export type SaveControls = {
  isSaved: (provider: string, apiRef: string) => boolean;
  toggle: (item: DiscoverPayload) => Promise<void>;
};

export function DiscoverCard({
  payload,
  catLabel,
  catEmoji,
  imageOptimized,
  saveControls,
  onAddToTrip,
  checkin,
  checkout,
}: {
  payload: DiscoverPayload;
  catLabel: string;
  catEmoji: string;
  imageOptimized?: boolean;
  saveControls: SaveControls;
  onAddToTrip: (item: DiscoverPayload) => void;
  checkin?: string;
  checkout?: string;
}) {
  const router = useRouter();
  const isSaved = saveControls.isSaved(payload.provider, payload.apiRef);
  const bookingHref = bookingHrefFor(payload, { checkin, checkout });
  const formattedPrice =
    payload.price !== undefined && payload.currency
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: payload.currency,
          maximumFractionDigits: 0,
        }).format(payload.price)
      : null;

  return (
    <div
      onClick={() => {
        // Hotel and flight cards route to the in-app booking flow. Other
        // categories (food, activities) fall back to the provider's own
        // page when one is supplied.
        if (bookingHref) {
          router.push(bookingHref);
        } else if (payload.externalUrl) {
          window.open(payload.externalUrl, "_blank");
        }
      }}
      className="group cursor-pointer overflow-hidden rounded-[14px] border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] transition-transform hover:-translate-y-0.5 hover:scale-[1.015]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {payload.imageUrl ? (
          imageOptimized ? (
            <Image
              src={payload.imageUrl}
              alt={payload.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 350px, 50vw"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={payload.imageUrl}
              alt={payload.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/10 to-foreground/5" />
        )}
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
          <span className="text-[10px]">{catEmoji}</span>
          {catLabel}
        </span>
        {formattedPrice && (
          <span className="absolute bottom-2 left-2 inline-flex items-center rounded-full bg-white/95 px-2 py-1 text-[10.5px] font-bold text-[#0F0F0F] shadow-sm">
            From {formattedPrice}
          </span>
        )}
        <button
          type="button"
          aria-label={isSaved ? "Unsave" : "Save"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void saveControls.toggle(payload);
          }}
          className={cn(
            "absolute right-2 top-2 grid h-[30px] w-[30px] place-items-center rounded-full backdrop-blur-md transition-all hover:bg-white active:scale-90",
            isSaved
              ? "bg-primary text-primary-foreground"
              : "bg-white/90 text-[#0F0F0F] hover:text-primary"
          )}
        >
          <Heart
            className="h-3.5 w-3.5"
            fill={isSaved ? "currentColor" : "none"}
          />
        </button>
      </div>
      <div className="px-3 pb-3 pt-2.5">
        <div className="mb-0.5 line-clamp-1 text-[13.5px] font-semibold leading-tight">
          {payload.title}
        </div>
        <div className="mb-2 line-clamp-2 text-[11.5px] leading-snug text-muted-foreground">
          {payload.description ?? ""}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex min-w-0 flex-1 items-center gap-1 text-[11px] text-muted-foreground/80">
            <MapPin className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{payload.locationName ?? ""}</span>
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToTrip(payload);
            }}
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-primary px-3 text-[11.5px] font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
          >
            <Plus className="h-2.5 w-2.5" strokeWidth={2.6} />
            Add to Trip
          </button>
        </div>
      </div>
    </div>
  );
}

