import { Calendar, MapPin, Ticket, Eye, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { GoogleMapPreview } from "@/components/shared/google-map-preview";
import { cn } from "@/lib/utils";
import type { Event } from "@/lib/supabase/events";
import type { HotelBooking } from "@/lib/supabase/hotel-bookings";

type Props = { event: Event; bookings: HotelBooking[] };

export function EventOverviewTab({ event, bookings }: Props) {
  const router = useRouter();

  const startDate = event.start_date
    ? new Date(event.start_date).toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      })
    : "—";

  const timeRange = [event.start_time, event.end_time].filter(Boolean).join(" – ") || null;

  const totalRevenue = bookings.reduce((s, b) => s + (b.total_amount ?? 0), 0);

  const overviewStats = [
    {
      label: "Participants",
      value: (event.current_participants ?? 0).toLocaleString(),
      icon: Ticket,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Booking Revenue",
      value: totalRevenue > 0 ? `$${totalRevenue.toLocaleString()}` : "—",
      icon: Users,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      label: "Views",
      value: (event.view_count ?? 0).toLocaleString(),
      icon: Eye,
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero image + About */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Image */}
        <div className="relative h-64 overflow-hidden rounded-xl bg-muted">
          {event.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.image} alt={event.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image uploaded
            </div>
          )}
        </div>

        {/* About + map */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-black">About Event</h3>
            <button
              type="button"
              onClick={() => router.push(`/admin/events/${event.id}/edit`)}
              className="text-xs font-medium text-primary hover:underline"
            >
              {event.description ? "Edit description" : "Add description"}
            </button>
          </div>

          {event.description ? (
            <p className="text-sm leading-relaxed text-body">{event.description}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground">No description yet.</p>
          )}

          <div className="flex flex-col gap-3 pt-1">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-black">{startDate}</p>
                {timeRange && <p className="text-xs text-muted-foreground">{timeRange}</p>}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-sm font-medium text-black">{event.location ?? "No location set"}</p>
            </div>
          </div>

          <GoogleMapPreview latitude={event.latitude} longitude={event.longitude} className="h-32 mt-1" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {overviewStats.map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5">
            <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl", s.iconBg)}>
              <s.icon className={cn("size-6", s.iconColor)} />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-black">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
