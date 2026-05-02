import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "refresh exchange rates (GBP)",
  { hourUTC: 3, minuteUTC: 0 },
  internal.currency.refreshRates,
  { baseCurrency: "GBP" }
);

// Hard-deletes any account whose 30-day soft-delete window has elapsed.
// Idempotent — re-running picks up only fresh expirations. The action
// processes up to 50 users per tick to stay well under transaction limits.
crons.cron(
  "run scheduled account deletions",
  "0 4 * * *",
  internal.account_deletion.runScheduledDeletions
);

export default crons;
