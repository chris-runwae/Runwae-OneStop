"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (US)" },
  { value: "America/Chicago", label: "Central Time (US)" },
  { value: "America/Denver", label: "Mountain Time (US)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Africa/Lagos", label: "Lagos (WAT)" },
  { value: "Africa/Accra", label: "Accra (GMT)" },
  { value: "Asia/Tokyo", label: "Tokyo" },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
];

function SelectField({
  label,
  placeholder,
  options,
  value,
  onSelect,
}: {
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  value: string;
  onSelect: (value: string) => void;
}) {
  const displayLabel = value
    ? options.find((o) => o.value === value)?.label ?? placeholder
    : placeholder;

  return (
    <div className="flex flex-col gap-2">
      <label className="font-display text-base font-semibold text-heading">
        {label}
      </label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full max-w-md items-center justify-between rounded-lg border border-border bg-surface px-3 py-3 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
              value ? "text-body" : "text-muted-foreground",
            )}
          >
            <span className="truncate">{displayLabel}</span>
            <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[280px] max-h-[280px] overflow-y-auto">
          {options.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onSelect={() => onSelect(opt.value)}
              className="cursor-pointer"
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function PreferencesTab() {
  const [timezone, setTimezone] = useState("");
  const [language, setLanguage] = useState("");

  const handleSave = () => {
    // TODO: persist to API
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight text-black sm:text-2xl">
          Preferences
        </h2>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          Set your timezone and language.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <SelectField
          label="Timezone"
          placeholder="Select Timezone"
          options={TIMEZONE_OPTIONS}
          value={timezone}
          onSelect={setTimezone}
        />
        <SelectField
          label="Language"
          placeholder="Select Language"
          options={LANGUAGE_OPTIONS}
          value={language}
          onSelect={setLanguage}
        />
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
