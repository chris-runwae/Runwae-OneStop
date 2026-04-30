"use client";

import { Download, Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { adminGetBookingsByEventId } from "@/lib/supabase/admin/hotel-bookings";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  cancelled: "bg-rose-50 text-rose-600",
  refunded: "bg-gray-100 text-gray-500",
};

type Props = { eventId: string };

export function AttendeesTab({ eventId }: Props) {
  const [search, setSearch] = useState("");

  const { data: bookings = [], isPending } = useQuery({
    queryKey: ["admin-event-bookings", eventId],
    queryFn: () => adminGetBookingsByEventId(eventId),
    enabled: !!eventId,
  });

  const filtered = bookings.filter(
    (b) =>
      (b.hotel_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (b.confirmation_code ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (b.booking_ref ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const totalGuests = bookings.reduce((s, b) => s + (b.guests ?? 0), 0);
  const confirmed = bookings.filter((b) => (b.status ?? "").toLowerCase() === "confirmed").length;

  const attendeeStats = [
    { label: "Total Bookings", value: bookings.length.toLocaleString(), color: "text-emerald-600 bg-emerald-50" },
    { label: "Total Guests", value: totalGuests.toLocaleString(), color: "text-sky-600 bg-sky-50" },
    { label: "Confirmed", value: confirmed.toLocaleString(), color: "text-amber-600 bg-amber-50" },
    { label: "Other", value: (bookings.length - confirmed).toLocaleString(), color: "text-rose-500 bg-rose-50" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {attendeeStats.map((s) => (
          <div key={s.label} className={cn("flex flex-col gap-1 rounded-xl p-5", s.color)}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="font-display text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Attendee List */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between px-5 pt-5">
          <h3 className="font-semibold text-black">Booking List</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search bookings"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-44 rounded-lg border border-border bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-body hover:bg-muted/40 transition-colors"
            >
              <Download className="size-3.5" /> Export CSV
            </button>
          </div>
        </div>

        {isPending ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading bookings…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-130">
              <thead>
                <tr className="border-y border-border bg-muted/30">
                  {["Confirmation", "Hotel", "Check-in", "Check-out", "Guests", "Amount", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      No bookings found.
                    </td>
                  </tr>
                ) : filtered.map((b) => {
                  const status = (b.status ?? "pending").toLowerCase();
                  const checkin = b.checkin ? new Date(b.checkin).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
                  const checkout = b.checkout ? new Date(b.checkout).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
                  return (
                    <tr key={b.id} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 text-xs font-mono text-muted-foreground">
                        {b.confirmation_code ?? b.booking_ref ?? b.id.slice(0, 8)}
                      </td>
                      <td className="px-5 py-3 text-sm text-body">{b.hotel_name ?? "—"}</td>
                      <td className="px-5 py-3 text-sm text-body whitespace-nowrap">{checkin}</td>
                      <td className="px-5 py-3 text-sm text-body whitespace-nowrap">{checkout}</td>
                      <td className="px-5 py-3 text-sm text-body text-center">{b.guests ?? "—"}</td>
                      <td className="px-5 py-3 text-sm font-medium text-black">
                        {b.total_amount != null ? `${b.currency ?? "$"}${b.total_amount.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-5 py-3">
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
        )}
      </div>
    </div>
  );
}
