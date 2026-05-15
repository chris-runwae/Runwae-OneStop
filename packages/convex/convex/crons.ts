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

// Flips commission rows pending → held once the guest has actually
// stayed / flown — that's the point at which earnings are locked in
// from LiteAPI/Duffel's side, even though cash hasn't landed yet. Runs
// daily; idempotent.
crons.cron(
  "flip pending commissions to held",
  "0 5 * * *",
  internal.commissions_cron.runPendingToHeld,
);

export default crons;
