"use client";

import { cn } from "@/lib/utils";

interface ShowOnEventPageToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ShowOnEventPageToggle({ checked, onChange }: ShowOnEventPageToggleProps) {
  return (
    <div>
      <p className="text-sm font-medium text-body">Show on the Event Page</p>
      <p className="text-sm text-muted-foreground">
        Help them set up their profile so they show up nicely on the event page.
      </p>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "mt-2 inline-flex h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-green-500" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-6" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
