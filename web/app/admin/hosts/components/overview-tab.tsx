import { CalendarDays } from "lucide-react";
import type { AdminUser } from "@/lib/supabase/admin/users";
import type { Event } from "@/lib/supabase/events";
import type { HotelBooking } from "@/lib/supabase/hotel-bookings";

type Props = {
  host: AdminUser;
  events: Event[];
  bookings: HotelBooking[];
};

export function OverviewTab({ host, events, bookings }: Props) {
  const totalRevenue = bookings.reduce((s, b) => s + (b.total_amount ?? 0), 0);
  const totalParticipants = events.reduce((s, e) => s + (e.current_participants ?? 0), 0);
  const joinDate = host.created_at
    ? new Date(host.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* About */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
        <h3 className="font-semibold text-black">About</h3>
        <p className="text-sm leading-relaxed text-body">
          {host.full_name ?? "This host"} has{" "}
          {events.length} event{events.length !== 1 ? "s" : ""} on the platform.
        </p>
      </div>

      {/* Event Metrics */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
        <h3 className="font-semibold text-black">Event Metrics</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Events", value: events.length.toString() },
            { label: "Total Attendees", value: totalParticipants.toLocaleString() },
            { label: "Booking Revenue", value: totalRevenue > 0 ? `$${totalRevenue.toLocaleString()}` : "—" },
          ].map((m) => (
            <div key={m.label} className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="font-display text-xl font-bold text-black">{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Details */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
        <h3 className="font-semibold text-black">Registration Details</h3>
        <dl className="flex flex-col gap-3">
          {[
            { label: "Host ID", value: host.id },
            { label: "Email", value: host.email ?? "—" },
            { label: "Joined", value: joinDate },
            { label: "Last Updated", value: host.updated_at ? new Date(host.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—" },
          ].map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-4">
              <dt className="shrink-0 text-sm text-muted-foreground">{item.label}</dt>
              <dd className="truncate text-sm font-medium text-black text-right">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Account Details */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
        <h3 className="font-semibold text-black">Account Details</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <CalendarDays className="size-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Member Since</p>
              <p className="text-sm font-medium text-black">{joinDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
