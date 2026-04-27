"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAction, useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  ArrowRight,
  Bell,
  Calendar,
  Heart,
  MapPin,
  Plus,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationPrompt } from "./LocationPrompt";
import { FindFriendsSheet } from "@/components/social/FindFriendsSheet";
import { AddToTripModal, type DiscoverPayload } from "@/components/discover/AddToTripModal";

type TripStatus =
  | "planning"
  | "upcoming"
  | "ongoing"
  | "completed"
  | "cancelled";

const STATUS_LABEL: Record<TripStatus, string> = {
  planning: "Planning",
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Cancelled",
};

// Maps trip.status → trip-status chip background. Tuned to match the Runwae
// design tokens: --status-planning / --status-upcoming / --status-ongoing.
const STATUS_BG: Record<TripStatus, string> = {
  planning: "bg-[rgba(123,104,238,0.92)]",
  upcoming: "bg-[rgba(245,166,35,0.95)]",
  ongoing: "bg-[rgba(76,175,130,0.95)]",
  completed: "bg-[rgba(107,107,107,0.85)]",
  cancelled: "bg-[rgba(107,107,107,0.85)]",
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

export function HomePageClient() {
  const viewer = useQuery(api.users.getCurrentUser, {});
  const trips = useQuery(api.trips.getMyTrips, {});
  const events = useQuery(api.events.listPublished, { limit: 8 });
  const friendActivity = useQuery(api.social.getFriendActivityHydrated, { limit: 5 });
  const unreadCount = useQuery(api.notifications.unreadCount, {});
  const polls = useQuery(api.polls.getOpenForUser, { limit: 1 });
  const savedKeys = useQuery(api.user_saves.listKeys, {});
  const addSave = useMutation(api.user_saves.add);
  const removeSave = useMutation(api.user_saves.remove);
  const [findFriendsOpen, setFindFriendsOpen] = useState(false);
  const [addToTripItem, setAddToTripItem] = useState<DiscoverPayload | null>(null);

  const homeCoords = viewer?.homeCoords;
  const homeLabel = viewer?.homeCity ?? viewer?.homeCountry ?? null;
  const homeIata = viewer?.homeIata ?? null;
  const showLocationPrompt = viewer !== undefined && viewer !== null && !homeCoords;

  const savedSet = useMemo(() => {
    const s = new Set<string>();
    for (const k of savedKeys ?? []) s.add(`${k.provider}:${k.apiRef}`);
    return s;
  }, [savedKeys]);

  function makeSaveControls(): SaveControls {
    return {
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
  }

  const saveControls = makeSaveControls();

  return (
    <>
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 lg:px-7 lg:py-2">
        <div className="min-w-0">
          <Greeting viewer={viewer} unread={unreadCount ?? 0} />
          {showLocationPrompt && <LocationPrompt />}
          <HeroFeatured />
          <MyTripsRow trips={trips} />
          <FriendsActivity
            activity={friendActivity}
            onFindFriends={() => setFindFriendsOpen(true)}
          />
          <DiscoverSection
            homeCoords={homeCoords ?? null}
            homeLabel={homeLabel}
            homeIata={homeIata}
            saveControls={saveControls}
            onAddToTrip={setAddToTripItem}
          />
          <EventsRow events={events} />
        </div>
        <RightRail trips={trips} polls={polls} />
      </div>
      <FindFriendsSheet open={findFriendsOpen} onClose={() => setFindFriendsOpen(false)} />
      <AddToTripModal
        open={addToTripItem !== null}
        onClose={() => setAddToTripItem(null)}
        item={addToTripItem}
      />
    </>
  );
}

type SaveControls = {
  isSaved: (provider: string, apiRef: string) => boolean;
  toggle: (item: DiscoverPayload) => Promise<void>;
};

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

/* ────────────────────────────────────────────────────────── */
/*  Greeting                                                  */
/* ────────────────────────────────────────────────────────── */

function Greeting({
  viewer,
  unread,
}: {
  viewer: { name?: string | null; image?: string | null } | null | undefined;
  unread: number;
}) {
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const first = (viewer?.name ?? "").trim().split(/\s+/)[0] ?? "there";

  return (
    <header className="flex items-start gap-3 px-4 pt-5 pb-3 lg:px-0 lg:pt-2">
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-foreground lg:text-3xl">
          {greeting}, {first}
        </h1>
        <p className="mt-0.5 text-[15px] text-muted-foreground">
          Where are you going next?
        </p>
      </div>
      <div className="hidden items-center gap-2.5 pt-0.5 lg:flex">
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative grid h-10 w-10 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-foreground/10"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
          )}
        </Link>
        <Link href="/profile" aria-label="Profile">
          <Avatar src={viewer?.image} name={viewer?.name ?? undefined} size="md" />
        </Link>
      </div>
    </header>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Hero featured                                             */
/* ────────────────────────────────────────────────────────── */

function HeroFeatured() {
  return (
    <div className="px-4 pt-1.5 pb-2 lg:px-0">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px] bg-muted shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]">
        <Image
          src="https://picsum.photos/seed/lisbon-tram-runwae/1200/675"
          alt="Lisbon trams"
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 700px, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/40" />
        <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-[5px] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#0F0F0F]">
          <i className="block h-1.5 w-1.5 rounded-full bg-primary" />
          Trending now
        </span>

        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3.5 text-white lg:inset-x-5 lg:bottom-5">
          <div className="min-w-0 flex-1">
            <div className="font-display text-[28px] font-bold leading-[1.05] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)] lg:text-[34px]">
              Lisbon in Spring
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <HeroPill icon={<Calendar className="h-3 w-3" />}>
                Apr 18 — 24
              </HeroPill>
              <HeroPill icon={<MapPin className="h-3 w-3" />}>Portugal</HeroPill>
            </div>
          </div>
          <Link
            href="/trips/new"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-[0_4px_14px_rgba(255,61,127,0.4)] transition-all hover:bg-primary/90 active:scale-[0.97]"
          >
            Plan a trip
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function HeroPill({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/20 bg-white/15 px-2.5 py-[5px] text-[11.5px] font-medium text-white backdrop-blur-md">
      {icon}
      {children}
    </span>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Section header                                            */
/* ────────────────────────────────────────────────────────── */

function SectionHead({
  title,
  href,
  cta = "See all",
}: {
  title: string;
  href: string;
  cta?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 pb-3 pt-6 lg:px-0 lg:pt-7">
      <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
        {title}
      </h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary"
      >
        {cta}
        <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
      </Link>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  My Trips row                                              */
/* ────────────────────────────────────────────────────────── */

type TripDoc = FunctionReturnType<typeof api.trips.getMyTrips>[number];

function MyTripsRow({ trips }: { trips: TripDoc[] | undefined }) {
  return (
    <>
      <SectionHead title="Your trips" href="/trips" />
      <div className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:px-0 [&::-webkit-scrollbar]:hidden">
        {trips === undefined ? (
          <>
            <Skeleton className="h-[180px] w-[140px] shrink-0 rounded-2xl" />
            <Skeleton className="h-[180px] w-[140px] shrink-0 rounded-2xl" />
            <Skeleton className="h-[180px] w-[140px] shrink-0 rounded-2xl" />
          </>
        ) : (
          <>
            {trips.map((t) => (
              <TripCard key={t._id} trip={t} />
            ))}
            <Link
              href="/trips/new"
              className="group flex h-[180px] w-[140px] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-foreground/15 bg-muted text-[12.5px] font-semibold text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              <span className="grid h-[38px] w-[38px] place-items-center rounded-full bg-foreground/5 text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Plus className="h-5 w-5" strokeWidth={2} />
              </span>
              New trip
            </Link>
          </>
        )}
      </div>
    </>
  );
}

function TripCard({ trip }: { trip: TripDoc }) {
  const status = trip.status as TripStatus;
  const statusBg = STATUS_BG[status] ?? STATUS_BG.planning;
  const statusLabel = STATUS_LABEL[status] ?? "Trip";
  const cover = trip.coverImageUrl;

  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group relative h-[180px] w-[140px] shrink-0 overflow-hidden rounded-2xl bg-muted shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] transition-transform hover:-translate-y-0.5 hover:scale-[1.02]"
    >
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/15 to-foreground/5" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/[0.05] to-black/35" />
      <span
        className={cn(
          "absolute left-2 top-2 inline-flex items-center gap-1 rounded-md px-[7px] py-[4px] text-[9.5px] font-bold uppercase tracking-[0.06em] text-white",
          statusBg
        )}
      >
        <i className="block h-[5px] w-[5px] rounded-full bg-white" />
        {statusLabel}
      </span>
      <div className="absolute inset-x-2.5 bottom-2.5 line-clamp-2 text-[13px] font-bold leading-tight text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]">
        {trip.title}
      </div>
    </Link>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Friends' activity                                         */
/* ────────────────────────────────────────────────────────── */

type ActivityDoc = FunctionReturnType<typeof api.social.getFriendActivityHydrated>[number];

export function ActivityRow({
  item,
  isLast,
}: {
  item: ActivityDoc;
  isLast: boolean;
}) {
  const time = formatRelativeTime(item.createdAt);
  const borderClass = isLast ? "" : "border-b border-border";
  const actorName = item.actor.name ?? item.actor.username ?? "A friend";

  if (item.kind === "trip_created") {
    return (
      <div className={cn("flex min-h-[60px] items-center gap-3 py-2.5", borderClass)}>
        <Avatar src={item.actor.image} name={actorName} size="md" />
        <div className="min-w-0 flex-1 text-[13.5px] leading-snug">
          <span className="font-semibold">{actorName}</span> started planning{" "}
          <span className="font-semibold text-primary">{item.trip.title}</span>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground/80">{time}</div>
        </div>
        <Link
          href={`/trips/${item.trip.slug}`}
          className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-primary"
        >
          See trip <ArrowRight className="h-2.5 w-2.5" strokeWidth={2.4} />
        </Link>
      </div>
    );
  }

  if (item.kind === "event_going") {
    return (
      <div className={cn("flex min-h-[60px] items-center gap-3 py-2.5", borderClass)}>
        <Avatar src={item.actor.image} name={actorName} size="md" />
        <div className="min-w-0 flex-1 text-[13.5px] leading-snug">
          <span className="font-semibold">{actorName}</span> is going to{" "}
          <span className="font-semibold text-primary">
            {item.event?.name ?? "an event"}
          </span>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground/80">{time}</div>
        </div>
        {item.event && (
          <Link
            href={`/e/${item.event.slug}`}
            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-primary"
          >
            See event <ArrowRight className="h-2.5 w-2.5" strokeWidth={2.4} />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-[60px] items-center gap-3 py-2.5", borderClass)}>
      <Avatar src={item.actor.image} name={actorName} size="md" />
      <div className="min-w-0 flex-1 text-[13.5px] leading-snug">
        <span className="font-semibold">{actorName}</span> saved{" "}
        <span className="font-semibold text-primary">{item.savedItem.title}</span>
        <div className="mt-0.5 text-[11.5px] text-muted-foreground/80">{time}</div>
      </div>
    </div>
  );
}

function FriendsActivity({
  activity,
  onFindFriends,
}: {
  activity: ActivityDoc[] | undefined;
  onFindFriends: () => void;
}) {
  const items = activity?.slice(0, 5);
  return (
    <>
      <SectionHead title="Friends' activity" href="/feed" cta="View all" />
      <div className="px-4 lg:px-0">
        {activity === undefined ? (
          <>
            <Skeleton className="my-2 h-12" />
            <Skeleton className="my-2 h-12" />
            <Skeleton className="my-2 h-12" />
          </>
        ) : items && items.length > 0 ? (
          items.map((a, i) => (
            <ActivityRow key={`${a.kind}-${i}`} item={a} isLast={i === items.length - 1} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-[13px] text-muted-foreground">
            Add friends to see what they&apos;re planning.{" "}
            <button
              type="button"
              onClick={onFindFriends}
              className="font-semibold text-primary hover:underline"
            >
              Find friends
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Discover                                                  */
/* ────────────────────────────────────────────────────────── */

// Maps the home Discover chips to provider-side categories + Viator search
// terms. The discovery action's switch picks the provider from category:
// "fly" → duffel, "stay" → liteapi, "tour"/"adventure" → viator, "event" →
// tiqets, "eat" → yelp, etc. For chips that don't have a clean provider
// (Shop / Relax), we fall back to Viator with a topical term.
const CHIP_QUERY: Record<
  string,
  { providerCategory: string; term: (city: string) => string }
> = {
  fly:    { providerCategory: "fly",       term: (c) => c },
  do:     { providerCategory: "tour",      term: (c) => `things to do in ${c}` },
  explore:{ providerCategory: "tour",      term: (c) => `sightseeing tours in ${c}` },
  adv:    { providerCategory: "adventure", term: (c) => `adventure activities in ${c}` },
  eat:    { providerCategory: "eat",       term: (c) => `restaurants in ${c}` },
  stay:   { providerCategory: "stay",      term: (c) => c },
  attend: { providerCategory: "event",     term: (c) => `events in ${c}` },
  shop:   { providerCategory: "tour",      term: (c) => `shopping tours in ${c}` },
  relax:  { providerCategory: "tour",      term: (c) => `wellness spa retreats in ${c}` },
};

const DISCOVER_CATEGORIES = [
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
};

// Default search dates pushed ~14 days out, returning ~21 days out — gives
// Duffel/LiteAPI a real window without requiring trip dates.
function defaultSearchDates() {
  const now = new Date();
  const out = new Date(now.getTime() + 14 * 86_400_000);
  const back = new Date(now.getTime() + 21 * 86_400_000);
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  return { checkin: fmt(out), checkout: fmt(back) };
}

function DiscoverSection({
  homeCoords,
  homeLabel,
  homeIata,
  saveControls,
  onAddToTrip,
}: {
  homeCoords: { lat: number; lng: number } | null;
  homeLabel: string | null;
  homeIata: string | null;
  saveControls: SaveControls;
  onAddToTrip: (item: DiscoverPayload) => void;
}) {
  const [active, setActive] = useState<string>("all");
  const [results, setResults] = useState<DiscoverItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const search = useAction(api.discovery.searchByCategory);

  const cityForSearch = homeLabel ?? "London";

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

    const dates = defaultSearchDates();
    const args: Parameters<typeof search>[0] = {
      category: cfg.providerCategory,
      term: cfg.term(cityForSearch),
      lat: homeCoords?.lat,
      lng: homeCoords?.lng,
      limit: 6,
      checkin: dates.checkin,
      checkout: dates.checkout,
      forceRefresh: refreshTick > 0,
    };

    if (cfg.providerCategory === "fly") {
      // Duffel needs both. We have a home origin (homeIata); without a
      // destination IATA we'd hit the early-return in the provider, so for
      // the home page we pop the same hub as both origin/destination —
      // good for "are flights working at all?" smoke test. Real flights
      // search lives on the Discover page where the user picks a city.
      if (!homeIata) {
        setLoading(false);
        setResults([]);
        setError("Set your home airport above to see flight deals.");
        return;
      }
      args.originIata = homeIata;
      args.destinationIata = "DXB"; // sensible default; replace via the
      // full Discover page or trip context
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
  }, [active, cityForSearch, homeCoords?.lat, homeCoords?.lng, homeIata, refreshTick, search]);

  return (
    <>
      <div className="flex items-center justify-between px-4 pb-3 pt-6 lg:px-0 lg:pt-7">
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
          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-primary"
          >
            See all <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
          </Link>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto px-4 pb-1.5 pt-1 [scrollbar-width:none] lg:px-0 [&::-webkit-scrollbar]:hidden">
        {DISCOVER_CATEGORIES.map((c) => {
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
        <div className="mx-4 mt-2 rounded-2xl border border-dashed border-border px-4 py-4 text-center text-[12.5px] text-muted-foreground lg:mx-0">
          {error}
        </div>
      )}

      {active === "all" ? (
        <div className="grid grid-cols-2 gap-3 px-4 pt-2 lg:gap-4 lg:px-0">
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
                onAddToTrip={onAddToTrip}
              />
            );
          })}
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-3 px-4 pt-2 lg:gap-4 lg:px-0">
          <Skeleton className="aspect-[4/3] rounded-[14px]" />
          <Skeleton className="aspect-[4/3] rounded-[14px]" />
          <Skeleton className="aspect-[4/3] rounded-[14px]" />
          <Skeleton className="aspect-[4/3] rounded-[14px]" />
        </div>
      ) : results.length === 0 && !error ? (
        <div className="mx-4 mt-2 rounded-2xl border border-dashed border-border px-4 py-6 text-center text-[12.5px] text-muted-foreground lg:mx-0">
          No results for {DISCOVER_CATEGORIES.find((c) => c.k === active)?.label}{" "}
          near {cityForSearch}.
          <button
            type="button"
            onClick={() => setRefreshTick((n) => n + 1)}
            className="ml-2 font-semibold text-primary"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pt-2 lg:gap-4 lg:px-0">
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
              locationName: cityForSearch,
              externalUrl: r.externalUrl,
            };
            return (
              <DiscoverCard
                key={`${r.provider}:${r.apiRef}`}
                payload={payload}
                catLabel={cfg?.label ?? r.category}
                catEmoji={cfg?.emoji ?? "✨"}
                saveControls={saveControls}
                onAddToTrip={onAddToTrip}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

export function DiscoverCard({
  payload,
  catLabel,
  catEmoji,
  imageOptimized,
  saveControls,
  onAddToTrip,
}: {
  payload: DiscoverPayload;
  catLabel: string;
  catEmoji: string;
  imageOptimized?: boolean;
  saveControls: SaveControls;
  onAddToTrip: (item: DiscoverPayload) => void;
}) {
  const isSaved = saveControls.isSaved(payload.provider, payload.apiRef);
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
        if (payload.externalUrl) window.open(payload.externalUrl, "_blank");
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

/* ────────────────────────────────────────────────────────── */
/*  Events near you                                           */
/* ────────────────────────────────────────────────────────── */

type EventDoc = FunctionReturnType<typeof api.events.listPublished>[number];

function EventsRow({ events }: { events: EventDoc[] | undefined }) {
  return (
    <>
      <SectionHead title="Events near you" href="/events" />
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 pt-1 [scrollbar-width:none] lg:px-0 [&::-webkit-scrollbar]:hidden">
        {events === undefined ? (
          <>
            <Skeleton className="h-56 w-60 shrink-0 rounded-[14px]" />
            <Skeleton className="h-56 w-60 shrink-0 rounded-[14px]" />
          </>
        ) : events.length === 0 ? (
          <div className="w-full rounded-2xl border border-dashed border-border px-4 py-6 text-center text-[13px] text-muted-foreground">
            No events available right now. Check back soon.
          </div>
        ) : (
          events.map((e) => <EventCard key={e._id} event={e} />)
        )}
      </div>
    </>
  );
}

function EventCard({ event }: { event: EventDoc }) {
  const date = new Date(event.startDateUtc);
  const month = date
    .toLocaleString("en-US", { month: "short", timeZone: event.timezone })
    .toUpperCase();
  const day = date.toLocaleString("en-US", {
    day: "2-digit",
    timeZone: event.timezone,
  });
  const cover = event.imageUrl ?? event.imageUrls[0];

  return (
    <Link
      href={`/e/${event.slug}`}
      className="group block w-60 shrink-0 overflow-hidden rounded-[14px] border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] transition-transform hover:-translate-y-0.5 hover:scale-[1.02]"
    >
      <div className="relative aspect-[16/10] w-full bg-muted">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={event.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute left-2.5 top-2.5 min-w-[42px] rounded-lg bg-white px-1.5 py-1 text-center leading-none shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
          <div className="text-[9px] font-bold uppercase tracking-[0.06em] text-primary">
            {month}
          </div>
          <div className="mt-0.5 font-display text-base font-bold text-[#0F0F0F]">
            {day}
          </div>
        </div>
        <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
          {event.currentParticipants} going
        </span>
      </div>
      <div className="px-3 pb-3 pt-2.5">
        <div className="mb-0.5 line-clamp-1 text-[13.5px] font-semibold leading-tight">
          {event.name}
        </div>
        <div className="mb-2 inline-flex items-center gap-1 text-[11.5px] text-muted-foreground">
          <MapPin className="h-2.5 w-2.5" />
          {event.locationName}
        </div>
        <div className="flex items-center justify-end">
          <span className="inline-flex h-7 items-center rounded-full bg-primary px-3 text-[11.5px] font-semibold text-primary-foreground">
            RSVP
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Right rail (desktop)                                      */
/* ────────────────────────────────────────────────────────── */

type PollDoc = FunctionReturnType<typeof api.polls.getOpenForUser>[number];

function RightRail({
  trips,
  polls,
}: {
  trips: TripDoc[] | undefined;
  polls: PollDoc[] | undefined;
}) {
  const next = useMemo(() => {
    if (!trips) return undefined;
    const upcoming = trips
      .filter((t) => t.status === "upcoming" || t.status === "ongoing")
      .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate))[0];
    return upcoming ?? trips.find((t) => t.status === "planning");
  }, [trips]);

  const poll = polls?.[0];

  return (
    <aside className="hidden flex-col gap-5 pt-2 lg:flex">
      <RailNextTrip trip={next} />
      {poll ? <RailPoll poll={poll} /> : <RailPollEmpty />}
    </aside>
  );
}

function RailNextTrip({ trip }: { trip: TripDoc | undefined }) {
  if (!trip) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]">
        <h3 className="mb-2 font-display text-[14.5px] font-bold tracking-tight">
          No trips yet
        </h3>
        <p className="mb-3 text-[12.5px] text-muted-foreground">
          Start planning your first adventure.
        </p>
        <Link
          href="/trips/new"
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-[12.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          New trip
          <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
        </Link>
      </div>
    );
  }

  const startMs = Date.parse(trip.startDate);
  const days = Math.max(
    1,
    Math.round(
      (Date.parse(trip.endDate) - startMs) / 86_400_000
    ) + 1
  );
  const inDays = Math.max(
    0,
    Math.ceil((startMs - Date.now()) / 86_400_000)
  );
  const budget = trip.estimatedBudget;
  const currency = trip.currency || "GBP";
  const dest = trip.destinationLabel ?? trip.title;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]">
      <h3 className="mb-2 flex items-center justify-between font-display text-[14.5px] font-bold tracking-tight">
        Your next trip
        {inDays > 0 && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-sans text-[10px] font-semibold tracking-normal text-primary">
            in {inDays}d
          </span>
        )}
      </h3>
      <RailStat value={`${days}`} label={`days in ${dest}`} />
      <RailStat value={trip.status === "planning" ? "—" : "9"} label="activities planned" />
      {budget !== undefined && (
        <RailStat
          value={new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
          }).format(budget)}
          label="estimated budget"
        />
      )}
      <Link
        href={`/trips/${trip.slug}`}
        className="mt-2.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-[12.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Open trip
        <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
      </Link>
    </div>
  );
}

function RailStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2 border-b border-border py-2 text-[12.5px] text-muted-foreground last:border-b-0">
      <b className="min-w-[30px] font-display text-[18px] font-bold tracking-tight text-foreground">
        {value}
      </b>
      <span>{label}</span>
    </div>
  );
}

function RailPollEmpty() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]">
      <h3 className="mb-2 font-display text-[14.5px] font-bold tracking-tight">
        No open polls
      </h3>
      <p className="text-[12.5px] text-muted-foreground">
        When your trip group runs a poll, it shows up here.
      </p>
    </div>
  );
}

function RailPoll({ poll }: { poll: PollDoc }) {
  const vote = useMutation(api.polls.vote);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const myOptionId = poll.myOptionId ?? pendingId;
  const showResults = myOptionId !== null;

  const total = Math.max(1, poll.totalVotes);
  const closesIn = poll.closesAt
    ? Math.max(0, Math.ceil((poll.closesAt - Date.now()) / 86_400_000))
    : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]">
      <h3 className="mb-2.5 flex items-center justify-between font-display text-[14.5px] font-bold tracking-tight">
        Open poll
        {closesIn !== null && (
          <span
            className="rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold tracking-normal"
            style={{ color: "#7B68EE", background: "rgba(123,104,238,0.12)" }}
          >
            {closesIn === 0 ? "closing" : `${closesIn}d left`}
          </span>
        )}
      </h3>
      <div className="mb-1 text-[13px] font-semibold leading-snug">
        {poll.title}
      </div>
      <div className="mb-2.5 text-[11px] text-muted-foreground/80">
        {poll.tripTitle} · {poll.totalVotes} voted
      </div>
      {poll.options.map((o) => {
        const isPicked = myOptionId === o._id;
        const pct = showResults
          ? Math.round((o.voteCount / total) * 100)
          : 0;
        return (
          <div key={o._id} className="mb-1.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPendingId(o._id);
                vote({ pollId: poll._id, optionId: o._id }).catch(() => {
                  setPendingId(null);
                });
              }}
              className="relative h-7 flex-1 cursor-pointer overflow-hidden rounded-full bg-foreground/5"
            >
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-all",
                  isPicked ? "bg-primary" : "bg-primary/15"
                )}
                style={{ width: showResults ? `${pct}%` : "0%" }}
              />
              <span
                className={cn(
                  "absolute left-2.5 top-1/2 -translate-y-1/2 whitespace-nowrap text-[11.5px] font-semibold",
                  isPicked ? "text-primary-foreground" : "text-foreground"
                )}
              >
                {o.label}
              </span>
            </button>
            <span className="min-w-[30px] text-right text-[11px] font-bold tabular-nums text-muted-foreground">
              {showResults ? `${pct}%` : "—"}
            </span>
          </div>
        );
      })}
      {poll.tripSlug && (
        <Link
          href={`/trips/${poll.tripSlug}?tab=activity`}
          className="mt-2 block text-[11.5px] font-semibold text-primary"
        >
          See all polls →
        </Link>
      )}
    </div>
  );
}
