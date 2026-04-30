"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { HotelBooking } from "@/lib/supabase/hotel-bookings";
import type { Event } from "@/lib/supabase/events";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  cancelled: "bg-rose-50 text-rose-600",
  refunded: "bg-gray-100 text-gray-500",
};

type Props = { bookings: HotelBooking[]; events: Event[] };

export function BookingsTab({ bookings, events }: Props) {
  const [filter, setFilter] = useState<string>("All");
  const types = ["All", ...Array.from(new Set(bookings.map((b) => b.booking_type ?? "Other")))];

  const filtered = filter === "All" ? bookings : bookings.filter((b) => (b.booking_type ?? "Other") === filter);

  const eventName = (eventId: string | null) =>
    events.find((e) => e.id === eventId)?.name ?? "—";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between px-6 pt-5">
        <h3 className="font-semibold text-black">Bookings</h3>
        <span className="text-xs text-muted-foreground">{filtered.length} Total</span>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 px-6">
        {types.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f ? "bg-primary text-white" : "border border-border text-body hover:bg-muted/40",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-175">
          <thead>
            <tr className="border-y border-border bg-muted/30">
              {["Confirmation", "Hotel / Event", "Type", "Check-out", "Amount", "Status"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  No bookings found.
                </td>
              </tr>
            ) : filtered.map((b) => {
              const status = (b.status ?? "pending").toLowerCase();
              const checkout = b.checkout
                ? new Date(b.checkout).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "—";
              return (
                <tr key={b.id} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{b.confirmation_code ?? b.booking_ref ?? b.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-black">{b.hotel_name ?? eventName(b.event_id)}</td>
                  <td className="px-6 py-4 text-sm text-body">{b.booking_type ?? "—"}</td>
                  <td className="px-6 py-4 text-sm text-body whitespace-nowrap">{checkout}</td>
                  <td className="px-6 py-4 text-sm font-medium text-body">
                    {b.total_amount != null ? `${b.currency ?? "$"}${b.total_amount.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium capitalize", STATUS_STYLES[status] ?? STATUS_STYLES.pending)}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
