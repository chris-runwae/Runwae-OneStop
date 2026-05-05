"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { ArrowLeft, ArrowRight, Plane, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn, formatCurrency } from "@/lib/utils";

type Offer = {
  apiRef: string;
  carrier: string;
  carrierLogo?: string;
  totalAmount: number;
  currency: string;
  segments: Array<{
    origin: string;
    destination: string;
    depart: string;
    arrive: string;
    carrier: string;
    flightNumber: string;
  }>;
  passengers: Array<{ id: string; type: string }>;
};

type Title = "mr" | "ms" | "mrs" | "miss" | "dr";
type Gender = "m" | "f";

type PassengerForm = {
  duffelId: string;
  type: string;
  title: Title;
  firstName: string;
  lastName: string;
  gender: Gender;
  bornOn: string;
  email: string;
  phoneE164: string;
};

const TITLE_OPTIONS: Title[] = ["mr", "ms", "mrs", "miss", "dr"];

export function FlightDetailClient({
  apiRef,
  eventId,
  backHref,
}: {
  apiRef: string;
  eventId?: Id<"events">;
  backHref: string;
}) {
  const router = useRouter();
  const getOffer = useAction(api.flights.getOffer);
  const startBooking = useAction(api.flights.startBooking);
  const viewer = useQuery(api.users.getCurrentUser, {});
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paxOpen, setPaxOpen] = useState(false);
  const [passengers, setPassengers] = useState<PassengerForm[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOffer({ apiRef })
      .then((o) => {
        if (!cancelled) setOffer(o as Offer | null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiRef, getOffer]);

  // Initialise the passenger form once we know how many seats the offer holds.
  useEffect(() => {
    if (!offer) return;
    setPassengers(
      offer.passengers.map((p, i) => ({
        duffelId: p.id,
        type: p.type,
        title: "mr",
        firstName: i === 0 ? (viewer?.name?.split(" ")[0] ?? "") : "",
        lastName:
          i === 0 ? (viewer?.name?.split(" ").slice(1).join(" ") ?? "") : "",
        gender: "m",
        bornOn: "",
        email: i === 0 ? (viewer?.email ?? "") : "",
        phoneE164: i === 0 ? (viewer?.phone ?? "") : "",
      })),
    );
  }, [offer, viewer]);

  function updatePassenger(i: number, patch: Partial<PassengerForm>) {
    setPassengers((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
    );
  }

  function validate(): string | null {
    if (passengers.length === 0) return "Loading…";
    for (const [i, p] of passengers.entries()) {
      const tag = passengers.length > 1 ? `Passenger ${i + 1}: ` : "";
      if (!p.firstName.trim()) return `${tag}First name is required`;
      if (!p.lastName.trim()) return `${tag}Last name is required`;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(p.bornOn)) return `${tag}Date of birth is required`;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) return `${tag}Valid email required`;
      if (!/^\+\d{6,15}$/.test(p.phoneE164.replace(/\s/g, ""))) {
        return `${tag}Phone must be in +CCNNN format (e.g. +447123456789)`;
      }
    }
    return null;
  }

  async function reserve() {
    if (!offer) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setReserving(true);
    setError(null);
    try {
      const { bookingId, totalAmount, currency, summary } = await startBooking({
        offerId: apiRef,
        eventId,
        passengers: passengers.map((p) => ({
          duffelId: p.duffelId,
          title: p.title,
          firstName: p.firstName.trim(),
          lastName: p.lastName.trim(),
          gender: p.gender,
          bornOn: p.bornOn,
          email: p.email.trim(),
          phoneE164: p.phoneE164.replace(/\s/g, ""),
        })),
      });
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "flight",
          bookingId,
          summary: `${offer.carrier} — ${summary}`,
          totalAmount,
          currency,
          backHref,
        }),
      });
      if (!res.ok) {
        const { error: msg } = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(msg ?? "Could not start checkout");
      }
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reservation failed");
    } finally {
      setReserving(false);
    }
  }

  if (loading && !offer) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-5">
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
      </main>
    );
  }
  if (!offer) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-10 text-center">
        <h1 className="font-display text-xl font-bold">Offer expired</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Flight prices change quickly. Search again to see fresh fares.
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 text-sm font-semibold text-primary"
        >
          Go back
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-5 pb-20">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href={backHref}
          aria-label="Back"
          className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-2xl font-bold tracking-tight text-foreground">
            {offer.carrier}
          </h1>
          <div className="text-xs text-muted-foreground">
            {offer.segments.length} flight{offer.segments.length === 1 ? "" : "s"}
          </div>
        </div>
        {offer.carrierLogo && (
          <img
            src={offer.carrierLogo}
            alt=""
            className="h-10 w-10 shrink-0 object-contain"
          />
        )}
      </div>

      <div className="mb-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
        {offer.segments.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 py-3 ${
              i !== 0 ? "border-t border-border" : ""
            } ${i === 0 ? "pt-0" : ""} ${
              i === offer.segments.length - 1 ? "pb-0" : ""
            }`}
          >
            <Plane className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
                {s.origin}
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                {s.destination}
              </div>
              <div className="text-[11.5px] text-muted-foreground">
                {fmtTime(s.depart)} → {fmtTime(s.arrive)} · {s.carrier} {s.flightNumber}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div>
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="font-display text-2xl font-bold tracking-tight">
            {formatCurrency(offer.totalAmount, offer.currency)}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            for {offer.passengers.length} passenger
            {offer.passengers.length === 1 ? "" : "s"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setPaxOpen(true);
          }}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Continue
          <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
        </button>
      </div>

      <PassengerSheet
        open={paxOpen}
        onClose={() => setPaxOpen(false)}
        passengers={passengers}
        onChange={updatePassenger}
        onSubmit={reserve}
        reserving={reserving}
        error={error}
        total={offer.totalAmount}
        currency={offer.currency}
      />
    </main>
  );
}

function PassengerSheet({
  open,
  onClose,
  passengers,
  onChange,
  onSubmit,
  reserving,
  error,
  total,
  currency,
}: {
  open: boolean;
  onClose: () => void;
  passengers: PassengerForm[];
  onChange: (i: number, patch: Partial<PassengerForm>) => void;
  onSubmit: () => void;
  reserving: boolean;
  error: string | null;
  total: number;
  currency: string;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col overflow-hidden rounded-t-3xl bg-background shadow-2xl",
          "transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full",
          "md:inset-x-auto md:left-1/2 md:bottom-1/2 md:max-h-[85vh] md:w-[520px] md:rounded-3xl",
          open
            ? "md:translate-x-[-50%] md:translate-y-1/2"
            : "md:translate-x-[-50%] md:translate-y-[calc(50%+30px)] md:opacity-0",
        )}
      >
        <div className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-border md:hidden" />
        <div className="flex shrink-0 items-center justify-between px-5 pt-3.5 pb-2">
          <h2 className="font-display text-lg font-bold tracking-tight">
            Passenger details
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-foreground/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <p className="mb-4 text-[12.5px] text-muted-foreground">
            Names must match the passport / ID used at check-in. Phone must be in
            international format (+CC...).
          </p>
          <div className="flex flex-col gap-4">
            {passengers.map((p, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                {passengers.length > 1 && (
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Passenger {i + 1}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <SelectField
                    label="Title"
                    value={p.title}
                    onChange={(v) => onChange(i, { title: v as Title })}
                    options={TITLE_OPTIONS.map((t) => ({
                      value: t,
                      label: t.toUpperCase(),
                    }))}
                  />
                  <TextField
                    className="col-span-2"
                    label="First name"
                    value={p.firstName}
                    onChange={(v) => onChange(i, { firstName: v })}
                  />
                  <TextField
                    className="col-span-3"
                    label="Last name"
                    value={p.lastName}
                    onChange={(v) => onChange(i, { lastName: v })}
                  />
                  <SelectField
                    label="Gender"
                    value={p.gender}
                    onChange={(v) => onChange(i, { gender: v as Gender })}
                    options={[
                      { value: "m", label: "Male" },
                      { value: "f", label: "Female" },
                    ]}
                  />
                  <DateFieldInput
                    className="col-span-2"
                    label="Date of birth"
                    value={p.bornOn}
                    onChange={(v) => onChange(i, { bornOn: v })}
                  />
                  <TextField
                    className="col-span-2"
                    label="Email"
                    type="email"
                    value={p.email}
                    onChange={(v) => onChange(i, { email: v })}
                  />
                  <TextField
                    label="Phone"
                    placeholder="+447..."
                    value={p.phoneE164}
                    onChange={(v) => onChange(i, { phoneE164: v })}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mx-5 mb-3 rounded-xl border border-error/40 bg-error-light px-3 py-2 text-xs font-medium text-error">
            {error}
          </div>
        )}

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-background px-5 py-4">
          <div>
            <div className="text-[11px] text-muted-foreground">Total</div>
            <div className="font-display text-base font-bold tracking-tight">
              {formatCurrency(total, currency)}
            </div>
          </div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={reserving}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {reserving ? "Working…" : "Pay & confirm"}
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex flex-col gap-1 rounded-xl border border-border bg-background px-3 py-2",
        className,
      )}
    >
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-sm font-semibold text-foreground outline-none"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex flex-col gap-1 rounded-xl border border-border bg-background px-3 py-2",
        className,
      )}
    >
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-sm font-semibold text-foreground outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function DateFieldInput({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex flex-col gap-1 rounded-xl border border-border bg-background px-3 py-2",
        className,
      )}
    >
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-sm font-semibold text-foreground outline-none"
      />
    </label>
  );
}

function fmtTime(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    }).format(d);
  } catch {
    return iso;
  }
}
