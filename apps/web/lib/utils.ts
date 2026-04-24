import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string,
  displayCurrency?: string
): string {
  const effectiveCurrency = displayCurrency ?? currency;
  // Use en-US locale so that USD formats as "$" rather than "US$"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: effectiveCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(
  epochMs: number,
  timezone: string,
  format?: Intl.DateTimeFormatOptions
): string {
  const opts: Intl.DateTimeFormatOptions = format ?? {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return new Intl.DateTimeFormat("en-GB", {
    ...opts,
    timeZone: timezone,
  }).format(new Date(epochMs));
}

const THRESHOLDS: [number, Intl.RelativeTimeFormatUnit, number][] = [
  [60, "seconds", 1],
  [3_600, "minutes", 60],
  [86_400, "hours", 3_600],
  [604_800, "days", 86_400],
  [2_592_000, "weeks", 604_800],
  [31_536_000, "months", 2_592_000],
  [Infinity, "years", 31_536_000],
];

export function formatRelativeTime(epochMs: number): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diffSecs = Math.round((epochMs - Date.now()) / 1000);
  const absDiff = Math.abs(diffSecs);

  for (const [threshold, unit, divisor] of THRESHOLDS) {
    if (absDiff < threshold) {
      return rtf.format(Math.round(diffSecs / divisor), unit);
    }
  }

  return rtf.format(Math.round(diffSecs / 31_536_000), "years");
}
