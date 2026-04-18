"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Booking } from "./booking-detail-panel";

type Props = {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
};

export function DownloadReceiptModal({ booking, open, onClose }: Props) {
  const [show, setShow] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (open) requestAnimationFrame(() => setShow(true));
    else setShow(false);
  }, [open]);

  if (!open || !booking) return null;

  const receiptId = `RWE-${booking.bookingRef.replace(/\W/g, "").toUpperCase().slice(0, 8)}`;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const [{ pdf }, { ReceiptPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./receipt-pdf"),
      ]);

      const blob = await pdf(
        // @ts-expect-error — createElement mismatch between react-pdf and react types
        ReceiptPDF({ booking, receiptId })
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt_${receiptId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      console.error("Failed to generate receipt PDF:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200", show ? "opacity-100" : "opacity-0")}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className={cn(
        "w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl transition-all duration-200",
        show ? "scale-100 opacity-100" : "scale-95 opacity-0",
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-lg font-bold text-black">Download Receipt</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-black transition-colors">
            <X className="size-5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-5">Download and share your booking receipt</p>

        {/* Receipt preview */}
        <div className="rounded-xl border border-border bg-muted/20 p-5">
          <p className="text-center text-sm font-semibold text-black mb-4">Booking Receipt</p>
          <dl className="flex flex-col gap-2.5">
            {[
              { label: "Receipt ID", value: receiptId },
              { label: "Booking #", value: booking.bookingRef },
              { label: "Date issued", value: booking.bookingDate },
              { label: "Event Name", value: booking.eventName },
              { label: "Booking Type", value: booking.bookingType },
              { label: "Total", value: booking.totalRevenue },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <dt className="text-xs text-muted-foreground">{item.label}</dt>
                <dd className="text-xs font-medium text-black">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {downloading ? "Generating…" : "Download Receipt"}
        </button>
      </div>
    </div>
  );
}
