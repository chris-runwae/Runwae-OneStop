# Mobile Discover (RecommendationSection) — Plan

Goal: surface a Discover section on the mobile home screen with parity to the web `DiscoverGrid`, while reusing the existing `RecommendationsSection` infrastructure where it makes sense.

This document is a plan. No code yet.

## What exists today

### Web (`apps/web/components/discover/DiscoverGrid.tsx`)
- 10 category chips: All, Fly, Stay, Do, Explore, Adventure, Eat/Drink, Attend, Shop, Relax.
- Calls a single Convex action: `api.discovery.searchByCategory({ category, term, lat, lng, originIata, destinationIata, checkin, checkout, limit, forceRefresh })`.
- Server fans out to providers (Viator, LiteAPI, Duffel, Yelp, Ticketmaster, Geoapify, Tiqets) and falls back to `staticDiscovery`. Results cached 24h via `internal.discovery.getCached/setCache`.
- Heart icon toggles `api.user_saves.add/remove`; saved set comes from `api.user_saves.listKeys`.
- "All" tab renders 4 hardcoded `DISCOVER_SAMPLES`; other tabs render up to 6 fetched cards.
- "Fly" requires an originIata — falls through to "Set your home airport to see flight deals."
- Each card: image, category label/emoji, title, description, location, price (currency-formatted), heart toggle, `+ Add to trip` button → opens `AddToTripModal`.

### Mobile (`apps/mobile/components/destination/RecommendationsSection.tsx`)
- Currently a **destination-detail** section (only used inside `DestinationDetailsScreen`), not on home.
- Only 5 categories: All, Eat/Drink, Stay, Do, Shop. Missing Fly, Explore, Adventure, Attend, Relax.
- Two parallel data paths:
  - **Stay** → `useHotels(destinationTitle, checkin, checkout, ...)` → LiteAPI direct.
  - All others → `useViatorCategory(category, destinationId)` → Viator direct via the legacy mobile hooks; resolves a `viatorDestinationId` via `lookupViatorDestinationId`.
- Cards (`RecommendationCard.tsx`): image, category label, title, description, price, **`+ Add` button only** — no heart/save toggle.
- Add-to-trip flow uses `useTrips().addIdeaToTrip` + `savedItemFromViatorIdea` / `savedItemFromHotel`. Different from the web `AddToTripModal` shape but the destination is the same Convex `saved_items` table.
- "All" tab is wired but treated as a Viator category → returns nothing meaningful.

### Convex backend (already in place)
- `api.discovery.searchByCategory` — works for all 10 categories; same one the web uses.
- `api.user_saves.{add, remove, listKeys, listGrouped}` — used by web heart icon, **not** wired into mobile yet.
- `api.users.getCurrentUser` exposes `homeCity`, `homeCoords`, `homeIata`, `homeCountry` — already populated by `LocationPrompt`.

## The gap

Two distinct surfaces are conflated under one name. We need a clear split:

1. **Home Discover** — personalised by viewer's home location. The web home page renders `<DiscoverGrid city={homeLabel} coords={homeCoords} iata={homeIata} />`. Mobile has no equivalent.
2. **Destination Discover** — keyed off the trip's destination. This is what the existing mobile `RecommendationsSection` does.

The Convex action serves both; the difference is just which `term`/`coords`/`iata` to feed it. The right move is to build a single mobile component (`DiscoverGrid` for mobile) that mirrors the web abstraction, and have both home-page and destination-page screens render it with different props.

## Proposed plan

### Phase 1 — Build a shared mobile `DiscoverGrid`
Location: `apps/mobile/components/discover/DiscoverGrid.tsx`

Props (mirror web):
```ts
type Props = {
  city: string;
  coords?: { lat: number; lng: number };
  originIata?: string | null;
  destinationIata?: string | null;
  checkin?: string;
  checkout?: string;
  presetTripId?: Id<'trips'>;
  initialCategory?: string;
  excludeCategories?: readonly string[];
  showHeading?: boolean;
};
```

Behaviour:
- Use `useAction(api.discovery.searchByCategory)` and `useQuery(api.user_saves.listKeys)` plus `useMutation(api.user_saves.add/remove)` directly. Drop the legacy `useViatorCategory` / `useHotels` paths from the home flow — the Convex action already calls those providers server-side.
- Category chips identical to web (10 categories, same emojis/labels) — extract to a shared `apps/mobile/constants/discoverCategories.ts` mirroring `DISCOVER_CATEGORIES` in `DiscoverGrid.tsx`.
- "All" tab → render the same 4 `DISCOVER_SAMPLES` set the web uses (move into a shared constant alongside the categories so both apps reference one source).
- Other tabs → call the action, hydrate results into a 2-column grid (FlashList with `numColumns={2}`).
- Card component (`apps/mobile/components/discover/DiscoverCard.tsx`):
  - Image, category badge, title, description (2 lines), location, price (`Intl.NumberFormat` w/ currency, never hardcoded `$`).
  - Heart icon — toggles `user_saves.add/remove`. State comes from `savedKeys`.
  - `+ Add to trip` button → opens an Add-to-Trip sheet. Use the existing `AddToTripContent` modal pattern from `RecommendationCard.tsx` so we don't fork the trips logic, but the *payload* must be the `DiscoverPayload` shape (provider/apiRef/category) so it round-trips through `saved_items` cleanly.
- Loading: 4 skeleton tiles (FlashList `ListEmptyComponent` while loading).
- Errors: dashed-border card with the provider error string + "Try again" button (matches web). Special case for `fly` when `originIata` is missing → "Set your home airport to see flight deals." with a CTA that opens `LocationPrompt` programmatically.

### Phase 2 — Wire on Home
- Render `<DiscoverGrid city={viewer.homeCity ?? 'London'} coords={viewer.homeCoords} originIata={viewer.homeIata} />` on the home screen between `AddOnsForYou` and `OpenPollCard` (matches web order: trips → events → discover → friends).
- Section header "Discover" with a "See all" → `/explore` link to match web's `SectionHead`.
- Hide on first launch if `LocationPrompt` is visible? No — web shows it regardless and it falls back to London. Match web behaviour.

### Phase 3 — Migrate Destination detail to share the component
- Replace `apps/mobile/components/destination/RecommendationsSection.tsx` body with `<DiscoverGrid city={destination.title} excludeCategories={['fly']} initialCategory="do" />`.
- Keep the file path as a thin re-export so existing imports (`DestinationDetailsScreen.tsx`) don't break.
- The Stay tab will now hit `searchByCategory` → LiteAPI server-side rather than `useHotels` directly. Verify card parity (rate display, currency) before deleting `useHotels` callers; that hook is also used elsewhere (`apps/mobile/app/hotel/...`), so don't delete the hook itself, just its use here.
- After migration, the `useViatorCategory` hook is unused on home — keep it; `DestinationDetailsScreen` may still reference it through other surfaces. Delete only after a grep confirms zero references.

### Phase 4 — Consolidation (optional, ship after Phase 1–3 land)
- Move `DISCOVER_CATEGORIES` and `DISCOVER_SAMPLES` from `apps/web/components/discover/DiscoverGrid.tsx` into `packages/ui` (or a new `packages/shared`) so web and mobile import one definition.
- Same for `discoverCategoryToSave` and `defaultSearchDates` helpers.
- Reasoning: keeping two copies guarantees drift the next time we tweak category labels, and we're already mid-monorepo.

## Open questions

1. **AddToTrip UX.** Web uses a dedicated `AddToTripModal`; mobile has `AddToTripContent` inside `CustomModal`. Use the mobile-native sheet but accept a `DiscoverPayload` shape so we can drop the mobile-only `MappedViatorIdea`/`LiteAPIHotelRateItem` adapters from this code path.
2. **`+ Add to trip` from the home Discover, when the user has no trips?** Web sends them through trip creation. On mobile we should match — fall through to `/create-trip` with the item pre-saved as a "first idea" (or delay the save until after the trip exists).
3. **Caching.** Server already caches 24h. Mobile should not add its own cache. The "Refresh" button on web bypasses cache via `forceRefresh: true`; mobile should expose the same control on each non-`all` tab.
4. **FlashList vs FlatList for the grid.** FlashList with `numColumns={2}` is preferred for parity with the rest of the app, but it requires `estimatedItemSize`. Measure a card height first.
5. **iOS 26 Liquid Glass.** Once native tabs land, the home page sits closer to the bottom edge. Verify the bottom-padding heuristic in `index.tsx` (`NATIVE_TABS_ENABLED ? 32 : 100`) still works after Discover is added — the grid is taller than the current carousels.

## Files that will change / be created

**Create**
- `apps/mobile/components/discover/DiscoverGrid.tsx`
- `apps/mobile/components/discover/DiscoverCard.tsx`
- `apps/mobile/constants/discoverCategories.ts` (shared with destination view)

**Modify**
- `apps/mobile/app/(tabs)/index.tsx` — add `<DiscoverGrid />` between `AddOnsForYou` and `OpenPollCard`.
- `apps/mobile/components/destination/RecommendationsSection.tsx` — replace internals with `<DiscoverGrid />`; keep the export to avoid touching `DestinationDetailsScreen.tsx`.

**Touch lightly (not delete yet)**
- `apps/mobile/hooks/useViatorCategory.ts`, `apps/mobile/hooks/useHotels.ts` — continue to back the hotel detail screen and any other consumers; only the `RecommendationsSection` reference goes away.

## Estimated scope
- Phase 1: ~1 day. Most of the work is the card component + the Add-to-Trip sheet adapter.
- Phase 2: ~30 minutes once Phase 1 is solid.
- Phase 3: ~2 hours (regression test the Stay tab on a destination detail screen).
- Phase 4: half a day, all monorepo plumbing.
