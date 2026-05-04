# Mobile Search — Phase 3 (Experiences)

> **Predecessors:** Phase 1 (Flights — shipped on `feat/mobile-ui-tweaks`),
> Phase 2 (Hotels — see `docs/mobile-search-phase-2-hotels.md`).

## Context

The Experiences tab in `apps/mobile/app/search.tsx` will trigger a combined
search across **our own DB-backed experiences** AND **Viator** in parallel.
Results render in a fullscreen modal divided into sections (categories +
prompts), and because Viator items are **not bookable in-app**, tapping a
Viator card opens the rewritten URL in `expo-web-browser` rather than entering
a booking stack.

This is fundamentally a **discovery + handoff** flow, not a checkout flow —
no Stripe, no PaymentSheet, no booking rows.

## Backend status

### Already wired
| Function | Path |
|---|---|
| `discovery.searchByCategory` | `packages/convex/convex/discovery.ts` — generic dispatcher used by Explore today; supports `category: 'tour' \| 'eat' \| 'shop' \| 'other'` for Viator |
| `providers.viator.search` (internal) | `packages/convex/convex/providers/viator.ts` — destination resolution, URL rewriting, image picking |
| Mobile hooks | `apps/mobile/hooks/useViator.tsx`, `apps/mobile/hooks/useViatorCategory.ts` (existing, used by Explore) |
| URL rewriter | `rewriteViatorUrl` in `providers/viator.ts` — rewrites sandbox URLs and preserves affiliate params |

### Likely needs to be added
- A combined search action (e.g. `experiences.search`) that fans out to:
  1. Convex `experiences` table (DB-backed, internal catalog) by term/coords.
  2. Multiple Viator categories in parallel (e.g. `tour`, `eat`,
     `adventure`) so the modal can render distinct sections per response.
  Returns `{ runwae: DiscoveryItem[], viatorByCategory: Record<string, DiscoveryItem[]> }`.

  **Decide first** whether this composition lives backend-side or frontend.
  Composing in a Convex action is cleaner for the mobile client; composing
  on the client gives more room to lazy-load categories.

- Optional: a `viator.searchByPreset` action that maps named presets like
  "Once in a lifetime" or "Trending" to internal Viator query params (the
  user listed these as desired sections in the original brief). The Viator
  API supports `tags` and `flags` filters that may map to those — check the
  Viator API spec before promising this UX.

## Out of scope

- Booking. Viator items hand off to `expo-web-browser`. Runwae-owned
  experiences (DB-backed) link to existing `apps/mobile/app/experience/[id].tsx`
  detail page, which already handles its own booking flow if/when applicable.
- Maps/geo filtering at the search step. Use term-based search, optionally
  augmented by the user's `homeCoords` if present.
- Saved/wishlist toggling on result cards (planned separately).

---

## Files to create

### 1. `apps/mobile/components/search/ExperienceSearchForm.tsx`
Mirror of the Flights/Hotels forms. Fields:
- **Location or activity** — `TextInput` with debounced state. No
  autocomplete in v1.
- **Dates** — optional. Reuse `<DateModal>`. If left blank, search defaults
  to "Anytime".
- **Guests** — single counter, default 2. Reuse `PassengerStepper.tsx`
  pattern.
- Sticky **Search** button — enabled when location is non-empty.
- On press: `router.push('/experiences/results', { ...params })`.

State holder hook: `apps/mobile/hooks/useExperienceSearchState.ts`.

### 2. `apps/mobile/app/experiences/_layout.tsx` + `results.tsx`
Add `experiences` to the modal stack registration in
`apps/mobile/app/_layout.tsx` (same pattern as flights / hotels-search).

`results.tsx` calls the combined search action (or 2-3 parallel
`useAction` calls if composing on the client). Sections to render:
- **From Runwae** — DB-backed results.
- **Trending** / **Once-in-a-lifetime** / **Local picks** — Viator preset
  buckets. Section count is data-driven; render only sections that returned
  ≥ 1 item.

Each section is a `<SectionHeader>` + horizontal `FlatList` of cards.
Skeleton loaders per section.

### 3. `apps/mobile/components/experiences/ExperienceCard.tsx`
Single card used by all sections. Props: `{ item: DiscoveryItem; onPress }`.
Renders image, title, price, rating, "Powered by Viator" badge if
`item.provider === 'viator'`.

### 4. Tap behavior
- `item.provider === 'viator'` → `WebBrowser.openBrowserAsync(rewriteViatorUrl(item.externalUrl))`. The rewrite is done backend-side already if returned URL is `viator.com/`, but verify; if not, expose a tiny `viator.canonicalUrl` query.
- Otherwise → `router.push({ pathname: '/experience/[id]', params: { id: item.apiRef } })`.

---

## Existing code to reuse

| Need | Path |
|---|---|
| Viator data adapter | `apps/mobile/hooks/useViator.tsx` |
| Category mapper | `apps/mobile/hooks/useViatorCategory.ts` |
| `expo-web-browser` wrapper | `apps/mobile/components/ui/external-link.tsx` |
| Animated tab indicator | `apps/mobile/components/ui/AnimatedTabBar.tsx` (Phase 1) |
| Skeleton primitive | `apps/mobile/components/ui/SkeletonBox.tsx` |
| Form-card styling reference | `apps/mobile/components/search/FlightSearchForm.tsx` |
| Discover-screen card layout (probably reusable) | `apps/mobile/components/home/AddOnsForYou.tsx` |

---

## Decisions to lock in before coding

1. **Backend composition vs frontend composition** for the combined search.
   Recommendation: backend, in a single new `experiences.search` action,
   parallelizing internal calls with `Promise.all`. Cleaner client, easier
   to add caching later.
2. **Section presets**: which Viator slices appear by default? Need to
   confirm what the Viator product API supports (the user mentioned "once
   in a lifetime", "trending"). Read
   `packages/convex/convex/providers/viator.ts` and Viator's docs before
   promising those exact labels. Fall back to category-based slices
   (`tour`, `eat`, `adventure`, `shop`) if presets aren't a thing.
3. **Empty state when zero results**: just a friendly empty state, or a
   "Browse by category" CTA that pushes to Explore? (Recommend the
   former — keep it simple in v1.)

---

## Verification plan

1. `pnpm --filter @runwae/convex dev` (Terminal 1).
2. `cd apps/mobile && pnpm start` (Terminal 2). iOS simulator.
3. Tap **Experiences** on home → `/search?tab=experiences` with the
   indicator on Experiences.
4. Type "Rome", leave dates blank, guests at 2.
5. Tap **Search** → modal slides up. Multiple sections populate
   independently (skeletons resolve as each parallel query returns).
6. Tap a Viator card → `expo-web-browser` opens the rewritten URL with the
   affiliate params preserved. Confirm the URL is `www.viator.com/...`,
   not the sandbox host.
7. Tap a Runwae-owned card → `apps/mobile/app/experience/[id].tsx` opens.
8. Backgrounded URL ↔ app return: app remains on the results screen;
   modal not dismissed.
9. Type-check both workspaces.

---

## Suggested execution order

3A. Decide composition strategy and (if backend) write
    `experiences.search` action. Convex typecheck must be clean.
3B. Build `ExperienceSearchForm` + `useExperienceSearchState`. Wire into
    `search.tsx`. Search button → stub results screen.
3C. Build `results.tsx` with section layout, skeleton loaders, and
    Viator-vs-Runwae card branching.
3D. Wire `expo-web-browser` for Viator handoff with rewrite verification.
3E. Smoke-test both branches (Viator opens browser, Runwae opens detail
    page). Document any provider gaps.

---

## Stretch (V2)

The original brief mentioned an **AI link → itinerary** path on the home
search bar. That was deferred from Phase 1; if it's still desired after
Phases 2 and 3 land, it deserves its own spec. Rough shape:

- Convex action `ai.itineraryFromLink({ url })` that fetches the link
  preview server-side (so we can use private API keys), passes the
  scraped content to Claude with a structured-output schema, and returns
  a draft itinerary.
- Mobile UI: existing search bar in `HomeQuickActions` becomes input-driven
  again; on `https://...` paste, show a "Generate Itinerary" CTA that
  routes to a preview screen and finally to `/trips/new` with the draft
  pre-filled.
- Quota tracking already exists in `packages/convex/convex/ai.ts`
  (`createAiTripRequest`).
