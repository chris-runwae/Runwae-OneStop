"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { UnsplashPicker } from "@/components/trips/wizard/UnsplashPicker";

const GROUP_OPTIONS = [
  { id: "solo" as const, emoji: "🧍", t: "Just me", d: "Solo trip — one ticket, one room" },
  { id: "small" as const, emoji: "👯", t: "Small group", d: "2–4 people — friends or partner" },
  { id: "large" as const, emoji: "🎉", t: "Large group", d: "5+ people — bachelor, birthday, crew" },
];

const VISIBILITIES = [
  { id: "private" as const, t: "Private", d: "Only you and invited members" },
  { id: "friends" as const, t: "Friends", d: "Visible to your accepted friends" },
  { id: "public" as const, t: "Public", d: "Anyone with the link can view" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const dKey = (d: Date) => d.toISOString().slice(0, 10);
const dEq = (a: Date | null, b: Date | null) =>
  !!a && !!b && dKey(a) === dKey(b);
const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
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
type Visibility = "private" | "friends" | "public";

interface PlanMyTripModalProps {
  open: boolean;
  onClose: () => void;
  event: Doc<"events">;
  onPaywall: () => void;
  onSuccess?: (slug: string) => void;
}

// 4-step modal: group size → dates → details (title/cover/visibility) →
// build/success.
//
// Origin used to be a step but the trip's destination IS the event city.
// We default origin to viewer.homeCity (or fall back to the event city).
//
// Bug-fix history:
//   - The previous version had a useEffect with a wide dep array that
//     re-fired `generate` on every state tick (10× = 10 trips, 10 quota
//     burned). The current version (a) gates with firedRef and (b) mints
//     the idempotencyKey at submit-time so there's no race window where
//     we'd send a request without a key. The action also accepts a
//     server-mint fallback for older stale tabs.
export function PlanMyTripModal({
  open,
  onClose,
  event,
  onPaywall,
  onSuccess,
}: PlanMyTripModalProps) {
  const router = useRouter();
  const generate = useAction(api.ai.generateTripFromEvent);
  const quota = useQuery(api.ai.getQuota, {});
  const viewer = useQuery(api.users.getCurrentUser, {});

  const eventStart = useMemo(
    () => stripTime(new Date(event.startDateUtc)),
    [event.startDateUtc]
  );
  const eventEnd = useMemo(
    () => stripTime(new Date(event.endDateUtc ?? event.startDateUtc)),
    [event.endDateUtc, event.startDateUtc]
  );

  const [step, setStep] = useState(1);
  const [groupSize, setGroupSize] = useState<"solo" | "small" | "large" | null>(
    null
  );
  const [range, setRange] = useState<Range>({ start: null, end: null });
  const [quickPick, setQuickPick] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [buildIdx, setBuildIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultSlug, setResultSlug] = useState<string | null>(null);

  // Hard gate — flips true the moment we kick off generation and prevents
  // any subsequent re-render from firing another generation.
  const firedRef = useRef(false);

  // Reset whenever the modal closes.
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep(1);
        setGroupSize(null);
        setRange({ start: null, end: null });
        setQuickPick(null);
        setTitle("");
        setCoverImageUrl("");
        setVisibility("private");
        setBuildIdx(0);
        setDone(false);
        setError(null);
        setResultSlug(null);
        firedRef.current = false;
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Origin — derived, not user-picked.
  const originLabel = useMemo(() => {
    if (viewer?.homeCity) return viewer.homeCity;
    return event.locationName?.split(",")[0] ?? "Home";
  }, [viewer?.homeCity, event.locationName]);

  // Pre-fill the title once the event loads — just a sensible default the
  // user can overwrite on the details step.
  useEffect(() => {
    if (open && !title) setTitle(`Trip to ${event.name}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event.name]);

  // Fire the AI generation exactly once when we reach step 4 with valid
  // inputs. Idempotency key is minted INLINE at submit time — no useRef
  // bookkeeping, no race window with the modal-open effect.
  useEffect(() => {
    if (!open || step !== 4 || done || error) return;
    if (!groupSize || !range.start || !range.end) return;
    if (firedRef.current) return;

    firedRef.current = true;
    setBuildIdx(0);
    setError(null);

    let i = 0;
    const totalSteps = 4;
    const tick = () => {
      i++;
      setBuildIdx(i);
      if (i < totalSteps) setTimeout(tick, 700);
    };
    const animTimer = setTimeout(tick, 600);

    const startIso = range.start.toISOString().slice(0, 10);
    const endIso = range.end.toISOString().slice(0, 10);
    const idempotencyKey =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `ai_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    generate({
      eventId: event._id as Id<"events">,
      origin: originLabel,
      groupSize,
      startDate: startIso,
      endDate: endIso,
      idempotencyKey,
      title: title.trim() || undefined,
      coverImageUrl: coverImageUrl.trim() || undefined,
      visibility,
    })
      .then((res) => {
        if (!res.ok) {
          if (res.reason === "quota_exhausted") {
            onPaywall();
            onClose();
            return;
          }
          setError(
            res.reason === "event_missing"
              ? "Couldn't find the event."
              : res.reason === "not_authenticated"
                ? "Please sign in first."
                : "AI couldn't plan the trip — try again."
          );
          firedRef.current = false; // allow user-driven retry on error
          return;
        }
        setResultSlug(res.slug);
        setTimeout(() => setDone(true), Math.max(0, 700 * 4 + 600));
      })
      .catch((err) => {
        firedRef.current = false;
        setError(err instanceof Error ? err.message : "Something went wrong.");
      });

    return () => clearTimeout(animTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  const buildSteps = [
    `Finding flights from ${originLabel}`,
    "Matching hotels near the venue",
    "Adding event to itinerary",
    "Finalising your plan",
  ];

  const canNext =
    (step === 1 && !!groupSize) ||
    (step === 2 && !!range.start && !!range.end) ||
    (step === 3 && !!title.trim());
  const next = () => {
    if (step < 4) setStep((s) => s + 1);
  };
  const back = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const applyQuickPick = (id: string) => {
    setQuickPick(id);
    if (id === "event") setRange({ start: eventStart, end: eventEnd });
    else if (id === "weekend")
      setRange({ start: addDays(eventStart, -1), end: eventEnd });
    else if (id === "week")
      setRange({ start: addDays(eventStart, -2), end: addDays(eventEnd, 2) });
  };

  const fmtShort = (d: Date | null) =>
    d ? `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}` : "—";
  const nights =
    range.start && range.end
      ? Math.round((range.end.getTime() - range.start.getTime()) / 86400000)
      : 0;

  const stepLabel = `Step ${Math.min(step, 4)} of 4`;
  const progress = (Math.min(step, 4) / 4) * 100;

  // Footer is hidden on step 4 (build/success has its own CTA).
  const footer = step < 4 ? (
    <div className="flex items-center gap-2">
      {step > 1 && (
        <button
          type="button"
          onClick={back}
          aria-label="Back"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-foreground/[0.05] text-foreground hover:bg-foreground/[0.1]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      )}
      <button
        type="button"
        disabled={!canNext}
        onClick={next}
        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
      >
        {step === 3 ? "Generate trip" : "Continue"} <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  ) : undefined;

  return (
    <Modal open={open} onClose={onClose} title="" footer={footer}>
      <div className="-mx-6 -mt-2 mb-3">
        <div className="flex items-center justify-between px-6 pb-2">
          <span className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            {stepLabel}
          </span>
          {quota && step === 1 && (
            <span className="text-[11px] text-muted-foreground">
              {quota.remaining} of {quota.limit} AI plans left
            </span>
          )}
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

      {/* Step 1 — Group size */}
      {step === 1 && (
        <>
          <h2 className="font-display text-[22px] font-bold leading-tight">
            Solo or with a group?
          </h2>
          <p className="mb-4 mt-1 text-[13px] text-muted-foreground">
            We&apos;ll size accommodation and group polls accordingly. Travelling
            from <b className="text-foreground">{originLabel}</b>.
          </p>
          <div className="space-y-2">
            {GROUP_OPTIONS.map((opt) => {
              const on = groupSize === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGroupSize(opt.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors",
                    on
                      ? "border-primary bg-primary/[0.06]"
                      : "border-transparent bg-foreground/[0.04] hover:bg-foreground/[0.07]"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-12 w-12 shrink-0 place-items-center rounded-xl text-xl",
                      on ? "bg-primary text-primary-foreground" : "bg-card shadow-sm"
                    )}
                  >
                    {opt.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-semibold leading-tight">
                      {opt.t}
                    </div>
                    <div className="mt-0.5 text-[12.5px] text-muted-foreground">
                      {opt.d}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2",
                      on
                        ? "border-primary bg-primary"
                        : "border-foreground/20 bg-transparent"
                    )}
                  >
                    {on && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Step 2 — Dates */}
      {step === 2 && (
        <CalendarStep
          range={range}
          onChange={(r) => {
            setRange(r);
            setQuickPick(null);
          }}
          eventStart={eventStart}
          eventEnd={eventEnd}
          quickPick={quickPick}
          onQuickPick={applyQuickPick}
          fmtShort={fmtShort}
          nights={nights}
        />
      )}

      {/* Step 3 — Title + cover + visibility */}
      {step === 3 && (
        <DetailsStep
          title={title}
          onTitleChange={setTitle}
          coverImageUrl={coverImageUrl}
          onCoverChange={setCoverImageUrl}
          visibility={visibility}
          onVisibilityChange={setVisibility}
          seedQuery={event.locationName ?? title}
        />
      )}

      {/* Step 4 — Build / Success */}
      {step === 4 && !done && (
        <div className="flex flex-col items-center px-2 py-6 text-center">
          <div className="mb-5 h-14 w-14 animate-spin rounded-full border-4 border-foreground/[0.08] border-t-primary" />
          <div className="mb-1 font-display text-[20px] font-bold">
            Building your trip…
          </div>
          <p className="mb-5 max-w-[300px] text-[13px] text-muted-foreground">
            Stitching together flights, hotels, and the event into one
            shareable itinerary.
          </p>
          <div className="w-full max-w-[300px] space-y-2">
            {buildSteps.map((s, i) => {
              const isDone = i < buildIdx;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] transition-colors",
                    isDone
                      ? "bg-primary/10 text-foreground"
                      : "bg-foreground/[0.05] text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 transition-colors",
                      isDone
                        ? "border-primary bg-primary text-white"
                        : "border-foreground/20"
                    )}
                  >
                    {isDone && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                  </span>
                  <span>{s}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === 4 && done && (
        <div className="flex flex-col items-center px-2 py-6 text-center">
          <div className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40">
            <Check className="h-8 w-8" strokeWidth={3} />
          </div>
          <div className="mb-1 font-display text-[20px] font-bold">
            Trip ready!
          </div>
          <p className="mb-5 max-w-[300px] text-[13px] text-muted-foreground">
            Your trip to <b className="text-foreground">{event.name}</b> is set
            up. Invite your crew and customise the itinerary.
          </p>
          <button
            type="button"
            onClick={() => {
              if (resultSlug) {
                router.push(`/trips/${resultSlug}`);
                onSuccess?.(resultSlug);
              }
              onClose();
            }}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
          >
            View Trip <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </Modal>
  );
}

function DetailsStep({
  title,
  onTitleChange,
  coverImageUrl,
  onCoverChange,
  visibility,
  onVisibilityChange,
  seedQuery,
}: {
  title: string;
  onTitleChange: (v: string) => void;
  coverImageUrl: string;
  onCoverChange: (v: string) => void;
  visibility: Visibility;
  onVisibilityChange: (v: Visibility) => void;
  seedQuery: string;
}) {
  const inputCls =
    "h-11 w-full rounded-2xl border border-border bg-background px-4 text-[14.5px] focus:border-primary focus:outline-none";
  return (
    <>
      <h2 className="font-display text-[22px] font-bold leading-tight">
        Final touches
      </h2>
      <p className="mb-4 mt-1 text-[13px] text-muted-foreground">
        Name your trip, pick a cover photo, choose who can see it.
      </p>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Trip name
          </span>
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Trip to …"
            className={inputCls}
          />
        </label>

        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Visibility
          </div>
          <div className="grid grid-cols-3 gap-2">
            {VISIBILITIES.map((v) => {
              const on = visibility === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onVisibilityChange(v.id)}
                  className={cn(
                    "rounded-xl border px-2 py-2 text-left transition-colors",
                    on
                      ? "border-primary bg-primary/[0.08]"
                      : "border-border bg-card hover:bg-muted/40"
                  )}
                >
                  <div className="text-[12.5px] font-semibold">{v.t}</div>
                  <div className="mt-0.5 line-clamp-2 text-[10.5px] text-muted-foreground">
                    {v.d}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

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
            seedQuery={seedQuery}
            selectedUrl={coverImageUrl}
            onSelect={onCoverChange}
          />
        </div>
      </div>
    </>
  );
}

function CalendarStep({
  range,
  onChange,
  eventStart,
  eventEnd,
  quickPick,
  onQuickPick,
  fmtShort,
  nights,
}: {
  range: Range;
  onChange: (r: Range) => void;
  eventStart: Date;
  eventEnd: Date;
  quickPick: string | null;
  onQuickPick: (id: string) => void;
  fmtShort: (d: Date | null) => string;
  nights: number;
}) {
  const today = stripTime(new Date());
  const initialMonth = eventStart || today;
  const [view, setView] = useState({
    y: initialMonth.getFullYear(),
    m: initialMonth.getMonth(),
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
        Event days are marked with a dot — your trip should overlap.
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
          { id: "event", label: "Event days only" },
          { id: "weekend", label: "Long weekend" },
          { id: "week", label: "Week" },
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

      {/* Day-of-week header — gap-0 to line up with the grid below. */}
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

      {/*
        Pill calendar — no gap between cells so the in-range stripe is
        continuous. Start/end cells are circular caps; middle cells are
        a flat strip; lone-day selections are full circles.
      */}
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
          const isEvent =
            d >= eventStart && d <= eventEnd && !isStart && !isEnd && !inRange;

          // Layered rendering: outer wrapper holds the connected fill (if
          // any), inner pill shows the day digit. This is the standard
          // trick for date-range pickers — keeps the strip seamless without
          // forcing every cell to have a background.
          let fillClass = "";
          if (isStart && hasRange) fillClass = "bg-primary/15 rounded-l-full";
          else if (isEnd && hasRange) fillClass = "bg-primary/15 rounded-r-full";
          else if (inRange) fillClass = "bg-primary/15";

          let innerClass = "rounded-full";
          if (isStart || isEnd) innerClass += " bg-primary text-primary-foreground font-bold";
          else if (!isPast)
            innerClass += " hover:bg-foreground/[0.06] text-foreground";
          else innerClass += " text-foreground/30";

          return (
            <div
              key={i}
              className={cn("relative aspect-square", fillClass)}
            >
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
                {isEvent && (
                  <span
                    aria-hidden
                    className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex gap-3 px-1 pt-1 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-3.5 rounded-sm bg-primary" />
          Your trip
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Event days
        </span>
      </div>
    </>
  );
}

export function PaywallModal({
  open,
  onClose,
  used,
  limit,
}: {
  open: boolean;
  onClose: () => void;
  used: number;
  limit: number;
}) {
  return (
    <Modal open={open} onClose={onClose} title="">
      <div className="flex flex-col items-center px-2 py-2 text-center">
        <div className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
          <span className="text-3xl">✨</span>
        </div>
        <h2 className="mb-1 font-display text-[22px] font-bold leading-tight">
          You&apos;ve used all your AI trips
        </h2>
        <p className="mb-5 max-w-[320px] text-[13.5px] text-muted-foreground">
          You&apos;ve planned {used} / {limit} AI trips this period. Upgrade to
          Runwae Pro for unlimited AI itineraries, group polls, and event-aware
          flight matching.
        </p>
        <button
          type="button"
          onClick={() => {
            window.open("/api/checkout?plan=pro", "_blank");
          }}
          className="mb-2 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
        >
          Upgrade to Pro
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-[12.5px] font-semibold text-muted-foreground hover:text-foreground"
        >
          Maybe later
        </button>
      </div>
    </Modal>
  );
}

export const _IconExport = X;
