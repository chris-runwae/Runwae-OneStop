"use client";

import { cn } from "@/lib/utils";
import { List } from "lucide-react";

interface ThemeOption {
  id: string;
  name: string;
}

interface ThemeSelectorProps {
  themes: readonly ThemeOption[] | ThemeOption[];
  value: string;
  onChange: (themeId: string) => void;
}

export function ThemeSelector({ themes, value, onChange }: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {themes.map((theme) => {
        const isSelected = value === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => onChange(theme.id)}
            className={cn(
              "group flex aspect-video items-center justify-center rounded-lg border-2 bg-linear-to-br from-primary/10 to-primary/5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
              isSelected
                ? "border-primary ring-2 ring-primary/30"
                : "border-border hover:border-primary/50",
            )}
            aria-pressed={isSelected}
            aria-label={`Select ${theme.name}`}
          >
            <List className="size-12 text-primary/30" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
