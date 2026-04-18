"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { SettingsToggle } from "../components/settings-toggle";
import { CreatePlanModal, EditPlanModal, AddFeatureModal } from "../modals/plan-modals";
import { cn } from "@/lib/utils";

type Feature = { label: string; free: boolean; creator: boolean };
type Plan = { name: string; price: string; description: string };

const DEFAULT_FEATURES: Feature[] = [
  { label: "Event creation", free: true, creator: true },
  { label: "Vendor access", free: false, creator: true },
  { label: "Analytics dashboard", free: false, creator: true },
  { label: "Priority support", free: false, creator: true },
  { label: "Custom branding", free: false, creator: true },
  { label: "Team members", free: false, creator: true },
];

const DEFAULT_PLANS: Plan[] = [
  { name: "Free Plan", price: "$0", description: "Basic access for all users" },
  { name: "Creator Plan", price: "$29/mo", description: "Advanced tools for event creators" },
];

export function SubscriptionTab() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addFeatureOpen, setAddFeatureOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | undefined>();
  const [features, setFeatures] = useState<Feature[]>(DEFAULT_FEATURES);

  const toggle = (idx: number, col: "free" | "creator") => {
    setFeatures((prev) => prev.map((f, i) => i === idx ? { ...f, [col]: !f[col] } : f));
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Manage subscription tiers and feature access.</p>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" /> Add Plan
          </button>
        </div>

        {/* Plans grid */}
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground">Features</th>
                {DEFAULT_PLANS.map((plan) => (
                  <th key={plan.name} className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-semibold text-black">{plan.name}</span>
                      <span className="text-xs font-bold text-primary">{plan.price}</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <button
                          type="button"
                          onClick={() => { setEditPlan(plan); setEditOpen(true); }}
                          className="text-muted-foreground hover:text-black transition-colors"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button type="button" className="text-muted-foreground hover:text-rose-500 transition-colors">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr key={f.label} className="border-b border-border last:border-0">
                  <td className="px-6 py-3 text-sm text-body">{f.label}</td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center">
                      <SettingsToggle size="sm" checked={f.free} onChange={() => toggle(i, "free")} />
                    </div>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center">
                      <SettingsToggle size="sm" checked={f.creator} onChange={() => toggle(i, "creator")} />
                    </div>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} className="px-6 py-3">
                  <button
                    type="button"
                    onClick={() => setAddFeatureOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  >
                    <Plus className="size-3.5" /> Add Feature
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button type="button" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      <CreatePlanModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditPlanModal open={editOpen} onClose={() => setEditOpen(false)} initial={editPlan} />
      <AddFeatureModal open={addFeatureOpen} onClose={() => setAddFeatureOpen(false)} />
    </>
  );
}
