# Trip Creation + Discover/Saved Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build the manual trip-creation wizard, wire the Discover and Saved tabs to richer Add flows (with comments and poll creation), and integrate Viator + LiteAPI as discovery sources behind a cached Convex action layer.

**Architecture:**
- `apps/web/app/(app)/trips/new/page.tsx`: 4-step wizard (Destination → Dates → Details → Review). Routes to `/trips/[slug]/share` on success.
- `/trips/[slug]/share`: post-create screen with join code, copyable share link, friend search/invite, "Go to trip" CTA.
- `discovery_cache` Convex table + `discovery.ts` action layer providing a unified `searchByCategory` interface; backed by Viator (tours/activities/events) and LiteAPI (hotels), with static seed fallback when env keys missing.
- Saved-item comments via a new `saved_item_comments` table + `saved_items.{addComment,getComments}` functions.
- Poll creation anchored to a saved item via new `polls.createForSavedItem` mutation.
- New UI primitives: `Dialog` (centered modal), `DateRangePicker` (responsive), `LocationPicker` (search combobox over destinations + free-text fallback), `CoverImagePicker`.
- Discover/Saved card update: "Details" → price; "+ Add" → action sheet with 2 options (Discover) or 3 options (Saved).

**Tech Stack:** Next.js 15 App Router, React 19, Convex, Tailwind v4. No new npm dependencies — all wizard primitives built from existing components.

---

## File Structure

### New files (web)
| Path | Purpose |
|------|---------|
| `apps/web/lib/cover-image.ts` | `pickDefaultCover(slug): string` — deterministic Unsplash URL from a curated list of travel photos, picked by hashing the slug |
| `apps/web/components/ui/dialog.tsx` | Centered modal primitive (analogue of Sheet but center-screen) |
| `apps/web/components/ui/date-range-picker.tsx` | Responsive: native `<input type="date">` pair on mobile, two-month inline grid on desktop |
| `apps/web/components/ui/location-picker.tsx` | Combobox searching `api.search.searchAll` destinations + free-text fallback; emits `{ destinationLabel, destinationId?, destinationCoords? }` |
| `apps/web/components/trips/CreateTripWizard.tsx` | Top-level client wizard: progress dots, step-state, `createTrip` call |
| `apps/web/components/trips/wizard/StepDestination.tsx` | Step 1 — wraps `LocationPicker` |
| `apps/web/components/trips/wizard/StepDates.tsx` | Step 2 — wraps `DateRangePicker` |
| `apps/web/components/trips/wizard/StepDetails.tsx` | Step 3 — title, description, currency, visibility, cover image |
| `apps/web/components/trips/wizard/StepReview.tsx` | Step 4 — summary + create button |
| `apps/web/components/trips/AddDiscoveryItemSheet.tsx` | 2-option action sheet for Discover items: "Add to itinerary → day picker" / "Add to Saved" |
| `apps/web/components/trips/AddSavedItemActionsSheet.tsx` | 3-option action sheet for Saved items: itinerary / comment / poll |
| `apps/web/components/trips/CommentDialog.tsx` | Add-comment dialog (uses Dialog primitive) |
| `apps/web/components/trips/CreatePollSheet.tsx` | Poll creation sheet anchored to a saved item (replaces the `window.prompt` flow) |
| `apps/web/components/trips/DayPickerSheet.tsx` | Reusable "pick a day from this trip" sub-sheet |
| `apps/web/app/(app)/trips/[slug]/share/page.tsx` | Post-create share screen (server component fetching trip + members) |
| `apps/web/app/(app)/trips/[slug]/share/ShareClient.tsx` | Client: copy link, search/invite friends |

### New files (Convex)
| Path | Purpose |
|------|---------|
| `packages/convex/convex/discovery.ts` | Unified action: `searchByCategory({ category, term, lat?, lng?, limit? })`. Routes to Viator / LiteAPI / static. Caches per `(category, term)` for 24h. |
| `packages/convex/convex/providers/viator.ts` | Viator API normalizer (internal action). |
| `packages/convex/convex/providers/liteapi.ts` | LiteAPI hotel API normalizer (internal action). |
| `packages/convex/convex/providers/staticDiscovery.ts` | Static seed for categories without an API yet (eat / fly / ride). |
| `packages/convex/tests/discovery.test.ts` | convex-test for static fallback + cache hit path. |
| `packages/convex/tests/comments.test.ts` | convex-test for `addComment` + `getComments`. |
| `packages/convex/tests/saved_polls.test.ts` | convex-test for `polls.createForSavedItem`. |

### Modified files
| Path | Change |
|------|--------|
| `packages/convex/convex/schema.ts` | Add `saved_item_comments` table (`tripId, savedItemId, userId, content, createdAt, updatedAt`, indexes: `by_saved_item`, `by_trip`); add `discovery_cache` table (`provider, category, queryKey, expiresAt, payload (any)`, index: `by_key`). |
| `packages/convex/convex/trips.ts` | Add `destinationCoords` to `createTrip` args; on success, default `coverImageUrl` to a deterministic Unsplash URL if not provided. Return `{ tripId, slug }` instead of just `tripId`. |
| `packages/convex/convex/saved_items.ts` | Add `addComment`, `getComments`, `removeComment` functions. |
| `packages/convex/convex/polls.ts` | Add `createForSavedItem` mutation that creates a poll and inserts options with `savedItemId` set. |
| `apps/web/app/(app)/trips/new/page.tsx` | Replace stub with `<CreateTripWizard />`. |
| `apps/web/components/trips/tabs/DiscoverTab.tsx` | Swap the existing rails (which use `search.searchAll`) to use `discovery.searchByCategory` per-category; replace "Details" link on cards with price; "+ Add" → `AddDiscoveryItemSheet`. |
| `apps/web/components/trips/tabs/SavedTab.tsx` | "+ Add" → `AddSavedItemActionsSheet` (which can pivot to comment / poll / itinerary). |
| `apps/web/components/trips/tabs/activity/PollsView.tsx` | Replace `window.prompt`-based create with `CreatePollSheet`. |
| `apps/web/lib/categories.ts` | Add UI categories: explicit `car_rental` / `transport` / `event` already present via mapping; expose them in `ALL_CATEGORIES` chip filter for Discover. |
| `apps/web/app/(app)/trips/page.tsx` | Replace stub with a real list using `api.trips.getMyTrips` + a "Create new" CTA → `/trips/new`. |

---

## Conventions

- TDD where tractable (Convex modules, lib helpers).
- Each task = one commit.
- Imports: `@/convex/_generated/api`, `@/lib/utils`, `@/components/ui/...`.
- Sub-agents in this run can use Sonnet for everything.

---

## Task 0: Schema additions + helpers

**Files:**
- Modify: `packages/convex/convex/schema.ts`
- Create: `apps/web/lib/cover-image.ts`

- [ ] **Step 1: Add tables to schema**

In `packages/convex/convex/schema.ts`, add these two tables alongside the existing definitions:

```ts
saved_item_comments: defineTable({
  tripId: v.id("trips"),
  savedItemId: v.id("saved_items"),
  userId: v.id("users"),
  content: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_saved_item", ["savedItemId"])
  .index("by_trip", ["tripId"]),

discovery_cache: defineTable({
  provider: v.string(),       // "viator" | "liteapi" | "static"
  category: v.string(),       // ui category id, e.g. "stay"
  queryKey: v.string(),       // normalized search key (lowercased term + coords)
  expiresAt: v.number(),
  payload: v.any(),           // array of normalized DiscoveryItem
})
  .index("by_key", ["provider", "category", "queryKey"]),
```

- [ ] **Step 2: Cover-image helper**

Create `apps/web/lib/cover-image.ts`:

```ts
const COVERS = [
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80",
  "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1600&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80",
  "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1600&q=80",
  "https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=1600&q=80",
  "https://images.unsplash.com/photo-1473625247510-8ceb1760943f?w=1600&q=80",
];

export function pickDefaultCover(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return COVERS[Math.abs(h) % COVERS.length];
}
```

Mirror this constant in `packages/convex/convex/lib/coverImage.ts` so server-side `createTrip` uses the same set:

```ts
const COVERS = [/* same 8 URLs */];
export function pickDefaultCover(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return COVERS[Math.abs(h) % COVERS.length];
}
```

(No DRY across web/convex packages without cross-package import; the duplication is intentional and small.)

- [ ] **Step 3: Add image hostname**

Verify `apps/web/next.config.ts` already lists `images.unsplash.com`. If not, add it.

- [ ] **Step 4: Codegen + commit**

```
cd packages/convex && npx convex dev --once --typecheck=enable
```

Commit:
```
git add packages/convex/convex/schema.ts \
        packages/convex/convex/lib/coverImage.ts \
        packages/convex/convex/_generated \
        apps/web/lib/cover-image.ts \
        apps/web/next.config.ts
git commit -m "feat: add saved_item_comments + discovery_cache tables, cover image helper"
```

---

## Task 1: Extend `trips.createTrip`

**Files:**
- Modify: `packages/convex/convex/trips.ts`

- [ ] **Step 1: Update args + handler**

Add `destinationCoords` to `createTrip` args:

```ts
destinationCoords: v.optional(v.object({ lat: v.number(), lng: v.number() })),
```

In the handler, after generating `slug`, default `coverImageUrl`:

```ts
import { pickDefaultCover } from "./lib/coverImage";

const finalCover = args.coverImageUrl ?? pickDefaultCover(slug);
```

Use `finalCover` in the insert. Pass `destinationCoords` to the insert (the schema already has the field).

Change the return to `{ tripId, slug }`.

- [ ] **Step 2: Verify**

`cd packages/convex && npx convex dev --once --typecheck=enable` → exit 0.

Update any test that relied on `createTrip` returning a bare id (search `tests/` for `createTrip`).

- [ ] **Step 3: Commit**

```
git add packages/convex/convex/trips.ts
git commit -m "feat(convex): trips.createTrip — accept destinationCoords, default cover, return {tripId, slug}"
```

---

## Task 2: Saved-item comments — Convex module + tests

**Files:**
- Modify: `packages/convex/convex/saved_items.ts`
- Create: `packages/convex/tests/comments.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/comments.test.ts
import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import schema from "../convex/schema";
import { api } from "../convex/_generated/api";

const modules = import.meta.glob("../convex/**/*.*s");

describe("saved_items.comments", () => {
  it("addComment + getComments roundtrip", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(c => c.db.insert("users", { email: "u@x.com", name: "U" }));
    const tripId = await t.run(c => c.db.insert("trips", {
      title: "T", creatorId: userId, startDate: "2026-01-01", endDate: "2026-01-02",
      visibility: "private", status: "planning", slug: "t", joinCode: "j",
      currency: "GBP", createdAt: 0, updatedAt: 0,
    }));
    await t.run(c => c.db.insert("trip_members", {
      tripId, userId, role: "owner", status: "accepted", joinedAt: 0,
    }));
    const savedId = await t.run(c => c.db.insert("saved_items", {
      tripId, addedByUserId: userId, type: "restaurant", title: "X",
      addedToItinerary: false, isManual: true, createdAt: 0,
    }));

    const asUser = t.withIdentity({ subject: userId, email: "u@x.com" });
    await asUser.mutation(api.saved_items.addComment, { savedItemId: savedId, content: "yum" });
    const list = await asUser.query(api.saved_items.getComments, { savedItemId: savedId });
    expect(list).toHaveLength(1);
    expect(list[0].content).toBe("yum");
    expect(list[0].author?.name).toBe("U");
  });

  it("non-member cannot add a comment", async () => {
    const t = convexTest(schema, modules);
    const ownerId = await t.run(c => c.db.insert("users", { email: "o@x.com", name: "O" }));
    const intruderId = await t.run(c => c.db.insert("users", { email: "i@x.com", name: "I" }));
    const tripId = await t.run(c => c.db.insert("trips", {
      title: "T", creatorId: ownerId, startDate: "2026-01-01", endDate: "2026-01-02",
      visibility: "private", status: "planning", slug: "t2", joinCode: "k",
      currency: "GBP", createdAt: 0, updatedAt: 0,
    }));
    await t.run(c => c.db.insert("trip_members", {
      tripId, userId: ownerId, role: "owner", status: "accepted", joinedAt: 0,
    }));
    const savedId = await t.run(c => c.db.insert("saved_items", {
      tripId, addedByUserId: ownerId, type: "restaurant", title: "X",
      addedToItinerary: false, isManual: true, createdAt: 0,
    }));
    const asIntruder = t.withIdentity({ subject: intruderId, email: "i@x.com" });
    await expect(
      asIntruder.mutation(api.saved_items.addComment, { savedItemId: savedId, content: "hi" })
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run, confirm FAIL.**

- [ ] **Step 3: Implement**

Append to `packages/convex/convex/saved_items.ts` (reuse the existing `assertTripMember` helper — read the file first to confirm its signature):

```ts
export const addComment = mutation({
  args: { savedItemId: v.id("saved_items"), content: v.string() },
  handler: async (ctx, { savedItemId, content }) => {
    const text = content.trim();
    if (text.length === 0) throw new Error("Comment cannot be empty.");
    const saved = await ctx.db.get(savedItemId);
    if (!saved) throw new Error("Saved item not found.");
    const userId = await assertTripMember(ctx, saved.tripId);
    const now = Date.now();
    return await ctx.db.insert("saved_item_comments", {
      tripId: saved.tripId,
      savedItemId,
      userId,
      content: text,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getComments = query({
  args: { savedItemId: v.id("saved_items") },
  handler: async (ctx, { savedItemId }) => {
    const saved = await ctx.db.get(savedItemId);
    if (!saved) return [];
    // membership check via assertTripMember-style: but for queries we need a softer fail
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const trip = await ctx.db.get(saved.tripId);
    if (!trip) return [];
    if (trip.visibility !== "public") {
      const membership = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", q => q.eq("tripId", saved.tripId))
        .filter(q => q.eq(q.field("userId"), userId))
        .first();
      if (!membership) return [];
    }
    const rows = await ctx.db
      .query("saved_item_comments")
      .withIndex("by_saved_item", q => q.eq("savedItemId", savedItemId))
      .order("asc")
      .collect();
    return Promise.all(rows.map(async r => ({
      ...r,
      author: await ctx.db.get(r.userId),
    })));
  },
});

export const removeComment = mutation({
  args: { commentId: v.id("saved_item_comments") },
  handler: async (ctx, { commentId }) => {
    const comment = await ctx.db.get(commentId);
    if (!comment) return;
    const userId = await assertTripMember(ctx, comment.tripId);
    if (comment.userId !== userId) throw new Error("Not your comment.");
    await ctx.db.delete(commentId);
  },
});
```

(Add `getAuthUserId` to the file's imports if not already present.)

- [ ] **Step 4: Run tests, confirm pass.**

- [ ] **Step 5: Codegen + commit**

```
git add packages/convex/convex/saved_items.ts \
        packages/convex/tests/comments.test.ts \
        packages/convex/convex/_generated
git commit -m "feat(convex): saved_items.addComment/getComments/removeComment"
```

---

## Task 3: Polls — `createForSavedItem` mutation

**Files:**
- Modify: `packages/convex/convex/polls.ts`
- Create: `packages/convex/tests/saved_polls.test.ts`

- [ ] **Step 1: Test**

```ts
// tests/saved_polls.test.ts
import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import schema from "../convex/schema";
import { api } from "../convex/_generated/api";

const modules = import.meta.glob("../convex/**/*.*s");

describe("polls.createForSavedItem", () => {
  it("creates a poll with options pre-anchored to saved items", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(c => c.db.insert("users", { email: "u@x.com", name: "U" }));
    const tripId = await t.run(c => c.db.insert("trips", {
      title: "T", creatorId: userId, startDate: "2026-01-01", endDate: "2026-01-02",
      visibility: "private", status: "planning", slug: "t3", joinCode: "j",
      currency: "GBP", createdAt: 0, updatedAt: 0,
    }));
    await t.run(c => c.db.insert("trip_members", {
      tripId, userId, role: "owner", status: "accepted", joinedAt: 0,
    }));
    const a = await t.run(c => c.db.insert("saved_items", {
      tripId, addedByUserId: userId, type: "restaurant", title: "A",
      addedToItinerary: false, isManual: true, createdAt: 0,
    }));
    const b = await t.run(c => c.db.insert("saved_items", {
      tripId, addedByUserId: userId, type: "restaurant", title: "B",
      addedToItinerary: false, isManual: true, createdAt: 0,
    }));
    const asUser = t.withIdentity({ subject: userId, email: "u@x.com" });
    const pollId = await asUser.mutation(api.polls.createForSavedItem, {
      tripId,
      title: "Where to eat?",
      type: "single_choice",
      savedItemIds: [a, b],
    });
    const polls = await asUser.query(api.polls.getByTrip, { tripId });
    expect(polls).toHaveLength(1);
    expect(polls[0]._id).toBe(pollId);
    expect(polls[0].options.map(o => o.label).sort()).toEqual(["A", "B"]);
  });
});
```

- [ ] **Step 2: Run, confirm FAIL.**

- [ ] **Step 3: Implement** (append to `polls.ts`)

```ts
export const createForSavedItem = mutation({
  args: {
    tripId: v.id("trips"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("single_choice"), v.literal("multi_choice"), v.literal("ranked")),
    savedItemIds: v.array(v.id("saved_items")),
    closesAt: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx);  // existing helper in polls.ts
    if (args.savedItemIds.length < 2) throw new Error("Need at least 2 options.");
    const pollId = await ctx.db.insert("trip_polls", {
      tripId: args.tripId,
      createdByUserId: userId,
      title: args.title,
      description: args.description,
      type: args.type,
      status: "open",
      closesAt: args.closesAt,
      allowAddOptions: false,
      isAnonymous: args.isAnonymous ?? false,
      createdAt: Date.now(),
    });
    for (const savedItemId of args.savedItemIds) {
      const saved = await ctx.db.get(savedItemId);
      if (!saved || saved.tripId !== args.tripId) continue;
      await ctx.db.insert("poll_options", {
        pollId,
        label: saved.title,
        addedByUserId: userId,
        savedItemId,
        createdAt: Date.now(),
      });
    }
    return pollId;
  },
});
```

- [ ] **Step 4: Test passes; commit**

```
git add packages/convex/convex/polls.ts \
        packages/convex/tests/saved_polls.test.ts \
        packages/convex/convex/_generated
git commit -m "feat(convex): polls.createForSavedItem"
```

---

## Task 4: Discovery layer (`discovery.ts` + providers + cache)

**Files:**
- Create: `packages/convex/convex/discovery.ts`
- Create: `packages/convex/convex/providers/viator.ts`
- Create: `packages/convex/convex/providers/liteapi.ts`
- Create: `packages/convex/convex/providers/staticDiscovery.ts`
- Create: `packages/convex/tests/discovery.test.ts`

- [ ] **Step 1: Define normalized DiscoveryItem type**

In `packages/convex/convex/providers/types.ts`:

```ts
export type DiscoveryItem = {
  provider: "viator" | "liteapi" | "static";
  apiRef: string;
  category: "stay" | "tour" | "adventure" | "event" | "eat" | "ride" | "fly" | "shop" | "other";
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  externalUrl?: string;
  locationName?: string;
  coords?: { lat: number; lng: number };
  rating?: number;
};
```

- [ ] **Step 2: Static fallback** (`providers/staticDiscovery.ts`)

Hard-code a small array of `DiscoveryItem` per category so Discover always renders. The implementer can crib from `packages/convex/convex/destinations.ts` seed data style or generate plausible entries (5-8 per category). Categories to cover: `stay, tour, adventure, event, eat, ride`.

- [ ] **Step 3: Viator + LiteAPI internal actions**

Both as `internalAction` (not directly callable from client). Each takes `({ category, term, limit })` and returns `DiscoveryItem[]`. Use `process.env.VIATOR_KEY` / `process.env.LITEAPI_KEY`. If the key isn't set, return `[]` and log once. Real endpoints:
- Viator search: `https://api.viator.com/partner/products/search` (POST, requires `exp-api-key` header). Map results: `productCode → apiRef`, `title`, `shortDescription → description`, `images.url → imageUrl`, `pricing.summary.fromPrice → price`, `pricing.currency → currency`.
- LiteAPI hotels: `https://api.liteapi.travel/v3.0/data/hotels?destinationName=...` (GET, header `X-API-Key`). Map: `id → apiRef`, `name → title`, `description`, `main_photo → imageUrl`, `priceFrom → price`, `currency`.

If either provider's request shape changes, the implementer should consult their public docs and adjust. The point is to produce a `DiscoveryItem[]` — not to reverse-engineer their API perfectly.

- [ ] **Step 4: `discovery.searchByCategory` action**

```ts
// discovery.ts
import { v } from "convex/values";
import { action, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import type { DiscoveryItem } from "./providers/types";

const TTL_MS = 24 * 60 * 60 * 1000;

export const searchByCategory = action({
  args: {
    category: v.string(),
    term: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { category, term, limit }): Promise<DiscoveryItem[]> => {
    const queryKey = `${term.trim().toLowerCase()}|limit=${limit ?? 12}`;
    const cached = await ctx.runQuery(internal.discovery.getCached, { category, queryKey });
    if (cached) return cached as DiscoveryItem[];

    let items: DiscoveryItem[] = [];
    const provider = providerFor(category);
    try {
      if (provider === "viator") {
        items = await ctx.runAction(internal.providers.viator.search, { category, term, limit: limit ?? 12 });
      } else if (provider === "liteapi") {
        items = await ctx.runAction(internal.providers.liteapi.search, { category, term, limit: limit ?? 12 });
      }
    } catch (err) {
      console.error("[discovery] provider failed", { category, error: String(err) });
    }

    if (items.length === 0) {
      items = await ctx.runAction(internal.providers.staticDiscovery.search, { category, term, limit: limit ?? 12 });
    }

    await ctx.runMutation(internal.discovery.setCache, {
      provider, category, queryKey, payload: items,
    });
    return items;
  },
});

function providerFor(category: string): "viator" | "liteapi" | "static" {
  switch (category) {
    case "stay": return "liteapi";
    case "tour":
    case "adventure":
    case "event": return "viator";
    default: return "static";
  }
}

export const getCached = internalQuery({
  args: { category: v.string(), queryKey: v.string() },
  handler: async (ctx, { category, queryKey }) => {
    const row = await ctx.db
      .query("discovery_cache")
      .withIndex("by_key", q => q.eq("provider", "any").eq("category", category).eq("queryKey", queryKey))
      .first();
    if (!row || row.expiresAt < Date.now()) return null;
    return row.payload;
  },
});

export const setCache = internalMutation({
  args: {
    provider: v.string(), category: v.string(),
    queryKey: v.string(), payload: v.any(),
  },
  handler: async (ctx, { provider, category, queryKey, payload }) => {
    // Upsert
    const existing = await ctx.db
      .query("discovery_cache")
      .withIndex("by_key", q => q.eq("provider", provider).eq("category", category).eq("queryKey", queryKey))
      .first();
    const expiresAt = Date.now() + TTL_MS;
    if (existing) {
      await ctx.db.patch(existing._id, { expiresAt, payload });
    } else {
      await ctx.db.insert("discovery_cache", { provider, category, queryKey, expiresAt, payload });
    }
  },
});
```

NOTE on `getCached`: the index `by_key` is on `["provider", "category", "queryKey"]` — to query without provider, restructure either the index or the query. Implementer should adjust: change cache lookup to scan by `category + queryKey` only (drop provider from the query, but keep it in the index as a secondary). Or use a separate `by_category_key` index. The implementer should pick whichever is cleaner.

- [ ] **Step 5: Discovery test (static path + cache)**

`tests/discovery.test.ts` exercises:
1. With no env keys + no cache → returns static items.
2. After one call, the cache row exists; second call hits cache.

(Skipping live Viator/LiteAPI tests — those would require real keys.)

- [ ] **Step 6: Codegen + commit**

```
git add packages/convex/convex/discovery.ts \
        packages/convex/convex/providers \
        packages/convex/tests/discovery.test.ts \
        packages/convex/convex/_generated
git commit -m "feat(convex): discovery action with viator/liteapi/static providers + cache"
```

---

## Task 5: UI primitives — Dialog + DateRangePicker + LocationPicker

**Files:**
- Create: `apps/web/components/ui/dialog.tsx`
- Create: `apps/web/components/ui/date-range-picker.tsx`
- Create: `apps/web/components/ui/location-picker.tsx`

- [ ] **Step 1: Dialog**

A centered modal:

```tsx
"use client";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Dialog({
  open, onClose, title, children, className,
}: { open: boolean; onClose: () => void; title?: string; children: ReactNode; className?: string }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative w-full max-w-md rounded-2xl bg-card p-6 shadow-xl", className)}>
        {title && <h2 className="mb-4 font-display text-lg font-bold text-foreground">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: DateRangePicker**

Mobile-first, two `<input type="date">` side by side. Min/max validation: `endDate >= startDate`. Computes nights count.

```tsx
"use client";
import { cn } from "@/lib/utils";

export function DateRangePicker({
  start, end, onChange, className,
}: {
  start: string; end: string;
  onChange: (v: { start: string; end: string }) => void;
  className?: string;
}) {
  const nights = computeNights(start, end);
  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Start">
          <input type="date" value={start} onChange={e => onChange({ start: e.target.value, end: end < e.target.value ? e.target.value : end })}
            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:border-primary focus:outline-none" />
        </Field>
        <Field label="End">
          <input type="date" value={end} min={start} onChange={e => onChange({ start, end: e.target.value })}
            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:border-primary focus:outline-none" />
        </Field>
      </div>
      {nights > 0 && (
        <p className="text-center text-xs text-muted-foreground">{nights} night{nights === 1 ? "" : "s"}</p>
      )}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
function computeNights(start: string, end: string): number {
  const s = Date.parse(start), e = Date.parse(end);
  if (Number.isNaN(s) || Number.isNaN(e) || e < s) return 0;
  return Math.round((e - s) / 86400000);
}
```

- [ ] **Step 3: LocationPicker**

Searches `api.search.searchAll` destinations as the user types (≥ 2 chars). Falls back to free text. Emits `{ destinationLabel, destinationId?, destinationCoords? }`. Modeled on `TimezonePicker` but the dropdown shows destination cards (image thumbnail + name + country).

Implementer: read `apps/web/components/ui/timezone-picker.tsx` for the dropdown/click-outside pattern and apply it. Pull `useQuery(api.search.searchAll, term.length >= 2 ? { term, limit: 8 } : "skip")`. Render `results?.destinations` items.

- [ ] **Step 4: Typecheck + commit**

```
git add apps/web/components/ui/dialog.tsx \
        apps/web/components/ui/date-range-picker.tsx \
        apps/web/components/ui/location-picker.tsx
git commit -m "feat(web): Dialog, DateRangePicker, LocationPicker primitives"
```

---

## Task 6: CreateTripWizard

**Files:**
- Create: `apps/web/components/trips/CreateTripWizard.tsx` (and 4 step files)
- Modify: `apps/web/app/(app)/trips/new/page.tsx`

- [ ] **Step 1: Wizard shell**

Follow the same pattern as the existing `(auth)/sign-up/page.tsx` 5-step wizard. State held at the top; sub-step components receive props. ProgressDots at top.

State shape:
```ts
const [step, setStep] = useState(0);
const [destination, setDestination] = useState<{ label: string; destinationId?: Id<"destinations">; coords?: { lat: number; lng: number } }>({ label: "" });
const [dates, setDates] = useState({ start: "", end: "" });
const [details, setDetails] = useState({
  title: "", description: "", coverImageUrl: "",
  currency: "GBP", visibility: "private" as "private" | "invite_only" | "friends" | "public",
});
const [error, setError] = useState<string | null>(null);
const [submitting, setSubmitting] = useState(false);
```

Step 4 calls:
```ts
const result = await createTrip({
  title: details.title,
  description: details.description || undefined,
  destinationLabel: destination.label,
  destinationId: destination.destinationId,
  destinationCoords: destination.coords,
  startDate: dates.start,
  endDate: dates.end,
  visibility: details.visibility,
  currency: details.currency,
  coverImageUrl: details.coverImageUrl || undefined,
});
router.push(`/trips/${result.slug}/share`);
```

- [ ] **Step 2: Each step component**

`StepDestination` — wraps `<LocationPicker>`. Validates `destination.label` not empty.

`StepDates` — wraps `<DateRangePicker>`. Validates both dates set and start <= end.

`StepDetails`:
- title: required
- description: textarea, optional
- cover image: text input for URL, with a small preview using `<img>` (not next/image so dev doesn't fight with hostname config), and a "Use a default cover" hint. If empty, the backend will pick one.
- currency: `<select>` GBP/USD/EUR/JPY/AUD
- visibility: chip group `Private | Friends | Public` (omit `invite_only` for v1; can add later)

`StepReview` — displays the collected info as a summary card; Create button at bottom.

- [ ] **Step 3: Wire `/trips/new`**

Replace `apps/web/app/(app)/trips/new/page.tsx`:

```tsx
import type { Metadata } from "next";
import { CreateTripWizard } from "@/components/trips/CreateTripWizard";
export const metadata: Metadata = { title: "New trip" };
export default function NewTripPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Create a trip</h1>
      <p className="mb-6 text-sm text-muted-foreground">A few quick steps and you're planning.</p>
      <CreateTripWizard />
    </main>
  );
}
```

- [ ] **Step 4: Typecheck + commit**

```
git add apps/web/components/trips/CreateTripWizard.tsx \
        apps/web/components/trips/wizard \
        apps/web/app/\(app\)/trips/new/page.tsx
git commit -m "feat(web): /trips/new — 4-step create-trip wizard"
```

---

## Task 7: Share screen `/trips/[slug]/share`

**Files:**
- Create: `apps/web/app/(app)/trips/[slug]/share/page.tsx` (server)
- Create: `apps/web/app/(app)/trips/[slug]/share/ShareClient.tsx` (client)

- [ ] **Step 1: Server page**

```tsx
import { notFound, redirect } from "next/navigation";
import { fetchAuthedQuery } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import { ShareClient } from "./ShareClient";

export default async function SharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trip = await fetchAuthedQuery(api.trips.getBySlug, { slug });
  if (!trip) notFound();
  return <ShareClient trip={trip} />;
}
```

- [ ] **Step 2: ShareClient**

Shows:
- The trip title + cover thumbnail
- Join code in a big chip with "Copy" button
- Shareable URL `${window.location.origin}/t/${slug}` — copy button
- Friend search: input → `useQuery(api.users.searchByEmail, ...)` → list of users with "Invite" buttons that call a new `trips.inviteByEmail` (next task) — for v1, just show "feature coming soon — share the join code instead".
- "Go to trip" button → `/trips/[slug]`

- [ ] **Step 3: Commit**

```
git add apps/web/app/\(app\)/trips/\[slug\]/share
git commit -m "feat(web): /trips/[slug]/share — post-create share screen"
```

---

## Task 8: AddDiscoveryItemSheet + DayPickerSheet

**Files:**
- Create: `apps/web/components/trips/DayPickerSheet.tsx`
- Create: `apps/web/components/trips/AddDiscoveryItemSheet.tsx`
- Modify: `apps/web/components/trips/tabs/DiscoverTab.tsx`

- [ ] **Step 1: DayPickerSheet** — list of days for a trip; emits a `dayId` on click. Uses `api.itinerary.getItinerary`.

- [ ] **Step 2: AddDiscoveryItemSheet** — open with `{ tripId, item: DiscoveryItem }`. Two big choices:
  1. "Add to itinerary" → opens DayPickerSheet → calls `api.itinerary.addItem({ ... })` mapping the item's category to a schema enum
  2. "Add to Saved" → calls `api.saved_items.addSavedItem({ ..., isManual: false, apiSource: item.provider, apiRef: item.apiRef })`

Map UI category → schema enum: reuse logic mirrored from existing `uiCategoryToType` in `AddItemSheet.tsx`.

- [ ] **Step 3: Update DiscoverTab**

- Switch each rail to use `useAction(api.discovery.searchByCategory)` per-category instead of one `searchAll`. Render rails for `stay, tour, adventure, eat, event` (top categories).
- Card "Details" link replaced with price `formatCurrency(item.price, item.currency, viewer.preferredCurrency)`.
- Whole card becomes clickable: `onClick` opens `AddDiscoveryItemSheet`. (No detail page yet — the click currently routes nowhere; just opens the action sheet for v1. The user explicitly said the future detail page is what details would link to.)
- "+ Add" button on the card also opens the same sheet.

NOTE: `useAction` returns a function — call it inside `useEffect` with the search term and store results in state (it's not a live subscription). Implementer: handle loading + error states with Skeletons.

- [ ] **Step 4: Commit**

```
git add apps/web/components/trips/DayPickerSheet.tsx \
        apps/web/components/trips/AddDiscoveryItemSheet.tsx \
        apps/web/components/trips/tabs/DiscoverTab.tsx
git commit -m "feat(web): Discover tab — discovery rails + AddDiscoveryItemSheet"
```

---

## Task 9: AddSavedItemActionsSheet + CommentDialog + CreatePollSheet

**Files:**
- Create: `apps/web/components/trips/AddSavedItemActionsSheet.tsx`
- Create: `apps/web/components/trips/CommentDialog.tsx`
- Create: `apps/web/components/trips/CreatePollSheet.tsx`
- Modify: `apps/web/components/trips/tabs/SavedTab.tsx`
- Modify: `apps/web/components/trips/tabs/activity/PollsView.tsx`

- [ ] **Step 1: AddSavedItemActionsSheet**

Three options for a `savedItemId`:
1. "Add to itinerary" → DayPickerSheet → `promoteToItinerary({ savedItemId, dayId })`
2. "Add comment" → opens `CommentDialog`
3. "Create poll" → opens `CreatePollSheet` pre-anchored to this saved item; user picks one or more additional saved items to compete in the poll

- [ ] **Step 2: CommentDialog**

Wraps `Dialog`. Textarea + submit. Calls `api.saved_items.addComment({ savedItemId, content })`. Shows existing comments via `useQuery(api.saved_items.getComments)`.

- [ ] **Step 3: CreatePollSheet**

Wraps `Sheet`. Pre-fills with the seeding `savedItemId`. Lets the user pick more saved items from the trip (multi-select). Title input. Calls `api.polls.createForSavedItem`.

- [ ] **Step 4: Update SavedTab**

Replace the existing inline "+ Add" promote-to-day call with opening `AddSavedItemActionsSheet`.

- [ ] **Step 5: Update PollsView**

Replace the `window.prompt` create flow with a generic `CreatePollSheet` (no pre-seeded saved item — user enters options as text). Add an "Anchor to saved items" toggle inside the sheet.

- [ ] **Step 6: Commit**

```
git add apps/web/components/trips/{AddSavedItemActionsSheet,CommentDialog,CreatePollSheet}.tsx \
        apps/web/components/trips/tabs/{SavedTab,activity/PollsView}.tsx
git commit -m "feat(web): Saved tab actions — comment + poll + itinerary; replace prompt-based poll create"
```

---

## Task 10: trips list + verification

**Files:**
- Modify: `apps/web/app/(app)/trips/page.tsx`

- [ ] **Step 1: Real list**

```tsx
"use client";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
// render trip cards via api.trips.getMyTrips, with a CTA to /trips/new
```

(The existing `metadata` export will need to move to a parent or be removed since this becomes a client component. Keep the file simple.)

- [ ] **Step 2: Final smoke pass**

Run all checks:
```
cd apps/web && pnpm exec tsc --noEmit
cd packages/convex && pnpm exec vitest run
cd packages/convex && npx convex dev --once --typecheck=enable
cd apps/web && pnpm exec vitest run
```

All green = ready.

- [ ] **Step 3: Commit**

```
git add apps/web/app/\(app\)/trips/page.tsx
git commit -m "feat(web): trips list with my-trips query + create CTA"
```

---

## Self-review

- Discovery cache index is `(provider, category, queryKey)` — make sure both writes and reads use the same composite. The Task 4 implementer should pick a strategy (provider field always present in the cache row from `providerFor`).
- The "default cover image" logic needs to fire even when the wizard skips the field; the server-side default in Task 1 ensures this.
- Poll creation from PollsView's "Create poll" button should default to a pure-text-options sheet, while saved-tab's "Create poll" pre-fills options from saved items. CreatePollSheet supports both modes via an optional `seedSavedItemId` prop.
- Date validation: server should reject if `endDate < startDate`. The existing `createTrip` may not validate this; implementer adds the check in Task 1.

---

## Final functionality after merge (for handoff message)

- **Trip creation**: `/trips/new` — 4-step wizard (Destination → Dates → Details → Review). Defaults cover image deterministically. Routes to a share screen with copyable join code on success.
- **Discover tab**: Per-category rails (Stay / Tour / Adventure / Eat / Event) sourced from Viator (tours/adventure/event), LiteAPI (stay), or static fallback. Cards show price, click to add to itinerary or saved.
- **Saved tab**: Same item cards. "+ Add" opens an action sheet — promote to itinerary day, add a comment, or create a poll anchored to the item.
- **Polls in Activity tab**: Real `CreatePollSheet` (no more `window.prompt`), supports both text-options polls and saved-item polls.
- **Comments**: Saved items have threaded comments stored in `saved_item_comments`.
- **Discovery cache**: 24h TTL across all provider hits.
- **Trips list**: `/trips` shows your trips with a "Create new" CTA.
- **Share screen**: `/trips/[slug]/share` — copy join code, share URL, "Go to trip" button.

---

## Execution

**Subagent-driven** — each task gets a fresh implementer + spec/quality reviews per project policy. Sonnet on every task except T4 (Sonnet still fine; the action layer isn't deeply complex).
