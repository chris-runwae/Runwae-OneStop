import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "refresh exchange rates (GBP)",
  { hourUTC: 3, minuteUTC: 0 },
  internal.currency.refreshRates,
  { baseCurrency: "GBP" }
);

export default crons;
