"use client";

import { useState } from "react";
import { SectionHeader, SettingsField, SettingsToggle } from "../components/settings-toggle";

export function GeneralTab() {
  const [platformName, setPlatformName] = useState("Runwae");
  const [adminEmail, setAdminEmail] = useState("admin@runwae.com");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [userRegistration, setUserRegistration] = useState(true);
  const [hostRegistration, setHostRegistration] = useState(true);
  const [vendorRegistration, setVendorRegistration] = useState(true);
  const [emailVerification, setEmailVerification] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      {/* Platform */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <SectionHeader title="Platform Name" description="The public-facing name of the platform." />
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-body">Platform Name</label>
            <input
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-body">Platform Admin Email</label>
            <input
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
        </div>
      </div>

      {/* Logo Configurability */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <SectionHeader title="Logo Configurability" description="Manage platform logo and branding." />
        <div className="mt-4 flex flex-col gap-4">
          <SettingsField label="Maintenance Mode" description="Take the platform offline for maintenance.">
            <SettingsToggle checked={maintenanceMode} onChange={setMaintenanceMode} />
          </SettingsField>
          <SettingsField label="User Registration" description="Allow new users to sign up.">
            <SettingsToggle checked={userRegistration} onChange={setUserRegistration} />
          </SettingsField>
          <SettingsField label="Host Registration" description="Allow new hosts to register.">
            <SettingsToggle checked={hostRegistration} onChange={setHostRegistration} />
          </SettingsField>
          <SettingsField label="Vendor Registration" description="Allow new vendors to register.">
            <SettingsToggle checked={vendorRegistration} onChange={setVendorRegistration} />
          </SettingsField>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <SectionHeader title="Security" description="Authentication and account security settings." />
        <div className="mt-4 flex flex-col gap-4">
          <SettingsField label="Email Verification" description="Require email verification on sign-up.">
            <SettingsToggle checked={emailVerification} onChange={setEmailVerification} />
          </SettingsField>
          <SettingsField label="Two-Factor Authentication" description="Enforce 2FA for admin accounts.">
            <SettingsToggle checked={twoFactor} onChange={setTwoFactor} />
          </SettingsField>
        </div>
      </div>

      {/* Save */}
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
