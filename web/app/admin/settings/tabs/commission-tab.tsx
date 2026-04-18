"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { SectionHeader } from "../components/settings-toggle";

export function CommissionTab() {
  const [baseCommission, setBaseCommission] = useState("10");
  const [dropCommission, setDropCommission] = useState("5");
  const [vendorCommission, setVendorCommission] = useState("8");
  const [revenueDeduction, setRevenueDeduction] = useState("2");

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-xl border border-border bg-surface p-6">
        <SectionHeader title="Commission Info" description="Set platform-wide commission rates applied to all transactions." />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <CommissionField
            label="Base Commission"
            description="Default rate applied to all bookings."
            value={baseCommission}
            onChange={setBaseCommission}
          />
          <CommissionField
            label="Drop Commissions"
            description="Rate reduction for high-volume hosts."
            value={dropCommission}
            onChange={setDropCommission}
          />
          <CommissionField
            label="Vendor Commission"
            description="Commission taken from vendor payouts."
            value={vendorCommission}
            onChange={setVendorCommission}
          />
          <CommissionField
            label="Revenue Deductions"
            description="Platform operating cost deduction."
            value={revenueDeduction}
            onChange={setRevenueDeduction}
          />
        </div>

        {/* Warning */}
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-700">
            <span className="font-semibold">Warning:</span> Changing commission rates will affect all existing and future bookings. Changes take effect immediately — Apr 18, 2026. Review all active host contracts before saving.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <SectionHeader title="Rate Summary" description="Effective breakdown of all commission rules." />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-border">
                {["Type", "Rate", "Applies To"].map((h) => (
                  <th key={h} className="pb-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { type: "Base Commission", rate: `${baseCommission}%`, applies: "All bookings" },
                { type: "Drop Commission", rate: `${dropCommission}%`, applies: "High-volume hosts" },
                { type: "Vendor Commission", rate: `${vendorCommission}%`, applies: "Vendor payouts" },
                { type: "Revenue Deduction", rate: `${revenueDeduction}%`, applies: "Gross revenue" },
              ].map((row) => (
                <tr key={row.type} className="border-b border-border last:border-0">
                  <td className="py-3 text-sm font-medium text-black">{row.type}</td>
                  <td className="py-3 text-sm font-semibold text-primary">{row.rate}</td>
                  <td className="py-3 text-sm text-body">{row.applies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-body hover:bg-muted/40 transition-colors">
          Cancel
        </button>
        <button type="button" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function CommissionField({ label, description, value, onChange }: {
  label: string; description: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-black">{label}</label>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="relative mt-1">
        <input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-background pr-8 pl-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
      </div>
    </div>
  );
}
