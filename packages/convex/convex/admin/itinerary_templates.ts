import { v, ConvexError } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "../lib/admin";
import type { Doc } from "../_generated/dataModel";

const COORDS = v.object({ lat: v.number(), lng: v.number() });

// Item type vocabulary used by the admin day editor. The schema stores this
// as a free string, so this validator only enforces the contract on writes
// from the admin app. Keep aligned with the editor dropdown.
const ITEM_TYPE = v.union(
  v.literal("activity"),
  v.literal("food"),
  v.literal("transport"),
  v.literal("lodging"),
  v.literal("free")
);

const DIFFICULTY = v.union(
  v.literal("easy"),
  v.literal("moderate"),
  v.literal("challenging")
);

const ITEM = v.object({
  time: v.optional(v.string()),
  endTime: v.optional(v.string()),
  title: v.string(),
  description: v.optional(v.string()),
  type: ITEM_TYPE,
  imageUrl: v.optional(v.string()),
  locationName: v.optional(v.string()),
  coords: v.optional(COORDS),
  estimatedCost: v.optional(v.number()),
  currency: v.optional(v.string()),
  externalUrl: v.optional(v.string()),
  apiSource: v.optional(v.string()),
  apiRef: v.optional(v.string()),
});

const DAY = v.object({
  dayNumber: v.number(),
  title: v.string(),
  items: v.array(ITEM),
});

export const listAll = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
    featuredOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let rows: Doc<"itinerary_templates">[];
    if (args.featuredOnly) {
      rows = await ctx.db
        .query("itinerary_templates")
        .withIndex("by_featured", (q) => q.eq("isFeatured", true))
        .collect();
    } else {
      rows = await ctx.db.query("itinerary_templates").collect();
    }
    if (args.status) {
      rows = rows.filter((r) => r.status === args.status);
    }
    if (args.search && args.search.trim()) {
      const needle = args.search.trim().toLowerCase();
      rows = rows.filter((r) => r.title.toLowerCase().includes(needle));
    }
    rows.sort((a, b) => b.createdAt - a.createdAt);

    const destIds = Array.from(new Set(rows.map((r) => r.destinationId)));
    const destinations = await Promise.all(destIds.map((id) => ctx.db.get(id)));
    const destMap = new Map(
      destinations
        .filter((d): d is Doc<"destinations"> => Boolean(d))
        .map((d) => [d._id, d])
    );

    return rows.map((r) => ({
      ...r,
      destination: destMap.get(r.destinationId)
        ? {
            _id: r.destinationId,
            name: destMap.get(r.destinationId)!.name,
            country: destMap.get(r.destinationId)!.country,
          }
        : null,
    }));
  },
});

export const getById = query({
  args: { id: v.id("itinerary_templates") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) return null;
    const destination = await ctx.db.get(row.destinationId);
    return {
      ...row,
      destination: destination
        ? {
            _id: destination._id,
            name: destination.name,
            country: destination.country,
          }
        : null,
    };
  },
});

function buildEmptyDays(durationDays: number) {
  return Array.from({ length: durationDays }, (_, i) => ({
    dayNumber: i + 1,
    title: `Day ${i + 1}`,
    items: [],
  }));
}

// Normalise a days array against a target durationDays:
//   - truncate trailing days when shrinking
//   - append blank days when growing
//   - re-number sequentially so dayNumber always matches array index + 1
function normaliseDays(
  days: Doc<"itinerary_templates">["days"],
  durationDays: number
): Doc<"itinerary_templates">["days"] {
  const trimmed = days.slice(0, durationDays);
  while (trimmed.length < durationDays) {
    trimmed.push({
      dayNumber: trimmed.length + 1,
      title: `Day ${trimmed.length + 1}`,
      items: [],
    });
  }
  return trimmed.map((d, i) => ({ ...d, dayNumber: i + 1 }));
}

export const create = mutation({
  args: {
    title: v.string(),
    destinationId: v.id("destinations"),
    description: v.optional(v.string()),
    durationDays: v.number(),
    difficultyLevel: v.optional(DIFFICULTY),
    category: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    days: v.optional(v.array(DAY)),
    estimatedTotalCost: v.optional(v.number()),
    currency: v.string(),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (!args.title.trim()) throw new ConvexError("Title is required");
    if (args.durationDays < 1 || args.durationDays > 60) {
      throw new ConvexError("Duration must be between 1 and 60 days");
    }
    const dest = await ctx.db.get(args.destinationId);
    if (!dest) throw new ConvexError("Destination not found");

    const baseDays = args.days ?? buildEmptyDays(args.durationDays);
    const days = normaliseDays(baseDays, args.durationDays);

    const id = await ctx.db.insert("itinerary_templates", {
      title: args.title.trim(),
      destinationId: args.destinationId,
      description: args.description?.trim() || undefined,
      durationDays: args.durationDays,
      difficultyLevel: args.difficultyLevel,
      category: args.category?.trim() || undefined,
      coverImageUrl: args.coverImageUrl,
      days,
      estimatedTotalCost: args.estimatedTotalCost,
      currency: args.currency.toUpperCase(),
      isFeatured: args.isFeatured ?? false,
      timesCopied: 0,
      status: "draft",
      createdByAdminId: admin._id,
      createdAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("itinerary_templates"),
    title: v.optional(v.string()),
    destinationId: v.optional(v.id("destinations")),
    description: v.optional(v.string()),
    durationDays: v.optional(v.number()),
    difficultyLevel: v.optional(v.union(DIFFICULTY, v.null())),
    category: v.optional(v.string()),
    coverImageUrl: v.optional(v.union(v.string(), v.null())),
    days: v.optional(v.array(DAY)),
    estimatedTotalCost: v.optional(v.union(v.number(), v.null())),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) throw new ConvexError("Template not found");

    const patch: Partial<Doc<"itinerary_templates">> = {};

    if (args.title !== undefined) {
      if (!args.title.trim()) throw new ConvexError("Title cannot be empty");
      patch.title = args.title.trim();
    }
    if (args.destinationId !== undefined) {
      const dest = await ctx.db.get(args.destinationId);
      if (!dest) throw new ConvexError("Destination not found");
      patch.destinationId = args.destinationId;
    }
    if (args.description !== undefined) {
      patch.description = args.description.trim() || undefined;
    }
    if (args.category !== undefined) {
      patch.category = args.category.trim() || undefined;
    }
    if (args.coverImageUrl !== undefined) {
      patch.coverImageUrl =
        args.coverImageUrl === null ? undefined : args.coverImageUrl;
    }
    if (args.difficultyLevel !== undefined) {
      patch.difficultyLevel =
        args.difficultyLevel === null ? undefined : args.difficultyLevel;
    }
    if (args.estimatedTotalCost !== undefined) {
      patch.estimatedTotalCost =
        args.estimatedTotalCost === null ? undefined : args.estimatedTotalCost;
    }
    if (args.currency !== undefined) {
      patch.currency = args.currency.toUpperCase();
    }

    // durationDays + days are linked: if either changes, we re-normalise so
    // they stay consistent. The form's debounced auto-save sends them
    // together when it can, but tolerate either coming alone.
    const nextDuration =
      args.durationDays !== undefined ? args.durationDays : row.durationDays;
    if (args.durationDays !== undefined) {
      if (args.durationDays < 1 || args.durationDays > 60) {
        throw new ConvexError("Duration must be between 1 and 60 days");
      }
      patch.durationDays = args.durationDays;
    }
    const nextRawDays = args.days ?? row.days;
    if (args.days !== undefined || args.durationDays !== undefined) {
      patch.days = normaliseDays(nextRawDays, nextDuration);
    }

    await ctx.db.patch(args.id, patch);
    return await ctx.db.get(args.id);
  },
});

// Hard delete is acceptable for now — templates aren't user-generated and
// any trips already cloned from one keep their materialised days/items
// (sourceTemplateId becomes a dangling pointer, which the consumer code
// tolerates because it only reads when rendering the source-template card).
export const remove = mutation({
  args: { id: v.id("itinerary_templates") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) return { ok: true };
    await ctx.db.delete(args.id);
    return { ok: true };
  },
});

export const setFeatured = mutation({
  args: {
    id: v.id("itinerary_templates"),
    isFeatured: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) throw new ConvexError("Template not found");
    await ctx.db.patch(args.id, { isFeatured: args.isFeatured });
    return await ctx.db.get(args.id);
  },
});

export const publish = mutation({
  args: {
    id: v.id("itinerary_templates"),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) throw new ConvexError("Template not found");
    const next = args.status ?? "published";
    if (next === "published") {
      // Block publish on obvious gaps so junk templates don't surface
      // publicly. Admins can still save drafts with anything.
      if (!row.title.trim()) throw new ConvexError("Title is required");
      if (!row.days.length) throw new ConvexError("Template has no days");
    }
    await ctx.db.patch(args.id, { status: next });
    return await ctx.db.get(args.id);
  },
});
