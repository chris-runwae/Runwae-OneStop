import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    featuredOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    // Soft-deleted records are excluded from public reads. Admin queries
    // (admin/destinations.ts) include them so they can be restored.
    if (args.featuredOnly) {
      const rows = await ctx.db
        .query("destinations")
        .withIndex("by_featured", (q) => q.eq("isFeatured", true))
        .collect();
      rows.sort((a, b) => (a.featuredRank ?? 1e9) - (b.featuredRank ?? 1e9));
      return rows
        .filter((r) => r.deletedAt === undefined)
        .slice(0, limit);
    }
    return (await ctx.db.query("destinations").collect())
      .filter((r) => r.deletedAt === undefined)
      .slice(0, limit);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const destination = await ctx.db
      .query("destinations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    // Soft-deleted records are excluded from public reads. Admin queries
    // (admin/destinations.ts) include them so they can be restored.
    if (!destination || destination.deletedAt) return null;

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

// Idempotent default seed. Inserts a small set of featured destinations the
// first time the explore page is opened on an empty database. No-ops once
// any destinations exist, so it's safe to call repeatedly from the client.
const DEFAULT_DESTINATIONS = [
  {
    name: "Lisbon",
    country: "Portugal",
    region: "Europe",
    slug: "lisbon",
    timezone: "Europe/Lisbon",
    currency: "EUR",
    coords: { lat: 38.7223, lng: -9.1393 },
    tags: ["beach", "culture", "food", "weekend"],
    description:
      "Pastel-soaked hills, miradouros at golden hour, and a tram-rattled tangle of tiled streets that lead from fado bars to ocean cliffs.",
    heroImage: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1600&q=80",
    rank: 1,
    rating: 4.7,
    ratingCount: 312,
  },
  {
    name: "Tokyo",
    country: "Japan",
    region: "Asia",
    slug: "tokyo",
    timezone: "Asia/Tokyo",
    currency: "JPY",
    coords: { lat: 35.6762, lng: 139.6503 },
    tags: ["city", "food", "culture", "tech"],
    description:
      "A neon ribbon stretching from Shibuya scrambles to ancient Yanaka backstreets, where hyper-future skyline lounges sit metres from 200-year-old shrines.",
    heroImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80",
    rank: 2,
    rating: 4.8,
    ratingCount: 521,
  },
  {
    name: "Marrakech",
    country: "Morocco",
    region: "Africa",
    slug: "marrakech",
    timezone: "Africa/Casablanca",
    currency: "MAD",
    coords: { lat: 31.6295, lng: -7.9811 },
    tags: ["culture", "food", "adventure", "souk"],
    description:
      "Spiced air, riad courtyards, and the slow electricity of Jemaa el-Fnaa at dusk — all 30 minutes from desert dunes and Atlas trailheads.",
    heroImage: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1600&q=80",
    rank: 3,
    rating: 4.6,
    ratingCount: 287,
  },
  {
    name: "Bali",
    country: "Indonesia",
    region: "Asia",
    slug: "bali",
    timezone: "Asia/Makassar",
    currency: "IDR",
    coords: { lat: -8.4095, lng: 115.1889 },
    tags: ["beach", "wellness", "adventure", "nature"],
    description:
      "Volcanic surf at dawn in Uluwatu, jungle waterfalls past noon, and rice-paddy temples lit by paper lanterns by night.",
    heroImage: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1600&q=80",
    rank: 4,
    rating: 4.7,
    ratingCount: 463,
  },
  {
    name: "Mexico City",
    country: "Mexico",
    region: "North America",
    slug: "mexico-city",
    timezone: "America/Mexico_City",
    currency: "MXN",
    coords: { lat: 19.4326, lng: -99.1332 },
    tags: ["food", "culture", "city", "art"],
    description:
      "A leafy, art-soaked, taco-anchored capital where Roma rooftop bars look out over Aztec ruins and Frida's blue house is a 10-minute Uber away.",
    heroImage: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1600&q=80",
    rank: 5,
    rating: 4.6,
    ratingCount: 198,
  },
  {
    name: "Reykjavík",
    country: "Iceland",
    region: "Europe",
    slug: "reykjavik",
    timezone: "Atlantic/Reykjavik",
    currency: "ISK",
    coords: { lat: 64.1466, lng: -21.9426 },
    tags: ["adventure", "nature", "northern-lights", "cold"],
    description:
      "Aurora-lit nights, geothermal lagoons, and a tiny capital from which black-sand beaches, ice caves and glaciers are all a day-trip away.",
    heroImage: "https://images.unsplash.com/photo-1490080886466-6ea0a78d4f4f?auto=format&fit=crop&w=1600&q=80",
    rank: 6,
    rating: 4.8,
    ratingCount: 156,
  },
];

export const seedDefaultsIfEmpty = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("destinations").take(1);
    if (existing.length > 0) return { inserted: 0 };

    const now = Date.now();
    let inserted = 0;
    for (const d of DEFAULT_DESTINATIONS) {
      await ctx.db.insert("destinations", {
        name: d.name,
        country: d.country,
        region: d.region,
        heroImageUrl: d.heroImage,
        imageUrls: [d.heroImage],
        description: d.description,
        isFeatured: true,
        featuredRank: d.rank,
        tags: d.tags,
        coords: d.coords,
        timezone: d.timezone,
        currency: d.currency,
        ratingAverage: d.rating,
        ratingCount: d.ratingCount,
        slug: d.slug,
        createdAt: now,
      });
      inserted++;
    }
    return { inserted };
  },
});
