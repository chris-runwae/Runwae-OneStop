import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { fetchAuthedQuery } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Booking confirmed" };

export default async function BookingSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await fetchAuthedQuery(api.bookings.getById, {
    bookingId: id as Id<"bookings">,
  });
  if (!booking) notFound();

  const isPending = booking.status === "pending";

  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-10 text-center">
      <div className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="h-10 w-10" strokeWidth={1.8} />
      </div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
        {isPending ? "Payment received" : "Booking confirmed"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isPending
          ? "Stripe is finalising your payment — your tickets will appear here in a moment."
          : "Your tickets are ready. We sent a copy to your email."}
      </p>
      <div className="mt-6 w-full rounded-2xl border border-border bg-card p-5 text-left text-sm shadow-sm">
        <div className="flex justify-between border-b border-border pb-3">
          <span className="text-muted-foreground">Booking</span>
          <span className="font-mono text-xs text-foreground">
            {booking._id.slice(-10)}
          </span>
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
