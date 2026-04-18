import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Total Hosts", value: "320", trend: "+12% MoM", up: true },
  { label: "Active Hosts", value: "200", trend: "+8% MoM", up: true },
  { label: "Pending Approval", value: "100", trend: "-3% MoM", up: false },
  { label: "Suspended", value: "102", trend: "+2% MoM", up: false },
];

export function HostsStats() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
          <p className="mt-3 font-display text-2xl font-bold text-black">{s.value}</p>
          <p
            className={cn(
              "mt-1.5 flex items-center gap-1 text-xs font-medium",
              s.up ? "text-emerald-600" : "text-rose-500",
            )}
          >
            {s.up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {s.trend}
          </p>
        </div>
      ))}
    </div>
  );
}
