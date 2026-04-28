# Trip Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Trip Detail Page at `apps/web/app/(app)/trips/[slug]/page.tsx` — a web-first, responsive Next.js Server Component that fetches a trip from Convex and renders a 4-tab UI (Itinerary / Discover / Saved / Activity) with live data, real-time updates, and skeleton loading states. Match the visual design from the Claude Design handoff bundle while staying consistent with the existing Runwae token system.

**Architecture:**
- **Server Component** at `[slug]/page.tsx` does the auth-aware first fetch (`fetchQuery` from `convex/nextjs`) — handles `notFound()` and the private/non-member redirect — then passes a typed `initialTrip` snapshot to a client wrapper.
- **Client Component** `TripDetailClient.tsx` subscribes to live Convex queries (`useQuery`) using the server-fetched data as a no-flash initial paint, owns `activeTab` + per-tab UI state, and lazy-renders each tab's content component.
- **Tab content** lives in `apps/web/components/trips/tabs/{Itinerary,Discover,Saved,Activity}Tab.tsx`. Activity has 5 sub-tabs (`Polls`, `Expenses`, `Posts`, `Members`, `Checklists`); v1 wires Polls + Members + Posts to live data, ships Expenses/Checklists/Discover as visual-shell with a viewer-friendly read of existing data (no create flows).
- **Web-first responsive layout** — desktop is the primary canvas; mobile collapses to single-column. No phone-frame constraint.
- **Backend additions** kept minimal: new `polls.ts` module, new `posts.ts` module, new `members.ts` module, an `itinerary.updateItem` mutation, an `itinerary.getDayWithTravelTimes`-compatible day fetcher (already exists), and a `trip_posts.countBySavedItems` aggregator for the saved-card comment badge.
- **Category mapping**: schema enums (`flight`, `hotel`, `restaurant`, …) map to design's UI categories (`fly`, `stay`, `eat`, …) via a single `apps/web/lib/categories.ts` module — color, emoji, label all derived there.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Convex, `@convex-dev/auth`, Tailwind CSS v4 (tokens in `globals.css`), Bricolage Grotesque + Inter, `date-fns` (already a dep), Vitest for unit tests.

---

## File Structure

### New files
| Path | Responsibility |
|------|----------------|
| `apps/web/lib/convex-server.ts` | `fetchQuery` wrapper that pulls the auth token from `@convex-dev/auth/nextjs/server` |
| `apps/web/lib/categories.ts` | UI category mapping: `categoryFromType(type) -> { id, label, emoji, color }` for all 9 schema types |
| `apps/web/lib/format.ts` | Re-exports of `formatCurrency`/`formatDate`/`formatRelativeTime` from `@/lib/utils` plus a `formatDateRange(start,end,tz)` helper |
| `apps/web/components/ui/skeleton.tsx` | `<Skeleton className="…" />` — animated `bg-bg2` rounded box |
| `apps/web/components/trips/TripDetailClient.tsx` | Top-level client wrapper: owns activeTab, renders Hero + MembersBudget + TabBar + active tab content |
| `apps/web/components/trips/TripHero.tsx` | Cover image, gradient, back/share/⋯ icon row, title + destination/date pills |
| `apps/web/components/trips/MembersBudget.tsx` | Avatar stack + "N travelers" + budget row + progress bar |
| `apps/web/components/trips/tabs/ItineraryTab.tsx` | Day pills + "All days" toggle, `DayView` and `AccordionView` sub-components |
| `apps/web/components/trips/tabs/DiscoverTab.tsx` | Category chips + Suggested rail + Top-rated grid (visual shell wired to `search.searchAll`) |
| `apps/web/components/trips/tabs/SavedTab.tsx` | Category chips + 2-col card grid w/ comment badge + promote-to-itinerary action |
| `apps/web/components/trips/tabs/ActivityTab.tsx` | Sub-tab pill bar + dispatcher to 5 sub-views |
| `apps/web/components/trips/tabs/activity/PollsView.tsx` | Live polls list + create/vote |
| `apps/web/components/trips/tabs/activity/ExpensesView.tsx` | Expense summary + per-line list (read-only v1) |
| `apps/web/components/trips/tabs/activity/PostsView.tsx` | Live trip posts feed |
| `apps/web/components/trips/tabs/activity/MembersView.tsx` | Live members list w/ role tags |
| `apps/web/components/trips/tabs/activity/ChecklistsView.tsx` | Pre-trip checklist (read-only v1) |
| `apps/web/components/trips/AddItemSheet.tsx` | Bottom sheet: Search tab (calls `search.searchAll`) + Manual tab (form → `saved_items.addSavedItem` or `itinerary.addItem`) |
| `apps/web/components/trips/CategoryBadge.tsx` | Reusable solid-color category badge with emoji |
| `apps/web/components/trips/ItineraryCard.tsx` | One itinerary item: image, badge, title, location, debounced inline note input, arrow button |
| `apps/web/components/trips/TravelConnector.tsx` | Dashed connector between itinerary cards: car icon + "X km · Y min" |
| `apps/web/components/trips/SavedCard.tsx` | One saved item: image, badge, title, comment-count badge, "+ Add" → promote |
| `apps/web/app/(app)/trips/[slug]/loading.tsx` | Skeleton for the trip detail route (matches the real layout) |
| `apps/web/app/(app)/trips/[slug]/not-found.tsx` | "Trip not found" UI |
| `packages/convex/convex/polls.ts` | `getByTrip` query, `vote` mutation, `create` mutation, `unvote` mutation |
| `packages/convex/convex/posts.ts` | `getByTrip` query, `countBySavedItems` query, `create` mutation |
| `packages/convex/convex/members.ts` | `listByTrip` query (joins `users` for name/image) |
| `apps/web/lib/categories.test.ts` | Vitest unit tests for the category mapping |
| `apps/web/lib/format.test.ts` | Vitest unit tests for formatters |
| `packages/convex/convex/polls.test.ts` | convex-test suite for polls handlers |
| `packages/convex/convex/posts.test.ts` | convex-test suite for posts handlers |
| `packages/convex/convex/members.test.ts` | convex-test suite for members handler |

### Modified files
| Path | Change |
|------|--------|
| `apps/web/tsconfig.json` | Add `@/convex/*` path → `../../packages/convex/convex/*` |
| `apps/web/app/(app)/trips/[slug]/page.tsx` | Replace stub with real Server Component: fetch + auth-gate + render `<TripDetailClient initialTrip={…} />` |
| `apps/web/package.json` | Add `vitest` (devDep) if absent — used for `lib/*.test.ts` |
| `packages/convex/convex/itinerary.ts` | Add `updateItem` mutation (notes save) |
| `packages/convex/convex/package.json` | Add `convex-test` devDep if absent — used for backend handler tests |

---

## Conventions for every task

- **TDD discipline:** every task that adds executable code starts by writing a failing test, runs it to confirm failure, then implements, then runs to confirm pass, then commits.
- **Frequent commits:** one task = one commit. Use Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`).
- **Imports:**
  - Convex API: `import { api } from "@/convex/_generated/api"` (the new tsconfig path)
  - Types: `import type { Doc, Id } from "@/convex/_generated/dataModel"`
  - Utils: `import { cn, formatCurrency, formatDate } from "@/lib/utils"`
  - Convex auth on server: `import { getAuthToken } from "@convex-dev/auth/nextjs/server"` then pass `{ token }` into `fetchQuery`. (Verify exact name during Task 0; if the helper is `convexAuthNextjsToken`, swap accordingly.)
- **Test runner:** `pnpm --filter ./apps/web test` for web tests; `pnpm --filter ./packages/convex test` for backend tests. If `vitest` isn't yet wired into `apps/web`, Task 0 adds it.
- **Pink color:** keep existing `hsla(327, 99%, 42%, 1)` — do **not** introduce `#FF3D7F` from the design.
- **Theme:** use `prefers-color-scheme` + Tailwind's `dark:` variant. No explicit toggle in this plan.

---

## Task 0: Path alias, server-side Convex helper, Skeleton primitive

**Files:**
- Modify: `apps/web/tsconfig.json`
- Create: `apps/web/lib/convex-server.ts`
- Create: `apps/web/components/ui/skeleton.tsx`

- [ ] **Step 1: Add `@/convex/*` path alias to tsconfig**

Open `apps/web/tsconfig.json`. Find the `"paths"` block. Add the convex alias alongside the existing `@/*` entry:

```json
"paths": {
  "@/*": ["./*"],
  "@/convex/*": ["../../packages/convex/convex/*"]
}
```

- [ ] **Step 2: Verify the alias resolves**

Run: `cd apps/web && pnpm exec tsc --noEmit -p tsconfig.json --traceResolution 2>&1 | grep -m1 _generated/api || true`
Expected: no error about `@/convex/_generated/api` not being found in any sample import. (You can also `touch apps/web/_probe.ts` containing `import { api } from "@/convex/_generated/api"; void api;` then `pnpm exec tsc --noEmit` and delete the probe.)

- [ ] **Step 3: Identify the auth-token helper export name**

Run: `grep -RIn "export " node_modules/@convex-dev/auth/nextjs/server.* 2>/dev/null | head -20`
Look for an export named `getAuthToken`, `convexAuthNextjsToken`, or similar. Note the exact name — use it in the next step.

- [ ] **Step 4: Create the server-side fetch helper**

Create `apps/web/lib/convex-server.ts`:

```ts
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import type { FunctionReference } from "convex/server";

// Replace `convexAuthNextjsToken` with the exact export found in Step 3 if different.
export async function fetchAuthedQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: Query["_args"],
): Promise<Query["_returnType"]> {
  const token = await convexAuthNextjsToken();
  return fetchQuery(query, args, token ? { token } : {});
}
```

- [ ] **Step 5: Create the Skeleton component**

Create `apps/web/components/ui/skeleton.tsx`:

```tsx
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-foreground/10", className)}
      {...props}
    />
  );
}
```

- [ ] **Step 6: Type-check passes**

Run: `cd apps/web && pnpm exec tsc --noEmit`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add apps/web/tsconfig.json apps/web/lib/convex-server.ts apps/web/components/ui/skeleton.tsx
git commit -m "feat(web): add @/convex alias, server fetch helper, Skeleton primitive"
```

---

## Task 1: Category mapping module + tests

**Files:**
- Create: `apps/web/lib/categories.ts`
- Test: `apps/web/lib/categories.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/web/lib/categories.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { categoryFromType, ALL_CATEGORIES } from "./categories";

describe("categoryFromType", () => {
  it("maps schema enums to UI categories", () => {
    expect(categoryFromType("flight")).toEqual({
      id: "fly", label: "Fly", emoji: "✈️", color: "#2196F3",
    });
    expect(categoryFromType("hotel")).toEqual({
      id: "stay", label: "Stay", emoji: "🏨", color: "#7B68EE",
    });
    expect(categoryFromType("restaurant")).toEqual({
      id: "eat", label: "Eat/Drink", emoji: "🍽", color: "#F5A623",
    });
  });

  it("falls back to 'other' for unknown types", () => {
    // @ts-expect-error — testing runtime fallback
    expect(categoryFromType("nonsense").id).toBe("other");
  });

  it("ALL_CATEGORIES contains the 9 ui-side ids exactly once", () => {
    const ids = ALL_CATEGORIES.map(c => c.id).sort();
    expect(ids).toEqual([
      "adventure", "eat", "event", "fly", "other",
      "ride", "shop", "stay", "tour",
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && pnpm exec vitest run lib/categories.test.ts`
Expected: FAIL — module `./categories` not found. (If vitest isn't installed, install it first: `cd apps/web && pnpm add -D vitest @vitest/ui` and add `"test": "vitest"` to `apps/web/package.json` scripts. Then re-run.)

- [ ] **Step 3: Implement the module**

Create `apps/web/lib/categories.ts`:

```ts
import type { Doc } from "@/convex/_generated/dataModel";

export type SavedItemType = Doc<"saved_items">["type"];

export type UiCategory = {
  id: "fly" | "stay" | "eat" | "tour" | "ride" | "event" | "shop" | "adventure" | "other";
  label: string;
  emoji: string;
  color: string; // hex; pulled from design's --cat-* tokens
};

const MAP: Record<SavedItemType, UiCategory> = {
  flight:     { id: "fly",       label: "Fly",        emoji: "✈️", color: "#2196F3" },
  hotel:      { id: "stay",      label: "Stay",       emoji: "🏨", color: "#7B68EE" },
  restaurant: { id: "eat",       label: "Eat/Drink",  emoji: "🍽",  color: "#F5A623" },
  tour:       { id: "tour",      label: "Tour",       emoji: "🧭", color: "#2196F3" },
  car_rental: { id: "ride",      label: "Ride",       emoji: "🚗", color: "#FF8C42" },
  event:      { id: "event",     label: "Event",      emoji: "🎟",  color: "#FF6B6B" },
  activity:   { id: "adventure", label: "Adventure",  emoji: "⛰",  color: "#8BC34A" },
  transport:  { id: "ride",      label: "Ride",       emoji: "🚇", color: "#FF8C42" },
  other:      { id: "other",     label: "Other",      emoji: "📍", color: "#6B6B6B" },
};

export function categoryFromType(t: SavedItemType): UiCategory {
  return MAP[t] ?? MAP.other;
}

// One entry per unique ui-side category id (de-duped).
export const ALL_CATEGORIES: UiCategory[] = Array.from(
  new Map(Object.values(MAP).map(c => [c.id, c])).values(),
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web && pnpm exec vitest run lib/categories.test.ts`
Expected: PASS (3/3).

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/categories.ts apps/web/lib/categories.test.ts apps/web/package.json apps/web/pnpm-lock.yaml
git commit -m "feat(web): add UI category mapping for saved-item types"
```

---

## Task 2: Format helpers — date-range and currency tests

**Files:**
- Create: `apps/web/lib/format.ts`
- Test: `apps/web/lib/format.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/web/lib/format.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { formatDateRange } from "./format";

describe("formatDateRange", () => {
  it("renders same-month range as 'Mar 14–18, 2026'", () => {
    const start = Date.UTC(2026, 2, 14);
    const end   = Date.UTC(2026, 2, 18);
    expect(formatDateRange(start, end, "UTC")).toBe("Mar 14–18, 2026");
  });

  it("renders cross-month range as 'Mar 30 – Apr 3, 2026'", () => {
    const start = Date.UTC(2026, 2, 30);
    const end   = Date.UTC(2026, 3, 3);
    expect(formatDateRange(start, end, "UTC")).toBe("Mar 30 – Apr 3, 2026");
  });

  it("renders cross-year range as 'Dec 30, 2026 – Jan 3, 2027'", () => {
    const start = Date.UTC(2026, 11, 30);
    const end   = Date.UTC(2027, 0, 3);
    expect(formatDateRange(start, end, "UTC")).toBe("Dec 30, 2026 – Jan 3, 2027");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd apps/web && pnpm exec vitest run lib/format.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `apps/web/lib/format.ts`:

```ts
export { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";

export function formatDateRange(startMs: number, endMs: number, timezone: string): string {
  const s = new Date(startMs);
  const e = new Date(endMs);
  const sameYear  = s.getUTCFullYear() === e.getUTCFullYear();
  const sameMonth = sameYear && s.getUTCMonth() === e.getUTCMonth();

  const monthFmt = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: timezone });
  const dayFmt   = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: timezone });
  const yearFmt  = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: timezone });

  if (sameMonth) {
    return `${monthFmt.format(s)} ${dayFmt.format(s)}–${dayFmt.format(e)}, ${yearFmt.format(s)}`;
  }
  if (sameYear) {
    return `${monthFmt.format(s)} ${dayFmt.format(s)} – ${monthFmt.format(e)} ${dayFmt.format(e)}, ${yearFmt.format(s)}`;
  }
  return `${monthFmt.format(s)} ${dayFmt.format(s)}, ${yearFmt.format(s)} – ${monthFmt.format(e)} ${dayFmt.format(e)}, ${yearFmt.format(e)}`;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `cd apps/web && pnpm exec vitest run lib/format.test.ts`
Expected: PASS (3/3).

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/format.ts apps/web/lib/format.test.ts
git commit -m "feat(web): add formatDateRange helper for trip header date strings"
```

---

## Task 3: Convex `members.listByTrip` query + tests

**Files:**
- Create: `packages/convex/convex/members.ts`
- Test: `packages/convex/convex/members.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/convex/convex/members.test.ts`:

```ts
import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";

describe("members.listByTrip", () => {
  it("returns accepted members joined with user profile", async () => {
    const t = convexTest(schema);
    const userA = await t.run(async (ctx) =>
      ctx.db.insert("users", { email: "a@x.com", name: "Alice" })
    );
    const userB = await t.run(async (ctx) =>
      ctx.db.insert("users", { email: "b@x.com", name: "Bob" })
    );
    const tripId = await t.run(async (ctx) =>
      ctx.db.insert("trips", {
        title: "T", creatorId: userA, startDate: "2026-03-14", endDate: "2026-03-18",
        visibility: "private", status: "planning", slug: "t", joinCode: "j",
        currency: "GBP", createdAt: 0, updatedAt: 0,
      })
    );
    await t.run(async (ctx) => {
      await ctx.db.insert("trip_members", { tripId, userId: userA, role: "owner",  status: "accepted", joinedAt: 0 });
      await ctx.db.insert("trip_members", { tripId, userId: userB, role: "viewer", status: "accepted", joinedAt: 0 });
    });

    const members = await t.query(api.members.listByTrip, { tripId });
    expect(members).toHaveLength(2);
    expect(members.map(m => m.role).sort()).toEqual(["owner", "viewer"]);
    expect(members.find(m => m.role === "owner")?.user.name).toBe("Alice");
  });

  it("excludes pending and declined members", async () => {
    const t = convexTest(schema);
    const userA = await t.run(async (ctx) =>
      ctx.db.insert("users", { email: "a@x.com", name: "Alice" })
    );
    const tripId = await t.run(async (ctx) =>
      ctx.db.insert("trips", {
        title: "T", creatorId: userA, startDate: "2026-03-14", endDate: "2026-03-18",
        visibility: "private", status: "planning", slug: "t", joinCode: "j",
        currency: "GBP", createdAt: 0, updatedAt: 0,
      })
    );
    await t.run(async (ctx) => {
      await ctx.db.insert("trip_members", { tripId, userId: userA, role: "owner",  status: "pending",  joinedAt: 0 });
    });
    expect(await t.query(api.members.listByTrip, { tripId })).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd packages/convex && pnpm exec vitest run convex/members.test.ts`
Expected: FAIL — module `./members` not found. If `convex-test` isn't installed, run `pnpm add -D convex-test vitest @edge-runtime/vm` in `packages/convex` and ensure a `vitest.config.ts` exists per the convex-test docs.

- [ ] **Step 3: Implement**

Create `packages/convex/convex/members.ts`:

```ts
import { v } from "convex/values";
import { query } from "./_generated/server";

export const listByTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, { tripId }) => {
    const memberships = await ctx.db
      .query("trip_members")
      .withIndex("by_trip", q => q.eq("tripId", tripId))
      .filter(q => q.eq(q.field("status"), "accepted"))
      .collect();

    return Promise.all(
      memberships.map(async m => ({
        _id: m._id,
        role: m.role,
        joinedAt: m.joinedAt,
        user: await ctx.db.get(m.userId),
      })),
    );
  },
});
```

- [ ] **Step 4: Run to verify pass**

Run: `cd packages/convex && pnpm exec vitest run convex/members.test.ts`
Expected: PASS (2/2).

- [ ] **Step 5: Run convex codegen + typecheck**

Run: `cd packages/convex && npx convex dev --once --typecheck=enable`
Expected: exit 0; `_generated/api.d.ts` now includes `members.listByTrip`.

- [ ] **Step 6: Commit**

```bash
git add packages/convex/convex/members.ts packages/convex/convex/members.test.ts packages/convex/convex/_generated
git commit -m "feat(convex): add members.listByTrip query"
```

---

## Task 4: Convex `posts.ts` — `getByTrip`, `countBySavedItems`, `create`

**Files:**
- Create: `packages/convex/convex/posts.ts`
- Test: `packages/convex/convex/posts.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/convex/convex/posts.test.ts`:

```ts
import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";

async function seedTripWithUser(t: ReturnType<typeof convexTest>) {
  const userId = await t.run(c => c.db.insert("users", { email: "u@x.com", name: "U" }));
  const tripId = await t.run(c => c.db.insert("trips", {
    title: "T", creatorId: userId, startDate: "2026-03-14", endDate: "2026-03-18",
    visibility: "private", status: "planning", slug: "t", joinCode: "j",
    currency: "GBP", createdAt: 0, updatedAt: 0,
  }));
  return { userId, tripId };
}

describe("posts", () => {
  it("getByTrip returns posts in newest-first order with author joined", async () => {
    const t = convexTest(schema);
    const { userId, tripId } = await seedTripWithUser(t);
    await t.run(async (c) => {
      await c.db.insert("trip_posts", { tripId, createdByUserId: userId, content: "first",  createdAt: 1, updatedAt: 1 });
      await c.db.insert("trip_posts", { tripId, createdByUserId: userId, content: "second", createdAt: 2, updatedAt: 2 });
    });
    const posts = await t.query(api.posts.getByTrip, { tripId });
    expect(posts.map(p => p.content)).toEqual(["second", "first"]);
    expect(posts[0].author?.name).toBe("U");
  });

  it("countBySavedItems aggregates by savedItemId", async () => {
    const t = convexTest(schema);
    const { userId, tripId } = await seedTripWithUser(t);
    const savedId = await t.run(c => c.db.insert("saved_items", {
      tripId, addedByUserId: userId, type: "restaurant", title: "Pierchic",
      addedToItinerary: false, isManual: true, createdAt: 0, updatedAt: 0,
    }));
    await t.run(async (c) => {
      await c.db.insert("trip_posts", { tripId, createdByUserId: userId, content: "a", savedItemId: savedId, createdAt: 1, updatedAt: 1 });
      await c.db.insert("trip_posts", { tripId, createdByUserId: userId, content: "b", savedItemId: savedId, createdAt: 2, updatedAt: 2 });
    });
    const counts = await t.query(api.posts.countBySavedItems, { savedItemIds: [savedId] });
    expect(counts[savedId]).toBe(2);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd packages/convex && pnpm exec vitest run convex/posts.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `packages/convex/convex/posts.ts`:

```ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const getByTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, { tripId }) => {
    const posts = await ctx.db
      .query("trip_posts")
      .withIndex("by_trip", q => q.eq("tripId", tripId))
      .order("desc")
      .collect();

    return Promise.all(
      posts.map(async p => ({
        ...p,
        author: await ctx.db.get(p.createdByUserId),
      })),
    );
  },
});

export const countBySavedItems = query({
  args: { savedItemIds: v.array(v.id("saved_items")) },
  handler: async (ctx, { savedItemIds }) => {
    const counts: Record<string, number> = {};
    for (const id of savedItemIds) {
      const rows = await ctx.db
        .query("trip_posts")
        .withIndex("by_saved_item", q => q.eq("savedItemId", id))
        .collect();
      counts[id] = rows.length;
    }
    return counts as Record<Id<"saved_items">, number>;
  },
});

export const create = mutation({
  args: {
    tripId: v.id("trips"),
    content: v.string(),
    imageUrls: v.optional(v.array(v.string())),
    savedItemId: v.optional(v.id("saved_items")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("email"), identity.email))
      .unique();
    if (!user) throw new Error("User not found");
    const now = Date.now();
    return ctx.db.insert("trip_posts", {
      tripId: args.tripId,
      createdByUserId: user._id,
      content: args.content,
      imageUrls: args.imageUrls,
      savedItemId: args.savedItemId,
      createdAt: now,
      updatedAt: now,
    });
  },
});
```

- [ ] **Step 4: Run to verify pass**

Run: `cd packages/convex && pnpm exec vitest run convex/posts.test.ts`
Expected: PASS (2/2).

- [ ] **Step 5: Codegen + typecheck**

Run: `cd packages/convex && npx convex dev --once --typecheck=enable`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add packages/convex/convex/posts.ts packages/convex/convex/posts.test.ts packages/convex/convex/_generated
git commit -m "feat(convex): add posts.getByTrip, countBySavedItems, create"
```

---

## Task 5: Convex `polls.ts` — `getByTrip`, `vote`, `unvote`, `create`

**Files:**
- Create: `packages/convex/convex/polls.ts`
- Test: `packages/convex/convex/polls.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/convex/convex/polls.test.ts`:

```ts
import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";

async function seed(t: ReturnType<typeof convexTest>) {
  const userId = await t.run(c => c.db.insert("users", { email: "u@x.com", name: "U" }));
  const tripId = await t.run(c => c.db.insert("trips", {
    title: "T", creatorId: userId, startDate: "2026-03-14", endDate: "2026-03-18",
    visibility: "private", status: "planning", slug: "t", joinCode: "j",
    currency: "GBP", createdAt: 0, updatedAt: 0,
  }));
  const pollId = await t.run(c => c.db.insert("trip_polls", {
    tripId, createdByUserId: userId, title: "Where to eat?",
    type: "single_choice", status: "open", allowAddOptions: false,
    isAnonymous: false, createdAt: 0,
  }));
  const optA = await t.run(c => c.db.insert("poll_options", { pollId, label: "A", addedByUserId: userId, createdAt: 0 }));
  const optB = await t.run(c => c.db.insert("poll_options", { pollId, label: "B", addedByUserId: userId, createdAt: 0 }));
  return { userId, tripId, pollId, optA, optB };
}

describe("polls", () => {
  it("getByTrip returns each poll with options + vote counts", async () => {
    const t = convexTest(schema);
    const { tripId, optA, userId, pollId } = await seed(t);
    await t.run(c => c.db.insert("poll_votes", { pollId, optionId: optA, userId, createdAt: 0 }));
    const polls = await t.query(api.polls.getByTrip, { tripId });
    expect(polls).toHaveLength(1);
    expect(polls[0].totalVotes).toBe(1);
    expect(polls[0].options.find(o => o._id === optA)?.voteCount).toBe(1);
  });

  it("vote is idempotent: re-voting same option does not duplicate", async () => {
    const t = convexTest(schema);
    const { pollId, optA, userId } = await seed(t);
    const asUser = t.withIdentity({ subject: userId, email: "u@x.com" });
    await asUser.mutation(api.polls.vote, { pollId, optionId: optA });
    await asUser.mutation(api.polls.vote, { pollId, optionId: optA });
    const votes = await t.run(c =>
      c.db.query("poll_votes").withIndex("by_poll", q => q.eq("pollId", pollId)).collect()
    );
    expect(votes).toHaveLength(1);
  });

  it("vote on a different option in single_choice replaces the previous vote", async () => {
    const t = convexTest(schema);
    const { pollId, optA, optB, userId } = await seed(t);
    const asUser = t.withIdentity({ subject: userId, email: "u@x.com" });
    await asUser.mutation(api.polls.vote, { pollId, optionId: optA });
    await asUser.mutation(api.polls.vote, { pollId, optionId: optB });
    const votes = await t.run(c =>
      c.db.query("poll_votes").withIndex("by_poll", q => q.eq("pollId", pollId)).collect()
    );
    expect(votes).toHaveLength(1);
    expect(votes[0].optionId).toBe(optB);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd packages/convex && pnpm exec vitest run convex/polls.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `packages/convex/convex/polls.ts`:

```ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

async function resolveUserId(ctx: { auth: any; db: any }): Promise<Id<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("email"), identity.email))
    .unique();
  if (!user) throw new Error("User not found");
  return user._id as Id<"users">;
}

export const getByTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, { tripId }) => {
    const polls = await ctx.db
      .query("trip_polls")
      .withIndex("by_trip", q => q.eq("tripId", tripId))
      .order("desc")
      .collect();

    return Promise.all(
      polls.map(async (poll: Doc<"trip_polls">) => {
        const options = await ctx.db
          .query("poll_options")
          .withIndex("by_poll", q => q.eq("pollId", poll._id))
          .collect();
        const votes = await ctx.db
          .query("poll_votes")
          .withIndex("by_poll", q => q.eq("pollId", poll._id))
          .collect();
        const counts: Record<string, number> = {};
        for (const v2 of votes) counts[v2.optionId] = (counts[v2.optionId] ?? 0) + 1;
        const author = await ctx.db.get(poll.createdByUserId);
        return {
          ...poll,
          author,
          totalVotes: votes.length,
          options: options.map(o => ({ ...o, voteCount: counts[o._id] ?? 0 })),
        };
      }),
    );
  },
});

export const vote = mutation({
  args: { pollId: v.id("trip_polls"), optionId: v.id("poll_options") },
  handler: async (ctx, { pollId, optionId }) => {
    const userId = await resolveUserId(ctx);
    const poll = await ctx.db.get(pollId);
    if (!poll) throw new Error("Poll not found");
    if (poll.status !== "open") throw new Error("Poll is closed");

    const existing = await ctx.db
      .query("poll_votes")
      .withIndex("by_poll_user", q => q.eq("pollId", pollId).eq("userId", userId))
      .collect();

    if (poll.type === "single_choice") {
      const same = existing.find(v2 => v2.optionId === optionId);
      if (same) return same._id; // idempotent
      for (const v2 of existing) await ctx.db.delete(v2._id);
      return ctx.db.insert("poll_votes", { pollId, optionId, userId, createdAt: Date.now() });
    }

    // multi_choice / ranked: idempotent insert per (poll,user,option)
    if (existing.some(v2 => v2.optionId === optionId)) {
      return existing.find(v2 => v2.optionId === optionId)!._id;
    }
    return ctx.db.insert("poll_votes", { pollId, optionId, userId, createdAt: Date.now() });
  },
});

export const unvote = mutation({
  args: { pollId: v.id("trip_polls"), optionId: v.id("poll_options") },
  handler: async (ctx, { pollId, optionId }) => {
    const userId = await resolveUserId(ctx);
    const existing = await ctx.db
      .query("poll_votes")
      .withIndex("by_poll_user", q => q.eq("pollId", pollId).eq("userId", userId))
      .filter(q => q.eq(q.field("optionId"), optionId))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});

export const create = mutation({
  args: {
    tripId: v.id("trips"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("single_choice"), v.literal("multi_choice"), v.literal("ranked")),
    options: v.array(v.string()),
    closesAt: v.optional(v.number()),
    allowAddOptions: v.optional(v.boolean()),
    isAnonymous: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx);
    const pollId = await ctx.db.insert("trip_polls", {
      tripId: args.tripId,
      createdByUserId: userId,
      title: args.title,
      description: args.description,
      type: args.type,
      status: "open",
      closesAt: args.closesAt,
      allowAddOptions: args.allowAddOptions ?? false,
      isAnonymous: args.isAnonymous ?? false,
      createdAt: Date.now(),
    });
    for (const label of args.options) {
      await ctx.db.insert("poll_options", {
        pollId, label, addedByUserId: userId, createdAt: Date.now(),
      });
    }
    return pollId;
  },
});
```

- [ ] **Step 4: Run to verify pass**

Run: `cd packages/convex && pnpm exec vitest run convex/polls.test.ts`
Expected: PASS (3/3).

- [ ] **Step 5: Codegen + typecheck**

Run: `cd packages/convex && npx convex dev --once --typecheck=enable`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add packages/convex/convex/polls.ts packages/convex/convex/polls.test.ts packages/convex/convex/_generated
git commit -m "feat(convex): add polls module (getByTrip, vote, unvote, create)"
```

---

## Task 6: `itinerary.updateItem` mutation

**Files:**
- Modify: `packages/convex/convex/itinerary.ts`
- Test: extend `packages/convex/convex/itinerary.test.ts` if it exists, else create it

- [ ] **Step 1: Read the existing itinerary file to find the right insertion point**

Run: `grep -n "^export const" packages/convex/convex/itinerary.ts`
Note the exports — append the new mutation at the end.

- [ ] **Step 2: Write the failing test**

Create or extend `packages/convex/convex/itinerary.test.ts`:

```ts
import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";

describe("itinerary.updateItem", () => {
  it("updates the notes field on an itinerary item", async () => {
    const t = convexTest(schema);
    const userId = await t.run(c => c.db.insert("users", { email: "u@x.com", name: "U" }));
    const tripId = await t.run(c => c.db.insert("trips", {
      title: "T", creatorId: userId, startDate: "2026-03-14", endDate: "2026-03-18",
      visibility: "private", status: "planning", slug: "t", joinCode: "j",
      currency: "GBP", createdAt: 0, updatedAt: 0,
    }));
    const dayId = await t.run(c => c.db.insert("itinerary_days", {
      tripId, date: "2026-03-14", dayNumber: 1, createdAt: 0, updatedAt: 0,
    }));
    const itemId = await t.run(c => c.db.insert("itinerary_items", {
      tripId, dayId, type: "restaurant", title: "Pierchic",
      addedByUserId: userId, createdAt: 0, updatedAt: 0, sortOrder: 0,
    }));

    const asUser = t.withIdentity({ subject: userId, email: "u@x.com" });
    await asUser.mutation(api.itinerary.updateItem, { itemId, notes: "Reservation 7:30" });
    const item = await t.run(c => c.db.get(itemId));
    expect(item?.notes).toBe("Reservation 7:30");
  });
});
```

(If the existing `itinerary_items` schema differs from `addedByUserId`/`sortOrder`, adjust the seed insert to match — read `schema.ts` line 279 first.)

- [ ] **Step 3: Run to verify failure**

Run: `cd packages/convex && pnpm exec vitest run convex/itinerary.test.ts -t updateItem`
Expected: FAIL — `api.itinerary.updateItem` does not exist.

- [ ] **Step 4: Implement**

Append to `packages/convex/convex/itinerary.ts`:

```ts
export const updateItem = mutation({
  args: {
    itemId: v.id("itinerary_items"),
    notes: v.optional(v.string()),
    title: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, { itemId, ...patch }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.patch(itemId, { ...patch, updatedAt: Date.now() });
  },
});
```

(Make sure `mutation` and `v` are already imported at the top of the file.)

- [ ] **Step 5: Run to verify pass**

Run: `cd packages/convex && pnpm exec vitest run convex/itinerary.test.ts -t updateItem`
Expected: PASS.

- [ ] **Step 6: Codegen + typecheck**

Run: `cd packages/convex && npx convex dev --once --typecheck=enable`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add packages/convex/convex/itinerary.ts packages/convex/convex/itinerary.test.ts packages/convex/convex/_generated
git commit -m "feat(convex): add itinerary.updateItem mutation"
```

---

## Task 7: Server Component — fetch + auth-gate the trip detail route

**Files:**
- Modify: `apps/web/app/(app)/trips/[slug]/page.tsx`
- Create: `apps/web/app/(app)/trips/[slug]/loading.tsx`
- Create: `apps/web/app/(app)/trips/[slug]/not-found.tsx`

- [ ] **Step 1: Add `loading.tsx`**

Create `apps/web/app/(app)/trips/[slug]/loading.tsx`:

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <Skeleton className="h-64 w-full" />
      <div className="mt-4 flex gap-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Add `not-found.tsx`**

Create `apps/web/app/(app)/trips/[slug]/not-found.tsx`:

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-2xl font-bold">Trip not found</h1>
      <p className="mt-2 text-sm text-foreground/60">
        That trip doesn&apos;t exist, was deleted, or you don&apos;t have access.
      </p>
      <Link
        href="/home"
        className="mt-6 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
      >
        Back to home
      </Link>
    </main>
  );
}
```

- [ ] **Step 3: Replace page.tsx with the real Server Component**

Overwrite `apps/web/app/(app)/trips/[slug]/page.tsx`:

```tsx
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchAuthedQuery } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import { TripDetailClient } from "@/components/trips/TripDetailClient";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const trip = await fetchAuthedQuery(api.trips.getBySlug, { slug });
  return { title: trip?.title ?? "Trip" };
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = await fetchAuthedQuery(api.trips.getBySlug, { slug });
  if (!trip) notFound();

  const viewer = await fetchAuthedQuery(api.users.getCurrentUser, {});

  if (trip.visibility === "private") {
    if (!viewer) redirect("/sign-in");
    const members = await fetchAuthedQuery(api.members.listByTrip, { tripId: trip._id });
    const isMember = members.some(m => m.user?._id === viewer._id);
    if (!isMember) redirect("/sign-in");
  }

  return <TripDetailClient slug={slug} initialTrip={trip} />;
}
```

- [ ] **Step 4: Type-check passes (TripDetailClient stub will fail; create the stub now)**

Create a minimal stub `apps/web/components/trips/TripDetailClient.tsx`:

```tsx
"use client";
import type { Doc } from "@/convex/_generated/dataModel";

export function TripDetailClient({ slug, initialTrip }: {
  slug: string;
  initialTrip: Doc<"trips">;
}) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold">{initialTrip.title}</h1>
      <p className="text-sm text-foreground/60">{slug}</p>
    </main>
  );
}
```

Run: `cd apps/web && pnpm exec tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/\(app\)/trips/\[slug\]/page.tsx \
        apps/web/app/\(app\)/trips/\[slug\]/loading.tsx \
        apps/web/app/\(app\)/trips/\[slug\]/not-found.tsx \
        apps/web/components/trips/TripDetailClient.tsx
git commit -m "feat(web): trip detail server component with auth-gate + loading/not-found"
```

---

## Task 8: TripHero component

**Files:**
- Create: `apps/web/components/trips/TripHero.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import Link from "next/link";
import { ArrowLeft, Share2, MoreHorizontal, MapPin, Calendar } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";
import { formatDateRange } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  trip: Doc<"trips">;
  destinationLabel?: string;
  timezone?: string;
};

export function TripHero({ trip, destinationLabel, timezone = "UTC" }: Props) {
  const startMs = Date.parse(trip.startDate);
  const endMs   = Date.parse(trip.endDate);
  return (
    <section className={cn(
      "relative isolate overflow-hidden rounded-2xl",
      "h-72 md:h-96 lg:h-[420px]",
      "bg-foreground/5",
    )}>
      {trip.coverImageUrl && (
        <img
          src={trip.coverImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/30" />

      <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between">
        <Link href="/home" aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-black backdrop-blur">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex gap-2">
          <button aria-label="Share" className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-black backdrop-blur">
            <Share2 className="h-4 w-4" />
          </button>
          <button aria-label="Options" className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-black backdrop-blur">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-5 left-5 right-5 z-10 text-white">
        <h1 className="font-display text-2xl font-bold leading-tight md:text-4xl">
          {trip.title}
        </h1>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {(destinationLabel ?? trip.destinationLabel) && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-3 py-1 backdrop-blur">
              <MapPin className="h-3 w-3" /> {destinationLabel ?? trip.destinationLabel}
            </span>
          )}
          {!Number.isNaN(startMs) && !Number.isNaN(endMs) && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-3 py-1 backdrop-blur">
              <Calendar className="h-3 w-3" /> {formatDateRange(startMs, endMs, timezone)}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `cd apps/web && pnpm exec tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/trips/TripHero.tsx
git commit -m "feat(web): TripHero component"
```

---

## Task 9: MembersBudget component

**Files:**
- Create: `apps/web/components/trips/MembersBudget.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { useQuery } from "convex/react";
import type { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  trip: Doc<"trips">;
  displayCurrency?: string;
};

export function MembersBudget({ trip, displayCurrency }: Props) {
  const members = useQuery(api.members.listByTrip, { tripId: trip._id });

  return (
    <section className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
      <div className="flex items-center gap-3">
        {members === undefined ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <>
            <div className="flex">
              {members.slice(0, 4).map((m, i) => (
                <div
                  key={m._id}
                  title={m.user?.name ?? ""}
                  className="-ml-2 h-8 w-8 overflow-hidden rounded-full border-2 border-background bg-foreground/10 first:ml-0"
                  style={{ zIndex: 4 - i }}
                >
                  {m.user?.image && <img src={m.user.image} alt="" className="h-full w-full object-cover" />}
                </div>
              ))}
              {members.length > 4 && (
                <div className="-ml-2 grid h-8 w-8 place-items-center rounded-full border-2 border-background bg-foreground/10 text-[11px] font-semibold">
                  +{members.length - 4}
                </div>
              )}
            </div>
            <span className="text-xs text-foreground/60">
              <b className="font-semibold text-foreground">{members.length}</b> traveler{members.length === 1 ? "" : "s"}
            </span>
          </>
        )}
      </div>

      {trip.estimatedBudget !== undefined && (
        <div className="text-xs text-foreground/60 md:text-right">
          <span className="font-semibold text-foreground">
            {formatCurrency(trip.estimatedBudget, trip.currency, displayCurrency)}
          </span>
          {" "}estimated
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `cd apps/web && pnpm exec tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/trips/MembersBudget.tsx
git commit -m "feat(web): MembersBudget — live member avatars + budget summary"
```

---

## Task 10: TripDetailClient shell — tabs + viewer + active-tab state

**Files:**
- Modify: `apps/web/components/trips/TripDetailClient.tsx`

- [ ] **Step 1: Implement**

Replace the stub with:

```tsx
"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import type { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { TripHero } from "./TripHero";
import { MembersBudget } from "./MembersBudget";
import { ItineraryTab } from "./tabs/ItineraryTab";
import { DiscoverTab } from "./tabs/DiscoverTab";
import { SavedTab } from "./tabs/SavedTab";
import { ActivityTab } from "./tabs/ActivityTab";

type TabId = "itinerary" | "discover" | "saved" | "activity";
const TABS: { id: TabId; label: string }[] = [
  { id: "itinerary", label: "Itinerary" },
  { id: "discover",  label: "Discover" },
  { id: "saved",     label: "Saved" },
  { id: "activity",  label: "Activity" },
];

export function TripDetailClient({ slug, initialTrip }: {
  slug: string;
  initialTrip: Doc<"trips">;
}) {
  const liveTrip = useQuery(api.trips.getBySlug, { slug });
  const trip = liveTrip ?? initialTrip;
  const viewer = useQuery(api.users.getCurrentUser, {});
  const [tab, setTab] = useState<TabId>("itinerary");

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <TripHero trip={trip} timezone={"UTC"} />
      <MembersBudget trip={trip} displayCurrency={viewer?.preferredCurrency} />

      <nav className="mt-6 flex gap-2 border-b border-foreground/10" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-3 py-3 text-xs font-semibold uppercase tracking-wider",
              "border-b-2 -mb-px transition-colors",
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-foreground/40 hover:text-foreground/70",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-4">
        {tab === "itinerary" && <ItineraryTab trip={trip} viewer={viewer ?? null} />}
        {tab === "discover"  && <DiscoverTab  trip={trip} viewer={viewer ?? null} />}
        {tab === "saved"     && <SavedTab     trip={trip} viewer={viewer ?? null} />}
        {tab === "activity"  && <ActivityTab  trip={trip} viewer={viewer ?? null} />}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Create stub tab components so the build passes**

For each of `ItineraryTab`, `DiscoverTab`, `SavedTab`, `ActivityTab`, create a stub at `apps/web/components/trips/tabs/<Name>.tsx`:

```tsx
"use client";
import type { Doc } from "@/convex/_generated/dataModel";
export function ItineraryTab(_: { trip: Doc<"trips">; viewer: Doc<"users"> | null }) {
  return <div className="py-8 text-sm text-foreground/60">Itinerary coming up…</div>;
}
```

(Repeat with the matching name for the other three.)

- [ ] **Step 3: Type-check**

Run: `cd apps/web && pnpm exec tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/trips/TripDetailClient.tsx apps/web/components/trips/tabs
git commit -m "feat(web): TripDetailClient shell with 4-tab nav + tab stubs"
```

---

## Task 11: ItineraryTab — day pills, "All days" toggle, day view

**Files:**
- Create: `apps/web/components/trips/CategoryBadge.tsx`
- Create: `apps/web/components/trips/ItineraryCard.tsx`
- Create: `apps/web/components/trips/TravelConnector.tsx`
- Modify: `apps/web/components/trips/tabs/ItineraryTab.tsx`

- [ ] **Step 1: CategoryBadge**

```tsx
import { categoryFromType, type SavedItemType } from "@/lib/categories";

export function CategoryBadge({ type }: { type: SavedItemType }) {
  const c = categoryFromType(type);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold text-white"
      style={{ background: c.color }}
    >
      {c.emoji} {c.label}
    </span>
  );
}
```

- [ ] **Step 2: TravelConnector**

```tsx
import { Car } from "lucide-react";

export function TravelConnector({ distanceKm, durationMin }: {
  distanceKm?: number;
  durationMin?: number;
}) {
  if (distanceKm == null || durationMin == null) return null;
  return (
    <div className="my-2 ml-4 flex items-center gap-2 pl-4 text-xs text-foreground/60">
      <span className="grid h-6 w-6 place-items-center rounded-full border border-foreground/10 bg-foreground/5">
        <Car className="h-3 w-3" />
      </span>
      <span>{distanceKm} km · {durationMin} min</span>
    </div>
  );
}
```

- [ ] **Step 3: ItineraryCard with debounced inline note save**

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { CategoryBadge } from "./CategoryBadge";

export function ItineraryCard({ item }: { item: Doc<"itinerary_items"> }) {
  const updateItem = useMutation(api.itinerary.updateItem);
  const [notes, setNotes] = useState(item.notes ?? "");
  const lastSaved = useRef(item.notes ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (notes === lastSaved.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      updateItem({ itemId: item._id, notes }).then(() => {
        lastSaved.current = notes;
      });
    }, 600);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [notes, item._id, updateItem]);

  return (
    <article className="overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-sm">
      {item.imageUrl && (
        <div className="relative aspect-[16/9] bg-foreground/5">
          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
          <div className="absolute left-2.5 top-2.5">
            <CategoryBadge type={item.type} />
          </div>
        </div>
      )}
      <div className="p-4">
        <h3 className="text-base font-semibold leading-tight">{item.title}</h3>
        {item.locationName && (
          <p className="mt-1 flex items-center gap-1 text-xs text-foreground/60">
            <MapPin className="h-3 w-3" /> {item.locationName}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add a note for the group…"
            className="h-9 flex-1 rounded-full bg-foreground/5 px-3 text-xs text-foreground placeholder:text-foreground/40 focus:bg-foreground/10 focus:outline-none"
          />
          <button aria-label="Open" className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: ItineraryTab implementation**

Replace the stub at `apps/web/components/trips/tabs/ItineraryTab.tsx`:

```tsx
"use client";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { ItineraryCard } from "../ItineraryCard";
import { TravelConnector } from "../TravelConnector";

type Props = { trip: Doc<"trips">; viewer: Doc<"users"> | null };

export function ItineraryTab({ trip }: Props) {
  const data = useQuery(api.itinerary.getItinerary, { tripId: trip._id });
  const [mode, setMode] = useState<"day" | "all">("day");
  const [activeDayId, setActiveDayId] = useState<string | null>(null);

  const days = data?.days ?? [];
  const activeDay = useMemo(() => {
    if (!days.length) return null;
    return days.find(d => d._id === activeDayId) ?? days[0];
  }, [days, activeDayId]);

  if (data === undefined) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (!days.length) {
    return (
      <div className="rounded-2xl border border-dashed border-foreground/15 px-6 py-10 text-center text-sm text-foreground/60">
        No days yet — add the first one to get started.
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setMode(m => m === "all" ? "day" : "all")}
          className={cn(
            "h-9 flex-shrink-0 rounded-full border px-4 text-xs font-semibold",
            mode === "all"
              ? "border-primary bg-primary/10 text-primary"
              : "border-foreground/15 text-foreground",
          )}
        >
          All days
        </button>
        {days.map(d => {
          const date = new Date(d.date);
          const dow = date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }).toUpperCase();
          const num = date.getUTCDate();
          const active = mode === "day" && (activeDay?._id === d._id);
          return (
            <button
              key={d._id}
              onClick={() => { setMode("day"); setActiveDayId(d._id); }}
              className="flex flex-shrink-0 flex-col items-center gap-1 px-1"
            >
              <span className={cn("text-[9.5px] font-semibold tracking-wider", active ? "text-primary" : "text-foreground/40")}>{dow}</span>
              <span className={cn(
                "grid h-9 w-9 place-items-center rounded-full text-sm font-semibold",
                active ? "bg-primary text-primary-foreground" : "text-foreground",
              )}>{num}</span>
            </button>
          );
        })}
      </div>

      {mode === "day" && activeDay ? (
        <DayView day={activeDay} tripId={trip._id} />
      ) : (
        <div className="space-y-6">
          {days.map(d => <DayView key={d._id} day={d} tripId={trip._id} compact />)}
        </div>
      )}
    </>
  );
}

function DayView({ day, tripId, compact }: {
  day: NonNullable<ReturnType<typeof useDays>>[number];
  tripId: Doc<"trips">["_id"];
  compact?: boolean;
}) {
  const detail = useQuery(api.itinerary.getDayWithTravelTimes, { dayId: day._id });
  const items = detail?.items ?? day.items ?? [];
  const legs  = detail?.legs ?? [];

  return (
    <section className={compact ? "" : "mt-4"}>
      <header className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-xl font-bold">
          Day {day.dayNumber}{day.title ? ` — ${day.title}` : ""}
        </h2>
        <span className="text-xs text-foreground/60">{day.date}</span>
      </header>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={it._id}>
            <ItineraryCard item={it} />
            {i < items.length - 1 && <TravelConnector distanceKm={legs[i]?.distanceKm} durationMin={legs[i]?.durationMin} />}
          </div>
        ))}
        <button className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary text-sm font-semibold text-primary">
          <Plus className="h-4 w-4" /> Add to Day {day.dayNumber}
        </button>
      </div>
    </section>
  );
}

// Helper type alias to avoid `any`.
type useDays = ReturnType<typeof useQuery<typeof api.itinerary.getItinerary>>["days"];
```

(If `getItinerary`'s actual returned shape differs from `{ days: [...] }`, adjust the destructuring; fall back to `day.items ?? []` so missing fields are handled.)

- [ ] **Step 5: Type-check**

Run: `cd apps/web && pnpm exec tsc --noEmit`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/trips
git commit -m "feat(web): ItineraryTab — day pills, day view, travel connector, inline notes"
```

---

## Task 12: AddItemSheet — Search + Manual tabs

**Files:**
- Create: `apps/web/components/trips/AddItemSheet.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Sheet } from "@/components/ui/sheet";
import { ALL_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

type Mode = "search" | "manual";
type Target = { kind: "saved"; tripId: Id<"trips"> } | { kind: "itinerary"; tripId: Id<"trips">; dayId: Id<"itinerary_days"> };

export function AddItemSheet({
  open, onClose, target,
}: {
  open: boolean;
  onClose: () => void;
  target: Target;
}) {
  const [mode, setMode] = useState<Mode>("manual");

  return (
    <Sheet open={open} onClose={onClose} title="Add to trip">
      <div className="mb-4 flex gap-2">
        {(["search", "manual"] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "h-9 rounded-full px-4 text-xs font-semibold",
              mode === m ? "bg-primary text-primary-foreground" : "bg-foreground/5 text-foreground/70",
            )}
          >
            {m === "search" ? "Search" : "Manual"}
          </button>
        ))}
      </div>
      {mode === "search" ? <SearchTab target={target} onDone={onClose} /> : <ManualTab target={target} onDone={onClose} />}
    </Sheet>
  );
}

function SearchTab({ target, onDone }: { target: Target; onDone: () => void }) {
  const [term, setTerm] = useState("");
  const results = useQuery(api.search.searchAll, term.length >= 2 ? { term, limit: 10 } : "skip");
  const addSaved = useMutation(api.saved_items.addSavedItem);

  return (
    <>
      <input
        value={term}
        onChange={e => setTerm(e.target.value)}
        placeholder="Search destinations, experiences, events…"
        className="h-10 w-full rounded-full bg-foreground/5 px-4 text-sm focus:bg-foreground/10 focus:outline-none"
      />
      <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto">
        {(results?.experiences ?? []).map(exp => (
          <li key={exp._id} className="flex items-center justify-between rounded-xl border border-foreground/10 p-3">
            <span className="text-sm">{exp.title}</span>
            <button
              onClick={async () => {
                await addSaved({
                  tripId: target.tripId,
                  type: "activity",
                  title: exp.title,
                  isManual: false,
                  imageUrl: exp.imageUrl,
                });
                onDone();
              }}
              className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
            >
              Add
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

function ManualTab({ target, onDone }: { target: Target; onDone: () => void }) {
  const addSaved = useMutation(api.saved_items.addSavedItem);
  const addItem  = useMutation(api.itinerary.addItem);
  const [type, setType] = useState<Doc<"saved_items">["type"]>("activity");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        const priceNum = price ? Number(price) : undefined;
        if (target.kind === "itinerary") {
          await addItem({
            tripId: target.tripId,
            dayId: target.dayId,
            type,
            title,
            startTime: time || undefined,
            price: priceNum,
            notes: notes || undefined,
          });
        } else {
          await addSaved({
            tripId: target.tripId,
            type,
            title,
            date: date || undefined,
            price: priceNum,
            notes: notes || undefined,
            isManual: true,
          });
        }
        onDone();
      }}
      className="space-y-3"
    >
      <select value={type} onChange={e => setType(e.target.value as typeof type)}
              className="h-10 w-full rounded-xl bg-foreground/5 px-3 text-sm">
        {ALL_CATEGORIES.map(c => (
          <option key={c.id} value={uiCategoryToType(c.id)}>{c.emoji} {c.label}</option>
        ))}
      </select>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required
             className="h-10 w-full rounded-xl bg-foreground/5 px-3 text-sm" />
      {target.kind === "saved" && (
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
               className="h-10 w-full rounded-xl bg-foreground/5 px-3 text-sm" />
      )}
      {target.kind === "itinerary" && (
        <input type="time" value={time} onChange={e => setTime(e.target.value)}
               className="h-10 w-full rounded-xl bg-foreground/5 px-3 text-sm" />
      )}
      <input type="number" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price"
             className="h-10 w-full rounded-xl bg-foreground/5 px-3 text-sm" />
      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes" rows={3}
                className="w-full rounded-xl bg-foreground/5 p-3 text-sm" />
      <button type="submit" className="h-10 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground">
        Add
      </button>
    </form>
  );
}

function uiCategoryToType(id: string): Doc<"saved_items">["type"] {
  switch (id) {
    case "fly":       return "flight";
    case "stay":      return "hotel";
    case "eat":       return "restaurant";
    case "tour":      return "tour";
    case "ride":      return "transport";
    case "event":     return "event";
    case "shop":      return "other";
    case "adventure": return "activity";
    default:          return "other";
  }
}
```

- [ ] **Step 2: Wire the "+ Add to Day N" button in `ItineraryTab` to open the sheet**

In `ItineraryTab.tsx`, lift sheet state and pass to each `DayView`:

```tsx
const [addOpen, setAddOpen] = useState(false);
const [addDayId, setAddDayId] = useState<Id<"itinerary_days"> | null>(null);
// …
<button onClick={() => { setAddDayId(day._id); setAddOpen(true); }} …>Add to Day {day.dayNumber}</button>
// …
{addOpen && addDayId && (
  <AddItemSheet open onClose={() => setAddOpen(false)} target={{ kind: "itinerary", tripId, dayId: addDayId }} />
)}
```

- [ ] **Step 3: Type-check**

Run: `cd apps/web && pnpm exec tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/trips/AddItemSheet.tsx apps/web/components/trips/tabs/ItineraryTab.tsx
git commit -m "feat(web): AddItemSheet (Search + Manual) wired to itinerary"
```

---

## Task 13: SavedTab — chips, grid, comment-count badge, promote action

**Files:**
- Create: `apps/web/components/trips/SavedCard.tsx`
- Modify: `apps/web/components/trips/tabs/SavedTab.tsx`

- [ ] **Step 1: SavedCard**

```tsx
"use client";
import { MessageSquare, Plus } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";
import { CategoryBadge } from "./CategoryBadge";
import { formatCurrency } from "@/lib/format";

export function SavedCard({
  item, commentCount, displayCurrency, onPromote,
}: {
  item: Doc<"saved_items">;
  commentCount: number;
  displayCurrency?: string;
  onPromote: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-sm">
      <div className="relative aspect-[4/3] bg-foreground/5">
        {item.imageUrl && <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />}
        <div className="absolute left-2 top-2"><CategoryBadge type={item.type} /></div>
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold">{item.title}</h3>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-xs text-foreground/60">{item.description}</p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] text-foreground/60">
            <MessageSquare className="h-3 w-3" /> {commentCount}
          </span>
          {item.price != null && item.currency && (
            <span className="text-xs font-semibold">
              {formatCurrency(item.price, item.currency, displayCurrency)}
            </span>
          )}
          <button onClick={onPromote} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: SavedTab — wire query + chips + promote**

```tsx
"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { ALL_CATEGORIES, categoryFromType } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { SavedCard } from "../SavedCard";

type Props = { trip: Doc<"trips">; viewer: Doc<"users"> | null };

export function SavedTab({ trip, viewer }: Props) {
  const [activeCat, setActiveCat] = useState<string>("all");
  const items = useQuery(api.saved_items.getSavedItems, { tripId: trip._id });
  const days  = useQuery(api.itinerary.getItinerary, { tripId: trip._id });
  const counts = useQuery(api.posts.countBySavedItems,
    items ? { savedItemIds: items.map(i => i._id) } : "skip"
  );
  const promote = useMutation(api.saved_items.promoteToItinerary);

  if (items === undefined) {
    return <div className="grid gap-3 md:grid-cols-2"><Skeleton className="h-44" /><Skeleton className="h-44" /></div>;
  }

  const filtered = activeCat === "all"
    ? items
    : items.filter(i => categoryFromType(i.type).id === activeCat);

  const firstDayId: Id<"itinerary_days"> | undefined = days?.days?.[0]?._id;

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-3">
        <Chip on={activeCat === "all"} onClick={() => setActiveCat("all")}>All</Chip>
        {ALL_CATEGORIES.map(c => (
          <Chip key={c.id} on={activeCat === c.id} onClick={() => setActiveCat(c.id)}>
            {c.emoji} {c.label}
          </Chip>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(item => (
          <SavedCard
            key={item._id}
            item={item}
            commentCount={counts?.[item._id] ?? 0}
            displayCurrency={viewer?.preferredCurrency}
            onPromote={() => firstDayId && promote({ savedItemId: item._id, dayId: firstDayId })}
          />
        ))}
      </div>
    </>
  );
}

function Chip({ on, onClick, children }: React.PropsWithChildren<{ on: boolean; onClick: () => void }>) {
  return (
    <button onClick={onClick} className={cn(
      "h-9 flex-shrink-0 rounded-full px-4 text-xs font-medium",
      on ? "bg-primary text-primary-foreground" : "bg-foreground/5 text-foreground/70 hover:text-foreground",
    )}>{children}</button>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `cd apps/web && pnpm exec tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/trips/SavedCard.tsx apps/web/components/trips/tabs/SavedTab.tsx
git commit -m "feat(web): SavedTab — chips + grid + comment badge + promote"
```

---

## Task 14: ActivityTab dispatcher + PollsView

**Files:**
- Modify: `apps/web/components/trips/tabs/ActivityTab.tsx`
- Create: `apps/web/components/trips/tabs/activity/PollsView.tsx`
- Create: `apps/web/components/trips/tabs/activity/MembersView.tsx`
- Create: `apps/web/components/trips/tabs/activity/PostsView.tsx`
- Create: `apps/web/components/trips/tabs/activity/ExpensesView.tsx`
- Create: `apps/web/components/trips/tabs/activity/ChecklistsView.tsx`

- [ ] **Step 1: ActivityTab dispatcher**

```tsx
"use client";
import { useState } from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { PollsView } from "./activity/PollsView";
import { MembersView } from "./activity/MembersView";
import { PostsView } from "./activity/PostsView";
import { ExpensesView } from "./activity/ExpensesView";
import { ChecklistsView } from "./activity/ChecklistsView";

type Sub = "polls" | "expenses" | "posts" | "members" | "checklists";
const SUBS: { id: Sub; label: string }[] = [
  { id: "polls",      label: "Polls" },
  { id: "expenses",   label: "Expenses" },
  { id: "posts",      label: "Posts" },
  { id: "members",    label: "Members" },
  { id: "checklists", label: "Checklists" },
];

export function ActivityTab({ trip, viewer }: { trip: Doc<"trips">; viewer: Doc<"users"> | null }) {
  const [sub, setSub] = useState<Sub>("polls");
  return (
    <>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {SUBS.map(s => (
          <button key={s.id} onClick={() => setSub(s.id)}
            className={cn(
              "h-8 flex-shrink-0 rounded-full px-3 text-xs font-semibold",
              sub === s.id ? "bg-primary text-primary-foreground" : "bg-foreground/5 text-foreground/70",
            )}
          >{s.label}</button>
        ))}
      </div>
      {sub === "polls"      && <PollsView      trip={trip} viewer={viewer} />}
      {sub === "expenses"   && <ExpensesView   trip={trip} viewer={viewer} />}
      {sub === "posts"      && <PostsView      trip={trip} viewer={viewer} />}
      {sub === "members"    && <MembersView    trip={trip} viewer={viewer} />}
      {sub === "checklists" && <ChecklistsView trip={trip} viewer={viewer} />}
    </>
  );
}
```

- [ ] **Step 2: PollsView — live polls + vote + create**

```tsx
"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function PollsView({ trip }: { trip: Doc<"trips">; viewer: Doc<"users"> | null }) {
  const polls = useQuery(api.polls.getByTrip, { tripId: trip._id });
  const vote  = useMutation(api.polls.vote);
  const create = useMutation(api.polls.create);
  const [creating, setCreating] = useState(false);

  if (polls === undefined) {
    return <div className="space-y-3"><Skeleton className="h-40" /><Skeleton className="h-40" /></div>;
  }

  return (
    <div className="space-y-3">
      {polls.map(p => (
        <article key={p._id} className="rounded-2xl border border-foreground/10 bg-background p-4 shadow-sm">
          <header className="mb-3 flex items-center gap-3">
            {p.author?.image && <img src={p.author.image} alt="" className="h-9 w-9 rounded-full object-cover" />}
            <div>
              <div className="text-sm font-semibold">{p.author?.name ?? "Someone"}</div>
              <div className="text-[11px] text-foreground/60">{new Date(p.createdAt).toLocaleDateString()}</div>
            </div>
          </header>
          <div className="font-display text-base font-semibold">{p.title}</div>
          <div className="mt-3 space-y-2">
            {p.options.map(o => {
              const pct = p.totalVotes ? Math.round((o.voteCount / p.totalVotes) * 100) : 0;
              return (
                <button key={o._id} onClick={() => vote({ pollId: p._id, optionId: o._id })}
                  className="relative flex h-10 w-full items-center overflow-hidden rounded-full bg-foreground/5">
                  <div className="absolute inset-y-0 left-0 bg-primary/20" style={{ width: `${pct}%` }} />
                  <span className="relative px-3 text-xs font-semibold">{o.label}</span>
                  <span className="relative ml-auto pr-3 text-xs font-bold">{pct}%</span>
                </button>
              );
            })}
          </div>
        </article>
      ))}
      <button
        onClick={async () => {
          setCreating(true);
          const title = window.prompt("Poll question?");
          if (title) {
            const optionsRaw = window.prompt("Options (comma-separated)") ?? "";
            const opts = optionsRaw.split(",").map(s => s.trim()).filter(Boolean);
            if (opts.length >= 2) {
              await create({ tripId: trip._id, title, type: "single_choice", options: opts });
            }
          }
          setCreating(false);
        }}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary text-sm font-semibold text-primary",
          creating && "opacity-60",
        )}
      >
        <Plus className="h-4 w-4" /> Create poll
      </button>
    </div>
  );
}
```

- [ ] **Step 3: MembersView**

```tsx
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";

export function MembersView({ trip }: { trip: Doc<"trips">; viewer: Doc<"users"> | null }) {
  const members = useQuery(api.members.listByTrip, { tripId: trip._id });
  if (members === undefined) {
    return <div className="space-y-2"><Skeleton className="h-14" /><Skeleton className="h-14" /></div>;
  }
  return (
    <ul className="divide-y divide-foreground/10">
      {members.map(m => (
        <li key={m._id} className="flex items-center gap-3 py-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-foreground/10">
            {m.user?.image && <img src={m.user.image} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{m.user?.name ?? "Member"}</div>
            <div className="text-[11px] text-foreground/60">{m.role}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: PostsView**

```tsx
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/format";

export function PostsView({ trip }: { trip: Doc<"trips">; viewer: Doc<"users"> | null }) {
  const posts = useQuery(api.posts.getByTrip, { tripId: trip._id });
  if (posts === undefined) return <Skeleton className="h-32" />;
  if (!posts.length) return <div className="py-8 text-center text-sm text-foreground/60">No posts yet.</div>;
  return (
    <div className="space-y-3">
      {posts.map(p => (
        <article key={p._id} className="rounded-2xl border border-foreground/10 bg-background p-4 shadow-sm">
          <header className="mb-2 flex items-center gap-3">
            {p.author?.image && <img src={p.author.image} alt="" className="h-8 w-8 rounded-full object-cover" />}
            <div>
              <div className="text-sm font-semibold">{p.author?.name}</div>
              <div className="text-[11px] text-foreground/60">{formatRelativeTime(p.createdAt)}</div>
            </div>
          </header>
          <p className="text-sm leading-relaxed">{p.content}</p>
          {p.imageUrls?.[0] && (
            <img src={p.imageUrls[0]} alt="" className="mt-3 aspect-[16/9] w-full rounded-xl object-cover" />
          )}
        </article>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: ExpensesView and ChecklistsView (read-only shells using existing data)**

`ExpensesView`:

```tsx
"use client";
import type { Doc } from "@/convex/_generated/dataModel";
export function ExpensesView({ trip, viewer }: { trip: Doc<"trips">; viewer: Doc<"users"> | null }) {
  return (
    <div className="rounded-2xl border border-dashed border-foreground/15 px-6 py-10 text-center text-sm text-foreground/60">
      Expenses are coming soon. We&apos;ll surface group splits and your share here.
    </div>
  );
}
```

`ChecklistsView`:

```tsx
"use client";
import type { Doc } from "@/convex/_generated/dataModel";
export function ChecklistsView({ trip, viewer }: { trip: Doc<"trips">; viewer: Doc<"users"> | null }) {
  return (
    <div className="rounded-2xl border border-dashed border-foreground/15 px-6 py-10 text-center text-sm text-foreground/60">
      Pre-trip checklists are coming soon.
    </div>
  );
}
```

- [ ] **Step 6: Type-check**

Run: `cd apps/web && pnpm exec tsc --noEmit`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add apps/web/components/trips/tabs/ActivityTab.tsx apps/web/components/trips/tabs/activity
git commit -m "feat(web): ActivityTab — Polls/Members/Posts wired, Expenses/Checklists stubbed"
```

---

## Task 15: DiscoverTab — chips + Suggested rail + Top-rated grid

**Files:**
- Modify: `apps/web/components/trips/tabs/DiscoverTab.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { ALL_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function DiscoverTab({ trip }: { trip: Doc<"trips">; viewer: Doc<"users"> | null }) {
  const [active, setActive] = useState<string>("all");
  const term = trip.destinationLabel ?? "";
  const results = useQuery(api.search.searchAll, term ? { term, limit: 12 } : "skip");

  const experiences = results?.experiences ?? [];
  const events      = results?.events ?? [];
  const destinations = results?.destinations ?? [];

  return (
    <>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        <Chip on={active === "all"} onClick={() => setActive("all")}>All</Chip>
        {ALL_CATEGORIES.map(c => (
          <Chip key={c.id} on={active === c.id} onClick={() => setActive(c.id)}>{c.emoji} {c.label}</Chip>
        ))}
      </div>

      <Section title="Suggested for you">
        {results === undefined ? <Skeleton className="h-44 w-full" /> : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {experiences.map(e => (
              <article key={e._id} className="w-52 flex-shrink-0 overflow-hidden rounded-xl border border-foreground/10 bg-background">
                {e.imageUrl && <img src={e.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />}
                <div className="p-3">
                  <div className="text-sm font-semibold">{e.title}</div>
                  {e.shortDescription && <div className="line-clamp-2 text-xs text-foreground/60">{e.shortDescription}</div>}
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>

      <Section title="Top events">
        {results === undefined ? <Skeleton className="h-44 w-full" /> : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {events.map(e => (
              <article key={e._id} className="overflow-hidden rounded-xl border border-foreground/10 bg-background">
                {e.imageUrl && <img src={e.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />}
                <div className="p-3">
                  <div className="text-sm font-semibold">{e.title}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>

      {!term && (
        <div className="rounded-2xl border border-dashed border-foreground/15 px-6 py-8 text-center text-sm text-foreground/60">
          Set a destination on this trip to see suggestions.
        </div>
      )}
    </>
  );
}

function Chip({ on, onClick, children }: React.PropsWithChildren<{ on: boolean; onClick: () => void }>) {
  return (
    <button onClick={onClick} className={cn(
      "h-9 flex-shrink-0 rounded-full px-4 text-xs font-medium",
      on ? "bg-primary text-primary-foreground" : "bg-foreground/5 text-foreground/70 hover:text-foreground",
    )}>{children}</button>
  );
}
function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <section className="mt-5">
      <header className="mb-2 flex items-center justify-between"><h3 className="font-display text-lg font-bold">{title}</h3></header>
      {children}
    </section>
  );
}
```

(If `searchAll`'s returned items use different field names than `imageUrl` / `shortDescription`, adjust to match — read `search.ts` first.)

- [ ] **Step 2: Type-check**

Run: `cd apps/web && pnpm exec tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/trips/tabs/DiscoverTab.tsx
git commit -m "feat(web): DiscoverTab — chips + suggested rail + top events grid"
```

---

## Task 16: Manual end-to-end smoke check

**Files:** none.

- [ ] **Step 1: Start Convex and Next.js**

In one terminal: `cd packages/convex && pnpm dev`
In another:    `cd apps/web && pnpm dev`

- [ ] **Step 2: Seed a private trip you're a member of**

Use the Convex dashboard or `npx convex run` to insert a `trips` row with `slug: "smoke-test"`, `visibility: "private"`, `creatorId: <your user id>`, `currency: "GBP"`, `startDate: "2026-05-01"`, `endDate: "2026-05-05"`, `coverImageUrl: "https://picsum.photos/seed/smoke/1200/600"`, `createdAt: Date.now()`, `updatedAt: Date.now()`. Then add a `trip_members` row with `tripId`, `userId: <you>`, `role: "owner"`, `status: "accepted"`, `joinedAt: Date.now()`. Add 2 `itinerary_days` and 2–3 `itinerary_items`.

- [ ] **Step 3: Visit the page in a browser**

Navigate to `http://localhost:3000/trips/smoke-test` while signed in as the member.

Verify:
- Hero renders with cover image, title, destination/date pills.
- Avatars + traveler count show.
- 4 main tabs work; switching between them re-renders the right content.
- Itinerary day pills render; tapping a day switches view; "All days" toggles to the multi-day list.
- Editing an inline note saves within ~600ms (check DB row updates).
- Saved tab loads (likely empty); "+ Add" on a saved item promotes to itinerary's first day.
- Activity > Polls renders empty state; "Create poll" prompt creates a poll; voting toggles bars.
- Activity > Members shows you in the list with the owner role.
- Discover tab renders "Set a destination on this trip" if no destination, else suggestion rail.

- [ ] **Step 4: Visit with an unauthenticated session**

Sign out, hit `/trips/smoke-test` directly. Confirm redirect to `/sign-in`.

- [ ] **Step 5: Visit a non-existent slug**

Hit `/trips/this-does-not-exist`. Confirm `not-found.tsx` renders.

- [ ] **Step 6: Commit any small fixes found during smoke testing**

```bash
git add -A
git commit -m "fix(web): smoke-test fixes"
```

(If no fixes needed, skip.)

---

## Self-Review Notes

This plan delivers the full visual page (hero, members/budget, 4 tabs, 5 activity sub-tabs) but only wires **Itinerary, Saved, Activity > Polls / Members / Posts, Discover** to live data. **Expenses** and **Checklists** ship as "coming soon" tiles (schema exists, no handlers — those would each be a separate plan). **Discover** uses `search.searchAll` against the trip's `destinationLabel` as a heuristic; a curated "suggested-for-you" backend is a follow-up. Inline note save is **debounced 600 ms**; chosen over save-on-blur because it persists work even if the tab closes mid-edit. Pink stays at `hsla(327, 99%, 42%, 1)` — design's `#FF3D7F` is **not** introduced. Layout is web-first (responsive max-w-5xl), no phone-frame. Theme respects `prefers-color-scheme` with no toggle here. Category mapping (`flight→fly`, `hotel→stay`, etc.) is centralized in `apps/web/lib/categories.ts`.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-25-trip-detail-wiring.md`.

Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — I execute tasks in this session using executing-plans, with checkpoints for review.

Which approach?
