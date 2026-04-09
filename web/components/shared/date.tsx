import { cn } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";
import React from "react";
import { Control, Controller, FieldValues } from "react-hook-form";
import { FormMessage } from "../ui/form";

interface DateSelectorProps<T extends FieldValues> {
  name: keyof T;
  control: Control<T>;
  inputRef?: React.MutableRefObject<HTMLInputElement | null>;
  min?: string;
}

export const DateSelector = <T extends FieldValues>({
  name,
  control,
  inputRef,
  min,
}: DateSelectorProps<T>) => {
  return (
    <Controller
      name={name as any} // TS needs this assertion for keyof
      control={control}
      render={({ field, fieldState }) => (
        <label
          className="flex w-full relative cursor-pointer"
          onClick={() => inputRef?.current?.showPicker()}
        >
          <Calendar
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="date"
            {...field}
            ref={(el) => {
              field.ref(el);
              if (inputRef) inputRef.current = el;
            }}
            min={min}
            className={cn(
              "pl-10 w-full",
              "h-11 w-full rounded-lg border bg-surface pl-10 pr-3 text-sm text-body focus:outline-none focus:ring-2 focus:ring-ring/50 cursor-pointer",
              fieldState.error
                ? "border-destructive focus:ring-destructive/50"
                : "border-input",
            )}
          />
          <FormMessage />
        </label>
      )}
    />
  );
};

export const TimeSelector = <T extends FieldValues>({
  name,
  control,
  inputRef,
  disabled,
  min,
}: DateSelectorProps<T> & { disabled: boolean }) => {
  return (
    <Controller
      name={name as any} // TS needs this assertion for keyof
      control={control}
      render={({ field }) => (
        <div
          className={cn(
            "relative h-11 w-full rounded-lg border border-input bg-surface",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <Clock
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          {!field.value && (
            <span className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              00:00
            </span>
          )}

          <input
            type="time"
            {...field}
            ref={(el) => {
              field.ref(el);
              if (inputRef) inputRef.current = el;
            }}
            disabled={disabled}
            onClick={() => inputRef?.current?.showPicker()}
            className={cn(
              "h-11 w-full rounded-lg border border-input bg-surface pl-10 pr-3 text-sm text-body focus:outline-none focus:ring-2 focus:ring-ring/50 cursor-pointer",
              disabled && "cursor-not-allowed opacity-0",
            )}
          />
        </div>
      )}
    />
  );
};
