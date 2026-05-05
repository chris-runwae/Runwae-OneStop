import { v } from "convex/values";
import { query } from "./_generated/server";
import { toPublicEvent } from "./lib/event_sanitize";

function matches(haystack: string | undefined, needle: string): boolean {
  if (!haystack) return false;
  return haystack.toLowerCase().includes(needle);
}

// Naive full-scan search across destinations, experiences, events.
// Fine for MVP; swap for Convex search indexes once the content catalogue grows.
export const searchAll = query({
  args: { term: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const needle = args.term.trim().toLowerCase();
    if (needle.length === 0) {
      return { destinations: [], experiences: [], events: [] };
    }
    const limit = args.limit ?? 10;

    const destinations = await ctx.db.query("destinations").collect();
    const experiences = await ctx.db.query("experiences").collect();
    const events = await ctx.db.query("events").collect();

    return {
      // Soft-deleted records are excluded from public reads. Admin queries
      // (admin/destinations.ts) include them so they can be restored.
      destinations: destinations
        .filter(
          (d) =>
            d.deletedAt === undefined &&
            (matches(d.name, needle) ||
              matches(d.country, needle) ||
              matches(d.region, needle) ||
              d.tags.some((t) => t.toLowerCase().includes(needle)))
        )
        .slice(0, limit),
      experiences: experiences
        .filter(
          (e) => matches(e.title, needle) || matches(e.description, needle)
        )
        .slice(0, limit),
      events: events
        .filter(
          (e) =>
            e.status === "published" &&
            (matches(e.name, needle) ||
              matches(e.description, needle) ||
              matches(e.locationName, needle))
        )
        .slice(0, limit)
        .map(toPublicEvent),
    };
  },
});
