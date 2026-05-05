"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatCurrency } from "@/lib/utils";

export function BookingSuccessClient({ bookingId }: { bookingId: Id<"bookings"> }) {
  const booking = useQuery(api.bookings.getById, { bookingId });

  // Initial render before subscription resolves.
  if (booking === undefined) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-10 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (booking === null) {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-10 text-center">
        <h1 className="font-display text-xl font-bold">Booking not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn&apos;t find this booking under your account.
        </p>
        <Link
          href="/home"
          className="mt-4 inline-flex text-sm font-semibold text-primary"
        >
          Back to home
        </Link>
      </main>
    );
  }

  const cancelled = booking.status === "cancelled";
  const confirmed = booking.status === "confirmed";
  const pending = booking.status === "pending";

  // Hotel & flight types defer to a post-Stripe provider call. While that's in
  // flight the booking row stays "pending" until the supplier confirms.
  const supplierLabel =
    booking.type === "hotel"
      ? "the hotel"
      : booking.type === "flight"
        ? "the airline"
        : "the venue";

  const reference =
    (booking.rawResponse?.liteapiConfirmationCode as string | undefined) ??
    (booking.rawResponse?.duffelBookingReference as string | undefined) ??
    booking._id.slice(-10);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-10 text-center">
      <div
        className={
          cancelled
            ? "mb-6 grid h-20 w-20 place-items-center rounded-full bg-error-light text-error"
            : "mb-6 grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary"
        }
      >
        {cancelled ? (
          <AlertCircle className="h-10 w-10" strokeWidth={1.8} />
        ) : pending ? (
          <Loader2 className="h-10 w-10 animate-spin" />
        ) : (
          <CheckCircle2 className="h-10 w-10" strokeWidth={1.8} />
        )}
      </div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
        {cancelled
          ? "Booking failed"
          : confirmed
            ? "Booking confirmed"
            : "Confirming with " + supplierLabel + "…"}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {cancelled
          ? `Your payment has been refunded. ${supplierLabel.charAt(0).toUpperCase() + supplierLabel.slice(1)} could not finalise the booking — your card has not been charged.`
          : confirmed
            ? "All set. We've sent the details to your email."
            : `Stripe payment received. Holding your ${booking.type === "flight" ? "seat" : "room"} with ${supplierLabel} now — this usually takes a few seconds.`}
      </p>

      <div className="mt-6 w-full rounded-2xl border border-border bg-card p-5 text-left text-sm shadow-sm">
        <div className="flex justify-between border-b border-border pb-3">
          <span className="text-muted-foreground">Reference</span>
          <span className="font-mono text-xs text-foreground">{reference}</span>
        </div>
        <div className="flex justify-between pt-3">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-display text-base font-bold text-foreground">
            {formatCurrency(booking.grossAmount, booking.currency)}
          </span>
        </div>
      </div>
      <Link
        href="/home"
        className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Back to home
      </Link>
    </main>
  );
}
