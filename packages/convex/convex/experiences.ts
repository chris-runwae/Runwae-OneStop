import { v } from "convex/values";
import { query } from "./_generated/server";

// Featured experiences populated by the admin (`isFeatured: true`) or by a
// future Viator import job. Returns empty until the experiences table has
// rows; callers fall back to the live `discovery.searchByCategory` action.
export const listFeatured = query({
  args: {
    limit: v.optional(v.number()),
    destinationId: v.optional(v.id("destinations")),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 12;
    if (args.destinationId) {
      const destinationId = args.destinationId;
      const rows = await ctx.db
        .query("experiences")
        .withIndex("by_destination", (q) =>
          q.eq("destinationId", destinationId)
        )
        .collect();
      return rows.filter((e) => e.isFeatured).slice(0, limit);
    }
    // No `by_featured` index on experiences yet — full table scan is OK at
    // current data volume; revisit when seeding > 100 rows.
    const all = await ctx.db.query("experiences").collect();
    return all.filter((e) => e.isFeatured).slice(0, limit);
  },
});

export const listByDestination = query({
  args: {
    destinationId: v.id("destinations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const destinationId = args.destinationId;
    const rows = await ctx.db
      .query("experiences")
      .withIndex("by_destination", (q) => q.eq("destinationId", destinationId))
      .collect();
    return rows.slice(0, args.limit ?? 24);
  },
});
