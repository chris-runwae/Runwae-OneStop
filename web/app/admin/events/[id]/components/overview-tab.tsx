import { Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

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
  { label: "Total Sold", value: "1,067", color: "text-emerald-600 bg-emerald-50" },
  { label: "Revenue Generated", value: "$199,382", color: "text-amber-600 bg-amber-50" },
  { label: "Total Checkpoints", value: "1001", color: "text-sky-600 bg-sky-50" },
  { label: "Cancelled", value: "04", color: "text-rose-500 bg-rose-50" },
];

export function EventOverviewTab({ imageUrl }: { imageUrl?: string }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero + About */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="relative h-60 overflow-hidden rounded-xl bg-muted">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="Event" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-black">About Event</h3>
            <button type="button" className="text-xs font-medium text-primary hover:underline">
              Add description
            </button>
          </div>
          <p className="text-sm leading-relaxed text-body">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris.
          </p>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-start gap-3 text-sm text-body">
              <Calendar className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-black">Saturday, November 22, 2025</p>
                <p className="text-xs text-muted-foreground">10:30PM – November 25, 10:05AM</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm text-body">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-black">Landmark, Lagos Nigeria</p>
                <p className="text-xs text-muted-foreground">Plot 2 &amp; 3, Water Corporation Rd</p>
              </div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="h-28 overflow-hidden rounded-lg bg-muted/60 flex items-center justify-center text-xs text-muted-foreground">
            Map Preview
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {overviewStats.map((s) => (
          <div key={s.label} className={cn("flex flex-col gap-1 rounded-xl p-5", s.color)}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="font-display text-2xl font-bold">{s.value}</p>
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
              className="h-9 w-44 rounded-lg border border-border bg-background pl-3 pr-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
          {["Location", "Status", "Type", "Date Range"].map((f) => (
            <button
              key={f}
              type="button"
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-body hover:bg-muted/40 transition-colors"
            >
              {f}
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
                  <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{c.userId}</td>
                  <td className="px-5 py-3 text-sm text-body">{c.email}</td>
                  <td className="px-5 py-3 text-sm text-body">{c.date}</td>
                  <td className="px-5 py-3 text-sm text-body">{c.issue}</td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        c.status === "Opened"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-gray-100 text-gray-500",
                      )}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button type="button" className="text-muted-foreground hover:text-black">
                      ···
                    </button>
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
