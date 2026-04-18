"use client";

import { useState } from "react";
import { BookingsTable } from "./components/bookings-table";
import { BookingDetailPanel, type Booking } from "./components/booking-detail-panel";
import { DownloadReceiptModal } from "./components/download-receipt-modal";

export default function AdminBookingsPage() {
  const [selected, setSelected] = useState<Booking | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-black">Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage bookings and their activities.</p>
        </div>
        <BookingsTable onSelectBooking={setSelected} />
      </div>

      <BookingDetailPanel
        booking={selected}
        onClose={() => setSelected(null)}
        onDownloadReceipt={() => setReceiptOpen(true)}
        onCancelBooking={() => setSelected(null)}
      />

      <DownloadReceiptModal
        booking={selected}
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
      />
    </>
  );
}
