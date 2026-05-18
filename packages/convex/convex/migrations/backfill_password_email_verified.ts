import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

// DRAFT FOR REVIEW — do not run against prod until you have:
//   1. read the caveats below,
//   2. run it on the DEV deployment first,
//   3. run it here in dryRun mode and sanity-checked the counts.
//
// Why this exists
// ---------------
// `auth.ts` configures Password({ verify: VerifyOTP }). On flow:"signIn"
// @convex-dev/auth does: `if (config.verify && !account.emailVerified) ->
// send OTP, no session`. The gate is `authAccounts.emailVerified` (an
// optional string). When real verification completes the library patches
// the account with `emailVerified: <email>` (see @convex-dev/auth
// server/implementation/users.ts). Production (abundant-pika-833) is a
// different database than the dev deployment where users originally
// verified, so migrated password accounts have `emailVerified` unset and
// every existing user is forced back through OTP on first prod login.
//
// This backfills `emailVerified` for existing password accounts so they
// are not forced to re-verify, writing the SAME value the library writes
// (the account email = providerAccountId for the password provider).
//
// CAVEATS — read before running
// -----------------------------
// * This bypasses email verification for ALL existing password accounts.
//   Only acceptable if these are genuinely pre-existing users who already
//   owned/verified their email on the prior deployment. Do NOT run it if
//   prod has untrusted/unverified signups you actually want gated.
// * It only patches `authAccounts` (the gate Password.ts checks). It does
//   NOT touch the app `users` table.
// * Idempotent: rows that already have a truthy `emailVerified` are skipped.
// * Only the "password" provider is affected (OAuth accounts are unrelated).
//
// Run (dry run first, dev before prod):
//   npx convex run migrations/backfill_password_email_verified:run '{"dryRun":true}'
//   npx convex run migrations/backfill_password_email_verified:run '{"dryRun":true}' --prod
//   npx convex run migrations/backfill_password_email_verified:run '{}' --prod
export const run = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: async (ctx, { dryRun }) => {
    const accounts = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("provider"), "password"))
      .collect();

    let alreadyVerified = 0;
    let toPatch = 0;
    let patched = 0;

    for (const account of accounts) {
      if (account.emailVerified) {
        alreadyVerified++;
        continue;
      }
      toPatch++;
      if (dryRun) continue;
      // Mirror @convex-dev/auth: emailVerified holds the verified email.
      // For the password provider, providerAccountId IS the email.
      await ctx.db.patch(account._id, {
        emailVerified: account.providerAccountId,
      });
      patched++;
    }

    return {
      dryRun: dryRun ?? false,
      passwordAccounts: accounts.length,
      alreadyVerified,
      needingBackfill: toPatch,
      patched,
    };
  },
});
