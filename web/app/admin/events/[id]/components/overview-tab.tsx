import { Calendar, MapPin, Ticket, DollarSign, Users, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { GoogleMapPreview } from "@/components/shared/google-map-preview";
import { cn } from "@/lib/utils";
import type { Event } from "@/lib/supabase/events";

type ComplaintRow = {
  userId: string;
  email: string;
  date: string;
  issue: string;
  status: "Opened" | "Closed";
};

const COMPLAINTS: ComplaintRow[] = [
  { userId: "RUN-930", email: "cm@gmail.com", date: "12-03-2024", issue: "Refund Issue", status: "Opened" },
  { userId: "RUN-930", email: "cm@gmail.com", date: "12-04-2024", issue: "Refund Issue", status: "Closed" },
  { userId: "RUN-930", email: "cm@gmail.com", date: "12-05-2024", issue: "Refund Issue", status: "Opened" },
  { userId: "RUN-930", email: "cm@gmail.com", date: "12-07-2024", issue: "Refund Issue", status: "Closed" },
  { userId: "RUN-930", email: "cm@gmail.com", date: "12-09-2024", issue: "Refund Issue", status: "Opened" },
];

const overviewStats = [
  { label: "Tickets sold", value: "1,067", icon: Ticket, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  { label: "Revenue generated", value: "$199,382", icon: DollarSign, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  { label: "Users Checked in", value: "1001", icon: Users, iconBg: "bg-sky-100", iconColor: "text-sky-600" },
  { label: "Complaint", value: "04", icon: AlertTriangle, iconBg: "bg-rose-100", iconColor: "text-rose-500" },
];

type Props = { event: Event };

export function EventOverviewTab({ event }: Props) {
  const router = useRouter();
  const startDate = event.start_date
    ? new Date(event.start_date).toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      })
    : "—";

  const timeRange = [event.start_time, event.end_time].filter(Boolean).join(" – ") || null;

  return (
    <div className="flex flex-col gap-6">
      {/* Hero image + About */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Image */}
        <div className="relative h-64 overflow-hidden rounded-xl bg-muted">
          {event.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.image}
              alt={event.name}
              className="h-full w-full object-cover"
            />
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

          {/* Real Google Map */}
          <GoogleMapPreview
            latitude={event.latitude}
            longitude={event.longitude}
            className="h-32 mt-1"
          />
        </div>
      </div>

      {/* Stats — icon left, value + label right */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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

      {/* Attendee Complaints */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface">
        <div className="flex flex-wrap items-center gap-3 px-5 pt-5">
          <h3 className="font-semibold text-black mr-auto">Attendee Complaint</h3>
          <div className="relative">
            <input
              type="search"
              placeholder="Search"
              className="h-9 w-44 rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
          {["Location", "Status", "Type", "Date Range"].map((f) => (
            <button key={f} type="button" className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-body hover:bg-muted/40 transition-colors">
              {f} ×
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px]">
            <thead>
              <tr className="border-y border-border bg-muted/30">
                {["User ID", "Email Address", "Date", "Issue", "Status", "Action"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPLAINTS.map((c, idx) => (
                <tr key={idx} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4 text-xs font-mono text-muted-foreground">{c.userId}</td>
                  <td className="px-5 py-4 text-sm text-body">{c.email}</td>
                  <td className="px-5 py-4 text-sm text-body">{c.date}</td>
                  <td className="px-5 py-4 text-sm text-body">{c.issue}</td>
                  <td className="px-5 py-4">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", c.status === "Opened" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500")}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button type="button" className="text-muted-foreground hover:text-black">···</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
