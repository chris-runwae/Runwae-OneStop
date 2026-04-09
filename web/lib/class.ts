import { cn } from "./utils";

const dateInputClass = (hasError?: boolean) =>
  cn(
    "h-11 w-full rounded-lg border bg-surface pl-10 pr-3 text-sm text-body focus:outline-none focus:ring-2 focus:ring-ring/50 cursor-pointer",
    hasError ? "border-destructive focus:ring-destructive/50" : "border-input",
  );

const timeInputClass = (hasValue: boolean, disabled?: boolean) =>
  cn(
    "h-11 w-full rounded-lg border border-input bg-surface pl-10 pr-3 text-sm text-body focus:outline-none focus:ring-2 focus:ring-ring/50 cursor-pointer",
    !hasValue && "opacity-0",
    disabled && "cursor-not-allowed",
  );
