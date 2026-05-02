# Viator Ideas Sheet Enhancements — Design Spec

**Date:** 2026-04-15  
**Branch:** feature/ensure-navigation  
**Scope:** SearchIdeasSheet + Viator utilities — bug fixes, destination-aware search, price display, product detail navigation

---

## 1. Fix Known Issues

### 1a. Remove `usePlacesAutocomplete` firing on every keystroke

**Problem:** `usePlacesAutocomplete` is imported and called in `SearchIdeasSheet`. Its `query`/`setQuery` is wired to the search TextInput via `setQuery(txt)` in `onChangeText`, triggering a debounced Places API call on every keystroke. The `results` array returned by the hook is never rendered — it is entirely unused.

**Fix:** Delete the `usePlacesAutocomplete` import and hook call. Remove the `setQuery(txt)` call from the TextInput's `onChangeText`. Retain only `localQuery` state, which drives the existing client-side filter. The search bar currently shows a `SpinningLoader` when `usePlacesAutocomplete.loading` is true, otherwise shows the filter button — after removing the hook, always show the filter button. Each category section already has its own spinner.

**Files:** `mobile/components/trip-activity/SearchIdeasSheet.tsx`

### 1b. Rename `MOCK_CATEGORIES` → `SEARCH_CATEGORIES`

The `MOCK_` prefix is misleading (the list is real, not mock data). Single rename within `SearchIdeasSheet.tsx`.

### 1c. Fix `handleSaveIdea` type (`any` → union)

**Current:** `handleSaveIdea = async (idea: any)`

**Fix:** Type the parameter as `MappedViatorIdea | HotelIdeaData` where `HotelIdeaData` is an inline interface covering `{ name, hotelId, address, roomTypes, thumbnail, all_data }`. The two branches of the function already discriminate by `ideaType === 'hotel'`, so no runtime change — just removes the `any`.

### 1d. Remove dead StyleSheet entries

Remove the following empty/unused entries from the `styles` StyleSheet in `SearchIdeasSheet.tsx`:
- `loader: {}`
- `categoryPillActive`
- `categoryPillTextActive`

---

## 2. Viator Destination Mapping

### New module: `mobile/utils/viator/viatorDestinationLookup.ts`

Exports one public function:

```ts
lookupViatorDestinationId(label: string): Promise<string | null>
```

**Behaviour:**
- Checks an in-memory `Map<string, string>` cache keyed by the normalised label (lowercased, trimmed). Returns immediately if cached.
- On miss: calls `POST https://api.sandbox.viator.com/partner/v1/taxonomy/destinations` with `{ textQuery: label, language: "en", pageSize: 1 }` and the same `exp-api-key` header used by `viatorSearchSingleton.ts`.
- Parses the first result's `ref` field. Stores in cache and returns it.
- On any error or empty result: returns `null` (caller falls back to no destination filter).

### Integration in `SearchIdeasSheet`

- Add `destinationId` state: `const [destinationId, setDestinationId] = useState<string | null>(null)`.
- In the `useEffect([visible])` that fires on sheet open: call `lookupViatorDestinationId(trip.destination_label)` alongside the existing prefetch. When the ID resolves, `setDestinationId(id)`. Pass it to `loadCategoryProducts` calls in the prefetch: `loadCategoryProducts('Eat/Drink', id ? { destination: id } : {})`.
- Pass `destinationId` down to `ViatorCategorySection` and `AllCategoryView` as a prop, forwarded to `useViatorCategory`.

### Integration in `useViatorCategory`

Add an optional second parameter: `destinationId?: string | null`. When non-null, pass `{ destination: destinationId }` as the `filters` argument to `loadCategoryProducts`. Per existing cache design, non-empty filters bypass the per-category cache — correct since results are destination-specific.

The `retry()` callback must also forward the destination filter.

---

## 3. Price Display in IdeaCard

### `MappedViatorIdea` shape (in `useViatorCategory.ts`)

Add two optional fields:

```ts
price?: number | null;
currency?: string | null;
```

Populated in `mapProduct` from:
- `product.pricing?.summary?.fromPrice ?? null`
- `product.pricing?.currency ?? null`

### `IdeaCard` props

Add:

```ts
price?: number | null;
currency?: string | null;
```

**Footer change:** Replace the `View Details` `TouchableOpacity` with a static price label:

- If `price` is a positive number: render **"From $49"** (currency symbol resolved from a small lookup: USD→`$`, EUR→`€`, GBP→`£`, default→the code itself). Use `price.toFixed(0)` for whole-number display.
- If `price` is `0` or `null` (and `onAdd` is present): render nothing in that slot, keeping the Add button right-aligned.
- Hotel cards don't pass `price`, so they're unaffected.

### Render sites

All `IdeaCard` render sites inside `SearchIdeasSheet` (in `ViatorCategorySection` and `SearchResultGroup`) pass `price={item.price}` and `currency={item.currency}`.

---

## 4. Card Tap → `viator/[productCode]`

### Problem: product cache gap

`viator/[productCode].tsx` reads from `viatorProductCache` via `getViatorProductByCode(productCode)`. `viatorCategoryCache.ts` stores products in its own Map and never writes to the product cache. So navigating to the Viator detail screen for a category-loaded product would hit the "not found" state.

### Fix: `mergeViatorProductsCache` in `viatorProductCache.ts`

Add:

```ts
export function mergeViatorProductsCache(products: ViatorProduct[]): void
```

Upserts each product by `productCode` into the module-level `cachedProducts` array. Does not wipe existing entries (unlike `setViatorProductsCache`).

**Call site:** In `viatorCategoryCache.ts`, inside the `.then()` block where leaf products are saved to the entry cache, also call `mergeViatorProductsCache(products)`. This means any product loaded via the category cache is immediately findable by code.

### `IdeaCard` navigation

Add prop:

```ts
viatorProductCode?: string;
```

Extend `handleNavigateToDetails`:

```ts
if (viatorProductCode) {
  router.push({ pathname: '/viator/[productCode]', params: { productCode: viatorProductCode } });
  return;
}
if (item?.type === 'hotel') { ... existing hotel logic ... }
```

The whole card `Pressable` already calls `handleNavigateToDetails` on press — no change needed to the press handler itself.

### Render sites

All `IdeaCard` usages in `SearchIdeasSheet` pass `viatorProductCode={item.id}`.

---

## 5. Files Changed Summary

| File | Change |
|------|--------|
| `mobile/utils/viator/viatorProductCache.ts` | Add `mergeViatorProductsCache` |
| `mobile/utils/viator/viatorCategoryCache.ts` | Call `mergeViatorProductsCache` after loading leaf products |
| `mobile/utils/viator/viatorDestinationLookup.ts` | **New file** — cached Viator destination ID lookup |
| `mobile/hooks/useViatorCategory.ts` | Add `price`/`currency` to `MappedViatorIdea`; accept `destinationId` param |
| `mobile/components/trip-activity/IdeaCard.tsx` | Add `price`, `currency`, `viatorProductCode` props; replace View Details with price; add Viator nav |
| `mobile/components/trip-activity/SearchIdeasSheet.tsx` | Remove `usePlacesAutocomplete`; rename `MOCK_CATEGORIES`; fix types/styles; add destination lookup; pass new props to IdeaCard |

---

## 6. Out of Scope

- `clearCategoryCache()` lifecycle hookup (logout / destination change) — noted as future work
- `expo-location` GPS fallback — `trip.destination_label` is sufficient; no location permissions needed
- Deep-link from itinerary items to Viator detail — separate feature
- Viator booking flow — out of scope
