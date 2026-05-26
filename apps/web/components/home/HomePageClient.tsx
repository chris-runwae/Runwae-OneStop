"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  ArrowRight,
  Bell,
  Calendar,
  MapPin,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationPrompt } from "./LocationPrompt";
import { FindFriendsSheet } from "@/components/social/FindFriendsSheet";
import { DiscoverGrid } from "@/components/discover/DiscoverGrid";
import { EventCard } from "@/components/events/EventCard";
import { CreateTripModal } from "@/components/trips/CreateTripModal";

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

const STATUS_BG: Record<TripStatus, string> = {
  planning: "bg-[rgba(123,104,238,0.92)]",
  upcoming: "bg-[rgba(245,166,35,0.95)]",
  ongoing: "bg-[rgba(76,175,130,0.95)]",
  completed: "bg-[rgba(107,107,107,0.85)]",
  cancelled: "bg-[rgba(107,107,107,0.85)]",
};

export function HomePageClient() {
  const viewer = useQuery(api.users.getCurrentUser, {});
  const trips = useQuery(api.trips.getMyTrips, {});
  const events = useQuery(api.events.listPublished, { limit: 8 });
  const friendActivity = useQuery(api.social.getFriendActivityHydrated, {
    limit: 5,
  });
  const unreadCount = useQuery(api.notifications.unreadCount, {});
  const polls = useQuery(api.polls.getOpenForUser, { limit: 1 });
  const featuredDestinations = useQuery(api.destinations.list, {
    featuredOnly: true,
    limit: 1,
  });
  const heroDestination = featuredDestinations?.[0] ?? null;
  const [findFriendsOpen, setFindFriendsOpen] = useState(false);

  const homeCoords = viewer?.homeCoords;
  const homeLabel = viewer?.homeCity ?? viewer?.homeCountry ?? null;
  const homeIata = viewer?.homeIata ?? null;
  const showLocationPrompt =
    viewer !== undefined && viewer !== null && !homeCoords;

  // Find the next upcoming/planning trip for the hero card
  const nextTrip = useMemo(() => {
    if (trips === undefined) return undefined; // still loading
    const ordered = trips
      .filter(
        (t) =>
          t.status === "upcoming" ||
          t.status === "planning" ||
          t.status === "ongoing",
      )
      .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));
    return ordered[0] ?? null; // null = loaded but no upcoming trip
  }, [trips]);

  return (
    <>
      <div className="lg:gap-8 lg:px-7 lg:py-2">
        <div className="min-w-0">
          <Greeting viewer={viewer} unread={unreadCount ?? 0} />
          {showLocationPrompt && <LocationPrompt />}
          <SearchBar />
          <HeroFeatured
            destination={heroDestination}
            loading={featuredDestinations === undefined}
            nextTrip={nextTrip}
          />
          <MyTripsRow trips={trips} />
          <FriendsActivity
            activity={friendActivity}
            onFindFriends={() => setFindFriendsOpen(true)}
          />
          <SectionHead title="Discover" href="/explore" />
          <div className="px-4 lg:px-0">
            <DiscoverGrid
              city={homeLabel ?? "London"}
              coords={homeCoords ?? undefined}
              iata={homeIata}
              showHeading={false}
            />
          </div>
          <EventsRow events={events} />
        </div>
      </div>
      <FindFriendsSheet
        open={findFriendsOpen}
        onClose={() => setFindFriendsOpen(false)}
      />
    </>
  );
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
  const first = (viewer?.name ?? "").trim().split(/\s+/)[0] ?? "there";

  return (
    <header className="mx-4 mb-4 mt-5 grid grid-cols-[auto_1fr_auto] items-stretch overflow-hidden rounded-2xl border border-border bg-card lg:mx-0 lg:mt-2 lg:grid-cols-[1fr_2fr_1fr]">
      {/* Greeting text */}
      <div className="lg:border-r lg:border-border px-3 py-3 lg:px-5 lg:py-4">
        <h1 className="font-display text-xl font-bold leading-tight tracking-tight text-foreground lg:text-2xl">
          Hi, {first} 👋
        </h1>
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground lg:mt-1 lg:text-[13px]">
          Let&apos;s help you plan your next Adventure
        </p>
      </div>

      {/* Category tabs — desktop only */}
      <div className="hidden items-center lg:flex">
        <NavCategoryTab emoji="✈️" label="Flights" active />
        <NavCategoryTab emoji="🏛️" label="Stay" />
        <NavCategoryTab emoji="🏞️" label="Experiences" />
      </div>

      {/* Bell + Avatar */}
      <div className="flex shrink-0 items-center justify-end gap-2 lg:border-l lg:border-border px-3 lg:gap-2.5 lg:px-4">
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-foreground/10 lg:h-10 lg:w-10"
        >
          <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background lg:right-2 lg:top-2 lg:h-2.5 lg:w-2.5" />
          )}
        </Link>
        <Link href="/profile" aria-label="Profile">
          <Avatar
            src={viewer?.image}
            name={viewer?.name ?? undefined}
            size="md"
          />
        </Link>
      </div>
    </header>
  );
}

function NavCategoryTab({
  emoji,
  label,
  active = false,
}: {
  emoji: string;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex flex-1 flex-col items-center gap-1.5 py-3 transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground/70",
      )}
    >
      <span className="text-3xl leading-none">{emoji}</span>
      <span
        className={cn("text-[12.5px]", active ? "font-bold" : "font-medium")}
      >
        {label}
      </span>
    </button>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Search / link bar                                         */
/* ────────────────────────────────────────────────────────── */

function SearchBar() {
  const [query, setQuery] = useState("");

  return (
    <div className="mx-4 mb-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] lg:mx-0">
      <div className="mb-4 flex items-center gap-2 text-[13.5px]">
        <span className="inline-flex items-center gap-1 font-bold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          NEW
        </span>
        <span className="select-none text-foreground/25">|</span>
        <span className="text-foreground/70">
          Paste a Link → Generate Itinerary
        </span>
      </div>
      <div className="flex gap-2.5">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search or paste link"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-[13.5px] font-semibold text-primary-foreground shadow-[0_4px_14px_rgba(255,61,127,0.35)] transition-all hover:bg-primary/90 active:scale-[0.97] lg:px-8"
        >
          <Search className="h-4 w-4" />
          <span className="hidden lg:inline">Search</span>
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Hero featured                                             */
/* ────────────────────────────────────────────────────────── */

type TripDoc = FunctionReturnType<typeof api.trips.getMyTrips>[number];
type HeroDestination = FunctionReturnType<typeof api.destinations.list>[number];

function HeroFeatured({
  destination,
  loading,
  nextTrip,
}: {
  destination: HeroDestination | null;
  loading: boolean;
  nextTrip: TripDoc | null | undefined;
}) {
  const [createOpen, setCreateOpen] = useState(false);

  // Skeleton while both data sources are loading
  if (nextTrip === undefined && loading) {
    return (
      <div className="px-4 pt-1.5 pb-2 lg:px-0">
        <Skeleton className="aspect-[4/3] lg:aspect-[5/2] w-full rounded-[20px]" />
      </div>
    );
  }

  // User has an upcoming trip — show it as the hero
  if (nextTrip) {
    return (
      <>
        <HeroTrip trip={nextTrip} onCreateTrip={() => setCreateOpen(true)} />
        <CreateTripModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
        />
      </>
    );
  }

  // Still waiting for destinations
  if (loading) {
    return (
      <div className="px-4 pt-1.5 pb-2 lg:px-0">
        <Skeleton className="aspect-[4/3] lg:aspect-[5/2] w-full rounded-[20px]" />
      </div>
    );
  }

  // No featured destination — evergreen placeholder
  if (!destination) {
    return (
      <div className="px-4 pt-1.5 pb-2 lg:px-0">
        <div className="relative aspect-[4/3] lg:aspect-[5/2] w-full overflow-hidden rounded-[20px] bg-gradient-to-br from-primary/20 via-card to-muted shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]">
          <div className="absolute inset-0 flex flex-col items-start justify-end gap-3 p-5 lg:p-7">
            <h2 className="font-display text-[26px] font-bold leading-[1.05] tracking-tight text-foreground lg:text-[32px]">
              Where to next?
            </h2>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-[0_4px_14px_rgba(255,61,127,0.4)] transition-all hover:bg-primary/90 active:scale-[0.97]"
            >
              Plan a trip
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
            </button>
          </div>
        </div>
        <CreateTripModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
        />
      </div>
    );
  }

  // Featured destination hero
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
  }).format(new Date());
  const title = `${destination.name} in ${monthLabel}`;
  const seedLabel = `${destination.name}, ${destination.country}`;

  return (
    <div className="px-4 pt-1.5 pb-2 lg:px-0">
      <Link
        href={`/destinations/${destination.slug}`}
        className="relative block aspect-[4/3] lg:aspect-[5/2] w-full overflow-hidden rounded-[20px] bg-muted shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]"
      >
        <Image
          src={destination.heroImageUrl}
          alt={destination.name}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 900px, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/40" />
        <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-[5px] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#0F0F0F]">
          <i className="block h-1.5 w-1.5 rounded-full bg-primary" />
          Trending now
        </span>

        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3.5 text-white lg:inset-x-5 lg:bottom-5">
          <div className="min-w-0 flex-1">
            <div className="font-display text-[28px] font-bold leading-[1.05] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)] lg:text-[34px]">
              {title}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <HeroPill icon={<MapPin className="h-3 w-3" />}>
                {destination.country}
              </HeroPill>
              {destination.ratingAverage > 0 && (
                <HeroPill icon={<Calendar className="h-3 w-3" />}>
                  ★ {destination.ratingAverage.toFixed(1)}
                </HeroPill>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setCreateOpen(true);
            }}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-[0_4px_14px_rgba(255,61,127,0.4)] transition-all hover:bg-primary/90 active:scale-[0.97]"
          >
            Plan a trip
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
          </button>
        </div>
      </Link>

      <CreateTripModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        seedDestination={{
          destinationLabel: seedLabel,
          coords: destination.coords,
        }}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Trip hero card                                            */
/* ────────────────────────────────────────────────────────── */

function formatTripDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const ordinal = (n: number) => {
    if (n % 10 === 1 && n !== 11) return "st";
    if (n % 10 === 2 && n !== 12) return "nd";
    if (n % 10 === 3 && n !== 13) return "rd";
    return "th";
  };
  const month = end.toLocaleDateString("en-GB", { month: "long" });
  const year = end.getFullYear();
  return `${start.getDate()} - ${end.getDate()}${ordinal(end.getDate())} ${month}, ${year}`;
}

function HeroTrip({
  trip,
  onCreateTrip,
}: {
  trip: TripDoc;
  onCreateTrip: () => void;
}) {
  const startMs = Date.parse(trip.startDate);
  const dateLabel = formatTripDateRange(trip.startDate, trip.endDate);
  const location = trip.destinationLabel ?? "";

  return (
    <div className="px-4 pt-1.5 pb-2 lg:px-0">
      <div className="relative aspect-[4/3] lg:aspect-[5/2] w-full overflow-hidden rounded-[20px] bg-muted shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] ring-2 ring-white/50">
        {trip.coverImageUrl ? (
          <Image
            src={trip.coverImageUrl}
            alt={trip.title}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 900px, 100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-card to-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40" />

        {/* Top bar — mobile: two rows; desktop: single row */}
        <div className="absolute inset-x-3.5 top-3.5">
          {/* Mobile */}
          <div className="flex flex-col gap-2 lg:hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-md bg-[#1F1F1F]/85 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                Trending
              </span>
              <button
                type="button"
                onClick={onCreateTrip}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground shadow-[0_4px_14px_rgba(255,61,127,0.4)] transition-all hover:bg-primary/90 active:scale-[0.97]"
              >
                Plan a Trip
                <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
              </button>
            </div>
            <div className="flex justify-center">
              <CountdownTimer targetMs={startMs} />
            </div>
          </div>
          {/* Desktop: [Trending + Countdown] left — [Plan a Trip] right */}
          <div className="hidden items-center justify-between gap-2 lg:flex">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#1F1F1F]/85 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                Trending
              </span>
              <CountdownTimer targetMs={startMs} />
            </div>
            <button
              type="button"
              onClick={onCreateTrip}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-[0_4px_14px_rgba(255,61,127,0.4)] transition-all hover:bg-primary/90 active:scale-[0.97]"
            >
              Plan a Trip
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
            </button>
          </div>
        </div>

        {/* Bottom info */}
        <Link
          href={`/trips/${trip.slug}`}
          className="absolute inset-x-0 bottom-0 p-5 lg:p-6"
        >
          <h2 className="font-display text-[28px] font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)] lg:text-[32px]">
            {trip.title}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {location && (
              <HeroPill icon={<span className="text-[11px]">📍</span>}>
                {location}
              </HeroPill>
            )}
            <HeroPill icon={<span className="text-[11px]">🗓️</span>}>
              {dateLabel}
            </HeroPill>
          </div>
        </Link>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Countdown timer                                           */
/* ────────────────────────────────────────────────────────── */

function CountdownTimer({ targetMs }: { targetMs: number }) {
  const [diff, setDiff] = useState(Math.max(0, targetMs - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      setDiff(Math.max(0, targetMs - Date.now()));
    }, 60_000);
    return () => clearInterval(id);
  }, [targetMs]);

  const totalSecs = Math.floor(diff / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-[7px] backdrop-blur-md">
      <DigitGroup n={days} />
      <span className="text-[9.5px] font-medium text-foreground/70">Days</span>
      <DigitGroup n={hours} />
      <span className="text-[9.5px] font-medium text-foreground/70">Hours</span>
      <DigitGroup n={mins} />
      <span className="text-[9.5px] font-medium text-foreground/70">Mins</span>
    </div>
  );
}

function DigitGroup({ n }: { n: number }) {
  const str = String(n).padStart(2, "0");
  return (
    <span className="inline-flex gap-[3px]">
      {str.split("").map((d, i) => (
        <span
          key={i}
          className="inline-flex h-[22px] w-[16px] items-center justify-center rounded-[4px] bg-white/90 text-[12px] font-black text-primary shadow-sm"
        >
          {d}
        </span>
      ))}
    </span>
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
          statusBg,
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

type ActivityDoc = FunctionReturnType<
  typeof api.social.getFriendActivityHydrated
>[number];

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
      <div
        className={cn(
          "flex min-h-[60px] items-center gap-3 py-2.5",
          borderClass,
        )}
      >
        <Avatar src={item.actor.image} name={actorName} size="md" />
        <div className="min-w-0 flex-1 text-[13.5px] leading-snug">
          <span className="font-semibold">{actorName}</span> started planning{" "}
          <span className="font-semibold text-primary">{item.trip.title}</span>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground/80">
            {time}
          </div>
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
      <div
        className={cn(
          "flex min-h-[60px] items-center gap-3 py-2.5",
          borderClass,
        )}
      >
        <Avatar src={item.actor.image} name={actorName} size="md" />
        <div className="min-w-0 flex-1 text-[13.5px] leading-snug">
          <span className="font-semibold">{actorName}</span> is going to{" "}
          <span className="font-semibold text-primary">
            {item.event?.name ?? "an event"}
          </span>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground/80">
            {time}
          </div>
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

  if (item.kind === "item_saved") {
    return (
      <div
        className={cn(
          "flex min-h-[60px] items-center gap-3 py-2.5",
          borderClass,
        )}
      >
        <Avatar src={item.actor.image} name={actorName} size="md" />
        <div className="min-w-0 flex-1 text-[13.5px] leading-snug">
          <span className="font-semibold">{actorName}</span> saved{" "}
          <span className="font-semibold text-primary">
            {item.savedItem.title}
          </span>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground/80">
            {time}
          </div>
        </div>
      </div>
    );
  }

  if (item.kind === "user_save") {
    return (
      <div
        className={cn(
          "flex min-h-[60px] items-center gap-3 py-2.5",
          borderClass,
        )}
      >
        <Avatar src={item.actor.image} name={actorName} size="md" />
        <div className="min-w-0 flex-1 text-[13.5px] leading-snug">
          <span className="font-semibold">{actorName}</span> liked{" "}
          <span className="font-semibold text-primary">{item.save.title}</span>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground/80">
            {time}
          </div>
        </div>
      </div>
    );
  }

  // trip_post
  return (
    <div
      className={cn("flex min-h-[60px] items-center gap-3 py-2.5", borderClass)}
    >
      <Avatar src={item.actor.image} name={actorName} size="md" />
      <div className="min-w-0 flex-1 text-[13.5px] leading-snug">
        <span className="font-semibold">{actorName}</span> posted on{" "}
        <span className="font-semibold text-primary">
          {item.trip?.title ?? "their trip"}
        </span>
        <div className="mt-0.5 line-clamp-1 text-[11.5px] text-foreground/70">
          {item.post.content}
        </div>
        <div className="mt-0.5 text-[11.5px] text-muted-foreground/80">
          {time}
        </div>
      </div>
      {item.trip && (
        <Link
          href={`/trips/${item.trip.slug}`}
          className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-primary"
        >
          Open <ArrowRight className="h-2.5 w-2.5" strokeWidth={2.4} />
        </Link>
      )}
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
            <ActivityRow
              key={`${a.kind}-${i}`}
              item={a}
              isLast={i === items.length - 1}
            />
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
/*  Events near you                                           */
/* ────────────────────────────────────────────────────────── */

type EventDoc = FunctionReturnType<typeof api.events.listPublished>[number];

function EventsRow({ events }: { events: EventDoc[] | undefined }) {
  return (
    <>
      <SectionHead title="Events near you" href="/events" />
      <div className="flex gap-3 overflow-x-auto px-4 pb-3 pt-3 [scrollbar-width:none] lg:px-0 [&::-webkit-scrollbar]:hidden">
        {events === undefined ? (
          <>
            <Skeleton className="h-[145px] w-[128px] shrink-0 rounded-[15px]" />
            <Skeleton className="h-[145px] w-[128px] shrink-0 rounded-[15px]" />
            <Skeleton className="h-[145px] w-[128px] shrink-0 rounded-[15px]" />
          </>
        ) : events.length === 0 ? (
          <div className="w-full rounded-2xl border border-dashed border-border px-4 py-6 text-center text-[13px] text-muted-foreground">
            No events available right now. Check back soon.
          </div>
        ) : (
          events.map((e, i) => <EventCard key={e._id} event={e} index={i} />)
        )}
      </div>
    </>
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
  const activityCount = useQuery(
    api.itinerary.getItemCount,
    trip ? { tripId: trip._id } : "skip",
  );

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
    Math.round((Date.parse(trip.endDate) - startMs) / 86_400_000) + 1,
  );
  const inDays = Math.max(0, Math.ceil((startMs - Date.now()) / 86_400_000));
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
      <RailStat
        value={activityCount === undefined ? "—" : String(activityCount)}
        label="activities planned"
      />
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
        const pct = showResults ? Math.round((o.voteCount / total) * 100) : 0;
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
                  isPicked ? "bg-primary" : "bg-primary/15",
                )}
                style={{ width: showResults ? `${pct}%` : "0%" }}
              />
              <span
                className={cn(
                  "absolute left-2.5 top-1/2 -translate-y-1/2 whitespace-nowrap text-[11.5px] font-semibold",
                  isPicked ? "text-primary-foreground" : "text-foreground",
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
