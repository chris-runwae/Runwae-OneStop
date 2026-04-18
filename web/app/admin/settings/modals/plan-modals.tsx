"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { SettingsToggle } from "../components/settings-toggle";
import { cn } from "@/lib/utils";

function ModalShell({ title, open, onClose, children }: {
  title: string; open: boolean; onClose: () => void; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
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

/* ─── Create / Edit Subscription Plan ─── */
type PlanFormProps = { open: boolean; onClose: () => void; initial?: { name: string; price: string; description: string } };

export function CreatePlanModal({ open, onClose }: PlanFormProps) {
  return <PlanForm title="Create Subscription Plan" open={open} onClose={onClose} />;
}

export function EditPlanModal({ open, onClose, initial }: PlanFormProps) {
  return <PlanForm title="Edit Subscription Plans" open={open} onClose={onClose} initial={initial} />;
}

function PlanForm({ title, open, onClose, initial }: { title: string } & PlanFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [features, setFeatures] = useState<{ label: string; enabled: boolean }[]>([
    { label: "Event creation", enabled: true },
    { label: "Vendor access", enabled: false },
    { label: "Analytics dashboard", enabled: false },
    { label: "Priority support", enabled: false },
  ]);
  const [newFeature, setNewFeature] = useState("");

  return (
    <ModalShell title={title} open={open} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <Field label="Plan Name" value={name} onChange={setName} placeholder="e.g. Pro Plan" />
        <Field label="Description" value={description} onChange={setDescription} placeholder="Brief description" />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-body">Price</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="h-10 w-full rounded-lg border border-border bg-background pl-7 pr-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-body">Plan Features</label>
          {features.map((f, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="text-sm text-black">{f.label}</span>
              <div className="flex items-center gap-2">
                <SettingsToggle
                  size="sm"
                  checked={f.enabled}
                  onChange={(v) => setFeatures((prev) => prev.map((item, idx) => idx === i ? { ...item, enabled: v } : item))}
                />
                <button
                  type="button"
                  onClick={() => setFeatures((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="New feature name…"
              className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
            <button
              type="button"
              onClick={() => { if (newFeature.trim()) { setFeatures((p) => [...p, { label: newFeature.trim(), enabled: true }]); setNewFeature(""); } }}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-body hover:bg-muted/40 transition-colors">
          Cancel
        </button>
        <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
          {title.startsWith("Edit") ? "Save Changes" : "Create Plan"}
        </button>
      </div>
    </ModalShell>
  );
}

/* ─── Add Feature ─── */
export function AddFeatureModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [feature, setFeature] = useState("");
  return (
    <ModalShell title="Add Feature" open={open} onClose={onClose}>
      <Field label="Feature Name" value={feature} onChange={setFeature} placeholder="e.g. Custom Branding" />
      <button
        type="button"
        onClick={onClose}
        className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
      >
        Add Feature
      </button>
    </ModalShell>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-body">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
      />
    </div>
  );
}
