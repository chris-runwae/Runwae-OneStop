"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  hostName: string;
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export function SuspendModal({ hostName, open, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-rose-50">
            <AlertTriangle className="size-6 text-rose-500" />
          </div>
          <h2 className="font-display text-lg font-bold text-black">Suspend Host</h2>
          <p className="text-sm text-muted-foreground">
            You are about to suspend{" "}
            <span className="font-medium text-black">{hostName}</span>. They will lose access to
            the platform immediately.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-body">Reason for suspension</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Describe why this host is being suspended…"
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-body hover:bg-muted/40 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!reason.trim()}
            onClick={() => { onConfirm(reason); onClose(); }}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition-colors",
              reason.trim()
                ? "bg-rose-500 hover:bg-rose-600"
                : "bg-rose-300 cursor-not-allowed",
            )}
          >
            Confirm Suspension
          </button>
        </div>
      </div>
    </div>
  );
}
