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

// Powers the Experiences chip's local-DB pass. Returns published events,
// curated experiences, and items from public trip itineraries that match
// the term. Hotels and flights are excluded from itinerary_items because
// they have their own chips and would crowd the experience surface.
// Substring matching only; swap for `withSearchIndex` once content scales.
export const searchExperiences = query({
  args: { term: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const needle = args.term.trim().toLowerCase();
    if (needle.length === 0) {
      return { events: [], experiences: [], itineraryItems: [] };
    }
    const limit = args.limit ?? 10;

    const experiences = await ctx.db.query("experiences").collect();
    const events = await ctx.db.query("events").collect();

    // Only surface itinerary items from PUBLIC trips so we don't leak
    // private trip contents into the cross-trip search surface. Walk a
    // bounded set of public trips so the read amplification stays in
    // check (cap at 200 — far above the current public-trip count).
    const publicTrips = (await ctx.db.query("trips").take(200)).filter(
      (t) => t.visibility === "public"
    );
    const publicTripIds = new Set<string>(
      publicTrips.map((t) => t._id as unknown as string),
    );
    const itineraryItems = publicTripIds.size
      ? (await ctx.db.query("itinerary_items").take(1000)).filter(
          (i) =>
            publicTripIds.has(i.tripId as unknown as string) &&
            i.type !== "flight" &&
            i.type !== "hotel" &&
            (matches(i.title, needle) ||
              matches(i.description, needle) ||
              matches(i.locationName, needle))
        )
      : [];

    return {
      events: events
        .filter(
          (e) =>
            e.status === "published" &&
            (matches(e.name, needle) ||
              matches(e.description, needle) ||
              matches(e.locationName, needle) ||
              matches(e.category, needle))
        )
        .slice(0, limit)
        .map(toPublicEvent),
      experiences: experiences
        .filter(
          (e) => matches(e.title, needle) || matches(e.description, needle)
        )
        .slice(0, limit),
      itineraryItems: itineraryItems.slice(0, limit),
    };
  },
});
