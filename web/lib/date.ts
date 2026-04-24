import { format } from "date-fns";

export function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    date: format(d, "MMM d, yyyy"),
    dayOfWeek: format(d, "EEEE"),
    monthLabel: format(d, "MMM").toUpperCase(),
    dayNum: format(d, "d"),
    time: format(d, "hh:mm a"),
  };
}
