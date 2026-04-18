"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AcceptedSuccessModal({ open, onClose }: Props) {
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
      <div className={cn("relative w-full max-w-xs rounded-2xl bg-white p-8 shadow-xl text-center transition-all duration-200", show ? "scale-100 opacity-100" : "scale-95 opacity-0")}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-black transition-colors"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center justify-center mb-5">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary">
            <CheckCircle2 className="size-10 text-white" strokeWidth={2} />
          </div>
        </div>

        <h2 className="font-display text-xl font-bold text-black">Accepted Vendor!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The Vendor's vendor verification has been updated.
        </p>
      </div>
    </div>
  );
}
