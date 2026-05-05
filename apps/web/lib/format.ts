export { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";

export function formatDateRange(startMs: number, endMs: number, timezone: string): string {
  const s = new Date(startMs);
  const e = new Date(endMs);
  const sameYear  = s.getUTCFullYear() === e.getUTCFullYear();
  const sameMonth = sameYear && s.getUTCMonth() === e.getUTCMonth();

  const monthFmt = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: timezone });
  const dayFmt   = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: timezone });
  const yearFmt  = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: timezone });

  if (sameMonth) {
    return `${monthFmt.format(s)} ${dayFmt.format(s)}–${dayFmt.format(e)}, ${yearFmt.format(s)}`;
  }
  if (sameYear) {
    return `${monthFmt.format(s)} ${dayFmt.format(s)} – ${monthFmt.format(e)} ${dayFmt.format(e)}, ${yearFmt.format(s)}`;
  }
  return `${monthFmt.format(s)} ${dayFmt.format(s)}, ${yearFmt.format(s)} – ${monthFmt.format(e)} ${dayFmt.format(e)}, ${yearFmt.format(e)}`;
}
