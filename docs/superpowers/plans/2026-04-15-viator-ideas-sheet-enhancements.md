# Viator Ideas Sheet Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix known bugs in SearchIdeasSheet, add per-trip destination-aware Viator search, replace "View Details" with a price badge, and wire card taps to the Viator detail screen.

**Architecture:** Six sequential tasks each touching one file. Utility modules are updated first (product cache bridge, destination lookup, category hook), then the UI components (IdeaCard, SearchIdeasSheet). TypeScript type-checking (`npx tsc --noEmit`) is used as the verification step for utility changes; component changes are verified with the running app.

**Tech Stack:** React Native / Expo, TypeScript, Expo Router, Viator Partner API (sandbox)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `mobile/utils/viator/viatorProductCache.ts` | Modify | Add `mergeViatorProductsCache` so category-loaded products are findable by code |
| `mobile/utils/viator/viatorCategoryCache.ts` | Modify | Call `mergeViatorProductsCache` after each leaf load |
| `mobile/utils/viator/viatorDestinationLookup.ts` | Create | Cached Viator destination-ID lookup from a text label |
| `mobile/hooks/useViatorCategory.ts` | Modify | Add `price`/`currency` to `MappedViatorIdea`; accept `destinationId` param |
| `mobile/components/trip-activity/IdeaCard.tsx` | Modify | Add `price`, `currency`, `viatorProductCode` props; replace View Details; add Viator nav |
| `mobile/components/trip-activity/SearchIdeasSheet.tsx` | Modify | All bug fixes + destination lookup wiring + pass new IdeaCard props |

---

## Task 1: Bridge viatorProductCache so detail screen finds category products

**Spec ref:** Section 4 — "product cache gap"

**Files:**
- Modify: `mobile/utils/viator/viatorProductCache.ts`

**Problem:** `viatorCategoryCache.ts` stores products in its own Map. `viator/[productCode].tsx` reads from `viatorProductCache` via `getViatorProductByCode`. These two caches are disconnected, so tapping a category card navigates to a "not found" screen.

**Fix:** Add `mergeViatorProductsCache` that upserts products by `productCode` without wiping existing entries (unlike `setViatorProductsCache` which replaces everything).

- [ ] **Step 1: Open `mobile/utils/viator/viatorProductCache.ts` and read the current content**

Current file:
```ts
import type { ViatorProduct } from '@/types/viator.types';

let cachedProducts: ViatorProduct[] = [];

export function setViatorProductsCache(products: ViatorProduct[]): void {
  cachedProducts = products;
}

export function getViatorProductByCode(
  productCode: string
): ViatorProduct | undefined {
  return cachedProducts.find((p) => p.productCode === productCode);
}
```

- [ ] **Step 2: Add `mergeViatorProductsCache`**

Replace the entire file content with:

```ts
import type { ViatorProduct } from '@/types/viator.types';

let cachedProducts: ViatorProduct[] = [];

export function setViatorProductsCache(products: ViatorProduct[]): void {
  cachedProducts = products;
}

/**
 * Upserts products into the cache by productCode.
 * Does not wipe existing entries — safe to call from multiple sources.
 */
export function mergeViatorProductsCache(products: ViatorProduct[]): void {
  const existing = new Map(cachedProducts.map((p) => [p.productCode, p]));
  for (const p of products) {
    existing.set(p.productCode, p);
  }
  cachedProducts = Array.from(existing.values());
}

export function getViatorProductByCode(
  productCode: string
): ViatorProduct | undefined {
  return cachedProducts.find((p) => p.productCode === productCode);
}
```

- [ ] **Step 3: Type-check**

```bash
cd mobile && npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add mobile/utils/viator/viatorProductCache.ts
git commit -m "feat: add mergeViatorProductsCache for category→detail navigation"
```

---

## Task 2: Sync category cache products into the product cache

**Spec ref:** Section 4 — "Call `mergeViatorProductsCache` from `viatorCategoryCache.ts`"

**Files:**
- Modify: `mobile/utils/viator/viatorCategoryCache.ts`

- [ ] **Step 1: Add the import at the top of `mobile/utils/viator/viatorCategoryCache.ts`**

After the existing imports, add:

```ts
import { mergeViatorProductsCache } from '@/utils/viator/viatorProductCache';
```

The import block should now look like:

```ts
import type { ViatorProduct } from '@/types/viator.types';
import { mergeViatorProductsCache } from '@/utils/viator/viatorProductCache';
import {
  executeViatorProductSearch,
  VIATOR_DEFAULT_STALE_MS,
  type ViatorSearchFilters,
} from '@/utils/viator/viatorSearchSingleton';
```

- [ ] **Step 2: Call `mergeViatorProductsCache` in the `.then()` block inside `loadCategoryProducts`**

Find the block that stores leaf products (around line 145–152 in the current file):

```ts
entry.inflight = executeViatorProductSearch(mergedFilters)
  .then((products) => {
    entry.products = products;
    entry.fetchedAtMs = Date.now();
    return products;
  })
  .finally(() => {
    entry.inflight = null;
  });
```

Replace it with:

```ts
entry.inflight = executeViatorProductSearch(mergedFilters)
  .then((products) => {
    entry.products = products;
    entry.fetchedAtMs = Date.now();
    mergeViatorProductsCache(products);
    return products;
  })
  .finally(() => {
    entry.inflight = null;
  });
```

- [ ] **Step 3: Type-check**

```bash
cd mobile && npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add mobile/utils/viator/viatorCategoryCache.ts
git commit -m "feat: sync category cache products into viatorProductCache on load"
```

---

## Task 3: Viator destination lookup module

**Spec ref:** Section 2 — New module `viatorDestinationLookup.ts`

**Files:**
- Create: `mobile/utils/viator/viatorDestinationLookup.ts`

This module resolves a human-readable trip destination label (e.g., `"Paris, France"`) into a Viator destination ref string (e.g., `"732"`) by calling `POST /partner/v1/taxonomy/destinations`. Results are cached in a module-level Map so the API is only hit once per label per session.

- [ ] **Step 1: Create the file**

Create `mobile/utils/viator/viatorDestinationLookup.ts` with:

```ts
/**
 * Resolves a trip destination label to a Viator destination ref.
 * Results are cached in memory for the session — one API call per unique label.
 */

const _cache = new Map<string, string>();

function normalise(label: string): string {
  return label.trim().toLowerCase();
}

/**
 * Returns a Viator destination ref (e.g. "732") for the given label, or null
 * if the label is empty, the lookup API returns no results, or the request fails.
 *
 * Uses the same sandbox API key and base URL as viatorSearchSingleton.ts.
 */
export async function lookupViatorDestinationId(
  label: string | null | undefined
): Promise<string | null> {
  if (!label) return null;

  const key = normalise(label);
  if (_cache.has(key)) return _cache.get(key)!;

  try {
    const response = await fetch(
      'https://api.sandbox.viator.com/partner/v1/taxonomy/destinations',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json;version=2.0',
          'Content-Type': 'application/json;version=2.0',
          'exp-api-key': 'c6eb1e0b-45be-40d3-a855-513d36bd361e',
          'Accept-Language': 'en-US',
        },
        body: JSON.stringify({ textQuery: label, language: 'en', pageSize: 1 }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    // Viator response: { destinations: [{ ref: "732", name: "...", ... }] }
    const ref: string | undefined = data?.destinations?.[0]?.ref;
    if (!ref) return null;

    _cache.set(key, ref);
    return ref;
  } catch {
    return null;
  }
}

/** Clear the cache (e.g. for testing or logout). */
export function clearDestinationCache(): void {
  _cache.clear();
}
```

- [ ] **Step 2: Type-check**

```bash
cd mobile && npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add mobile/utils/viator/viatorDestinationLookup.ts
git commit -m "feat: add viatorDestinationLookup — cached destination-ref lookup by label"
```

---

## Task 4: Add price/currency to MappedViatorIdea and accept destinationId in useViatorCategory

**Spec ref:** Sections 2 and 3

**Files:**
- Modify: `mobile/hooks/useViatorCategory.ts`

Two changes in one file:
1. Extend `MappedViatorIdea` with `price` and `currency` fields, populated in `mapProduct`.
2. Add an optional `destinationId` parameter to `useViatorCategory`. When non-null, it is passed as `{ destination: destinationId }` filters to `loadCategoryProducts` (bypassing the per-category cache, which is correct — results are destination-specific).

- [ ] **Step 1: Extend `MappedViatorIdea` interface**

Find the `MappedViatorIdea` interface (lines 13–20):

```ts
export interface MappedViatorIdea {
  id: string;
  title: string;
  description: string;
  imageUri: string;
  category: string;
  categoryLabel: string;
}
```

Replace with:

```ts
export interface MappedViatorIdea {
  id: string;
  title: string;
  description: string;
  imageUri: string;
  category: string;
  categoryLabel: string;
  price: number | null;
  currency: string | null;
}
```

- [ ] **Step 2: Populate `price` and `currency` in `mapProduct`**

Find `mapProduct` (lines 22–35):

```ts
function mapProduct(
  product: ViatorProduct,
  category: Exclude<CategoryKey, 'All'>
): MappedViatorIdea {
  const { cover } = pickViatorImageUrls(product);
  return {
    id: product.productCode,
    title: product.title,
    description: product.description ?? '',
    imageUri: cover,
    category,
    categoryLabel: CATEGORY_LABELS[category],
  };
}
```

Replace with:

```ts
function mapProduct(
  product: ViatorProduct,
  category: Exclude<CategoryKey, 'All'>
): MappedViatorIdea {
  const { cover } = pickViatorImageUrls(product);
  return {
    id: product.productCode,
    title: product.title,
    description: product.description ?? '',
    imageUri: cover,
    category,
    categoryLabel: CATEGORY_LABELS[category],
    price: product.pricing?.summary?.fromPrice ?? null,
    currency: product.pricing?.currency ?? null,
  };
}
```

- [ ] **Step 3: Populate `price` and `currency` in `mapSnapshot` for the `'All'` branch**

Find the `'All'` branch inside `mapSnapshot` (lines 37–55):

```ts
function mapSnapshot(
  raw: ViatorProduct[],
  category: CategoryKey
): MappedViatorIdea[] {
  if (category === 'All') {
    return raw.map((p) => {
      const { cover } = pickViatorImageUrls(p);
      return {
        id: p.productCode,
        title: p.title,
        description: p.description ?? '',
        imageUri: cover,
        category: 'All',
        categoryLabel: CATEGORY_LABELS['All'],
      };
    });
  }
  return raw.map((p) => mapProduct(p, category as Exclude<CategoryKey, 'All'>));
}
```

Replace with:

```ts
function mapSnapshot(
  raw: ViatorProduct[],
  category: CategoryKey
): MappedViatorIdea[] {
  if (category === 'All') {
    return raw.map((p) => {
      const { cover } = pickViatorImageUrls(p);
      return {
        id: p.productCode,
        title: p.title,
        description: p.description ?? '',
        imageUri: cover,
        category: 'All',
        categoryLabel: CATEGORY_LABELS['All'],
        price: p.pricing?.summary?.fromPrice ?? null,
        currency: p.pricing?.currency ?? null,
      };
    });
  }
  return raw.map((p) => mapProduct(p, category as Exclude<CategoryKey, 'All'>));
}
```

- [ ] **Step 4: Add `destinationId` parameter to `useViatorCategory`**

Find the `useViatorCategory` function signature (line 57):

```ts
export function useViatorCategory(category: CategoryKey): {
  products: MappedViatorIdea[];
  loading: boolean;
  error: string | null;
  retry: () => void;
} {
```

Replace with:

```ts
export function useViatorCategory(
  category: CategoryKey,
  destinationId?: string | null
): {
  products: MappedViatorIdea[];
  loading: boolean;
  error: string | null;
  retry: () => void;
} {
```

- [ ] **Step 5: Pass `destinationId` as filters inside the `load` callback**

Find the `load` callback (around line 75–96). The call to `loadCategoryProducts`:

```ts
const raw = await loadCategoryProducts(category, {}, staleMs);
```

Replace with:

```ts
const filters = destinationId ? { destination: destinationId } : {};
const raw = await loadCategoryProducts(category, filters, staleMs);
```

Also update the `load` useCallback dependency array to include `destinationId`:

```ts
  }, [category, destinationId]);
```

(was `[category]`)

- [ ] **Step 6: Re-trigger load when `destinationId` changes**

Find the `useEffect` (around line 98–105):

```ts
  useEffect(() => {
    if (isCategoryFresh(category, VIATOR_DEFAULT_STALE_MS)) {
      setProducts(mapSnapshot(getCategorySnapshot(category), category));
      setLoading(false);
      return;
    }
    load(VIATOR_DEFAULT_STALE_MS);
  }, [category, load]);
```

Replace with:

```ts
  useEffect(() => {
    // Skip cache when a destination filter is active — results are destination-specific
    if (!destinationId && isCategoryFresh(category, VIATOR_DEFAULT_STALE_MS)) {
      setProducts(mapSnapshot(getCategorySnapshot(category), category));
      setLoading(false);
      return;
    }
    load(VIATOR_DEFAULT_STALE_MS);
  }, [category, destinationId, load]);
```

- [ ] **Step 7: Type-check**

```bash
cd mobile && npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 8: Commit**

```bash
git add mobile/hooks/useViatorCategory.ts
git commit -m "feat: add price/currency to MappedViatorIdea and destinationId param to useViatorCategory"
```

---

## Task 5: Update IdeaCard — price badge, Viator navigation

**Spec ref:** Sections 3 and 4

**Files:**
- Modify: `mobile/components/trip-activity/IdeaCard.tsx`

Three changes:
1. Add `price`, `currency`, and `viatorProductCode` props.
2. Replace the `View Details` touchable with a static price label.
3. Extend `handleNavigateToDetails` to navigate to `viator/[productCode]`.

- [ ] **Step 1: Extend `IdeaCardProps`**

Find the `IdeaCardProps` interface (lines 17–33):

```ts
interface IdeaCardProps {
  imageUri: string;
  item?: SavedItineraryItem | null | undefined;
  categoryLabel: string;
  title: string;
  description: string;
  onAdd?: () => void;
  onViewDetails?: () => void;
  onOptionsPress?: (position: {
    top: number;
    right?: number;
    left?: number;
  }) => void;
  checkin?: string | null;
  checkout?: string | null;
  adults?: number | null;
}
```

Replace with:

```ts
interface IdeaCardProps {
  imageUri: string;
  item?: SavedItineraryItem | null | undefined;
  categoryLabel: string;
  title: string;
  description: string;
  onAdd?: () => void;
  onViewDetails?: () => void;
  onOptionsPress?: (position: {
    top: number;
    right?: number;
    left?: number;
  }) => void;
  checkin?: string | null;
  checkout?: string | null;
  adults?: number | null;
  price?: number | null;
  currency?: string | null;
  viatorProductCode?: string;
}
```

- [ ] **Step 2: Destructure the new props in the component**

Find the destructuring in `export default function IdeaCard(...)` (lines 35–47):

```ts
export default function IdeaCard({
  imageUri,
  item,
  categoryLabel,
  title,
  description,
  onAdd,
  onViewDetails,
  onOptionsPress,
  checkin,
  checkout,
  adults,
}: IdeaCardProps) {
```

Replace with:

```ts
export default function IdeaCard({
  imageUri,
  item,
  categoryLabel,
  title,
  description,
  onAdd,
  onViewDetails,
  onOptionsPress,
  checkin,
  checkout,
  adults,
  price,
  currency,
  viatorProductCode,
}: IdeaCardProps) {
```

- [ ] **Step 3: Add a currency symbol helper and update `handleNavigateToDetails`**

Find `handleNavigateToDetails` (lines 52–65):

```ts
  const handleNavigateToDetails = () => {
    if (item?.type === 'hotel') {
      router.push({
        pathname: '/hotels/[hotelId]',
        params: {
          hotelId: item.external_id as string,
          hotelData: JSON.stringify(item.all_data),
          checkin,
          checkout,
          adults,
        },
      } as any);
    }
  };
```

Replace with:

```ts
  function currencySymbol(code: string | null | undefined): string {
    if (!code) return '$';
    const map: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', AUD: 'A$', CAD: 'C$' };
    return map[code.toUpperCase()] ?? code;
  }

  const handleNavigateToDetails = () => {
    if (viatorProductCode) {
      router.push({
        pathname: '/viator/[productCode]',
        params: { productCode: viatorProductCode },
      } as any);
      return;
    }
    if (item?.type === 'hotel') {
      router.push({
        pathname: '/hotels/[hotelId]',
        params: {
          hotelId: item.external_id as string,
          hotelData: JSON.stringify(item.all_data),
          checkin,
          checkout,
          adults,
        },
      } as any);
    }
  };
```

- [ ] **Step 4: Replace `View Details` with price label in the card footer**

Find the footer section inside `{onAdd && (` (lines 125–147):

```tsx
        {onAdd && (
          <View style={styles.footer}>
            <TouchableOpacity onPress={onViewDetails} hitSlop={10}>
              <Text
                style={[
                  styles.viewDetails,
                  { color: colors.primaryColors.default },
                ]}>
                View Details
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: colors.primaryColors.default },
              ]}
              onPress={onAdd}
              activeOpacity={0.8}>
              <Plus size={12} color="#fff" strokeWidth={3} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
```

Replace with:

```tsx
        {onAdd && (
          <View style={styles.footer}>
            {price != null && price > 0 ? (
              <Text
                style={[styles.priceLabel, { color: colors.textColors.subtle }]}>
                {`From ${currencySymbol(currency)}${Math.round(price)}`}
              </Text>
            ) : (
              <View />
            )}
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: colors.primaryColors.default },
              ]}
              onPress={onAdd}
              activeOpacity={0.8}>
              <Plus size={12} color="#fff" strokeWidth={3} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
```

- [ ] **Step 5: Replace the `viewDetails` StyleSheet entry with `priceLabel`**

Find in the `StyleSheet.create({...})` block:

```ts
  viewDetails: {
    fontSize: 11,
    fontFamily: AppFonts.inter.medium,
    textDecorationLine: 'underline',
  },
```

Replace with:

```ts
  priceLabel: {
    fontSize: 11,
    fontFamily: AppFonts.inter.medium,
  },
```

- [ ] **Step 6: Type-check**

```bash
cd mobile && npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 7: Commit**

```bash
git add mobile/components/trip-activity/IdeaCard.tsx
git commit -m "feat: add price badge and viator navigation to IdeaCard"
```

---

## Task 6: SearchIdeasSheet — all bug fixes + destination wiring + new IdeaCard props

**Spec ref:** Sections 1, 2, 3, 4

**Files:**
- Modify: `mobile/components/trip-activity/SearchIdeasSheet.tsx`

Six sub-changes, applied sequentially to the same file:
1. Remove `usePlacesAutocomplete` (fix keystroke firing)
2. Rename `MOCK_CATEGORIES` → `SEARCH_CATEGORIES`
3. Fix `handleSaveIdea` type
4. Remove dead StyleSheet entries
5. Add destination ID state + lookup on sheet open
6. Pass `destinationId` to hooks, and `viatorProductCode`/`price`/`currency` to all `IdeaCard` render sites

- [ ] **Step 1: Remove `usePlacesAutocomplete` import and usage**

In the imports block (lines 1–38), remove the line:

```ts
import { usePlacesAutocomplete } from '@/hooks/usePlacesAutocomplete';
```

Inside `SearchIdeasSheet`, find and remove the hook call and destructuring (around line 327):

```ts
  const { query, setQuery, results, loading, clearResults } =
    usePlacesAutocomplete();
```

Remove it entirely.

In the `useEffect([visible])`, find the `else` branch that calls `clearResults`:

```ts
      setQuery('');
      setLocalQuery('');
      clearResults();
```

Change to:

```ts
      setLocalQuery('');
```

In the TextInput's `onChangeText` (around line 484):

```ts
              onChangeText={(txt) => {
                setLocalQuery(txt);
                setQuery(txt); // Still power the hook behind the scenes
              }}
```

Change to:

```ts
              onChangeText={setLocalQuery}
```

In the search bar, find the conditional that shows `SpinningLoader` when `loading`:

```tsx
            {loading ? (
              <SpinningLoader size={18} color="#FF1F8C" style={styles.loader} />
            ) : (
              <TouchableOpacity
                ref={filterBtnRef}
                onPress={handleFilterPress}
                hitSlop={10}>
                <SlidersHorizontal
                  size={18}
                  color={dark ? '#9CA3AF' : '#AEAEAE'}
                />
              </TouchableOpacity>
            )}
```

Replace with (always show the filter button):

```tsx
            <TouchableOpacity
              ref={filterBtnRef}
              onPress={handleFilterPress}
              hitSlop={10}>
              <SlidersHorizontal
                size={18}
                color={dark ? '#9CA3AF' : '#AEAEAE'}
              />
            </TouchableOpacity>
```

- [ ] **Step 2: Rename `MOCK_CATEGORIES` → `SEARCH_CATEGORIES`**

Find:

```ts
export const MOCK_CATEGORIES = [
```

Replace with:

```ts
export const SEARCH_CATEGORIES = [
```

Find the usage in the JSX (around line 512):

```tsx
              {MOCK_CATEGORIES.map((cat) => {
```

Replace with:

```tsx
              {SEARCH_CATEGORIES.map((cat) => {
```

- [ ] **Step 3: Add destination import and fix `handleSaveIdea` type**

In the imports block, add the destination lookup import alongside the other Viator imports:

```ts
import { lookupViatorDestinationId } from '@/utils/viator/viatorDestinationLookup';
```

Find `handleSaveIdea` (around line 373):

```ts
  const handleSaveIdea = async (idea: any) => {
```

Replace with a typed signature. Add a `HotelIdeaData` interface above `SearchIdeasSheet` (after the `SpinningLoader` component, before `SEARCH_CATEGORIES`):

```ts
interface HotelIdeaData {
  name: string;
  hotelId: string;
  address: string;
  roomTypes: unknown[];
  thumbnail?: string | null;
  all_data: unknown;
}
```

Then change the function signature to:

```ts
  const handleSaveIdea = async (idea: MappedViatorIdea | HotelIdeaData) => {
```

Inside the function, the hotel branch already uses `ideaType === 'hotel'` to discriminate. Add an inline type assertion to satisfy TypeScript:

```ts
  const handleSaveIdea = async (idea: MappedViatorIdea | HotelIdeaData) => {
    let input;

    if (ideaType === 'hotel') {
      const hotel = idea as HotelIdeaData;
      const roomTypes = hotel.roomTypes.length;
      input = {
        name: hotel.name,
        type: ideaType,
        location: 'Stay',
        external_id: hotel.hotelId,
        notes: `${hotel.address} | ${roomTypes} room${roomTypes > 1 ? 's' : ''}`,
        all_data: hotel,
        cover_image: hotel.thumbnail || null,
      };
    } else {
      const activity = idea as MappedViatorIdea;
      input = {
        name: activity.title,
        type: ideaType,
        location: activity.category,
        external_id: activity.id,
        notes: activity.description,
      };
    }
    await addIdea(input);
    onClose();
  };
```

- [ ] **Step 4: Remove dead StyleSheet entries**

Find in `styles = StyleSheet.create({...})`:

```ts
  loader: {},
```

Delete this line.

Find:

```ts
  categoryPillActive: {},
```

Delete this line.

Find:

```ts
  categoryPillTextActive: {
    color: '#ffffff',
  },
```

Delete these lines.

- [ ] **Step 5: Add `destinationId` state and look up on sheet open**

After the existing state declarations (around line 325):

```ts
  const [localQuery, setLocalQuery] = useState('');
```

Add:

```ts
  const [destinationId, setDestinationId] = useState<string | null>(null);
```

Inside the `useEffect([visible])`, in the `if (visible)` branch, after the `Promise.all([...]).catch(...)` prefetch block, add the destination lookup:

```ts
      // Look up destination and warm caches together — one API call for both
      lookupViatorDestinationId(trip.destination_label).then((id) => {
        setDestinationId(id);
        const filters = id ? { destination: id } : {};
        Promise.all([
          loadCategoryProducts('Eat/Drink', filters),
          loadCategoryProducts('Do', filters),
          loadCategoryProducts('Shop', filters),
        ]).catch(() => {
          /* swallow prefetch errors — hooks will retry on mount */
        });
      });
```

Replace the existing prefetch block (the `Promise.all` that currently calls `loadCategoryProducts` with no filters) — it is now superseded by the lookup+prefetch block above. The final `if (visible)` branch should contain only:

```ts
      Animated.spring(translateY, { ... }).start();
      setTimeout(() => inputRef.current?.focus(), 150);
      lookupViatorDestinationId(trip.destination_label).then((id) => {
        setDestinationId(id);
        const filters = id ? { destination: id } : {};
        Promise.all([
          loadCategoryProducts('Eat/Drink', filters),
          loadCategoryProducts('Do', filters),
          loadCategoryProducts('Shop', filters),
        ]).catch(() => {});
      });
```

In the `else` branch (sheet closing), after `setActiveCategory('All')`:

```ts
      setDestinationId(null);
```

- [ ] **Step 6: Pass `destinationId` down to `ViatorCategorySection` and `AllCategoryView`**

Update `ViatorCategorySectionProps` to accept `destinationId`:

```ts
interface ViatorCategorySectionProps {
  category: CategoryKey;
  localQuery: string;
  colors: { textColors: { default: string; subtle: string }; [key: string]: any };
  onAdd: (idea: MappedViatorIdea) => void;
  scrollEnabled?: boolean;
  destinationId?: string | null;
}
```

Update `ViatorCategorySection` to accept and forward it:

```ts
function ViatorCategorySection({
  category,
  localQuery,
  colors,
  onAdd,
  scrollEnabled = true,
  destinationId,
}: ViatorCategorySectionProps) {
  const { products, loading, error, retry } = useViatorCategory(category, destinationId);
```

Update `AllCategoryViewProps`:

```ts
interface AllCategoryViewProps {
  localQuery: string;
  colors: { textColors: { default: string; subtle: string }; [key: string]: any };
  onAdd: (idea: MappedViatorIdea) => void;
  destinationId?: string | null;
}
```

Update `AllCategoryView` to accept and forward it:

```ts
function AllCategoryView({ localQuery, colors, onAdd, destinationId }: AllCategoryViewProps) {
```

In the empty-query branch of `AllCategoryView`, pass `destinationId` to each `ViatorCategorySection`:

```tsx
          <ViatorCategorySection
            category={cat}
            localQuery=""
            colors={colors}
            onAdd={onAdd}
            scrollEnabled={false}
            destinationId={destinationId}
          />
```

Update `SearchResultGroupProps` to accept `destinationId`:

```ts
interface SearchResultGroupProps {
  category: Exclude<CategoryKey, 'All'>;
  localQuery: string;
  colors: { textColors: { default: string; subtle: string }; [key: string]: any };
  onAdd: (idea: MappedViatorIdea) => void;
  destinationId?: string | null;
}
```

Update `SearchResultGroup`:

```ts
function SearchResultGroup({
  category,
  localQuery,
  colors,
  onAdd,
  destinationId,
}: SearchResultGroupProps) {
  const { products } = useViatorCategory(category, destinationId);
```

In the query branch of `AllCategoryView`, pass `destinationId` to each `SearchResultGroup`:

```tsx
        {LEAF_CATEGORIES.map((cat) => (
          <SearchResultGroup
            key={cat}
            category={cat}
            localQuery={localQuery}
            colors={colors}
            onAdd={onAdd}
            destinationId={destinationId}
          />
        ))}
```

In `SearchIdeasSheet`'s render, pass `destinationId` to `AllCategoryView` and `ViatorCategorySection`:

```tsx
          {activeCategory === 'Stay' ? (
            <HotelsSection trip={trip} onAdd={handleSaveIdea} />
          ) : activeCategory === 'All' ? (
            <AllCategoryView
              localQuery={localQuery}
              colors={colors}
              onAdd={handleSaveIdea}
              destinationId={destinationId}
            />
          ) : (
            <ViatorCategorySection
              category={activeCategory as Exclude<CategoryKey, 'All'>}
              localQuery={localQuery}
              colors={colors}
              onAdd={handleSaveIdea}
              destinationId={destinationId}
            />
          )}
```

- [ ] **Step 7: Pass `viatorProductCode`, `price`, and `currency` to all `IdeaCard` render sites**

In `ViatorCategorySection`'s `FlatList` render item:

```tsx
      renderItem={({ item }) => (
        <IdeaCard
          imageUri={item.imageUri}
          categoryLabel={item.categoryLabel}
          title={item.title}
          description={item.description}
          onAdd={() => onAdd(item)}
          viatorProductCode={item.id}
          price={item.price}
          currency={item.currency}
        />
      )}
```

In `SearchResultGroup`'s `FlatList` render item:

```tsx
        renderItem={({ item }) => (
          <IdeaCard
            imageUri={item.imageUri}
            categoryLabel={item.categoryLabel}
            title={item.title}
            description={item.description}
            onAdd={() => onAdd(item)}
            viatorProductCode={item.id}
            price={item.price}
            currency={item.currency}
          />
        )}
```

- [ ] **Step 8: Type-check**

```bash
cd mobile && npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 9: Commit**

```bash
git add mobile/components/trip-activity/SearchIdeasSheet.tsx
git commit -m "feat: wire destination lookup, price display, and Viator navigation in SearchIdeasSheet"
```

---

## Verification Checklist (manual, in-app)

Run the app and open a trip that has a `destination_label` set:

- [ ] Open SearchIdeasSheet → no Places API calls in the network tab / logs
- [ ] Category section shows a spinner, then loads products
- [ ] Each product card shows **"From $49"** (or similar) instead of "View Details"
- [ ] Cards with no price show only the Add button (no empty space on the left)
- [ ] Tapping a product card navigates to `viator/[productCode]` detail screen
- [ ] Detail screen shows the product image, title, description, and "View on Viator" button
- [ ] Tapping filter icon (⊞) still opens the filter ActionMenu
- [ ] Switching between category pills (Eat/Drink, Do, Shop, All) works as before
- [ ] Search query filters results client-side as before
- [ ] Hotel cards (Stay tab) are unaffected — still navigate to hotel detail, no price label
