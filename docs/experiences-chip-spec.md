# Experiences Chip — Sectioned Results Page

Target: **mobile only** (`apps/mobile/`). Web is untouched.

## Context

The Experiences tab on the mobile search screen routes to `apps/mobile/app/experiences-search/results.tsx` (lines 81–121), which today merges Viator + Ticketmaster + Yelp + Tiqets results into one flat vertical `FlatList`. Users see a wall of mixed cards with no internal structure and no signal of what kind of content is what.

We want the Experiences results page to:

1. **Exclude hotels & flights** (those have their own chips).
2. **Show typed sections** (Most popular, Sights to see, Adventure tours, Places to eat, Events), each as a **collapsible** block with a **horizontal scroll** of cards and a **See more** button.
3. **Mix DB and external** results — DB for `events` + `experiences` matching the search term (substring scan, fuzzy via Convex search indexes is a follow-up), external for richer Viator/Yelp/Ticketmaster catalogs.
4. **Drive Viator section variety from tag IDs**, not separate providers — currently `viator.search` ignores tags entirely (`packages/convex/convex/providers/viator.ts:182–198` only sends `filtering.destination` + `pagination`), so all "tour" / "adventure" calls return the same products bucketed by category label. We extend the action to pass `filtering.tags` + `sorting`.

Decisions confirmed with user:
- **Mobile only.**
- **Restaurants → existing Yelp wiring** (not new OpenTable). Note: `results.tsx:62` mislabels Yelp as "OpenTable" — fix as part of this work.
- **Substring search now**, Convex `searchIndex` follow-up.
- **Sections in order**: Most popular · Sights to see · Adventure tours · Places to eat · Events.

## Files to modify / add

### Convex backend (`packages/convex/convex/`)

> Before editing any Convex file, read `convex/_generated/ai/guidelines.md` per `packages/convex/CLAUDE.md`.

1. **`providers/viator.ts`** — extend `search` (line 151).
   - Add args: `tags: v.optional(v.array(v.number()))`, `sortBy: v.optional(v.string())` (`"POPULARITY"` | `"PRICE"` | `"DEFAULT"`).
   - Inject into the request body when present:
     ```ts
     filtering: {
       destination: String(dest.destinationId),
       ...(tags?.length ? { tags } : {}),
     },
     ...(sortBy && sortBy !== "DEFAULT"
       ? { sorting: { sort: sortBy, order: "DESCENDING" } }
       : {}),
     ```
   - Comment from line 191–192 about Viator rejecting `{ sort: "DEFAULT", order: ASCENDING }` is the prior art for why we omit `sorting` when sortBy is "DEFAULT".

2. **`discovery.ts`** — extend `searchByCategory` (line 44).
   - Add args: `tags`, `sortBy` (same shape). Forward to viator action only.
   - Include `tags` and `sortBy` in `queryKey` so cached calls don't collide across sections (Most popular vs Sights to see for the same city would otherwise share a cache row).
   - Bump `CACHE_VERSION` to `"v5"` (line 74) so existing cached `tour` results are invalidated on first deploy.

3. **`search.ts`** — add `searchExperiences` query.
   - Args: `{ term: string, destinationId?: Id<"destinations">, limit?: number }`.
   - Returns: `{ events: Doc<"events">[], experiences: Doc<"experiences">[], itineraryItems: Doc<"itinerary_items">[] }`.
   - Reuses the existing substring-scan style from `searchAll` (line 5+). For `itinerary_items`, **filter out** `type === "flight"` and `type === "hotel"`. Cap each list at `limit ?? 10`.
   - Note: `events` table has no public-cross-trip "browse" index today; full table scan with status="published" + substring on name/description/locationName/category, same as today's `searchAll`.

### Mobile UI (`apps/mobile/`)

4. **`app/experiences-search/results.tsx`** — refactor.
   - Branching: when `params.category` ∈ `{tour, eat, event, adventure}`, keep the existing single-list view (this is the **See more** target page). When `params.category === "all"` (default), render the new `<SectionedExperiencesResults />`.
   - Bug fix at line 62: change `yelp: 'OpenTable'` to `yelp: 'Yelp'`.

5. **`components/discover/SectionedExperiencesResults.tsx`** (new).
   - Owns 5 parallel calls inside one `useEffect`:
     - `mostPopular`: `searchByCategory({ category: "tour", term, sortBy: "POPULARITY", limit: 10 })`
     - `sightsToSee`: `searchByCategory({ category: "tour", term, tags: [11930 /* Sightseeing */], limit: 10 })`
     - `adventureTours`: `searchByCategory({ category: "adventure", term, tags: [21972 /* Adventure */], limit: 10 })`
     - `placesToEat`: `searchByCategory({ category: "eat", term, limit: 10 })`
     - `events`: `Promise.all([useQuery(api.search.searchExperiences, { term }).events, searchByCategory({ category: "event", term, limit: 10 })])` — merge & dedupe by title+date.
   - Renders a `<ScrollView>` with 5 `<CollapsibleSection>` children.
   - Tag IDs (Viator standard catalog): keep inline as `const VIATOR_TAGS = { SIGHTSEEING: 11930, ADVENTURE: 21972 }`; can move to a constants file later.

6. **`components/discover/CollapsibleSection.tsx`** (new).
   - Props: `title`, `count`, `seeMoreHref`, `children`, `defaultOpen?: boolean = true`.
   - Header row: title + small count badge + caret. Tapping toggles `open`. **See more** is a separate `Pressable` on the right of the header that always navigates regardless of open state.
   - Animate via `react-native-reanimated` `LinearTransition` on the inner `Animated.View` (already used in `ExperiencesSearchForm.tsx:87`). Body uses `entering={FadeIn}` / `exiting={FadeOut}`.
   - Default `open = true` for first 3 sections, `false` for the bottom 2 (cheap perf win, avoids loading off-screen FlatLists immediately).

7. **`components/discover/DiscoverHScroll.tsx`** (new).
   - Props: `items: DiscoveryItem[]`, `loading: boolean`, `cardVariant: "addOn" | "event"`, `paddingHorizontal?: number = 20`.
   - Mirrors the pattern in `components/home/AddOnsForYou.tsx:49–73` (horizontal `FlatList`, `ItemSeparatorComponent`, skeletons via `AddOnCardSkeleton`).
   - Renders `<DiscoverAddOnCard>` or `<DiscoverEventCard>` based on `cardVariant`.

8. **`components/discover/DiscoverAddOnCard.tsx`** (new).
   - Visual style of `components/home/AddOnCard.tsx` (hero image + rotated overlay thumb, title, meta row).
   - Accepts `DiscoveryItem` directly. Pull `gallery[1]` from a future detail fetch — for now use `imageUrl` for both hero and overlay (degraded gracefully).
   - On press: same routing logic as `results.tsx:127` — `viator` → `/viator/[productCode]`, else `/experiences-search/detail`.

9. **`components/discover/DiscoverEventCard.tsx`** (new).
   - Mirrors the events card visual already used by `UpcomingEvents` (find via `apps/mobile/components/home/UpcomingEvents.tsx` — discovered during exploration).
   - Accepts a union: a Convex `events` doc OR a `DiscoveryItem` with `category === "event"`. Branch on shape.
   - On press: DB event → `/events/[slug]`; DiscoveryItem → existing `/experiences-search/detail` route.

### Out of scope (call out for follow-up)

- Convex `searchIndex` on `events.name`, `experiences.title`, `itinerary_items.title` for true fuzzy search. (User confirmed: follow-up.)
- OpenTable provider integration — Yelp covers this for v1.
- Filtering/sorting controls on the per-category "See more" page — user marked as bonus; defer.
- Adding `tags` to the `experiences` Convex table itself so DB experiences can be bucketed into the same sections. Right now DB experiences only land in the `eat` / `tour` buckets via category, not by Viator tag.

## Reused functions / patterns

- `useAction(api.discovery.searchByCategory)` — current data path (`results.tsx:76`, `useViator.tsx:50–84`). Keep it.
- `AddOnCardSkeleton` from `components/ui/CardSkeletons` — already used by `AddOnsForYou`. Reuse for section loading state.
- `SectionHeader` from `components/ui/SectionHeader` — already used for the "See all" affordance in `AddOnsForYou`. Reuse and pass `onPress={() => router.push({ pathname: '/experiences-search/results', params: { term, category: 'tour' } })}`.
- `useExperiencesSearchState` (`hooks/useExperiencesSearchState.ts`) — unchanged; the `category: 'all'` branch is what triggers sectioned view.
- Skeleton box, theme colors, safe-area insets — all already wired in current `results.tsx`.

## Verification

1. **Typecheck Convex**:
   ```
   cd packages/convex && npx convex dev --once --typecheck=enable
   ```
   Must pass clean (per `CLAUDE.md` note: "npx convex dev --once --typecheck=enable passes clean (exit 0)").

2. **Smoke test Viator with tags**:
   ```
   npx convex run discovery:smokeTest '{"city":"London"}'
   ```
   Then a one-off (add a temp action mirroring `viatorInternalProbe`) calling viator.search with `tags: [11930]` to confirm Viator returns sightseeing-flagged products. Delete the temp action after.

3. **Mobile, iOS simulator (or Expo Go)**:
   - Open the app → tap search bar → tap **Experiences** tab.
   - Type `London`, press search.
   - Land on the new sectioned results page.
   - Confirm: 5 sections render in order; first 3 are open by default, last 2 collapsed; each open section is a horizontal scroll with cards.
   - Tap a section title → collapses smoothly.
   - Tap **See more** → navigates to per-category list (the existing single-list view, untouched).
   - Tap a Viator card → opens `/viator/[productCode]`.
   - Tap an event card from the Events section → opens `/events/[slug]` (DB event) or detail screen (Ticketmaster).

4. **Cache key collisions**: Run two consecutive searches for the same city ("London") with different sections active. Inspect `discovery_cache` rows in Convex dashboard — there should be **separate** rows per `(provider, category, queryKey)` triplet now that `tags` + `sortBy` are part of the queryKey.

5. **Provider label fix**: Confirm `results.tsx` no longer shows "via OpenTable" on Yelp restaurant cards.
