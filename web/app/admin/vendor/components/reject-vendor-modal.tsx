"use client";

import { useState } from "react";
import { X } from "lucide-react";

const REJECTION_REASONS = [
  "Incomplete documentation",
  "Failed identity verification",
  "Duplicate account",
  "Suspicious activity",
  "Policy violation",
  "Other",
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onReject: (reason: string) => void;
};

export function RejectVendorModal({ open, onClose, onReject }: Props) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-black">Reject Vendor</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-black transition-colors">
            <X className="size-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Ensure you are sure before clicking to reject this vendor.
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-black">Reason for Rejection</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-body focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            <option value="">Select reason…</option>
            {REJECTION_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-body hover:bg-muted/40 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!reason}
            onClick={() => { onReject(reason); onClose(); }}
            className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-40 transition-colors"
          >
            Reject Vendor
          </button>
        </div>
      </div>
    </div>
  );
}
