"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, type LucideIcon } from "lucide-react";

export interface FilterDropdownOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterDropdownOption[];
  value?: string;
  onSelect?: (value: string) => void;
  align?: "start" | "end";
  minWidth?: string;
  icon?: LucideIcon;
  triggerClassName?: string;
}

export function FilterDropdown({
  label,
  options,
  value,
  onSelect,
  align = "start",
  minWidth = "min-w-[160px]",
  icon: Icon,
  triggerClassName,
}: FilterDropdownProps) {
  const displayLabel =
    value ? options.find((o) => o.value === value)?.label ?? label : label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={
            triggerClassName ??
            "flex cursor-pointer items-center gap-1 rounded-lg bg-border-disabled px-3 py-2 text-sm font-medium tracking-tight text-body transition-colors hover:bg-border-disabled/80 focus:outline-none focus:ring-2 focus:ring-ring"
          }
        >
          {Icon && <Icon className="size-4 shrink-0" aria-hidden />}
          {displayLabel}
          <ChevronDownIcon className="size-4 shrink-0" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={minWidth}>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => onSelect?.(option.value)}
            className="cursor-pointer"
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
