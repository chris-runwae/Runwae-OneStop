"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── shared helpers ─── */

function ModalShell({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-black">{title}</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-black transition-colors">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
        checked ? "bg-primary" : "bg-muted",
      )}
    >
      <span className={cn("inline-block h-5 w-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-5" : "translate-x-0")} />
    </button>
  );
}

function PrimaryBtn({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mt-5 w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors",
        danger ? "bg-rose-500 hover:bg-rose-600" : "bg-primary hover:bg-primary/90",
      )}
    >
      {label}
    </button>
  );
}

/* ─── Create New Support Ticket ─── */
export function CreateTicketModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ModalShell title="Create New Support Ticket" open={open} onClose={onClose}>
      <p className="mb-4 text-sm text-muted-foreground">Fill in the details to open a new ticket.</p>
      <div className="flex flex-col gap-3">
        <Field label="User Email" placeholder="user@example.com" />
        <Field label="Subject" placeholder="Brief issue description" />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-body">Category</label>
          <select className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-body focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50">
            {["Refund", "Booking", "Account", "Vendor", "Technical", "General"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-body">Priority</label>
          <select className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-body focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50">
            {["High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-body">Description</label>
          <textarea
            rows={3}
            placeholder="Describe the issue in detail…"
            className="resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
      </div>
      <PrimaryBtn label="Create Ticket" onClick={onClose} />
    </ModalShell>
  );
}

/* ─── Issue a Refund ─── */
export function IssueRefundModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [notify, setNotify] = useState(true);
  return (
    <ModalShell title="Issue A Refund" open={open} onClose={onClose}>
      <p className="mb-4 text-sm text-muted-foreground">Review and confirm the refund details below.</p>
      <div className="flex flex-col gap-3">
        <Field label="Booking ID" placeholder="#N0045" />
        <Field label="Refund Amount ($)" placeholder="0.00" type="number" />
        <Field label="Reason" placeholder="Reason for refund" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-black">Notify Attendee</p>
            <p className="text-xs text-muted-foreground">Send email confirmation to user</p>
          </div>
          <Toggle checked={notify} onChange={setNotify} />
        </div>
      </div>
      <PrimaryBtn label="Issue Refund" onClick={onClose} />
    </ModalShell>
  );
}

/* ─── Cancel Booking ─── */
export function CancelBookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [notify, setNotify] = useState(true);
  return (
    <ModalShell title="Cancel Booking" open={open} onClose={onClose}>
      <p className="mb-4 text-sm text-muted-foreground">This will cancel the booking and notify all parties.</p>
      <div className="flex flex-col gap-3">
        <Field label="Booking ID" placeholder="#N0045" />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-body">Cancellation Reason</label>
          <select className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-body focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50">
            {["User request", "Fraudulent activity", "Host cancelled", "Vendor unavailable", "Other"].map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-black">Notify All Parties</p>
            <p className="text-xs text-muted-foreground">Send cancellation email to attendee &amp; host</p>
          </div>
          <Toggle checked={notify} onChange={setNotify} />
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-body hover:bg-muted/40 transition-colors">
          Cancel
        </button>
        <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white hover:bg-rose-600 transition-colors">
          Cancel Booking
        </button>
      </div>
    </ModalShell>
  );
}

/* ─── Adjust Vendor Payout ─── */
export function AdjustPayoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ModalShell title="Adjust Vendor Payout" open={open} onClose={onClose}>
      <p className="mb-4 text-sm text-muted-foreground">Manually adjust the vendor payout amount for this booking.</p>
      <div className="flex flex-col gap-3">
        <Field label="Vendor Name" placeholder="e.g. Ryan Hotel" />
        <Field label="Booking ID" placeholder="#N0045" />
        <Field label="Original Payout ($)" placeholder="0.00" type="number" />
        <Field label="Adjusted Payout ($)" placeholder="0.00" type="number" />
        <Field label="Reason for Adjustment" placeholder="Explain the change…" />
      </div>
      <PrimaryBtn label="Adjust Payout" onClick={onClose} />
    </ModalShell>
  );
}

/* ─── Suspend Account ─── */
export function SuspendAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [notify, setNotify] = useState(false);
  return (
    <ModalShell title="Suspend Account" open={open} onClose={onClose}>
      <p className="mb-4 text-sm text-muted-foreground">Suspending will immediately revoke platform access.</p>
      <div className="flex flex-col gap-3">
        <Field label="User ID / Email" placeholder="user@example.com" />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-body">Reason for Suspension</label>
          <select className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-body focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50">
            {["Policy violation", "Fraudulent activity", "User request", "Spam", "Other"].map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-black">Notify User</p>
            <p className="text-xs text-muted-foreground">Send suspension email to account holder</p>
          </div>
          <Toggle checked={notify} onChange={setNotify} />
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-body hover:bg-muted/40 transition-colors">
          Cancel
        </button>
        <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white hover:bg-rose-600 transition-colors">
          Suspend
        </button>
      </div>
    </ModalShell>
  );
}

/* ─── Escalate to Engineering ─── */
export function EscalateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ModalShell title="Escalate to Engineering" open={open} onClose={onClose}>
      <p className="mb-4 text-sm text-muted-foreground">Flag this ticket for the engineering team to investigate.</p>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-body">Severity</label>
          <select className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-body focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50">
            {["Critical", "High", "Medium", "Low"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-body">Description for Engineering</label>
          <textarea
            rows={4}
            placeholder="Describe the technical issue in detail…"
            className="resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <Field label="Affected User ID" placeholder="USR-1001" />
      </div>
      <PrimaryBtn label="Escalate to Engineering" onClick={onClose} />
    </ModalShell>
  );
}

/* ─── shared field ─── */
function Field({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-body">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="h-10 rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
      />
    </div>
  );
}
