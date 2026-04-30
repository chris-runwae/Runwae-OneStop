import { TrendingUp } from "lucide-react";

const stats = [
  { label: "No. of Vendors", value: "760", badge: "This week", trend: "+16.01% from last month" },
  { label: "Active Vendors", value: "520", badge: "This week", trend: "+6.24% from last month" },
  { label: "Inactive Vendors", value: "240", badge: "This week", trend: "+6.13% from last month" },
  { label: "Verified Vendors", value: "520", badge: "This week", trend: "+6.01% from last month" },
];

export function VendorStats() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <span className="rounded-full border border-border px-2 py-0.5 text-2.5 font-medium text-muted-foreground">
              {s.badge}
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-black">{s.value}</p>
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <TrendingUp className="size-3.5" />
            {s.trend}
          </p>
        </div>
      ))}
    </div>
  );
}
