"use client";

import { cn } from "@/lib/utils";
import { addDays, format, isSameDay } from "date-fns";

interface DateStripProps {
  startDate: Date;
  days?: number;
  selectedDate?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
}

export function DateStrip({
  startDate,
  days = 7,
  selectedDate,
  onSelect,
  className,
}: DateStripProps) {
  const dates = Array.from({ length: days }, (_, i) => addDays(startDate, i));

  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {dates.map((date) => {
        const active = selectedDate ? isSameDay(date, selectedDate) : false;
        return (
          <button
            key={date.toISOString()}
            onClick={() => onSelect?.(date)}
            className={cn(
              "flex shrink-0 flex-col items-center rounded-2xl px-4 py-2 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <span className="text-xs font-medium">{format(date, "EEE")}</span>
            <span className="text-lg font-semibold leading-none">
              {format(date, "d")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
