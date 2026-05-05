import { v, ConvexError } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "../lib/admin";
import { kebabize, slugifyWithSuffix } from "../lib/slug";
import { Doc } from "../_generated/dataModel";

const COORDS = v.object({ lat: v.number(), lng: v.number() });

// listAll — admin table view. Excludes soft-deleted, sorts by featuredRank
// (ascending, undefined last) then name. Server-side `search` filters by
// case-insensitive name substring.
export const listAll = query({
  args: {
    search: v.optional(v.string()),
    featuredOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let rows: Doc<"destinations">[];
    if (args.featuredOnly) {
      rows = await ctx.db
        .query("destinations")
        .withIndex("by_featured", (q) => q.eq("isFeatured", true))
        .collect();
    } else {
      rows = await ctx.db.query("destinations").collect();
    }
    rows = rows.filter((r) => r.deletedAt === undefined);
    if (args.search && args.search.trim()) {
      const needle = args.search.trim().toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(needle));
    }
    rows.sort((a, b) => {
      const ra = a.featuredRank ?? Number.POSITIVE_INFINITY;
      const rb = b.featuredRank ?? Number.POSITIVE_INFINITY;
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name);
    });
    return rows;
  },
});

export const getById = query({
  args: { id: v.id("destinations") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) return null;
    return row;
  },
});

async function uniqueSlugFor(
  ctx: { db: any },
  name: string,
  desired?: string
): Promise<string> {
  const base = desired ? kebabize(desired) : kebabize(name);
  if (base) {
    const existing = await ctx.db
      .query("destinations")
      .withIndex("by_slug", (q: any) => q.eq("slug", base))
      .unique();
    if (!existing) return base;
  }
  // Collision (or empty kebab) — fall back to suffixed variant. Retry up
  // to 5x for the astronomically unlikely double-collision case.
  for (let i = 0; i < 5; i++) {
    const candidate = slugifyWithSuffix(name, "destination");
    const existing = await ctx.db
      .query("destinations")
      .withIndex("by_slug", (q: any) => q.eq("slug", candidate))
      .unique();
    if (!existing) return candidate;
  }
  throw new ConvexError("Could not generate a unique slug after 5 attempts");
}

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    country: v.string(),
    region: v.optional(v.string()),
    heroImageUrl: v.string(),
    imageUrls: v.array(v.string()),
    description: v.optional(v.string()),
    isFeatured: v.boolean(),
    featuredRank: v.optional(v.number()),
    tags: v.array(v.string()),
    coords: v.optional(COORDS),
    timezone: v.string(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (!args.name.trim()) throw new ConvexError("Name is required");
    if (!args.country.trim()) throw new ConvexError("Country is required");
    if (!args.heroImageUrl.trim())
      throw new ConvexError("Hero image is required");

    const slug = await uniqueSlugFor(ctx, args.name, args.slug);

    const id = await ctx.db.insert("destinations", {
      name: args.name.trim(),
      country: args.country.trim(),
      region: args.region?.trim() || undefined,
      heroImageUrl: args.heroImageUrl,
      imageUrls: args.imageUrls,
      description: args.description?.trim() || undefined,
      isFeatured: args.isFeatured,
      featuredRank: args.featuredRank,
      tags: args.tags,
      coords: args.coords,
      timezone: args.timezone,
      currency: args.currency.toUpperCase(),
      ratingAverage: 0,
      ratingCount: 0,
      slug,
      createdAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("destinations"),
    // Slug is intentionally not in this validator — slugs are immutable
    // post-create to avoid breaking shared links.
    name: v.optional(v.string()),
    country: v.optional(v.string()),
    region: v.optional(v.string()),
    heroImageUrl: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    coords: v.optional(v.union(COORDS, v.null())),
    timezone: v.optional(v.string()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) throw new ConvexError("Destination not found");
    if (row.deletedAt) throw new ConvexError("Destination is deleted");

    const patch: Partial<Doc<"destinations">> = {};
    if (args.name !== undefined) {
      if (!args.name.trim()) throw new ConvexError("Name cannot be empty");
      patch.name = args.name.trim();
    }
    if (args.country !== undefined) {
      if (!args.country.trim()) throw new ConvexError("Country cannot be empty");
      patch.country = args.country.trim();
    }
    if (args.region !== undefined)
      patch.region = args.region.trim() || undefined;
    if (args.heroImageUrl !== undefined) {
      if (!args.heroImageUrl.trim())
        throw new ConvexError("Hero image cannot be empty");
      patch.heroImageUrl = args.heroImageUrl;
    }
    if (args.imageUrls !== undefined) patch.imageUrls = args.imageUrls;
    if (args.description !== undefined)
      patch.description = args.description.trim() || undefined;
    if (args.tags !== undefined) patch.tags = args.tags;
    if (args.coords !== undefined)
      patch.coords = args.coords === null ? undefined : args.coords;
    if (args.timezone !== undefined) patch.timezone = args.timezone;
    if (args.currency !== undefined)
      patch.currency = args.currency.toUpperCase();

    await ctx.db.patch(args.id, patch);
    return await ctx.db.get(args.id);
  },
});

export const setFeatured = mutation({
  args: {
    id: v.id("destinations"),
    isFeatured: v.boolean(),
    featuredRank: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) throw new ConvexError("Destination not found");

    let rank: number | undefined = args.featuredRank;
    if (args.isFeatured && rank === undefined) {
      // Auto-assign max(rank)+1 across currently-featured non-deleted rows.
      const featured = await ctx.db
        .query("destinations")
        .withIndex("by_featured", (q) => q.eq("isFeatured", true))
        .collect();
      const live = featured.filter(
        (r) => r.deletedAt === undefined && r._id !== args.id
      );
      const max = live.reduce(
        (m: number, r) => Math.max(m, r.featuredRank ?? 0),
        0
      );
      rank = max + 1;
    }
    // When unfeaturing, clear the rank so re-featuring later starts fresh.
    if (!args.isFeatured) rank = undefined;

    await ctx.db.patch(args.id, {
      isFeatured: args.isFeatured,
      featuredRank: rank,
    });
    return await ctx.db.get(args.id);
  },
});

export const softDelete = mutation({
  args: { id: v.id("destinations") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) throw new ConvexError("Destination not found");
    if (row.deletedAt) return row;
    await ctx.db.patch(args.id, { deletedAt: Date.now() });
    return await ctx.db.get(args.id);
  },
});

// Restore a soft-deleted destination — handy escape hatch if an admin
// soft-deletes by mistake. Not in the section-3 spec but the inverse of
// softDelete and trivially safe; helpful for the manual test loop.
export const restore = mutation({
  args: { id: v.id("destinations") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) throw new ConvexError("Destination not found");
    if (!row.deletedAt) return row;
    await ctx.db.patch(args.id, { deletedAt: undefined });
    return await ctx.db.get(args.id);
  },
});
