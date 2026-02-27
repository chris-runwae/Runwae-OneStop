"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import * as React from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  options: readonly SelectOption[] | SelectOption[];
  value: string;
  onSelect: (value: string) => void;
  placeholder: string;
  triggerClassName?: string;
  contentAlign?: "start" | "end";
  minWidth?: string;
}

export function FormSelect({
  options,
  value,
  onSelect,
  placeholder,
  triggerClassName,
  contentAlign = "start",
  minWidth = "min-w-[200px]",
}: FormSelectProps) {
  const displayLabel =
    options.find((o) => o.value === value)?.label ?? placeholder;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-3 text-left text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
            value && "text-foreground",
            triggerClassName,
          )}
        >
          <span>{displayLabel}</span>
          <ChevronDown className="size-4 shrink-0" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={contentAlign} className={minWidth}>
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
  );
}

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
            <svg
              className="size-12 text-primary/30"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M2 12h4v-2H2v2zm0-4h4V6H2v2zm0 8h4v-2H2v2zm6 0h14v-2H8v2zm0-4h14v-2H8v2zm0-6v2h14V6H8z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
