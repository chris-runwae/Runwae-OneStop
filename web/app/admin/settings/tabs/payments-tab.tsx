"use client";

import { useState } from "react";
import { SectionHeader, SettingsField, SettingsToggle } from "../components/settings-toggle";

export function PaymentsTab() {
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [autoPayouts, setAutoPayouts] = useState(true);
  const [instantPayouts, setInstantPayouts] = useState(false);
  const [refundsEnabled, setRefundsEnabled] = useState(true);

  return (
    <div className="flex flex-col gap-8">
      {/* Stripe Integration */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <SectionHeader title="Stripe Integration" description="Connect and configure your Stripe payment gateway." />
        <div className="mt-4 flex flex-col gap-4">
          <SettingsField label="Enable Stripe" description="Process payments through Stripe.">
            <SettingsToggle checked={stripeEnabled} onChange={setStripeEnabled} />
          </SettingsField>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-body">Stripe Publishable Key</label>
            <input
              type="text"
              defaultValue="pk_live_••••••••••••••••••••••••"
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-body">Stripe Secret Key</label>
            <input
              type="password"
              defaultValue="sk_live_secret"
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>

          <div className="flex items-center gap-3">
            <button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
              Test Connection
            </button>
            <button type="button" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100 transition-colors">
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <SectionHeader title="Payment Settings" description="Configure payout and refund behaviour." />
        <div className="mt-4 flex flex-col gap-4">
          <SettingsField label="Automatic Payouts" description="Automatically transfer earnings to hosts/vendors.">
            <SettingsToggle checked={autoPayouts} onChange={setAutoPayouts} />
          </SettingsField>
          <SettingsField label="Instant Payouts" description="Enable same-day payouts (additional fees may apply).">
            <SettingsToggle checked={instantPayouts} onChange={setInstantPayouts} />
          </SettingsField>
          <SettingsField label="Enable Refunds" description="Allow admins to issue refunds to attendees.">
            <SettingsToggle checked={refundsEnabled} onChange={setRefundsEnabled} />
          </SettingsField>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-body">Refund Window (days)</label>
            <input
              type="number"
              defaultValue={14}
              className="h-10 w-40 rounded-lg border border-border bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-body hover:bg-muted/40 transition-colors">
          Cancel
        </button>
        <button type="button" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}
