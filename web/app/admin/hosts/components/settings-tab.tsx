import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Event } from "@/lib/supabase/events";

const approvalItems = [
  { label: "Basic Info Form", value: "—", done: false },
  { label: "License / Docs", value: "—", done: false },
  { label: "Host Application", value: "—", done: false },
  { label: "Identity Verification", value: "—", done: false },
  { label: "Event Approval", value: "—", done: false },
];

type Props = { events: Event[] };

export function SettingsTab({ events }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* Host Approval & Identity */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="font-semibold text-black">Host Approval and Identity</h3>
        <p className="mt-1 text-xs text-muted-foreground">Review and manage host verification steps.</p>

        <div className="mt-5 flex flex-col gap-3">
          {approvalItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2
                  className={cn("size-4 shrink-0", item.done ? "text-emerald-500" : "text-muted-foreground/40")}
                />
                <span className="text-sm font-medium text-black">{item.label}</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue and Commission Control */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="font-semibold text-black">Revenue and Commission Control</h3>
        <p className="mt-1 text-xs text-muted-foreground">Manage per-event commission rates and host revenue splits.</p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-125">
            <thead>
              <tr className="border-y border-border bg-muted/30">
                {["Event Name", "Event Status", "Host Application", "Identity Verification"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-muted-foreground">No events yet.</td>
                </tr>
              ) : events.map((ev) => {
                const status = (ev.status ?? "draft").toLowerCase();
                const isActive = status === "published";
                return (
                  <tr key={ev.id} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-black">{ev.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                          isActive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
                        )}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-body">—</td>
                    <td className="px-4 py-3 text-sm text-body">—</td>
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
