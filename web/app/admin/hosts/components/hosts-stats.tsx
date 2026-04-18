"use client";

import { TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminGetAllHosts } from "@/lib/supabase/admin/users";

export function HostsStats() {
  const { data } = useQuery({
    queryKey: ["admin-hosts"],
    queryFn: adminGetAllHosts,
  });

  const total = data?.length ?? 0;

  const stats = [
    { label: "Total Hosts", value: total.toString() },
    { label: "Active Hosts", value: total.toString() },
    { label: "Pending Approval", value: "0" },
    { label: "Suspended", value: "0" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
          <p className="mt-3 font-display text-2xl font-bold text-black">{s.value}</p>
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <TrendingUp className="size-3.5" />
            Live data
          </p>
        </div>
      ))}
    </div>
  );
}
