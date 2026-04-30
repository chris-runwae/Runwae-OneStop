"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { HotelBooking } from "@/lib/supabase/hotel-bookings";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  failed: "bg-rose-50 text-rose-600",
  cancelled: "bg-gray-100 text-gray-500",
};

type Props = { bookings: HotelBooking[] };

function daysBetween(checkin: string | null, checkout: string | null): number | null {
  if (!checkin || !checkout) return null;
  const diff = new Date(checkout).getTime() - new Date(checkin).getTime();
  return Math.round(diff / 86400000);
}

export function EarningsTab({ bookings }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<"earning" | "payout">("earning");

  const totalGross = bookings.reduce((s, b) => s + (b.total_amount ?? 0), 0);
  const totalConfirmed = bookings
    .filter((b) => (b.status ?? "").toLowerCase() === "confirmed")
    .reduce((s, b) => s + (b.total_amount ?? 0), 0);

  const earningStats = [
    { label: "Total Bookings", value: bookings.length.toString(), color: "text-sky-600 bg-sky-50" },
    { label: "Confirmed Revenue", value: totalConfirmed > 0 ? `$${totalConfirmed.toLocaleString()}` : "—", color: "text-emerald-600 bg-emerald-50" },
    { label: "Total Paid Out", value: "—", color: "text-emerald-600 bg-emerald-50" },
    { label: "Lifetime Gross", value: totalGross > 0 ? `$${totalGross.toLocaleString()}` : "—", color: "text-primary bg-primary/10" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {earningStats.map((s) => (
          <div key={s.label} className={cn("flex flex-col gap-1 rounded-xl p-5", s.color)}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="font-display text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* History Table */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface">
        <div className="flex items-center gap-4 border-b border-border px-6 pt-5 pb-0">
          {(["earning", "payout"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveSubTab(tab)}
              className={cn(
                "pb-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeSubTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-body",
              )}
            >
              {tab === "earning" ? "Booking History" : "Payout History"}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-145">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {activeSubTab === "earning"
                  ? ["Date", "Reference", "Hotel", "Nights", "Amount", "Status"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                    ))
                  : ["Date", "Reference", "Amount", "Status"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                    ))}
              </tr>
            </thead>
            <tbody>
              {activeSubTab === "payout" ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
                    No payout records yet.
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    No bookings yet.
                  </td>
                </tr>
              ) : bookings.map((b) => {
                const status = (b.status ?? "pending").toLowerCase();
                const nights = daysBetween(b.checkin, b.checkout);
                const date = b.created_at
                  ? new Date(b.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "—";
                return (
                  <tr key={b.id} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm text-body whitespace-nowrap">{date}</td>
                    <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{b.booking_ref ?? b.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-sm text-body">{b.hotel_name ?? "—"}</td>
                    <td className="px-6 py-4 text-sm text-body">{nights != null ? `${nights}` : "—"}</td>
                    <td className="px-6 py-4 text-sm font-medium text-black">
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
    </div>
  );
}
