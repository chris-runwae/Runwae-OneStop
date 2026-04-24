"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

const SESSION_OPTIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "120", label: "2 hours" },
];

export default function SecuritySettingsTab() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");

  const sessionLabel =
    SESSION_OPTIONS.find((o) => o.value === sessionTimeout)?.label ??
    "30 minutes";

  const handleSave = () => {
    // TODO: persist to API
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight text-black sm:text-2xl">
          Security Settings
        </h2>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          Manage recovery and security options for your account.
        </p>
      </div>

      <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-border bg-surface sm:rounded-2xl">
        <div className="border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <h3 className="font-display text-base font-semibold text-heading">
            Recovery Settings
          </h3>
        </div>

        <div className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-5 border-b border-border">
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-semibold text-heading">
              Two-Factor Authentication
            </p>
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          <div className="mt-3 shrink-0 sm:mt-0">
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
              aria-label="Toggle two-factor authentication"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-5 border-b border-border">
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-semibold text-heading">
              Login Alerts
            </p>
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">
              Get notified of new login attempts
            </p>
          </div>
          <div className="mt-3 shrink-0 sm:mt-0">
            <Switch
              checked={loginAlertsEnabled}
              onCheckedChange={setLoginAlertsEnabled}
              aria-label="Toggle login alerts"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-5">
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-semibold text-heading">
              Session Timeout
            </p>
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">
              Automatically sign out after a period of inactivity
            </p>
          </div>
          <div className="mt-2 shrink-0 sm:mt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-border-light focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {sessionLabel}
                  <ChevronDownIcon className="size-4 shrink-0" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                {SESSION_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onSelect={() => setSessionTimeout(opt.value)}
                    className="cursor-pointer"
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
