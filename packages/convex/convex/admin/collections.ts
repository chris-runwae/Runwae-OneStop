import { v, ConvexError } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "../lib/admin";
import type { Doc, Id } from "../_generated/dataModel";

const ENTITY_TYPE = v.union(
  v.literal("event"),
  v.literal("destination"),
  v.literal("experience"),
  v.literal("trip")
);

type EntityType = Doc<"collections">["entityType"];
type CollectionTable =
  | "events"
  | "destinations"
  | "experiences"
  | "trips";

function tableFor(entityType: EntityType): CollectionTable {
  switch (entityType) {
    case "event":
      return "events";
    case "destination":
      return "destinations";
    case "experience":
      return "experiences";
    case "trip":
      return "trips";
  }
}

// Hydrated entity card. `doc: null` means the stored entityId no longer
// resolves — the admin UI renders these as "missing" with the dangling ID
// shown so the curator can decide whether to remove or re-add. We never
// auto-prune; admin tooling shouldn't silently drop data.
export interface HydratedEntity {
  id: string;
  kind: EntityType;
  doc:
    | { _id: string; title: string; subtitle: string | null; imageUrl: string | null }
    | null;
}

async function hydrateEntity(
  ctx: { db: any },
  entityType: EntityType,
  rawId: string
): Promise<HydratedEntity> {
  // Convex .get throws on a malformed ID rather than returning null, so we
  // catch and treat unparseable IDs as missing — they came from the schema's
  // v.array(v.string()) which has no FK constraint, so junk strings are
  // possible in principle.
  let doc: any = null;
  try {
    doc = await ctx.db.get(rawId as Id<CollectionTable>);
  } catch {
    doc = null;
  }
  if (!doc) {
    return { id: rawId, kind: entityType, doc: null };
  }
  switch (entityType) {
    case "event": {
      const e = doc as Doc<"events">;
      return {
        id: rawId,
        kind: entityType,
        doc: {
          _id: e._id,
          title: e.name,
          subtitle: e.locationName ?? null,
          imageUrl: e.imageUrl ?? e.imageUrls[0] ?? null,
        },
      };
    }
    case "destination": {
      const d = doc as Doc<"destinations">;
      return {
        id: rawId,
        kind: entityType,
        doc: {
          _id: d._id,
          title: d.name,
          subtitle: d.country,
          imageUrl: d.heroImageUrl ?? null,
        },
      };
    }
    case "experience": {
      const x = doc as Doc<"experiences">;
      return {
        id: rawId,
        kind: entityType,
        doc: {
          _id: x._id,
          title: x.title,
          subtitle: x.description ?? null,
          imageUrl: x.imageUrl ?? x.imageUrls[0] ?? null,
        },
      };
    }
    case "trip": {
      const t = doc as Doc<"trips">;
      return {
        id: rawId,
        kind: entityType,
        doc: {
          _id: t._id,
          title: t.title,
          subtitle: t.destinationLabel ?? null,
          imageUrl: t.coverImageUrl ?? null,
        },
      };
    }
  }
}

export const listAll = query({
  args: {
    paginationOpts: paginationOptsValidator,
    entityType: v.optional(ENTITY_TYPE),
    activeOnly: v.optional(v.boolean()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const baseQuery = args.entityType
      ? ctx.db
          .query("collections")
          .withIndex("by_entity_type", (q) =>
            q.eq("entityType", args.entityType!)
          )
          .order("desc")
      : ctx.db.query("collections").order("desc");

    const result = await baseQuery.paginate(args.paginationOpts);
    let page = result.page;

    if (args.activeOnly) {
      page = page.filter((c) => c.isActive);
    }
    if (args.search && args.search.trim()) {
      const needle = args.search.trim().toLowerCase();
      page = page.filter((c) => c.title.toLowerCase().includes(needle));
    }

    return {
      ...result,
      page: page.map((c) => ({ ...c, entityCount: c.entityIds.length })),
    };
  },
});

export const getById = query({
  args: { id: v.id("collections") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) return null;

    const entities: HydratedEntity[] = await Promise.all(
      row.entityIds.map((eid) => hydrateEntity(ctx, row.entityType, eid))
    );
    return { ...row, entities };
  },
});

// Picker support — returns up to `limit` entities of the given type matching
// `search` (case-insensitive substring on title-equivalent field). Used by
// the "add entity" affordance on the detail page. Excludes IDs already in
// `excludeIds` so the picker never shows duplicates of what's in the
// collection.
export const searchEntities = query({
  args: {
    entityType: ENTITY_TYPE,
    search: v.optional(v.string()),
    excludeIds: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const cap = args.limit ?? 20;
    const needle = args.search?.trim().toLowerCase() ?? "";
    const exclude = new Set(args.excludeIds ?? []);
    const table = tableFor(args.entityType);

    // Page through with a generous cap rather than collect-all — 200 is
    // enough headroom for any realistic search-while-filtering session.
    const rows = await ctx.db.query(table).take(200);

    const matches: HydratedEntity[] = [];
    for (const r of rows) {
      if (exclude.has(r._id)) continue;
      const hyd = await hydrateEntity(ctx, args.entityType, r._id);
      if (!hyd.doc) continue;
      if (needle && !hyd.doc.title.toLowerCase().includes(needle)) continue;
      matches.push(hyd);
      if (matches.length >= cap) break;
    }
    return matches;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    entityType: ENTITY_TYPE,
    isActive: v.optional(v.boolean()),
    rank: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (!args.title.trim()) throw new ConvexError("Title is required");

    const id = await ctx.db.insert("collections", {
      title: args.title.trim(),
      description: args.description?.trim() || undefined,
      coverImageUrl: args.coverImageUrl,
      entityType: args.entityType,
      entityIds: [],
      isActive: args.isActive ?? false,
      rank: args.rank ?? 0,
      createdByAdminId: admin._id,
      createdAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("collections"),
    // entityType is intentionally not in this validator — changing it would
    // invalidate all entityIds. Locked after create, like slugs.
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.union(v.string(), v.null())),
    isActive: v.optional(v.boolean()),
    rank: v.optional(v.number()),
    // entityIds add/remove path — full replacement of the set. Reordering
    // goes through reorderEntities (which validates set equality).
    entityIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) throw new ConvexError("Collection not found");

    const patch: Partial<Doc<"collections">> = {};
    if (args.title !== undefined) {
      if (!args.title.trim()) throw new ConvexError("Title cannot be empty");
      patch.title = args.title.trim();
    }
    if (args.description !== undefined) {
      patch.description = args.description.trim() || undefined;
    }
    if (args.coverImageUrl !== undefined) {
      patch.coverImageUrl =
        args.coverImageUrl === null ? undefined : args.coverImageUrl;
    }
    if (args.isActive !== undefined) patch.isActive = args.isActive;
    if (args.rank !== undefined) patch.rank = args.rank;
    if (args.entityIds !== undefined) {
      // Light dedupe — same id appearing twice is almost certainly a UI
      // mistake and would render two identical cards in the rail.
      const seen = new Set<string>();
      const deduped = args.entityIds.filter((id) => {
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
      patch.entityIds = deduped;
    }

    await ctx.db.patch(args.id, patch);
    return await ctx.db.get(args.id);
  },
});

// Hard delete — collections schema has no deletedAt field. Follow-up worth
// considering: add `deletedAt: v.optional(v.number())` to make this
// reversible like destinations. Admin-curated data so the data-loss risk
// is low; admins can recreate.
export const remove = mutation({
  args: { id: v.id("collections") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) return { ok: true };
    await ctx.db.delete(args.id);
    return { ok: true };
  },
});

export const reorderEntities = mutation({
  args: {
    id: v.id("collections"),
    entityIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) throw new ConvexError("Collection not found");

    // Set-equality check: same elements, same multiplicity, in any order.
    // Reordering must not change membership — that's update's job.
    if (args.entityIds.length !== row.entityIds.length) {
      throw new ConvexError(
        `Reorder must preserve membership: got ${args.entityIds.length} ids, ` +
          `collection has ${row.entityIds.length}.`
      );
    }
    const before = new Map<string, number>();
    for (const id of row.entityIds) {
      before.set(id, (before.get(id) ?? 0) + 1);
    }
    for (const id of args.entityIds) {
      const remaining = before.get(id);
      if (remaining === undefined || remaining === 0) {
        throw new ConvexError(
          `Reorder includes id "${id}" not in current entityIds. ` +
            `Use update to add or remove ids.`
        );
      }
      before.set(id, remaining - 1);
    }

    await ctx.db.patch(args.id, { entityIds: args.entityIds });
    return await ctx.db.get(args.id);
  },
});
