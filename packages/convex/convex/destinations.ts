import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: {
    featuredOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    if (args.featuredOnly) {
      const rows = await ctx.db
        .query("destinations")
        .withIndex("by_featured", (q) => q.eq("isFeatured", true))
        .collect();
      rows.sort((a, b) => (a.featuredRank ?? 1e9) - (b.featuredRank ?? 1e9));
      return rows.slice(0, limit);
    }
    return (await ctx.db.query("destinations").collect()).slice(0, limit);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const destination = await ctx.db
      .query("destinations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!destination) return null;

    const experiences = await ctx.db
      .query("experiences")
      .withIndex("by_destination", (q) =>
        q.eq("destinationId", destination._id)
      )
      .collect();

    const templates = await ctx.db
      .query("itinerary_templates")
      .withIndex("by_destination", (q) =>
        q.eq("destinationId", destination._id)
      )
      .collect();

    return { destination, experiences, templates };
  },
});
