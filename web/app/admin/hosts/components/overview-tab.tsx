import { CalendarDays, CreditCard } from "lucide-react";

export function OverviewTab() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* About */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
        <h3 className="font-semibold text-black">About</h3>
        <p className="text-sm leading-relaxed text-body">
          Christopher Jones is a seasoned event host specialising in large-scale music and cultural
          festivals across West Africa and Europe. With over 8 years of experience, he has
          successfully produced events attracting tens of thousands of attendees.
        </p>
      </div>

      {/* Event Metrics */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
        <h3 className="font-semibold text-black">Event Metrics</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Events", value: "24" },
            { label: "LUXE", value: "$480K" },
            { label: "BUDGET", value: "$97" },
          ].map((m) => (
            <div key={m.label} className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="font-display text-xl font-bold text-black">{m.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-2 flex gap-3">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">LUXE</span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">BUDGET</span>
        </div>
      </div>

      {/* Registration Details */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
        <h3 className="font-semibold text-black">Registration Details</h3>
        <dl className="flex flex-col gap-3">
          {[
            { label: "Host ID", value: "HST-0001" },
            { label: "Joined", value: "January 15, 2024" },
            { label: "Organisation", value: "AfroNation Ltd" },
            { label: "Country", value: "Nigeria" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <dt className="text-sm text-muted-foreground">{item.label}</dt>
              <dd className="text-sm font-medium text-black">{item.value}</dd>
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
              <p className="text-xs text-muted-foreground">Last Login</p>
              <p className="text-sm font-medium text-black">April 17, 2026 — 10:32 AM</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <CreditCard className="size-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Payment Method</p>
              <p className="text-sm font-medium text-black">Visa •••• 4242</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
