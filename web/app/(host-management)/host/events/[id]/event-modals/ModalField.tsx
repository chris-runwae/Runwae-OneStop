"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm";

interface ModalFieldProps {
  label: string;
  type?: "text" | "email" | "datetime-local";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  className?: string;
}

export function ModalField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  readOnly,
  onKeyDown,
  className,
}: ModalFieldProps) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-body">{label}</label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        onKeyDown={onKeyDown}
        className={cn(inputClass, "mt-1")}
      />
    </div>
  );
}

export const modalInputClass = inputClass;
