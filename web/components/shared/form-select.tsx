import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
interface FormSelectProps {
  options: readonly SelectOption[] | SelectOption[];
  value: string;
  onSelect: (value: string) => void;
  placeholder: string;
  triggerClassName?: string;
  contentAlign?: "start" | "end";
}

export interface SelectOption {
  value: string;
  label: string;
}

export function FormSelect({
  options,
  value,
  onSelect,
  placeholder,
  triggerClassName,
  contentAlign = "start",
}: FormSelectProps) {
  const displayLabel =
    options.find((o) => o.value === value)?.label ?? placeholder;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-lg border border-input bg-surface px-3 text-left text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50",
            value && "text-foreground",
            triggerClassName,
          )}
        >
          <span>{displayLabel}</span>
          <ChevronDown className="size-4 shrink-0" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={contentAlign}
        style={{ width: "var(--radix-dropdown-menu-trigger-width)" }}
      >
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
