"use client";

import { X, MoreHorizontal, Hotel, Plane, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Booking = {
  id: string;
  bookingRef: string;
  eventName: string;
  hostName: string;
  vendorName: string;
  attendeeName: string;
  bookingType: "Hotel" | "Flight" | "Activity";
  bookingDate: string;
  status: "Confirmed" | "Pending" | "Cancelled" | "Refunded";
  dateTime: string;
  totalRevenue: string;
  platformCommission: string;
  hostBreakdown: string;
  vendorPayout: string;
};

const BOOKING_TYPE_ICON: Record<Booking["bookingType"], React.ElementType> = {
  Hotel: Hotel,
  Flight: Plane,
  Activity: Activity,
};

const STATUS_STYLES: Record<Booking["status"], string> = {
  Confirmed: "text-emerald-600",
  Pending: "text-amber-600",
  Cancelled: "text-rose-500",
  Refunded: "text-gray-500",
};

const PANEL_ACTIONS = [
  "Issue Refund",
  "Cancel Booking",
  "Contact Attendee",
  "Contact Host",
  "Contact Vendor",
  "Download Receipt",
] as const;

type Props = {
  booking: Booking | null;
  onClose: () => void;
  onDownloadReceipt: () => void;
  onCancelBooking: () => void;
};

export function BookingDetailPanel({ booking, onClose, onDownloadReceipt, onCancelBooking }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (booking) requestAnimationFrame(() => setShow(true));
    else setShow(false);
  }, [booking]);

  if (!booking) return null;

  const TypeIcon = BOOKING_TYPE_ICON[booking.bookingType];

  return (
    <>
      <div
        className={cn("fixed inset-0 z-40 bg-black/40 transition-opacity duration-300", show ? "opacity-100" : "opacity-0")}
        onClick={onClose}
        aria-hidden
      />

      <div className={cn(
        "fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-out",
        show ? "translate-x-0" : "translate-x-full",
      )}>
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <h2 className="font-display text-lg font-bold text-black">{booking.bookingRef}</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{booking.dateTime}</span>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {booking.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-black hover:bg-muted/40 transition-colors"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                {PANEL_ACTIONS.map((action) => (
                  <DropdownMenuItem
                    key={action}
                    className={cn(
                      "cursor-pointer text-sm",
                      (action === "Cancel Booking" || action === "Issue Refund") && "text-rose-500 focus:text-rose-500",
                    )}
                    onSelect={() => {
                      if (action === "Download Receipt") onDownloadReceipt();
                      if (action === "Cancel Booking") onCancelBooking();
                    }}
                  >
                    {action}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-black hover:bg-muted/40 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {/* Booking Overview */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-black">Booking Overview</h3>
            <dl className="flex flex-col gap-2.5">
              <DetailRow label="Booking ID" value={<span className="font-mono text-xs">{booking.bookingRef}</span>} />
              <DetailRow label="Booking Date" value={booking.bookingDate} />
              <DetailRow
                label="Booking Type"
                value={
                  <span className="flex items-center gap-1.5 text-sm font-medium text-black">
                    <TypeIcon className="size-3.5 text-muted-foreground" />
                    {booking.bookingType}
                  </span>
                }
              />
              <DetailRow
                label="Booking Status"
                value={
                  <span className={cn("flex items-center gap-1.5 text-xs font-medium", STATUS_STYLES[booking.status])}>
                    <span className="size-1.5 rounded-full bg-current" />
                    {booking.status}
                  </span>
                }
              />
            </dl>
          </section>

          <div className="border-t border-border" />

          {/* Events & Participants */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-black">Events &amp; Participants</h3>
            <dl className="flex flex-col gap-2.5">
              <DetailRow label="Event Name" value={booking.eventName} />
              <DetailRow label="Host Name" value={booking.hostName} />
              <DetailRow label="Vendor Name" value={booking.vendorName} />
              <DetailRow label="Attendee Name" value={booking.attendeeName} />
            </dl>
          </section>

          <div className="border-t border-border" />

          {/* Financial Breakdown */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-black">Financial Breakdown</h3>
            <dl className="flex flex-col gap-2.5">
              <DetailRow label="Total Revenue" value={<span className="font-semibold text-black">{booking.totalRevenue}</span>} />
              <DetailRow label="Platform Commission" value={booking.platformCommission} />
              <DetailRow label="Host Breakdown" value={booking.hostBreakdown} />
              <DetailRow label="Vendor Payout" value={booking.vendorPayout} />
            </dl>
          </section>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-3 border-t border-border p-5">
          <button
            type="button"
            onClick={onDownloadReceipt}
            className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-body hover:bg-muted/40 transition-colors"
          >
            Download Receipt
          </button>
          <button
            type="button"
            onClick={onCancelBooking}
            className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white hover:bg-rose-600 transition-colors"
          >
            Cancel Booking
          </button>
        </div>
      </div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="text-right text-xs font-medium text-black">{value}</dd>
    </div>
  );
}
