"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ExternalLink,
  MapPin,
  Minus,
  Plane,
  Plus,
  Search,
  Share2,
  Star,
  X,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Avatar } from "@/components/ui/avatar";
import { cn, formatCurrency } from "@/lib/utils";
import { formatDateRange } from "@/lib/format";

type Event = Doc<"events">;
type Tier = Doc<"event_ticket_tiers">;
type Host = Doc<"event_hosts">;

type Props = {
  event: Event;
  tiers: Tier[];
  hosts: Host[];
  viewer: Doc<"users"> | null;
  publicShell?: boolean;
};

type RsvpStatus = "going" | "interested" | "not_going";

const PLACEHOLDER_HOTELS = [
  { id: "h1", name: "FORM Hotel d3",          rating: 4.6, distance: "0.4 km", price: 142, img: "https://picsum.photos/seed/runwae-hotel-1/600/450" },
  { id: "h2", name: "Hyatt Centric Jumeirah", rating: 4.8, distance: "1.8 km", price: 218, img: "https://picsum.photos/seed/runwae-hotel-2/600/450" },
  { id: "h3", name: "Renaissance Downtown",   rating: 4.7, distance: "2.4 km", price: 189, img: "https://picsum.photos/seed/runwae-hotel-3/600/450" },
  { id: "h4", name: "JW Marriott Marquis",    rating: 4.5, distance: "3.6 km", price: 165, img: "https://picsum.photos/seed/runwae-hotel-4/600/450" },
  { id: "h5", name: "Rove Downtown",          rating: 4.4, distance: "4.1 km", price:  98, img: "https://picsum.photos/seed/runwae-hotel-5/600/450" },
];

const ORIGIN_SUGGESTIONS = [
  { id: "lon", name: "London, United Kingdom",  sub: "LHR, LGW, STN", flag: "🇬🇧" },
  { id: "nyc", name: "New York, United States", sub: "JFK, EWR, LGA", flag: "🇺🇸" },
  { id: "par", name: "Paris, France",           sub: "CDG, ORY",       flag: "🇫🇷" },
  { id: "ist", name: "Istanbul, Türkiye",       sub: "IST, SAW",       flag: "🇹🇷" },
  { id: "mum", name: "Mumbai, India",           sub: "BOM",            flag: "🇮🇳" },
];

export function EventDetailClient({
  event,
  tiers,
  hosts,
  viewer,
  publicShell = false,
}: Props) {
  const router = useRouter();
  const [planOpen, setPlanOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const visibleTiers = tiers
    .filter((t) => t.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const primaryHost = hosts.find((h) => h.showOnPage) ?? hosts[0] ?? null;

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share && url) {
      try {
        await navigator.share({ title: event.name, url });
        return;
      } catch {
        // fall through to copy
      }
    }
    if (url) {
      await navigator.clipboard.writeText(url);
      showToast("Link copied");
    }
  };

  return (
    <div className={cn(publicShell && "min-h-screen bg-background")}>
      <Hero event={event} onShare={handleShare} backHref={publicShell ? "/" : "/home"} />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 pt-5 pb-10 lg:gap-6 lg:px-7 lg:pt-6 lg:pb-12">
        <HostRow host={primaryHost} fallbackName={event.name} />

        <button
          type="button"
          onClick={() => setPlanOpen(true)}
          className="flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-primary font-display text-[15.5px] font-bold text-primary-foreground shadow-lg shadow-primary/40 transition-transform hover:bg-primary/90 active:scale-[0.98]"
        >
          ✈️ Plan my trip to this event
        </button>

        {event.description && <Description text={event.description} />}

        <TicketSection
          event={event}
          tiers={visibleTiers}
          host={primaryHost}
          viewer={viewer}
          onToast={showToast}
          onSignIn={() => router.push(`/sign-in?next=/e/${event.slug}`)}
        />

        <Attendees event={event} viewer={viewer} onToast={showToast} />

        <HotelsRow />

        <GettingThere event={event} viewer={viewer} />
      </div>

      <PlanTripSheet
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        event={event}
        viewer={viewer}
        onSuccess={() => {
          setPlanOpen(false);
          showToast("Opening your new trip…");
        }}
      />

      <div
        className={cn(
          "fixed left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background shadow-xl transition-all",
          publicShell ? "bottom-6" : "bottom-24 lg:bottom-8",
          toast ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {toast}
      </div>
    </div>
  );
}

// ============================================================================
// HERO
// ============================================================================
function Hero({
  event,
  onShare,
  backHref,
}: {
  event: Event;
  onShare: () => void;
  backHref: string;
}) {
  const cover = event.imageUrl ?? event.imageUrls[0];
  const dateLabel = event.endDateUtc
    ? formatDateRange(event.startDateUtc, event.endDateUtc, event.timezone)
    : new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: event.timezone,
      }).format(new Date(event.startDateUtc));
  const shortLocation = event.locationName.split(",").slice(0, 2).join(", ").trim();

  return (
    <section className="relative h-[45vh] min-h-[340px] max-h-[520px] w-full overflow-hidden bg-muted">
      {cover && (
        <img
          src={cover}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/80" />

      <div className="absolute left-3.5 right-3.5 top-3.5 z-10 flex items-center justify-between lg:left-6 lg:right-6 lg:top-5">
        <Link
          href={backHref}
          aria-label="Back"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/95 text-black shadow-md backdrop-blur transition-transform active:scale-90"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <button
          type="button"
          onClick={onShare}
          aria-label="Share"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/95 text-black shadow-md backdrop-blur transition-transform active:scale-90"
        >
          <Share2 className="h-[18px] w-[18px]" />
        </button>
      </div>

      <div className="absolute inset-x-4 bottom-5 z-10 text-white lg:inset-x-7 lg:bottom-7">
        <h1 className="mb-3 max-w-[640px] font-display text-[32px] font-bold leading-[1.05] tracking-tight drop-shadow-[0_2px_14px_rgba(0,0,0,0.35)] lg:text-[42px]">
          {event.name}
        </h1>
        <div className="flex flex-wrap gap-2">
          <HeroPill icon={<Calendar className="h-3 w-3" />}>{dateLabel}</HeroPill>
          <HeroPill icon={<MapPin className="h-3 w-3" />}>{shortLocation}</HeroPill>
        </div>
      </div>
    </section>
  );
}

function HeroPill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
      {icon}
      {children}
    </span>
  );
}

// ============================================================================
// HOST ROW
// ============================================================================
function HostRow({ host, fallbackName }: { host: Host | null; fallbackName: string }) {
  const [following, setFollowing] = useState(false);
  const name = host?.name ?? fallbackName;
  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="text-[11.5px] font-medium uppercase tracking-wider text-muted-foreground">
          Hosted by
        </div>
        <div className="truncate text-[15px] font-semibold leading-tight text-foreground">
          {name}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setFollowing((f) => !f)}
        className={cn(
          "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border-[1.5px] px-4 text-[12.5px] font-semibold transition-colors",
          following
            ? "border-transparent bg-primary/10 text-primary"
            : "border-border text-foreground hover:border-primary hover:text-primary",
        )}
      >
        {following ? (
          <>
            <Check className="h-3.5 w-3.5" /> Following
          </>
        ) : (
          <>
            <Plus className="h-3.5 w-3.5" /> Follow
          </>
        )}
      </button>
    </div>
  );
}

// ============================================================================
// DESCRIPTION
// ============================================================================
function Description({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p
        className={cn(
          "text-[15px] leading-[1.55] text-foreground",
          !open && "line-clamp-3",
        )}
      >
        {text}
      </p>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-semibold text-primary"
      >
        {open ? "Show less" : "Read more"}
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}

// ============================================================================
// TICKETS
// ============================================================================
function TicketSection({
  event,
  tiers,
  host,
  viewer,
  onToast,
  onSignIn,
}: {
  event: Event;
  tiers: Tier[];
  host: Host | null;
  viewer: Doc<"users"> | null;
  onToast: (msg: string) => void;
  onSignIn: () => void;
}) {
  if (event.ticketingMode === "external") {
    return (
      <section>
        <SectionTitle title="Tickets" sub="External" />
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-[200px] flex-1">
              <div className="mb-1 text-[14.5px] font-semibold text-foreground">
                Ticketed by {host?.name ?? "host"}
              </div>
              <div className="text-[12.5px] leading-[1.4] text-muted-foreground">
                You&apos;ll be redirected to the host&apos;s site to complete checkout.
              </div>
            </div>
            <a
              href={event.externalTicketUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-[42px] shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 text-[13.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.97]"
            >
              Get Tickets <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>
    );
  }

  if (event.ticketingMode === "free" || event.ticketingMode === "none") {
    return <FreeTicket event={event} viewer={viewer} onToast={onToast} onSignIn={onSignIn} />;
  }

  // runwae mode
  return (
    <RunwaeTickets
      event={event}
      tiers={tiers}
      viewer={viewer}
      onToast={onToast}
      onSignIn={onSignIn}
    />
  );
}

function FreeTicket({
  event,
  viewer,
  onToast,
  onSignIn,
}: {
  event: Event;
  viewer: Doc<"users"> | null;
  onToast: (msg: string) => void;
  onSignIn: () => void;
}) {
  const rsvpMut = useMutation(api.events.rsvp);
  const myRsvp = useQuery(
    api.events.getViewerRsvp,
    viewer ? { eventId: event._id } : "skip",
  );
  const isGoing = myRsvp === "going";
  const [pending, setPending] = useState(false);

  async function handleRsvp() {
    if (!viewer) {
      onSignIn();
      return;
    }
    setPending(true);
    try {
      await rsvpMut({ eventId: event._id, status: "going" });
      onToast("RSVP confirmed");
    } finally {
      setPending(false);
    }
  }

  return (
    <section>
      <SectionTitle title="Free Event" sub="RSVP only" />
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="py-1 text-center">
          <div className="mb-1 font-display text-2xl font-bold tracking-tight text-foreground">
            Free
          </div>
          <div className="mb-5 text-[13px] text-muted-foreground">
            RSVP to save your spot — capacity is limited.
          </div>
          <button
            type="button"
            onClick={handleRsvp}
            disabled={pending || isGoing}
            className="inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-[14.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {isGoing ? (
              <>
                <Check className="h-4 w-4" /> RSVP&apos;d
              </>
            ) : (
              "RSVP Now"
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

function RunwaeTickets({
  event,
  tiers,
  viewer,
  onToast,
  onSignIn,
}: {
  event: Event;
  tiers: Tier[];
  viewer: Doc<"users"> | null;
  onToast: (msg: string) => void;
  onSignIn: () => void;
}) {
  const initial: Record<string, number> = {};
  tiers.forEach((t) => {
    initial[t._id] = 0;
  });
  const [qty, setQty] = useState<Record<string, number>>(initial);

  const totalQty = Object.values(qty).reduce((a, b) => a + b, 0);
  const total = tiers.reduce((s, t) => s + (qty[t._id] ?? 0) * t.price, 0);
  const currency = tiers[0]?.currency ?? viewer?.preferredCurrency ?? "GBP";
  const minPrice = tiers.length > 0 ? Math.min(...tiers.map((t) => t.price)) : 0;

  function set(id: string, dir: 1 | -1, max: number) {
    setQty((q) => ({
      ...q,
      [id]: Math.max(0, Math.min(max, (q[id] ?? 0) + dir)),
    }));
  }

  function checkout() {
    if (!viewer) {
      onSignIn();
      return;
    }
    onToast(`${totalQty} ticket${totalQty === 1 ? "" : "s"} added to cart`);
  }

  if (tiers.length === 0) {
    return (
      <section>
        <SectionTitle title="Tickets" />
        <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
          Tickets aren&apos;t available yet — check back soon.
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionTitle title="Tickets" sub={`From ${formatCurrency(minPrice, currency, viewer?.preferredCurrency)}`} />
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        {tiers.map((t, i) => {
          const cap = Math.min(t.maxPerOrder ?? 8, Math.max(0, t.quantity - t.quantitySold));
          const soldOut = cap <= 0;
          return (
            <div
              key={t._id}
              className={cn(
                "flex items-center gap-3.5 py-3.5",
                i !== 0 && "border-t border-border",
                i === 0 && "pt-0",
                i === tiers.length - 1 && "pb-0",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex flex-wrap items-center gap-1.5 text-[14.5px] font-semibold leading-tight text-foreground">
                  {t.name}
                  {soldOut && (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
                      Sold out
                    </span>
                  )}
                </div>
                {t.description && (
                  <div className="text-xs leading-[1.35] text-muted-foreground">
                    {t.description}
                  </div>
                )}
              </div>
              <div className="shrink-0 font-display text-lg font-bold tabular-nums tracking-tight text-foreground">
                {formatCurrency(t.price, t.currency, viewer?.preferredCurrency)}
              </div>
              <div className="inline-flex h-8 shrink-0 items-center gap-0 rounded-full bg-muted p-0.5">
                <button
                  type="button"
                  onClick={() => set(t._id, -1, cap)}
                  disabled={!qty[t._id] || soldOut}
                  aria-label="Decrease"
                  className="grid h-7 w-7 place-items-center rounded-full text-foreground transition-colors hover:bg-card disabled:opacity-35"
                >
                  <Minus className="h-3.5 w-3.5" strokeWidth={2.4} />
                </button>
                <span className="min-w-[22px] text-center text-[13px] font-semibold tabular-nums">
                  {qty[t._id] ?? 0}
                </span>
                <button
                  type="button"
                  onClick={() => set(t._id, +1, cap)}
                  disabled={soldOut || (qty[t._id] ?? 0) >= cap}
                  aria-label="Increase"
                  className="grid h-7 w-7 place-items-center rounded-full text-foreground transition-colors hover:bg-card disabled:opacity-35"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
                </button>
              </div>
            </div>
          );
        })}
        <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-border pt-4">
          <div className="text-[13px] text-muted-foreground">
            {totalQty} ticket{totalQty === 1 ? "" : "s"}
            <b className="ml-1.5 font-display text-lg font-bold tracking-tight text-foreground">
              {formatCurrency(total, currency, viewer?.preferredCurrency)}
            </b>
          </div>
          <button
            type="button"
            disabled={totalQty === 0}
            onClick={checkout}
            className="inline-flex h-[42px] items-center gap-1.5 rounded-full bg-primary px-5 text-[13.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.97] disabled:opacity-50"
          >
            Get Tickets <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// ATTENDEES
// ============================================================================
function Attendees({
  event,
  viewer,
  onToast,
}: {
  event: Event;
  viewer: Doc<"users"> | null;
  onToast: (msg: string) => void;
}) {
  const router = useRouter();
  const attendees = useQuery(api.events.listAttendees, {
    eventId: event._id,
    limit: 4,
  });
  const myRsvp = useQuery(
    api.events.getViewerRsvp,
    viewer ? { eventId: event._id } : "skip",
  );
  const rsvpMut = useMutation(api.events.rsvp);
  const [pending, setPending] = useState(false);

  const total = event.currentParticipants;
  const visible = attendees ?? [];
  const overflow = Math.max(0, total - visible.length);

  async function setRsvp(status: RsvpStatus) {
    if (!viewer) {
      router.push(`/sign-in?next=/e/${event.slug}`);
      return;
    }
    setPending(true);
    try {
      await rsvpMut({ eventId: event._id, status });
      onToast(
        status === "going"
          ? "You're going!"
          : status === "interested"
            ? "Marked interested"
            : "RSVP updated",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section>
      <SectionTitle title="Who's going" />
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="flex shrink-0 -space-x-2.5">
            {visible.map((a) => (
              <Avatar
                key={a._id}
                src={a.image}
                name={a.name ?? "Attendee"}
                size="md"
                className="ring-[2.5px] ring-card"
              />
            ))}
            {overflow > 0 && (
              <span className="grid h-10 w-10 place-items-center rounded-full bg-muted text-[11.5px] font-bold text-foreground ring-[2.5px] ring-card">
                +{overflow}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 text-sm leading-snug">
            <div>
              <b className="font-bold">{total.toLocaleString()} {total === 1 ? "person" : "people"}</b>{" "}
              {total === 1 ? "is" : "are"} going
            </div>
            {visible.length > 0 && (
              <div className="mt-0.5 text-xs text-muted-foreground">
                {visible
                  .slice(0, 3)
                  .map((a) => a.name?.split(" ")[0] ?? "Someone")
                  .join(", ")}
                {visible.length > 3 ? ` +${visible.length - 3}` : ""}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-full bg-muted p-1">
          {(
            [
              { id: "going" as const, label: "Going" },
              { id: "interested" as const, label: "Interested" },
              { id: "not_going" as const, label: "Not Going" },
            ]
          ).map((opt) => {
            const on = myRsvp === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRsvp(opt.id)}
                disabled={pending}
                className={cn(
                  "inline-flex h-9 items-center justify-center gap-1 rounded-full text-[13px] font-semibold transition-all",
                  on
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {on && opt.id !== "not_going" && <Check className="h-3.5 w-3.5" />}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// HOTELS
// ============================================================================
function HotelsRow() {
  return (
    <section>
      <SectionTitle title="Hotels near this event" sub={`${PLACEHOLDER_HOTELS.length} options`} />
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1.5 lg:-mx-7 lg:px-7">
        {PLACEHOLDER_HOTELS.map((h) => (
          <article
            key={h.id}
            className="w-[220px] shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <div
              className="relative aspect-[4/3] w-full bg-muted bg-cover bg-center"
              style={{ backgroundImage: `url(${h.img})` }}
            >
              <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                <Star className="h-2.5 w-2.5 fill-white" /> {h.rating}
              </span>
              <span className="absolute bottom-2 left-2 rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-black">
                {h.distance}
              </span>
            </div>
            <div className="px-3 pb-3 pt-2.5">
              <div className="mb-0.5 truncate text-[13.5px] font-semibold leading-snug">{h.name}</div>
              <div className="text-[11.5px] text-muted-foreground">
                <b className="mr-0.5 font-display text-[14.5px] font-bold tracking-tight text-foreground">£{h.price}</b>
                /night
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// GETTING THERE
// ============================================================================
function GettingThere({ event, viewer }: { event: Event; viewer: Doc<"users"> | null }) {
  const homeCity = viewer?.homeCity ?? "London";
  const homeIata = viewer?.homeIata ?? "LHR";
  const origin = `${homeCity} (${homeIata})`;

  const destPart = event.locationName.split(",")[0]?.trim() ?? event.locationName;
  const dest = destPart;

  const start = new Date(event.startDateUtc);
  const dep = new Date(start.getTime() - 86_400_000);
  const ret = new Date((event.endDateUtc ?? event.startDateUtc) + 86_400_000);
  const fmtMD = (d: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: event.timezone,
    }).format(d);

  return (
    <section>
      <SectionTitle title="Getting there" sub="Pre-filled for this event" />
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-2.5">
          <FlightRow>
            <FlightField label="From" value={origin} />
            <FlightField label="To" value={dest} />
          </FlightRow>
          <FlightRow>
            <FlightField label="Depart" value={fmtMD(dep)} />
            <FlightField label="Return" value={fmtMD(ret)} />
          </FlightRow>
          <FlightRow>
            <FlightField label="Travelers" value="1 adult" />
            <FlightField label="Class" value="Economy" dim />
          </FlightRow>
          <button
            type="button"
            className="mt-1 inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
          >
            <Plane className="h-[15px] w-[15px] fill-primary-foreground" strokeWidth={1} />
            Search flights from {homeCity}
          </button>
        </div>
      </div>
    </section>
  );
}

function FlightRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2.5">{children}</div>;
}

function FlightField({
  label,
  value,
  dim,
}: {
  label: string;
  value: string;
  dim?: boolean;
}) {
  return (
    <div className="flex cursor-pointer flex-col gap-1 rounded-xl border border-border bg-muted px-3 py-2.5 transition-colors hover:border-foreground/20">
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-semibold leading-tight",
          dim ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ============================================================================
// SECTION TITLE
// ============================================================================
function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
      {sub && (
        <span className="text-xs font-medium text-muted-foreground">{sub}</span>
      )}
    </div>
  );
}

// ============================================================================
// PLAN-MY-TRIP BOTTOM SHEET (3 steps)
// ============================================================================
type OriginPick = (typeof ORIGIN_SUGGESTIONS)[number];
type GroupSize = "solo" | "small" | "large";

function PlanTripSheet({
  open,
  onClose,
  event,
  viewer,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  event: Event;
  viewer: Doc<"users"> | null;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [origin, setOrigin] = useState<OriginPick | null>(null);
  const [originQuery, setOriginQuery] = useState("");
  const [groupSize, setGroupSize] = useState<GroupSize | null>(null);
  const [buildIdx, setBuildIdx] = useState(0);
  const [done, setDone] = useState(false);

  // Reset state on close (after exit animation completes)
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setStep(1);
      setOrigin(null);
      setOriginQuery("");
      setGroupSize(null);
      setBuildIdx(0);
      setDone(false);
    }, 300);
    return () => clearTimeout(t);
  }, [open]);

  // Body scroll lock
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Pre-fill origin from viewer's home city if available
  useEffect(() => {
    if (!open || origin || !viewer?.homeCity) return;
    const match = ORIGIN_SUGGESTIONS.find((o) =>
      o.name.toLowerCase().startsWith(viewer.homeCity!.toLowerCase()),
    );
    if (match) {
      setOrigin(match);
      setOriginQuery(match.name);
    }
  }, [open, origin, viewer]);

  // Step 3 build sequence
  useEffect(() => {
    if (!open || step !== 3 || done) return;
    setBuildIdx(0);
    const totalSteps = 4;
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      i++;
      setBuildIdx(i);
      if (i < totalSteps) {
        timer = setTimeout(tick, 700);
      } else {
        timer = setTimeout(() => setDone(true), 500);
      }
    };
    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, [open, step, done]);

  const filteredOrigins = ORIGIN_SUGGESTIONS.filter(
    (o) => !originQuery || o.name.toLowerCase().includes(originQuery.toLowerCase()),
  );

  const buildSteps = [
    `Finding flights from ${origin?.name.split(",")[0] ?? "your origin"}`,
    "Matching hotels near the venue",
    "Adding event to itinerary",
    "Inviting your group",
  ];

  const canNext =
    (step === 1 && !!origin) ||
    (step === 2 && !!groupSize);

  function next() {
    if (step === 1) setStep(2);
    else if (step === 2) {
      if (!viewer) {
        router.push(`/sign-in?next=/e/${event.slug}`);
        return;
      }
      setStep(3);
    }
  }
  function back() {
    if (step === 2) setStep(1);
  }

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col overflow-hidden rounded-t-3xl bg-background shadow-2xl",
          "transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full",
          "md:inset-x-auto md:left-1/2 md:bottom-1/2 md:max-h-[80vh] md:w-[440px] md:rounded-3xl",
          open ? "md:translate-x-[-50%] md:translate-y-1/2" : "md:translate-x-[-50%] md:translate-y-[calc(50%+30px)] md:opacity-0",
        )}
      >
        <div className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-border md:hidden" />

        <div className="flex shrink-0 items-center justify-between px-5 pb-1.5 pt-3.5">
          <span className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            Step {step} of 3
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-foreground/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-5 h-[3px] shrink-0 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-6">
          {step === 1 && (
            <>
              <h3 className="mb-1.5 font-display text-2xl font-bold tracking-tight leading-tight">
                Where are you travelling from?
              </h3>
              <p className="mb-5 text-[13.5px] leading-snug text-muted-foreground">
                We&apos;ll pre-fill flights and time everything to land before the event starts.
              </p>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={originQuery}
                  onChange={(e) => setOriginQuery(e.target.value)}
                  placeholder="City or airport"
                  autoFocus
                  className="h-13 w-full rounded-2xl border-[1.5px] border-border bg-muted px-11 text-[15px] text-foreground outline-none transition-colors focus:border-primary focus:bg-card"
                  style={{ height: 52 }}
                />
              </div>
              <div className="mt-3.5 flex flex-col gap-0.5">
                {filteredOrigins.map((o) => {
                  const on = origin?.id === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => {
                        setOrigin(o);
                        setOriginQuery(o.name);
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors",
                        on ? "bg-primary/10" : "hover:bg-muted",
                      )}
                    >
                      <div
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-full text-base",
                          on ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                        )}
                      >
                        {o.flag}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold leading-tight">{o.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{o.sub}</div>
                      </div>
                      {on && <Check className="h-4 w-4 text-primary" strokeWidth={3} />}
                    </button>
                  );
                })}
                {filteredOrigins.length === 0 && (
                  <div className="px-2 py-5 text-center text-[13px] text-muted-foreground">
                    No matches — try another city.
                  </div>
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="mb-1.5 font-display text-2xl font-bold tracking-tight leading-tight">
                Solo or with a group?
              </h3>
              <p className="mb-5 text-[13.5px] leading-snug text-muted-foreground">
                We&apos;ll size accommodation, transport, and group polls accordingly.
              </p>
              <div className="flex flex-col gap-2.5">
                {(
                  [
                    { id: "solo" as const,  emoji: "🧍", t: "Just me",     d: "Solo trip — one ticket, one room" },
                    { id: "small" as const, emoji: "👯", t: "Small group", d: "2–4 people — friends or partner" },
                    { id: "large" as const, emoji: "🎉", t: "Large group", d: "5+ people — bachelor, birthday, crew" },
                  ]
                ).map((opt) => {
                  const on = groupSize === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setGroupSize(opt.id)}
                      className={cn(
                        "flex w-full items-center gap-3.5 rounded-2xl border-[1.5px] p-4 text-left transition-all",
                        on
                          ? "border-primary bg-primary/10"
                          : "border-transparent bg-muted hover:bg-foreground/5",
                      )}
                    >
                      <div
                        className={cn(
                          "grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl text-[22px] shadow-sm",
                          on ? "bg-primary text-primary-foreground" : "bg-card",
                        )}
                      >
                        {opt.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 text-[15px] font-semibold leading-tight">{opt.t}</div>
                        <div className="text-[12.5px] leading-snug text-muted-foreground">{opt.d}</div>
                      </div>
                      <div
                        className={cn(
                          "grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border-2",
                          on ? "border-primary bg-primary" : "border-border",
                        )}
                      >
                        {on && <span className="block h-2 w-2 rounded-full bg-primary-foreground" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 3 && !done && (
            <div className="flex flex-col items-center pt-7 text-center">
              <div className="mb-5 h-16 w-16 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <h3 className="mb-1.5 font-display text-[22px] font-bold tracking-tight leading-tight">
                Building your trip…
              </h3>
              <p className="mb-5 max-w-[300px] text-[13.5px] leading-snug text-muted-foreground">
                Stitching together flights, hotels, and the event into one shareable itinerary.
              </p>
              <div className="flex w-full max-w-[300px] flex-col gap-2">
                {buildSteps.map((s, i) => {
                  const stepDone = i < buildIdx;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] transition-colors",
                        stepDone ? "bg-primary/10 text-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border-2",
                          stepDone ? "border-primary bg-primary text-primary-foreground" : "border-border",
                        )}
                      >
                        {stepDone && <Check className="h-2 w-2" strokeWidth={3.5} />}
                      </span>
                      <span>{s}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && done && (
            <div className="flex flex-col items-center pt-7 text-center">
              <div className="mb-5 grid h-[74px] w-[74px] place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 animate-in zoom-in duration-300">
                <Check className="h-9 w-9" strokeWidth={3} />
              </div>
              <h3 className="mb-1.5 font-display text-[22px] font-bold tracking-tight leading-tight">
                Trip ready!
              </h3>
              <p className="mb-5 max-w-[300px] text-[13.5px] leading-snug text-muted-foreground">
                Your trip to <b className="text-foreground">{event.name}</b>{" "}
                from {origin?.name.split(",")[0]} is set up.
              </p>
              <button
                type="button"
                onClick={onSuccess}
                className="inline-flex h-12 w-full max-w-[300px] items-center justify-center gap-2 rounded-full bg-primary text-[14.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                View Trip <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
              </button>
            </div>
          )}
        </div>

        {step < 3 && (
          <div className="flex shrink-0 gap-2.5 border-t border-border bg-background px-5 pb-5 pt-3.5">
            {step > 1 && (
              <button
                type="button"
                onClick={back}
                aria-label="Back"
                className="grid h-12 w-[46px] shrink-0 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-foreground/10"
              >
                <ArrowLeft className="h-[18px] w-[18px]" />
              </button>
            )}
            <button
              type="button"
              onClick={next}
              disabled={!canNext}
              className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-[14.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98] disabled:opacity-40"
            >
              Continue <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2.4} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
