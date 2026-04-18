"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type PayoutRow = {
  id: string;
  date: string;
  ref: string;
  noOfDays?: number;
  amount: string;
  status: "Success" | "Pending" | "Failed";
};

const EARNING_HISTORY: PayoutRow[] = [
  { id: "1", date: "Apr 15, 2026", ref: "TXN-92811", noOfDays: 7, amount: "$12,400", status: "Success" },
  { id: "2", date: "Mar 30, 2026", ref: "TXN-88234", noOfDays: 14, amount: "$8,200", status: "Success" },
  { id: "3", date: "Mar 15, 2026", ref: "TXN-81192", noOfDays: 7, amount: "$5,600", status: "Pending" },
  { id: "4", date: "Feb 28, 2026", ref: "TXN-77401", noOfDays: 30, amount: "$19,000", status: "Success" },
  { id: "5", date: "Feb 14, 2026", ref: "TXN-70023", noOfDays: 7, amount: "$3,100", status: "Failed" },
];

const PAYOUT_HISTORY: PayoutRow[] = [
  { id: "1", date: "Apr 12, 2026", ref: "PAY-44821", amount: "$10,000", status: "Success" },
  { id: "2", date: "Mar 25, 2026", ref: "PAY-41032", amount: "$7,500", status: "Success" },
  { id: "3", date: "Mar 10, 2026", ref: "PAY-38200", amount: "$5,000", status: "Pending" },
];

const STATUS_STYLES: Record<PayoutRow["status"], string> = {
  Success: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Failed: "bg-rose-50 text-rose-600",
};

const earningStats = [
  { label: "Balance", value: "$67", color: "text-sky-600 bg-sky-50" },
  { label: "Total Earned", value: "$506,350", color: "text-emerald-600 bg-emerald-50" },
  { label: "Total Paid Out", value: "$518,392", color: "text-emerald-600 bg-emerald-50" },
  { label: "Lifetime Gross", value: "$800,943", color: "text-primary bg-primary/10" },
];

export function EarningsTab() {
  const [activeSubTab, setActiveSubTab] = useState<"earning" | "payout">("earning");

  const rows = activeSubTab === "earning" ? EARNING_HISTORY : PAYOUT_HISTORY;

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {earningStats.map((s) => (
          <div key={s.label} className={cn("flex flex-col gap-1 rounded-xl p-5", s.color)}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="font-display text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* History Table */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface">
        <div className="flex items-center gap-4 border-b border-border px-6 pt-5 pb-0">
          {(["earning", "payout"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveSubTab(tab)}
              className={cn(
                "pb-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeSubTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-body",
              )}
            >
              {tab === "earning" ? "Earning History" : "Payout History"}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Date", "Reference", ...(activeSubTab === "earning" ? ["No. of Days"] : []), "Amount", "Status"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-body">{row.date}</td>
                  <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{row.ref}</td>
                  {activeSubTab === "earning" && (
                    <td className="px-6 py-4 text-sm text-body">{row.noOfDays} days</td>
                  )}
                  <td className="px-6 py-4 text-sm font-medium text-black">{row.amount}</td>
                  <td className="px-6 py-4">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_STYLES[row.status])}>
                      {row.status}
                    </span>
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
