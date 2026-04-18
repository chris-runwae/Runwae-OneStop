"use client";

import { X, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export type Vendor = {
  id: string;
  businessName: string;
  type: string;
  location: string;
  partnership: number;
  totalBookings: number;
  totalRevenue: string;
  status: "Active" | "Inactive" | "Pending";
  contactInfo: string;
  website: string;
  dateRange: string;
};

const qualityChecks = [
  { label: "Photo uploaded", value: "100" },
  { label: "Photo Resolution", value: "Okay" },
  { label: "Pricing Info Listed", value: "Completed" },
  { label: "Contact details", value: "Verified" },
];

const docs = [
  { name: "Business Licence.pdf", ext: "pdf" },
  { name: "Tax Document.txt", ext: "txt" },
];

type Props = {
  vendor: Vendor | null;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
};

export function VendorDetailPanel({ vendor, onClose, onApprove, onReject }: Props) {
  if (!vendor) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <p className="font-mono text-xs text-muted-foreground">{vendor.id}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">{vendor.dateRange}</span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                  vendor.status === "Active"
                    ? "bg-emerald-50 text-emerald-700"
                    : vendor.status === "Pending"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-gray-100 text-gray-500",
                )}
              >
                Ven {vendor.status}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-black transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {/* Business Information */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-black">Business Information</h3>
            <dl className="flex flex-col gap-2">
              {[
                { label: "Business Name", value: vendor.businessName },
                { label: "Business Type", value: vendor.type },
                { label: "Location", value: vendor.location },
                { label: "Contact Info", value: vendor.contactInfo },
                { label: "Website", value: vendor.website },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <dt className="text-xs text-muted-foreground">{item.label}</dt>
                  <dd className="text-xs font-medium text-black text-right max-w-[55%] truncate">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Vendor Documents */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-black">Vendor Document</h3>
            <div className="flex flex-col gap-2">
              {docs.map((doc) => (
                <div
                  key={doc.name}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="size-4 text-primary" />
                    <span className="text-xs font-medium text-black">{doc.name}</span>
                  </div>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-black transition-colors"
                    aria-label={`Download ${doc.name}`}
                  >
                    <Download className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Picture Quality Check */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-black">Picture Quality check</h3>
            <div className="flex flex-col gap-2">
              {qualityChecks.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-xs font-medium text-black">{item.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-3 border-t border-border p-5">
          <button
            type="button"
            onClick={onApprove}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Approve Vendor
          </button>
          <button
            type="button"
            onClick={onReject}
            className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-body hover:bg-muted/40 transition-colors"
          >
            Reject Vendor
          </button>
        </div>
      </div>
    </>
  );
}
