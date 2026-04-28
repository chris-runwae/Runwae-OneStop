"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { ArrowRight, Compass, MapPin, Search, Sparkles, Star } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { EventCard } from "@/components/events/EventCard";
import { DestinationCard } from "@/components/destinations/DestinationCard";

type DiscoverItem = {
  provider: string;
  apiRef: string;
  category: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  rating?: number;
  externalUrl?: string;
};

const FILTERS = [
  { k: "all", label: "All", emoji: "✨" },
  { k: "beach", label: "Beach", emoji: "🏖" },
  { k: "city", label: "City", emoji: "🏙" },
  { k: "adventure", label: "Adventure", emoji: "⛰" },
  { k: "culture", label: "Culture", emoji: "🌈" },
  { k: "food", label: "Food", emoji: "🍽" },
  { k: "wellness", label: "Wellness", emoji: "🧘" },
] as const;

export function ExploreClient() {
  const destinations = useQuery(api.destinations.list, { featuredOnly: true, limit: 24 });
  const events = useQuery(api.events.listPublished, { limit: 12 });
  const seed = useMutation(api.destinations.seedDefaultsIfEmpty);
  const search = useAction(api.discovery.searchByCategory);

  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  // Bootstrap destinations on first visit if the table is empty.
  useEffect(() => {
    if (destinations === undefined) return;
    if (destinations.length === 0) {
      seed({}).catch(() => {
        /* swallow — non-fatal if user lacks auth */
      });
    }
  }, [destinations, seed]);

  const filtered = useMemo(() => {
    if (!destinations) return undefined;
    let rows = destinations;
    if (filter !== "all") {
      rows = rows.filter((d) =>
        d.tags.some((t) => t.toLowerCase().includes(filter))
      );
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return rows;
  }, [destinations, filter, query]);

  const hero = destinations?.[0];

  // Pull live featured experiences from Viator using the top featured
  // destination as the search term. Falls back to static provider if
  // VIATOR_KEY isn't configured.
  const [experiences, setExperiences] = useState<DiscoverItem[]>([]);
  const [expLoading, setExpLoading] = useState(false);

  useEffect(() => {
    if (!hero) return;
    let cancelled = false;
    setExpLoading(true);
    search({
      category: "tour",
      term: hero.name,
      lat: hero.coords?.lat,
      lng: hero.coords?.lng,
      limit: 8,
    })
      .then((items) => {
        if (cancelled) return;
        setExperiences(items as DiscoverItem[]);
      })
      .catch(() => {
        if (!cancelled) setExperiences([]);
      })
      .finally(() => {
        if (!cancelled) setExpLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hero, search]);

  return (
    <main className="mx-auto w-full max-w-6xl pb-20">
      {/* ─────────────────────────────────────────────────── */}
      {/* Header                                              */}
      {/* ─────────────────────────────────────────────────── */}
      <header className="px-4 pb-4 pt-6 lg:px-0">
        <div className="flex items-center gap-2 text-[12.5px] font-semibold uppercase tracking-wider text-primary">
          <Compass className="h-4 w-4" /> Explore
        </div>
        <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
          Find your next adventure
        </h1>
        <p className="mt-1 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
          Curated destinations, ready-to-plan itineraries, live experiences and
          upcoming events — all in one place.
        </p>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Lisbon, Tokyo, Bali…"
              className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-[14px] text-foreground shadow-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((f) => {
              const on = filter === f.k;
              return (
                <button
                  key={f.k}
                  type="button"
                  onClick={() => setFilter(f.k)}
                  className={cn(
                    "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium transition-colors",
                    on
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{f.emoji}</span>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────── */}
      {/* Featured destinations                               */}
      {/* ─────────────────────────────────────────────────── */}
      <section className="px-4 lg:px-0">
        {filtered === undefined ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="aspect-[4/5] w-full rounded-[18px]"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyHint
            title="No destinations match those filters"
            subtitle="Try clearing the search or pick another mood."
          />
        ) : (
          <>
            {hero && filter === "all" && !query && (
              <Link
                href={`/destinations/${hero.slug}`}
                className="group relative mb-6 block overflow-hidden rounded-[24px]"
              >
                <div className="relative aspect-[16/8] w-full">
                  <Image
                    src={hero.heroImageUrl}
                    alt={hero.name}
                    fill
                    priority
                    sizes="(min-width: 1024px) 1024px, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 px-5 pb-6 text-white md:px-8 md:pb-8">
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md">
                    <Sparkles className="h-3 w-3" /> Featured
                  </div>
                  <h2 className="font-display text-3xl font-extrabold leading-tight md:text-4xl">
                    {hero.name}
                    <span className="ml-2 text-[14px] font-medium opacity-80">
                      {hero.country}
                    </span>
                  </h2>
                  {hero.description && (
                    <p className="mt-2 line-clamp-2 max-w-2xl text-[13.5px] leading-relaxed text-white/90">
                      {hero.description}
                    </p>
                  )}
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12.5px] font-semibold text-foreground">
                    Explore destination
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            )}

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {(filter === "all" && !query ? filtered.slice(1) : filtered).map(
                (d) => (
                  <DestinationCard
                    key={d._id}
                    destination={d}
                    fullWidth
                    imageHeight={150}
                  />
                )
              )}
            </div>
          </>
        )}
      </section>

      {/* ─────────────────────────────────────────────────── */}
      {/* Featured experiences (Viator)                       */}
      {/* ─────────────────────────────────────────────────── */}
      <section className="mt-10">
        <header className="flex items-baseline justify-between px-4 pb-2 lg:px-0">
          <div>
            <h2 className="font-display text-xl font-extrabold tracking-tight">
              Featured Experiences
            </h2>
            <p className="text-[12.5px] text-muted-foreground">
              {hero
                ? `Top tours and activities in ${hero.name} — powered by Viator.`
                : "Curated tours and activities."}
            </p>
          </div>
        </header>
        {expLoading ? (
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 pt-2 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="h-[200px] w-[240px] shrink-0 rounded-[18px]"
              />
            ))}
          </div>
        ) : experiences.length === 0 ? (
          <EmptyHint
            title="No live experiences right now"
            subtitle="Check back later — we refresh providers daily."
          />
        ) : (
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 pt-2 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {experiences.map((e) => (
              <ExperienceCard key={`${e.provider}:${e.apiRef}`} item={e} />
            ))}
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────── */}
      {/* Upcoming events                                      */}
      {/* ─────────────────────────────────────────────────── */}
      <section className="mt-10">
        <header className="flex items-baseline justify-between px-4 pb-2 lg:px-0">
          <div>
            <h2 className="font-display text-xl font-extrabold tracking-tight">
              Upcoming Events
            </h2>
            <p className="text-[12.5px] text-muted-foreground">
              Festivals, gigs and gatherings hand-picked for travellers.
            </p>
          </div>
          <Link
            href="/events"
            className="text-[12.5px] font-semibold text-primary hover:underline"
          >
            See all
          </Link>
        </header>

        {events === undefined ? (
          <div className="flex gap-3 overflow-x-auto px-4 pb-3 pt-3 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="h-[145px] w-[128px] shrink-0 rounded-[15px]"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyHint
            title="No events yet"
            subtitle="Check back as the calendar fills up."
          />
        ) : (
          <div className="flex gap-3 overflow-x-auto px-4 pb-3 pt-3 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {events.map((e, i) => (
              <EventCard key={e._id} event={e} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────── */}
      {/* CTA strip                                            */}
      {/* ─────────────────────────────────────────────────── */}
      <section className="mt-10 px-4 lg:px-0">
        <div className="overflow-hidden rounded-[24px] bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground md:p-10">
          <h3 className="font-display text-2xl font-extrabold leading-tight md:text-3xl">
            Have a destination in mind?
          </h3>
          <p className="mt-1 max-w-md text-[14px] text-primary-foreground/85">
            Plan your trip in minutes — Runwae handles flights, stays, tours
            and group voting.
          </p>
          <Link
            href="/trips/new"
            className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[14px] font-semibold text-primary transition-transform hover:scale-[1.02]"
          >
            Plan a trip
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function EmptyHint({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-4 my-2 rounded-2xl border border-dashed border-border px-5 py-8 text-center text-foreground/70 lg:mx-0">
      <Sparkles className="mx-auto mb-1 h-4 w-4 text-foreground/40" />
      <div className="text-[13.5px] font-semibold">{title}</div>
      <div className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</div>
    </div>
  );
}

function ExperienceCard({ item }: { item: DiscoverItem }) {
  const formattedPrice =
    item.price !== undefined && item.currency
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: item.currency,
          maximumFractionDigits: 0,
        }).format(item.price)
      : null;

  return (
    <a
      href={item.externalUrl ?? "#"}
      target={item.externalUrl ? "_blank" : undefined}
      rel="noreferrer"
      className="group flex w-[240px] shrink-0 flex-col overflow-hidden rounded-[18px] border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_14px_rgba(0,0,0,0.04)] transition-transform hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] w-full bg-muted">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-foreground/10" />
        )}
        <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
          {item.provider}
        </span>
        {formattedPrice && (
          <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2 py-1 text-[10.5px] font-bold text-foreground shadow-sm">
            From {formattedPrice}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        <h3 className="line-clamp-2 text-[13.5px] font-semibold leading-tight">
          {item.title}
        </h3>
        <div className="mt-1 inline-flex items-center gap-2 text-[11px] text-muted-foreground">
          {item.rating !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {item.rating.toFixed(1)}
            </span>
          )}
          {item.externalUrl && (
            <span className="inline-flex items-center gap-1 text-foreground/60">
              <MapPin className="h-3 w-3" />
              Book
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
