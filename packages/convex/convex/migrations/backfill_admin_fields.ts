import { internalMutation } from "../_generated/server";

// One-shot backfill for admin-console schema additions. Idempotent —
// re-running is safe because each branch only patches rows still missing
// the field.
//
// Run via the Convex dashboard:
//   migrations/backfill_admin_fields:run
//
// Or via CLI:
//   npx convex run migrations/backfill_admin_fields:run
export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    let usersPatched = 0;
    let eventsPatched = 0;

    // users.isAdmin already exists in the schema as v.optional(v.boolean()),
    // so most rows will report `undefined` rather than missing. Treat both
    // as "needs default false" for cleanliness.
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      if (user.isAdmin === undefined) {
        await ctx.db.patch(user._id, { isAdmin: false });
        usersPatched++;
      }
    }

    const events = await ctx.db.query("events").collect();
    for (const event of events) {
      if (event.isTrending === undefined) {
        await ctx.db.patch(event._id, { isTrending: false });
        eventsPatched++;
      }
    }

    return { usersPatched, eventsPatched };
  },
});
