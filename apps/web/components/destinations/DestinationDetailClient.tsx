"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { ArrowLeft, Heart, MapPin, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { DestinationCard } from "./DestinationCard";
import { FeaturedItineraryCard } from "./FeaturedItineraryCard";

type DestinationData = {
  destination: Doc<"destinations">;
  experiences: Doc<"experiences">[];
  templates: Doc<"itinerary_templates">[];
};

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

interface Props {
  slug: string;
  initialData: DestinationData;
}

export function DestinationDetailClient({ slug, initialData }: Props) {
  const live = useQuery(api.destinations.getBySlug, { slug });
  const data = live ?? initialData;
  const { destination, templates } = data;

  const allDestinations = useQuery(api.destinations.list, { limit: 24 });
  const similar = useMemo(() => {
    if (!allDestinations) return [];
    return allDestinations.filter((d) => d._id !== destination._id);
  }, [allDestinations, destination._id]);

  // Save (heart) state — backed by user_saves keyed by ("internal", destination._id).
  const savedKeys = useQuery(api.user_saves.listKeys, {});
  const addSave = useMutation(api.user_saves.add);
  const removeSave = useMutation(api.user_saves.remove);
  const apiRef = destination._id;

  const isSaved = useMemo(() => {
    if (!savedKeys) return false;
    return savedKeys.some(
      (k) => k.provider === "internal" && k.apiRef === apiRef
    );
  }, [savedKeys, apiRef]);

  async function toggleSave() {
    if (isSaved) {
      await removeSave({ provider: "internal", apiRef });
    } else {
      await addSave({
        provider: "internal",
        apiRef,
        category: "destination",
        title: destination.name,
        description: destination.description,
        imageUrl: destination.heroImageUrl,
        locationName: `${destination.name}, ${destination.country}`,
        coords: destination.coords,
        rating: destination.ratingAverage,
      });
    }
  }

  // Live Viator-backed experiences for this destination, with static fallback.
  const search = useAction(api.discovery.searchByCategory);
  const [experiences, setExperiences] = useState<DiscoverItem[]>([]);
  const [expLoading, setExpLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setExpLoading(true);
    search({
      category: "tour",
      term: destination.name,
      lat: destination.coords?.lat,
      lng: destination.coords?.lng,
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
  }, [destination.name, destination.coords?.lat, destination.coords?.lng, search]);

  return (
    <main className="pb-20">
      <div className="relative h-[55vh] min-h-[360px] w-full overflow-hidden">
        <Image
          src={destination.heroImageUrl}
          alt={destination.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        <div className="absolute left-4 top-4 flex w-[calc(100%-2rem)] items-center justify-between">
          <Link
            href="/explore"
            aria-label="Back"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/85 text-foreground backdrop-blur-md transition-colors hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <button
            type="button"
            aria-label={isSaved ? "Unsave destination" : "Save destination"}
            onClick={toggleSave}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full backdrop-blur-md transition-colors",
              isSaved
                ? "bg-primary text-primary-foreground"
                : "bg-white/85 text-foreground hover:bg-white"
            )}
          >
            <Heart className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-5 pb-6 text-white">
          <div className="mx-auto max-w-5xl">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md">
              <MapPin className="h-3 w-3" /> {destination.country}
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">
              {destination.name}
            </h1>
            <div className="mt-2 inline-flex items-center gap-2 text-[12.5px] font-semibold">
              <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
              {destination.ratingAverage.toFixed(1)}
              <span className="text-white/70">
                ({destination.ratingCount} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl">
        <section className="px-5 pt-6">
          {destination.description && (
            <p className="text-[15px] leading-relaxed text-foreground/85">
              {destination.description}
            </p>
          )}
          {destination.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {destination.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-foreground/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </section>

        <Divider />

        <Section
          title="Featured Itineraries"
          subtitle="Pick a ready-made plan and tweak it as your own."
        >
          {templates.length === 0 ? (
            <EmptyHint message={`No curated itineraries for ${destination.name} yet — start a blank trip from the explore page.`} />
          ) : (
            <div className="flex gap-3 overflow-x-auto px-5 pb-2 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {templates.map((t) => (
                <FeaturedItineraryCard
                  key={t._id}
                  template={t}
                  fallbackImage={destination.heroImageUrl}
                />
              ))}
            </div>
          )}
        </Section>

        <Divider />

        <Section
          title="Featured Experiences"
          subtitle="Tours and activities to slot into your trip — powered by Viator."
        >
          {expLoading ? (
            <div className="flex gap-3 overflow-x-auto px-5 pb-2 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[180px] w-[220px] shrink-0 rounded-[18px]" />
              ))}
            </div>
          ) : experiences.length === 0 ? (
            <EmptyHint message="No live experiences available right now." />
          ) : (
            <div className="flex gap-3 overflow-x-auto px-5 pb-2 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {experiences.map((e) => (
                <ExperienceCard key={`${e.provider}:${e.apiRef}`} item={e} />
              ))}
            </div>
          )}
        </Section>

        <Divider />

        <Section
          title="Similar Destinations"
          subtitle="Other Runwae-loved spots — perfect for your next plan."
        >
          {similar.length === 0 ? (
            <EmptyHint message="More destinations coming soon." />
          ) : (
            <div className="flex gap-3 overflow-x-auto px-5 pb-2 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {similar.map((d) => (
                <DestinationCard key={d._id} destination={d} />
              ))}
            </div>
          )}
        </Section>
      </div>
    </main>
  );
}

function Divider() {
  return <div className="my-6 h-2 bg-foreground/[0.04]" />;
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="px-5 pb-1 pt-1">
        <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            {subtitle}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}

function EmptyHint({ message }: { message: string }) {
  return (
    <div className="mx-5 mt-2 rounded-2xl border border-dashed border-border px-4 py-5 text-center text-[12.5px] text-muted-foreground">
      <Sparkles className="mx-auto mb-1 h-4 w-4 text-foreground/40" />
      {message}
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
      target="_blank"
      rel="noreferrer"
      className="group flex w-[220px] shrink-0 flex-col overflow-hidden rounded-[18px] border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_14px_rgba(0,0,0,0.04)] transition-transform hover:-translate-y-0.5"
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
        {item.rating !== undefined && (
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {item.rating.toFixed(1)}
          </span>
        )}
      </div>
    </a>
  );
}
