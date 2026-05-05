"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { LocationValue } from "@/components/ui/location-picker";
import { LocationPicker } from "@/components/ui/location-picker";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { UnsplashPicker } from "./wizard/UnsplashPicker";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CURRENCIES = ["GBP", "USD", "EUR", "JPY", "AUD", "CAD"] as const;

const dKey = (d: Date) => d.toISOString().slice(0, 10);
const dEq = (a: Date | null, b: Date | null) =>
  !!a && !!b && dKey(a) === dKey(b);
const stripTime = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const monthDays = (year: number, month: number): (Date | null)[] => {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const total = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

type Range = { start: Date | null; end: Date | null };

interface CreateTripModalProps {
  open: boolean;
  onClose: () => void;
  // Optional pre-selected destination (e.g. from the home Trending card).
  // The modal still lets the user change it — this just skips the empty
  // state on step 1.
  seedDestination?: LocationValue;
}

// Quick-create modal opened from the sidebar "Create" button. Mirrors the
// PlanMyTripModal step pattern so the two flows feel like the same product.
//   1. Destination — preset chips of seeded destinations + Nominatim search
//   2. Dates — calendar with quick-pick weekend/week
//   3. Details — title + Unsplash cover + invites + currency
//   4. Success — confetti + View Trip / Share Trip CTAs
//
// /trips/new (the older multi-step wizard) is kept as the "deep link" form.
// Any links pointing there still work; the sidebar just doesn't go through
// it any more.
export function CreateTripModal({
  open,
  onClose,
  seedDestination,
}: CreateTripModalProps) {
  const router = useRouter();
  const createTrip = useMutation(api.trips.createTrip);
  const inviteToTrip = useMutation(api.trips.inviteToTrip);
  const seededDestinations = useQuery(api.destinations.list, {
    featuredOnly: true,
    limit: 8,
  });
  const recentFriends = useQuery(api.social.recentFriends, { limit: 5 });

  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState<LocationValue>(
    seedDestination ?? { destinationLabel: "" }
  );
  const [range, setRange] = useState<Range>({ start: null, end: null });
  const [quickPick, setQuickPick] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>("GBP");
  const [inviteIds, setInviteIds] = useState<Id<"users">[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result of a successful submit — drives the confetti/success screen
  // (step 4) where we also let the user share the freshly-created trip.
  const [resultSlug, setResultSlug] = useState<string | null>(null);
  const [resultTripId, setResultTripId] = useState<Id<"trips"> | null>(null);

  const submittedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep(1);
        setDestination(seedDestination ?? { destinationLabel: "" });
        setRange({ start: null, end: null });
        setQuickPick(null);
        setTitle("");
        setCoverImageUrl("");
        setCurrency("GBP");
        setInviteIds([]);
        setSubmitting(false);
        setError(null);
        setResultSlug(null);
        setResultTripId(null);
        submittedRef.current = false;
      }, 250);
      return () => clearTimeout(t);
    }
    // When opening with a fresh seed, prime the destination state.
    if (seedDestination?.destinationLabel) {
      setDestination(seedDestination);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fmtShort = (d: Date | null) =>
    d ? `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}` : "—";
  const nights =
    range.start && range.end
      ? Math.round((range.end.getTime() - range.start.getTime()) / 86400000)
      : 0;

  const canNext =
    (step === 1 && !!destination.destinationLabel.trim()) ||
    (step === 2 && !!range.start && !!range.end) ||
    (step === 3 && !!title.trim());

  function next() {
    setError(null);
    if (step < 3) setStep((s) => s + 1);
  }
  function back() {
    setError(null);
    if (step > 1) setStep((s) => s - 1);
  }

  async function handleCreate() {
    if (submittedRef.current) return; // belt-and-braces: never double-submit
    if (!destination.destinationLabel.trim() || !range.start || !range.end) {
      setError("Pick a destination + dates first.");
      return;
    }
    submittedRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const result = await createTrip({
        title: title.trim() || `Trip to ${destination.destinationLabel.split(",")[0]}`,
        destinationLabel: destination.destinationLabel,
        destinationCoords: destination.coords,
        startDate: range.start.toISOString().slice(0, 10),
        endDate: range.end.toISOString().slice(0, 10),
        visibility: "private",
        currency,
        coverImageUrl: coverImageUrl.trim() || undefined,
      });
      if (inviteIds.length > 0) {
        await Promise.allSettled(
          inviteIds.map((id) =>
            inviteToTrip({ tripId: result.tripId, inviteeId: id })
          )
        );
      }
      // Advance to the success/confetti step instead of closing+routing.
      // The user picks where to go next from there.
      setResultSlug(result.slug);
      setResultTripId(result.tripId);
      setStep(4);
    } catch (err) {
      submittedRef.current = false;
      setError(err instanceof Error ? err.message : "Couldn't create trip.");
    } finally {
      setSubmitting(false);
    }
  }

  // Step 4 is the post-create success screen — keep the progress bar full
  // there so it doesn't read as "step 4 of 3".
  const totalUserSteps = 3;
  const stepLabel = step <= totalUserSteps ? `Step ${step} of ${totalUserSteps}` : "Done";
  const progress = step <= totalUserSteps ? (step / totalUserSteps) * 100 : 100;

  // Pinned footer keeps the primary action visible even when the body
  // (Unsplash grid on step 3) needs to scroll. Hidden on step 4 — the
  // success screen has its own CTAs.
  const footer = step <= totalUserSteps ? (
    <div className="flex items-center gap-2">
      {step > 1 && (
        <button
          type="button"
          onClick={back}
          disabled={submitting}
          aria-label="Back"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-foreground/[0.05] text-foreground hover:bg-foreground/[0.1] disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      )}
      {step < 3 ? (
        <button
          type="button"
          disabled={!canNext}
          onClick={next}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          disabled={submitting || !canNext}
          onClick={handleCreate}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
        >
          {submitting ? "Creating…" : "Create trip"}
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </button>
      )}
    </div>
  ) : undefined;

  return (
    <Modal open={open} onClose={onClose} title="" footer={footer}>
      <div className="-mx-6 -mt-2 mb-3">
        <div className="flex items-center justify-between px-6 pb-2">
          <span className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            {stepLabel}
          </span>
        </div>
        <div className="mx-6 h-[3px] overflow-hidden rounded-full bg-foreground/[0.08]">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {step === 1 && (
        <DestinationStep
          value={destination}
          onChange={setDestination}
          presets={seededDestinations}
        />
      )}

      {step === 2 && (
        <CalendarStep
          range={range}
          onChange={(r) => {
            setRange(r);
            setQuickPick(null);
          }}
          quickPick={quickPick}
          onQuickPick={(id) => {
            setQuickPick(id);
            const today = stripTime(new Date());
            if (id === "weekend")
              setRange({
                start: today,
                end: new Date(today.getTime() + 2 * 86400000),
              });
            else if (id === "week")
              setRange({
                start: today,
                end: new Date(today.getTime() + 6 * 86400000),
              });
            else if (id === "fortnight")
              setRange({
                start: today,
                end: new Date(today.getTime() + 13 * 86400000),
              });
          }}
          fmtShort={fmtShort}
          nights={nights}
        />
      )}

      {step === 3 && (
        <DetailsStep
          title={title}
          onTitleChange={setTitle}
          coverImageUrl={coverImageUrl}
          onCoverChange={setCoverImageUrl}
          currency={currency}
          onCurrencyChange={setCurrency}
          inviteIds={inviteIds}
          onInviteToggle={(id: Id<"users">) =>
            setInviteIds((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            )
          }
          recentFriends={recentFriends}
          destinationLabel={destination.destinationLabel}
        />
      )}

      {step === 4 && resultSlug && resultTripId && (
        <SuccessStep
          slug={resultSlug}
          tripId={resultTripId}
          destinationLabel={destination.destinationLabel}
          onView={() => {
            const slug = resultSlug;
            onClose();
            router.push(`/trips/${slug}`);
          }}
          onClose={onClose}
        />
      )}

    </Modal>
  );
}

function DestinationStep({
  value,
  onChange,
  presets,
}: {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
  presets: Array<{
    _id: Id<"destinations">;
    name: string;
    country: string;
    heroImageUrl: string;
    coords?: { lat: number; lng: number };
  }> | undefined;
}) {
  return (
    <>
      <h2 className="font-display text-[22px] font-bold leading-tight">
        Where to?
      </h2>
      <p className="mb-4 mt-1 text-[13px] text-muted-foreground">
        Pick a popular destination or search for somewhere of your own.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {presets === undefined ? (
          <>
            <Skeleton className="aspect-[4/3] rounded-xl" />
            <Skeleton className="aspect-[4/3] rounded-xl" />
            <Skeleton className="aspect-[4/3] rounded-xl" />
            <Skeleton className="aspect-[4/3] rounded-xl" />
          </>
        ) : (
          presets.map((d) => {
            const label = `${d.name}, ${d.country}`;
            const on = value.destinationLabel === label;
            return (
              <button
                key={d._id}
                type="button"
                onClick={() =>
                  onChange({ destinationLabel: label, coords: d.coords })
                }
                className={cn(
                  "group relative aspect-[4/3] overflow-hidden rounded-xl border-2 text-left transition-colors",
                  on ? "border-primary" : "border-transparent"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.heroImageUrl}
                  alt={d.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute inset-x-2 bottom-2 text-white">
                  <div className="font-display text-[13px] font-bold leading-tight">
                    {d.name}
                  </div>
                  <div className="text-[10.5px] text-white/80">{d.country}</div>
                </div>
                {on && (
                  <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Or search
      </div>
      <LocationPicker value={value} onChange={onChange} />
    </>
  );
}

function CalendarStep({
  range,
  onChange,
  quickPick,
  onQuickPick,
  fmtShort,
  nights,
}: {
  range: Range;
  onChange: (r: Range) => void;
  quickPick: string | null;
  onQuickPick: (id: string) => void;
  fmtShort: (d: Date | null) => string;
  nights: number;
}) {
  const today = stripTime(new Date());
  const [view, setView] = useState({
    y: today.getFullYear(),
    m: today.getMonth(),
  });
  const goPrev = () =>
    setView((v) =>
      v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }
    );
  const goNext = () =>
    setView((v) =>
      v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }
    );
  const cells = monthDays(view.y, view.m);
  const isPrevDisabled =
    view.y === today.getFullYear() && view.m <= today.getMonth();

  function handleClick(d: Date | null) {
    if (!d) return;
    if (!range.start || (range.start && range.end)) {
      onChange({ start: d, end: null });
    } else if (d < range.start) {
      onChange({ start: d, end: range.start });
    } else if (dEq(d, range.start)) {
      onChange({ start: d, end: d });
    } else {
      onChange({ start: range.start, end: d });
    }
  }

  return (
    <>
      <h2 className="font-display text-[22px] font-bold leading-tight">
        When are you travelling?
      </h2>
      <p className="mb-4 mt-1 text-[13px] text-muted-foreground">
        Pick the arrival and departure dates.
      </p>

      <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl bg-foreground/[0.04] p-3">
        <div className="min-w-0">
          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            Arrive
          </div>
          <div
            className={cn(
              "mt-0.5 font-display text-[16px] font-bold",
              !range.start && "font-medium font-sans text-[14px] text-foreground/40"
            )}
          >
            {range.start ? fmtShort(range.start) : "Select date"}
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className="min-w-0 text-right">
          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            Depart
          </div>
          <div
            className={cn(
              "mt-0.5 font-display text-[16px] font-bold",
              !range.end && "font-medium font-sans text-[14px] text-foreground/40"
            )}
          >
            {range.end ? fmtShort(range.end) : "Select date"}
          </div>
          {nights > 0 && (
            <span className="mt-1 inline-block rounded-full bg-primary px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-primary-foreground">
              {nights} night{nights > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {[
          { id: "weekend", label: "Long weekend" },
          { id: "week", label: "Week" },
          { id: "fortnight", label: "Fortnight" },
        ].map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => onQuickPick(q.id)}
            className={cn(
              "h-8 shrink-0 rounded-full border px-3 text-[12px] font-medium transition-colors",
              quickPick === q.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-foreground/[0.04] text-foreground hover:border-primary/40 hover:text-primary"
            )}
          >
            {q.label}
          </button>
        ))}
      </div>

      <div className="mb-2 flex items-center justify-between px-1">
        <div className="font-display text-[15px] font-bold">
          {MONTHS[view.m]} {view.y}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={goPrev}
            disabled={isPrevDisabled}
            aria-label="Previous month"
            className="grid h-8 w-8 place-items-center rounded-full bg-foreground/[0.05] text-foreground hover:bg-foreground/[0.1] disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next month"
            className="grid h-8 w-8 place-items-center rounded-full bg-foreground/[0.05] text-foreground hover:bg-foreground/[0.1]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 px-1">
        {DOW.map((d) => (
          <span
            key={d}
            className="py-1 text-center text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Pill calendar — same approach as PlanMyTripModal: an outer
          coloured strip on in-range cells, inner pill for the digit. No
          gaps so the strip is continuous. */}
      <div className="grid grid-cols-7 px-1">
        {cells.map((d, i) => {
          if (!d) return <span key={i} aria-hidden className="aspect-square" />;
          const isPast = d < today;
          const isStart = !!range.start && dEq(d, range.start);
          const isEnd = !!range.end && dEq(d, range.end);
          const inRange =
            !!range.start &&
            !!range.end &&
            d > range.start &&
            d < range.end;
          const hasRange =
            !!range.start && !!range.end && !dEq(range.start, range.end);

          let fillClass = "";
          if (isStart && hasRange) fillClass = "bg-primary/15 rounded-l-full";
          else if (isEnd && hasRange) fillClass = "bg-primary/15 rounded-r-full";
          else if (inRange) fillClass = "bg-primary/15";

          let innerClass = "rounded-full";
          if (isStart || isEnd)
            innerClass += " bg-primary text-primary-foreground font-bold";
          else if (!isPast)
            innerClass += " hover:bg-foreground/[0.06] text-foreground";
          else innerClass += " text-foreground/30";

          return (
            <div key={i} className={cn("relative aspect-square", fillClass)}>
              <button
                type="button"
                disabled={isPast}
                onClick={() => handleClick(d)}
                className={cn(
                  "absolute inset-0 grid place-items-center text-[13px] font-medium transition-colors",
                  innerClass,
                  isPast && "cursor-default"
                )}
              >
                {d.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

function DetailsStep({
  title,
  onTitleChange,
  coverImageUrl,
  onCoverChange,
  currency,
  onCurrencyChange,
  inviteIds,
  onInviteToggle,
  recentFriends,
  destinationLabel,
}: {
  title: string;
  onTitleChange: (v: string) => void;
  coverImageUrl: string;
  onCoverChange: (v: string) => void;
  currency: (typeof CURRENCIES)[number];
  onCurrencyChange: (v: (typeof CURRENCIES)[number]) => void;
  inviteIds: Id<"users">[];
  onInviteToggle: (id: Id<"users">) => void;
  recentFriends:
    | Array<{
        _id: Id<"users">;
        name?: string | null;
        username?: string | null;
        image?: string | null;
      }>
    | undefined;
  destinationLabel: string;
}) {
  const inputCls =
    "h-11 w-full rounded-2xl border border-border bg-background px-4 text-[14.5px] focus:border-primary focus:outline-none";
  return (
    <>
      <h2 className="font-display text-[22px] font-bold leading-tight">
        Final touches
      </h2>
      <p className="mb-4 mt-1 text-[13px] text-muted-foreground">
        Name your trip, pick a cover photo, and (optionally) invite friends.
      </p>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Title
          </span>
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={
              destinationLabel
                ? `Trip to ${destinationLabel.split(",")[0]}`
                : "e.g. Summer in Japan"
            }
            className={inputCls}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Currency
          </span>
          <select
            value={currency}
            onChange={(e) =>
              onCurrencyChange(e.target.value as (typeof CURRENCIES)[number])
            }
            className={inputCls}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Cover image
          </div>
          {coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImageUrl}
              alt="Cover preview"
              className="mb-2 h-28 w-full rounded-2xl object-cover"
            />
          )}
          <UnsplashPicker
            seedQuery={destinationLabel || title}
            selectedUrl={coverImageUrl}
            onSelect={onCoverChange}
          />
        </div>

        {recentFriends && recentFriends.length > 0 && (
          <div>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Invite
            </div>
            <div className="space-y-1">
              {recentFriends.map((f) => {
                const on = inviteIds.includes(f._id);
                return (
                  <button
                    key={f._id}
                    type="button"
                    onClick={() => onInviteToggle(f._id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors",
                      on
                        ? "border-primary bg-primary/[0.06]"
                        : "border-border bg-card hover:bg-muted/40"
                    )}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground/[0.06] text-sm font-semibold text-foreground/60">
                      {(f.name?.[0] ?? "U").toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {f.name ?? "Friend"}
                      </div>
                      {f.username && (
                        <div className="truncate text-[11.5px] text-muted-foreground">
                          @{f.username}
                        </div>
                      )}
                    </div>
                    {on && (
                      <Check className="h-4 w-4 text-primary" strokeWidth={3} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground">
          <Search className="mr-1 inline h-3 w-3" />
          Need to invite someone else? You can do it from the trip page after
          creating.
        </p>
      </div>
    </>
  );
}

// Success/confetti step shown after a trip is created. Two CTAs:
//   - View Trip → routes to /trips/[slug]
//   - Share Trip → swaps the modal body for a username search that calls
//     trips.inviteToTrip per pick. Same pattern as ShareClient so users
//     get a familiar invite UI without leaving the create flow.
function SuccessStep({
  slug,
  tripId,
  destinationLabel,
  onView,
  onClose,
}: {
  slug: string;
  tripId: Id<"users"> extends never ? never : Id<"trips">;
  destinationLabel: string;
  onView: () => void;
  onClose: () => void;
}) {
  const [showShare, setShowShare] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<Id<"users"> | null>(null);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [shareError, setShareError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const inviteToTrip = useMutation(api.trips.inviteToTrip);
  const results = useQuery(
    api.users.searchByUsername,
    search.trim().length >= 2 ? { term: search.trim() } : "skip"
  );

  // Light confetti on mount — pure CSS, no extra dep. We render 12
  // streamers that drift down and fade. Hidden when we swap to the share
  // panel so they don't keep falling behind the search results.
  const streamers = Array.from({ length: 12 }, (_, i) => i);

  async function invite(userId: Id<"users">) {
    setShareError(null);
    setPendingId(userId);
    try {
      await inviteToTrip({ tripId, inviteeId: userId });
      setInvitedIds((prev) => {
        const next = new Set(prev);
        next.add(userId);
        return next;
      });
    } catch (e) {
      setShareError(e instanceof Error ? e.message : "Couldn't send invite.");
    } finally {
      setPendingId(null);
    }
  }

  async function copyLink() {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/t/${slug}`);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1800);
    } catch {
      setShareError("Couldn't copy link.");
    }
  }

  if (showShare) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowShare(false)}
          aria-label="Back to summary"
          className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back
        </button>
        <h2 className="font-display text-[22px] font-bold leading-tight">
          Share trip
        </h2>
        <p className="mb-3 mt-1 text-[13px] text-muted-foreground">
          Search for friends by username, or copy the link.
        </p>

        <div className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-background px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value.toLowerCase())}
            placeholder="Search any user by username"
            spellCheck={false}
            autoComplete="off"
            className="h-10 flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>

        {shareError && (
          <div className="mb-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {shareError}
          </div>
        )}

        {search.trim().length >= 2 && results !== undefined && (
          <ul className="space-y-1.5">
            {results.length === 0 ? (
              <li className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
                No matches.
              </li>
            ) : (
              results.map((u) => {
                const invited = invitedIds.has(u._id);
                const busy = pendingId === u._id;
                return (
                  <li
                    key={u._id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5"
                  >
                    <Avatar
                      src={u.image ?? undefined}
                      name={u.name ?? undefined}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {u.name ?? "User"}
                      </div>
                      {u.username && (
                        <div className="truncate text-xs text-muted-foreground">
                          @{u.username}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => invite(u._id)}
                      disabled={busy || invited}
                      className={cn(
                        "inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-3 text-[12px] font-semibold transition-colors disabled:opacity-60",
                        invited
                          ? "bg-emerald-500/15 text-emerald-700"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      {invited ? (
                        <>
                          <Check className="h-3 w-3" /> Invited
                        </>
                      ) : busy ? (
                        "Sending…"
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3" /> Invite
                        </>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}

        <button
          type="button"
          onClick={copyLink}
          className="mt-4 inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 text-[12.5px] font-semibold text-foreground hover:bg-muted"
        >
          {linkCopied ? (
            <>
              <Check className="h-3.5 w-3.5" /> Link copied
            </>
          ) : (
            <>
              <Search className="h-3.5 w-3.5" /> Or copy public link
            </>
          )}
        </button>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onView}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            View Trip <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center px-2 py-3 text-center">
      {/* CSS-only confetti — drift + fade, kicks off on mount. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden"
      >
        {streamers.map((i) => {
          const left = (i * 8.3) % 100;
          const delay = (i % 4) * 0.18;
          const colour = ["#FF3D7F", "#FFB800", "#7B61FF", "#3DD68C"][i % 4];
          return (
            <span
              key={i}
              style={{
                left: `${left}%`,
                background: colour,
                animationDelay: `${delay}s`,
              }}
              className="absolute -top-4 h-3 w-1.5 rounded-full opacity-80 [animation:rw-pop-in_900ms_ease-out_forwards,rw-peek-float_2.4s_ease-in-out_infinite]"
            />
          );
        })}
      </div>

      <div className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40">
        <Check className="h-8 w-8" strokeWidth={3} />
      </div>
      <div className="mb-1 font-display text-[22px] font-bold leading-tight">
        Trip created!
      </div>
      <p className="mb-6 max-w-[320px] text-[13.5px] text-muted-foreground">
        Your trip{destinationLabel ? ` to ${destinationLabel.split(",")[0]}` : ""}{" "}
        is ready. View it now or send invites to your crew.
      </p>

      <div className="flex w-full max-w-[320px] flex-col gap-2">
        <button
          type="button"
          onClick={onView}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
        >
          View Trip <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setShowShare(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted"
        >
          <UserPlus className="h-4 w-4" /> Share Trip
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-[12px] font-medium text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>
    </div>
  );
}
