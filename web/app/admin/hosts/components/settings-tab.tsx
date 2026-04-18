import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const approvalItems = [
  { label: "Basic Info Form", value: "Christopher Jones", done: true },
  { label: "License / Docs", value: "Submitted", done: true },
  { label: "Host Application", value: "Approved", done: true },
  { label: "Identity Verification", value: "Verified", done: true },
  { label: "Event Approval", value: "Pending Review", done: false },
];

const commissionRows = [
  { event: "TechBurst", hostStatus: "Active", hostApplication: "Approved", identityVerification: "Verified" },
  { event: "AfroFest", hostStatus: "Active", hostApplication: "Approved", identityVerification: "Verified" },
  { event: "Night Market", hostStatus: "Pending", hostApplication: "Under Review", identityVerification: "Pending" },
];

export function SettingsTab() {
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
              <span
                className={cn(
                  "text-xs font-medium",
                  item.done ? "text-emerald-600" : "text-amber-600",
                )}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue and Commission Control */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="font-semibold text-black">Revenue and Commission Control</h3>
        <p className="mt-1 text-xs text-muted-foreground">Manage per-event commission rates and host revenue splits.</p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-y border-border bg-muted/30">
                {["Event from Name", "Host Status", "Host Application", "Identity Verification"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {commissionRows.map((row) => (
                <tr key={row.event} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-black">{row.event}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        row.hostStatus === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
                      )}
                    >
                      {row.hostStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-body">{row.hostApplication}</td>
                  <td className="px-4 py-3 text-sm text-body">{row.identityVerification}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
