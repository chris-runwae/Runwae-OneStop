# Runwae Admin Console — Build Spec

## Context

You are building the Runwae internal admin console. This is a Next.js 15 App
Router app at `apps/admin/` in the existing Turborepo monorepo. It shares
`packages/convex` with the B2C web app at `apps/web/`.

This app is **internal only**. Two users will ever sign in: the founders. Do
not optimise for design polish, mobile responsiveness, or marketing aesthetics.
Use shadcn/ui with the default theme. Prioritise speed, clarity, and density
of information.

## Source of truth for existing code

The current Convex schema as of the start of this build is captured in
`docs/current-schema-snapshot.md`. **Treat that file as ground truth.** If
anything in this spec contradicts it, the snapshot wins — flag the
contradiction and ask the user before resolving.

The same principle applies to existing query/mutation files in
`packages/convex/convex/`. Read them in full before writing anything that touches
the same entities. Reuse helpers (slug generation, validation, formatting)
by importing them. Do not reimplement existing logic — if a helper isn't
exported, export it and import it. Report any logic you considered
duplicating.

## Scope (in order)

Build in this order. Stop after each numbered section and report back before
proceeding. Do not skip ahead.

0. Schema audit (blocking — must complete before section 1)
1. Schema additions + admin auth gating
2. App scaffold + sidebar shell
3. Destinations CRUD
4. Itinerary Templates CRUD
5. Events curation (read + trending toggle)
6. Collections CRUD
7. Users management (read + suspend)

---

## 0. Schema audit (do this first, do not skip)

Before adding any schema fields, audit what already exists.

1. Read `packages/convex/convex/schema.ts` in full.
2. Read `docs/current-schema-snapshot.md` to corroborate.
3. For each field this spec asks you to add (listed in section 1), check if
   it already exists in the live schema.
4. Produce a markdown table in your response:

   | Field | Table | In spec | In schema | Type matches? | Action |
   |-------|-------|---------|-----------|---------------|--------|
   | isAdmin | users | ✓ | ✗ | n/a | ADD |
   | isTrending | events | ✓ | ✓ | yes | SKIP |
   | trendingRank | events | ✓ | ✓ | NO — flag | FLAG, do not modify |

5. **Stop and report.** Do NOT modify `schema.ts` until the user confirms
   the action column. If any field exists with a different validator type,
   flag it and wait — never silently rewrite an existing field's validator.

Once the user confirms, proceed to section 1 and apply only the actions
they approved.

---

## 1. Schema additions

Edit `packages/convex/convex/schema.ts`. Add only the fields confirmed in section 0.
Do NOT remove or rename any existing fields. Run `npx convex dev --once` after
to confirm the deploy succeeds before continuing.

### `users` table — add if not present:
```ts
isAdmin: v.boolean(),
suspendedAt: v.optional(v.number()),
suspensionReason: v.optional(v.string()),
```

Add index: `.index("by_admin", ["isAdmin"])`

### `events` table — add if not present:
```ts
isTrending: v.boolean(),
trendingRank: v.optional(v.number()),
adminNotes: v.optional(v.string()),
```

Add index: `.index("by_trending", ["isTrending", "trendingRank"])`

### `destinations` table — add if `deletedAt` not present:
```ts
deletedAt: v.optional(v.number()),
```

This enables soft delete in section 3. If the field already exists, skip.

### Migration mutation

Create `packages/convex/convex/migrations/backfill_admin_fields.ts` with an internal
mutation that:
- Sets `isAdmin: false` on every existing user that lacks the field
- Sets `isTrending: false` on every existing event that lacks the field

Run it once via the Convex dashboard, then leave the file in place for
reference.

### Admin auth helper

Create `packages/convex/convex/lib/admin.ts`:

```ts
import { QueryCtx, MutationCtx } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Unauthorized");
  const user = await ctx.db.get(userId);
  if (!user || !user.isAdmin) throw new ConvexError("Forbidden");
  return user;
}
```

Every query and mutation in `packages/convex/convex/admin/*.ts` must call
`requireAdmin(ctx)` as its first line.

**Stop here. Confirm:**
1. Schema migration ran cleanly (`npx convex dev --once` succeeded)
2. Backfill mutation ran in the Convex dashboard
3. `git diff packages/convex/convex/schema.ts` shows only additions, no removals
   or modifications to existing field validators

Report the diff before proceeding.

---

## 2. App scaffold

Create `apps/admin/` as a Next.js 15 App Router app. Use:
- TypeScript, strict mode
- Tailwind CSS v4
- shadcn/ui with `slate` base colour, default radius
- `@convex-dev/auth` with Google provider only
- TanStack Table v8 for all data tables
- TanStack Query is NOT needed — use Convex's `useQuery` directly

### Directory structure

```
apps/admin/
├── app/
│   ├── (auth)/
│   │   └── sign-in/page.tsx
│   ├── (admin)/
│   │   ├── layout.tsx              ← sidebar + header, gates non-admins
│   │   ├── page.tsx                ← redirects to /destinations
│   │   ├── destinations/
│   │   │   ├── page.tsx            ← table
│   │   │   ├── new/page.tsx        ← create form
│   │   │   └── [id]/page.tsx       ← edit form
│   │   ├── itinerary-templates/
│   │   ├── events/
│   │   ├── collections/
│   │   └── users/
│   └── layout.tsx                  ← Convex provider, fonts
├── components/
│   ├── ui/                         ← shadcn primitives
│   ├── data-table/                 ← reusable TanStack Table wrapper
│   ├── image-upload.tsx            ← Uploadthing wrapper
│   └── admin-shell.tsx             ← sidebar + topbar
├── lib/
│   ├── utils.ts
│   └── convex.ts
└── package.json
```

### Auth gate

The `(admin)/layout.tsx` must:
1. Check `useConvexAuth()` — if not authenticated, redirect to `/sign-in`
2. Run `useQuery(api.users.currentUser)` — if `user.isAdmin !== true`, render
   a "Forbidden — this account is not an admin" page (do not redirect, so the
   user can see why they're locked out)
3. Otherwise render the shell with sidebar nav

### Sidebar

Static list of links:
- Destinations
- Itinerary Templates
- Events
- Collections
- Users

Highlight the active route. No collapse, no search, no fancy animations.

**Stop here. Confirm sign-in works and a non-admin gets the Forbidden page.**

---

## 3. Destinations CRUD

### Backend — `packages/convex/convex/admin/destinations.ts`

Before writing this file, read `packages/convex/convex/destinations.ts` in full.
Reuse any existing helpers (slug generation, image handling, validation).
Report any logic you would otherwise have duplicated.

Create:
- `listAll` query — returns all destinations sorted by `featuredRank` then
  `name`, excluding soft-deleted. Includes search by name (server-side filter).
- `create` mutation — takes all fields from the destinations schema except
  `createdAt`, `ratingAverage`, `ratingCount` (which it sets to 0). Auto-
  generates `slug` from `name` if not provided; verifies uniqueness.
- `update` mutation — takes `id` plus partial fields. Cannot change `slug`
  once set.
- `setFeatured` mutation — takes `id`, `isFeatured`, `featuredRank`. When
  setting `isFeatured: true` without a rank, assigns `max(featuredRank) + 1`.
- `softDelete` mutation — sets `deletedAt: Date.now()`. Verify the public
  destinations query in `packages/convex/convex/destinations.ts` filters out
  soft-deleted records; if it doesn't, flag and ask before modifying.

All five must call `requireAdmin(ctx)` first.

### Frontend

`/destinations` page:
- Header: "Destinations" + "New Destination" button
- Search input (filter by name)
- Toggle: "Show featured only"
- Table columns: Hero thumbnail, Name, Country, Featured (with rank), Tags,
  Created, Actions (Edit, Toggle Featured, Delete)
- Click row → navigate to `[id]/page.tsx`

`/destinations/new` and `/destinations/[id]`:
Form fields:
- Name (required)
- Slug (auto-generated, editable on create only)
- Country (required, dropdown of ISO countries)
- Region (optional)
- Description (textarea, markdown supported — use `react-markdown` for preview)
- Hero image (single, Uploadthing)
- Gallery images (multi, Uploadthing, drag-to-reorder)
- Tags (multi-input chips)
- Coords (lat/lng inputs, optional, with "Geocode from name" button using
  OpenStreetMap Nominatim — no API key needed)
- Timezone (autocomplete from `Intl.supportedValuesOf("timeZone")`)
- Currency (dropdown of ISO 4217)
- Featured toggle + rank input

Save button uses optimistic UI — if the mutation fails, revert and toast the
error.

**Stop here. Test create + edit + featured toggle end-to-end.**

---

## 4. Itinerary Templates CRUD

### Backend — `packages/convex/convex/admin/itinerary_templates.ts`

Before writing, read any existing `itinerary_templates.ts` in
`packages/convex/convex/`. Reuse helpers; report duplicated logic.

Standard CRUD: `listAll`, `getById`, `create`, `update`, `delete`,
`setFeatured`, `publish` (sets `status: "published"`).

### Frontend

`/itinerary-templates` page:
- Table: Cover thumb, Title, Destination (joined), Days, Status, Featured,
  Times Copied, Actions

`/itinerary-templates/new` and `/[id]`:
- Title, Destination (searchable dropdown of destinations), Description
- Duration days (number, drives the days array length)
- Difficulty level
- Category
- Cover image
- Estimated total cost + currency
- **Day editor** — accordion list, one per day:
  - Day title
  - Items array — each with: time, title, description, type (dropdown:
    activity/food/transport/lodging/free), location name, coords, estimated
    cost, currency
  - "Add item" + "Remove item" + drag-to-reorder within day
- Status: Draft / Published (radio)
- Featured toggle

The day editor is the complex bit. Use `@dnd-kit/sortable` for reordering.
Persist to Convex on every edit with debounce 800ms — show a "Saving..." /
"Saved ✓" indicator in the header.

**Stop here. Test creating a 3-day template with mixed item types.**

---

## 5. Events curation

This is **read + curate only** — vendors create events via the vendor
dashboard. The admin console only:
1. Views all events across all hosts
2. Toggles `isTrending` + `trendingRank`
3. Adds `adminNotes` (private, never shown to vendors)
4. Can flag/unpublish problematic events

### Backend — `packages/convex/convex/admin/events.ts`

Read existing `packages/convex/convex/events.ts` first. Reuse helpers.

- `listAll` query — paginated, filterable by status, host, destination, date
  range, ticketingMode
- `setTrending` mutation
- `setStatus` mutation — can force `status: "unpublished"` with a reason that
  gets emailed to the host (queue a Resend email via a Convex action). If the
  Resend integration isn't set up yet, stub the email send and flag it for
  the user to configure.
- `updateAdminNotes` mutation

### Frontend

`/events` page:
- Filters bar: status, host search, destination, date range, ticketing mode
- Table: Cover thumb, Title, Host, Destination, Start date, Status, Trending
  (with rank), Tickets sold, Actions (View, Toggle Trending, Unpublish, Add
  Note)
- Click row → drawer (not full page) showing full event details, admin notes
  editor, and audit log

**Stop here. Test trending toggle and verify it surfaces correctly when
queried with `by_trending` index.**

---

## 6. Collections CRUD

The simplest one. Schema already exists.

### Backend — `packages/convex/convex/admin/collections.ts`

Standard CRUD plus a `reorderEntities` mutation that takes a collection ID
and a new ordered array of entity IDs.

### Frontend

`/collections` page:
- Table: Cover thumb, Title, Entity type, Item count, Active, Rank, Actions

`/collections/new` and `/[id]`:
- Title, Description, Cover image
- Entity type (radio: event / destination / experience / trip)
- **Entity picker** — searchable, type-filtered. Shows selected entities as
  reorderable cards. Drag to reorder, click X to remove.
- Active toggle, Rank input

**Stop here. Test creating a collection of 5 destinations and reordering.**

---

## 7. Users management

### Backend — `packages/convex/convex/admin/users.ts`

Read existing `packages/convex/convex/users.ts` first. Reuse helpers.

- `listAll` query — paginated, searchable by email/name/username
- `getById` query — full user detail including trip count, booking count
- `setAdminStatus` mutation — takes `{ userId, isAdmin: boolean }`; promotes
  or demotes admin (require confirmation in the UI)
- `suspend` mutation — sets `suspendedAt` + `suspensionReason`
- `unsuspend` mutation — clears both fields

### Frontend

`/users` page:
- Search + filter (admin status, suspended)
- Table: Avatar, Name, Email, Username, Admin, Created, Trips, Status, Actions
- Click row → drawer with full profile + activity summary + admin actions

**Stop here. End of MVP scope.**

---

## What this build does NOT include

Do not implement any of these, even if they seem useful:
- Analytics dashboards
- Bulk import/export
- Activity audit log UI (we'll add later if needed)
- Email templates editor
- Vendor approval workflows
- AI moderation
- Internationalisation
- Mobile responsive design — desktop only is fine

If you find yourself wanting to add these, stop and ask first.

---

## Conventions

- All Convex files in `packages/convex/convex/admin/` start with `requireAdmin(ctx)`
- All forms use `react-hook-form` + `zod` resolvers
- All tables use the shared `<DataTable>` wrapper in `components/data-table/`
- Toast notifications via `sonner` (shadcn's recommended)
- Image uploads via Uploadthing — config already exists in
  `packages/convex/convex/uploadthing.ts` if present, otherwise create it and flag
- Dates displayed in user's local timezone, stored as Unix ms epochs
- Errors surfaced as toasts with the `ConvexError` message verbatim — these
  are admin-only, no need to sanitise

## When you're done with each section

Report:
1. What was built
2. What was skipped or deferred (and why)
3. Any schema mismatches or migrations needed
4. Manual testing steps for the founder to verify
5. `git diff --stat` summary of files changed

Then wait for confirmation before moving to the next section.
