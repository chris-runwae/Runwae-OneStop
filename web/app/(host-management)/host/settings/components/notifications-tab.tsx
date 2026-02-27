"use client";

import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface NotificationOption {
  id: string;
  title: string;
  description: string;
  defaultChecked: boolean;
}

const defaultOptions: NotificationOption[] = [
  {
    id: "new-bookings",
    title: "New Bookings",
    description: "Get notified when someone books tickets for your event.",
    defaultChecked: true,
  },
  {
    id: "payout-updates",
    title: "Payout Updates",
    description: "Receive updates about your payouts and earnings.",
    defaultChecked: false,
  },
  {
    id: "event-reminders",
    title: "Event Reminders",
    description: "Get reminders before your events start.",
    defaultChecked: false,
  },
  {
    id: "booking-confirmations",
    title: "Booking Confirmations",
    description: "Send confirmation emails to attendees.",
    defaultChecked: true,
  },
  {
    id: "event-updates",
    title: "Event Updates",
    description: "Get notified about changes to your events.",
    defaultChecked: true,
  },
  {
    id: "weekly-summary",
    title: "Weekly Summary",
    description: "Receive a weekly summary of your performance.",
    defaultChecked: true,
  },
  {
    id: "marketing-emails",
    title: "Marketing Emails",
    description: "Tips and best practices for event hosts.",
    defaultChecked: true,
  },
];

export default function NotificationsTab() {
  const [options, setOptions] = useState(() =>
    defaultOptions.map((opt) => ({ ...opt, checked: opt.defaultChecked })),
  );

  const setChecked = (id: string, checked: boolean) => {
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, checked } : o)),
    );
  };

  const handleSave = () => {
    // TODO: persist to API
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight text-black sm:text-2xl">
          Notification Preferences
        </h2>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          Choose which notifications you want to receive.
        </p>
      </div>

      <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-border bg-surface sm:rounded-2xl">
        {options.map((option, index) => (
          <div
            key={option.id}
            className={`flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-5 ${
              index < options.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-semibold text-heading">
                {option.title}
              </p>
              <p className="mt-0.5 text-sm font-medium text-muted-foreground">
                {option.description}
              </p>
            </div>
            <div className="mt-3 shrink-0 sm:mt-0">
              <Switch
                checked={option.checked}
                onCheckedChange={(checked) => setChecked(option.id, checked)}
                aria-label={`Toggle ${option.title}`}
              />
            </div>
          </div>
        ))}
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
