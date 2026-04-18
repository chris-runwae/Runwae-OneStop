"use client";

import { useState } from "react";
import { VendorStats } from "./components/vendor-stats";
import { VendorsTable } from "./components/vendors-table";
import { VendorDetailPanel, type Vendor } from "./components/vendor-detail-panel";
import { AcceptVendorModal } from "./components/accept-vendor-modal";
import { RejectVendorModal } from "./components/reject-vendor-modal";
import { AcceptedSuccessModal } from "./components/accepted-success-modal";

type Modal = "none" | "accept" | "reject" | "success";

export default function AdminVendorPage() {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [modal, setModal] = useState<Modal>("none");

  const handleAccept = () => {
    setModal("none");
    setSelectedVendor(null);
    setModal("success");
  };

  const handleReject = (_reason: string) => {
    setSelectedVendor(null);
  };

  return (
    <>
      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-black">Vendors</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage Vendors and their activities.</p>
        </div>
        <VendorStats />
        <VendorsTable onSelectVendor={setSelectedVendor} />
      </div>

      {/* Detail slide-in panel */}
      <VendorDetailPanel
        vendor={selectedVendor}
        onClose={() => setSelectedVendor(null)}
        onApprove={() => setModal("accept")}
        onReject={() => setModal("reject")}
      />

      {/* Accept modal */}
      <AcceptVendorModal
        vendorName={selectedVendor?.businessName ?? ""}
        open={modal === "accept"}
        onClose={() => setModal("none")}
        onAccept={handleAccept}
      />

      {/* Reject modal */}
      <RejectVendorModal
        open={modal === "reject"}
        onClose={() => setModal("none")}
        onReject={handleReject}
      />

      {/* Success modal */}
      <AcceptedSuccessModal
        open={modal === "success"}
        onClose={() => setModal("none")}
      />
    </>
  );
}
