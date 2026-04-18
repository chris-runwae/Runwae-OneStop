"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  vendorName: string;
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
};

export function AcceptVendorModal({ vendorName, open, onClose, onAccept }: Props) {
  const [markVerified, setMarkVerified] = useState(true);
  const [sendWelcome, setSendWelcome] = useState(true);
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (open) requestAnimationFrame(() => setShow(true));
    else setShow(false);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200", show ? "opacity-100" : "opacity-0")}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className={cn("w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl transition-all duration-200", show ? "scale-100 opacity-100" : "scale-95 opacity-0")}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-black">Accept Vendor</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-black transition-colors">
            <X className="size-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Ensure you are sure before clicking to accept this.
        </p>

        <div className="flex flex-col gap-4">
          <ToggleRow
            label="Mark Vendor as Verified"
            description="Mark vendor as fully ready to serve."
            checked={markVerified}
            onChange={setMarkVerified}
          />
          <ToggleRow
            label="Send Welcome Email"
            description="Send welcome onboarding email to newly verified"
            checked={sendWelcome}
            onChange={setSendWelcome}
          />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-black">Send Message</label>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Write a message to the vendor…"
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onAccept}
          className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          Accept Vendor
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-black">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none",
          checked ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}
