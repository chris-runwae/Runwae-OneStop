# Viator Category Cache — SearchIdeasSheet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace MOCK_IDEAS in SearchIdeasSheet with live Viator API data (keyed by category), while keeping HotelsSection for Stay and warming the cache on sheet open.

**Architecture:** A new category cache module (`viatorCategoryCache.ts`) wraps `executeViatorProductSearch` from the existing singleton, keyed by CategoryKey (`'Eat/Drink'`, `'Do'`, `'Shop'`). A `useViatorCategory` hook reads from that cache and maps products to the `IdeaCard` prop shape. `SearchIdeasSheet` prefetches all three leaf categories on `visible → true`, then switches rendering based on `activeCategory`. `'All'` aggregates the three cached leaf snapshots.

**Tech Stack:** React Native, TypeScript strict, Expo, existing Viator singleton (`executeViatorProductSearch`, `VIATOR_DEFAULT_STALE_MS`, `ViatorSearchFilters`), `pickViatorImageUrls` utility.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| **Create** | `mobile/utils/viator/viatorCategoryCache.ts` | Keyed cache Map, `loadCategoryProducts`, `getCategorySnapshot`, `isCategoryFresh` |
| **Create** | `mobile/hooks/useViatorCategory.ts` | React hook that reads the category cache; maps `ViatorProduct → MappedViatorIdea` |
| **Modify** | `mobile/components/trip-activity/SearchIdeasSheet.tsx` | Prefetch on open; `ViatorCategorySection` component; switch on `activeCategory`; search logic |

---

## Known Types & Fields

**`ViatorProduct`** (from `mobile/types/viator.types.ts`):
```ts
{
  productCode: string;         // ← id
  title: string;               // ← title
  description?: string;        // ← description (may be undefined)
  images?: ViatorProductImage[]; // use pickViatorImageUrls() → .cover
  reviews?: { combinedAverageRating?: number; totalReviews?: number };
  pricing?: { summary?: { fromPrice?: number }; currency?: string };
  itineraryType?: string;
  flags?: string[];
}
```

**`IdeaCard`** required props: `imageUri: string`, `categoryLabel: string`, `title: string`, `description: string`, `onAdd?: () => void`.

**`MappedViatorIdea`** (the bridge type used in SearchIdeasSheet):
```ts
interface MappedViatorIdea {
  id: string;           // productCode
  title: string;
  description: string;
  imageUri: string;
  category: string;     // 'Eat/Drink' | 'Do' | 'Shop'
  categoryLabel: string; // '🍹 Eat/Drink' | '🎭 Do' | '🛍️ Shop'
}
```

**`handleSaveIdea`** (activity branch) reads: `idea.title`, `idea.category`, `idea.id`, `idea.description` — all present in `MappedViatorIdea`.

---

## Task 1: `viatorCategoryCache.ts`

**Files:**
- Create: `mobile/utils/viator/viatorCategoryCache.ts`

- [ ] **Step 1: Create the file with types, constants, and the cache Map**

```ts
// mobile/utils/viator/viatorCategoryCache.ts
import type { ViatorProduct } from '@/types/viator.types';
import {
  executeViatorProductSearch,
  VIATOR_DEFAULT_STALE_MS,
  type ViatorSearchFilters,
} from '@/utils/viator/viatorSearchSingleton';

export type CategoryKey = 'Eat/Drink' | 'Do' | 'Shop' | 'All';

/** Tag IDs for each leaf category. 'All' is the union. */
export const CATEGORY_TAGS: Record<Exclude<CategoryKey, 'All'>, number[]> = {
  'Eat/Drink': [21911],
  Do: [21913, 21725, 22046],
  Shop: [21970],
};

/** Human-readable labels with emoji for badges/headers. */
export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  'Eat/Drink': '🍹 Eat/Drink',
  Do: '🎭 Do',
  Shop: '🛍️ Shop',
  All: 'All',
};

interface CategoryCacheEntry {
  products: ViatorProduct[];
  fetchedAtMs: number;
  inflight: Promise<ViatorProduct[]> | null;
}

const _cache = new Map<Exclude<CategoryKey, 'All'>, CategoryCacheEntry>();

function _getEntry(category: Exclude<CategoryKey, 'All'>): CategoryCacheEntry {
  if (!_cache.has(category)) {
    _cache.set(category, { products: [], fetchedAtMs: 0, inflight: null });
  }
  return _cache.get(category)!;
}

const LEAF_CATEGORIES = ['Eat/Drink', 'Do', 'Shop'] as const;
```

- [ ] **Step 2: Implement `getCategorySnapshot`**

Append to the same file:

```ts
/**
 * Synchronously returns the current cached products for a category.
 * For 'All', returns the deduped union of the three leaf caches.
 */
export function getCategorySnapshot(category: CategoryKey): ViatorProduct[] {
  if (category === 'All') {
    const seen = new Set<string>();
    return LEAF_CATEGORIES.flatMap((c) => _getEntry(c).products).filter((p) => {
      if (seen.has(p.productCode)) return false;
      seen.add(p.productCode);
      return true;
    });
  }
  return _getEntry(category).products;
}
```

- [ ] **Step 3: Implement `isCategoryFresh`**

Append to the same file:

```ts
/**
 * Returns true if the category's cache is non-empty and within `staleMs`.
 * For 'All', ALL three leaf caches must be fresh.
 */
export function isCategoryFresh(
  category: CategoryKey,
  staleMs: number = VIATOR_DEFAULT_STALE_MS
): boolean {
  if (category === 'All') {
    return LEAF_CATEGORIES.every((c) => isCategoryFresh(c, staleMs));
  }
  const entry = _getEntry(category);
  return entry.products.length > 0 && Date.now() - entry.fetchedAtMs < staleMs;
}
```

- [ ] **Step 4: Implement `loadCategoryProducts`**

Append to the same file:

```ts
/**
 * Returns cached data if fresh, joins any in-flight request, or starts a new fetch.
 * `filters` are merged in (caller may pass `{ destination }` etc.).
 * Tags are always set from the category mapping.
 * For 'All', loads all three leaf categories in parallel.
 */
export async function loadCategoryProducts(
  category: CategoryKey,
  filters: ViatorSearchFilters = {},
  staleMs: number = VIATOR_DEFAULT_STALE_MS
): Promise<ViatorProduct[]> {
  if (category === 'All') {
    const [eat, doProducts, shop] = await Promise.all([
      loadCategoryProducts('Eat/Drink', filters, staleMs),
      loadCategoryProducts('Do', filters, staleMs),
      loadCategoryProducts('Shop', filters, staleMs),
    ]);
    const seen = new Set<string>();
    return [...eat, ...doProducts, ...shop].filter((p) => {
      if (seen.has(p.productCode)) return false;
      seen.add(p.productCode);
      return true;
    });
  }

  const entry = _getEntry(category);

  // Return cached if fresh
  if (entry.products.length > 0 && Date.now() - entry.fetchedAtMs < staleMs) {
    return entry.products;
  }

  // Join existing in-flight request
  if (entry.inflight) {
    return entry.inflight;
  }

  // Start new fetch — merge caller filters, always override tags
  const mergedFilters: ViatorSearchFilters = {
    ...filters,
    tags: CATEGORY_TAGS[category],
  };

  entry.inflight = executeViatorProductSearch(mergedFilters)
    .then((products) => {
      entry.products = products;
      entry.fetchedAtMs = Date.now();
      return products;
    })
    .finally(() => {
      entry.inflight = null;
    });

  return entry.inflight;
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd /Users/christopherobocha/Documents/GitHub/Runwae-OneStop/mobile
npx tsc --noEmit --project tsconfig.json 2>&1 | head -40
```

Expected: no errors from `viatorCategoryCache.ts`.

- [ ] **Step 6: Commit**

```bash
git add mobile/utils/viator/viatorCategoryCache.ts
git commit -m "feat: add viatorCategoryCache — keyed category cache with loadCategoryProducts"
```

---

## Task 2: `useViatorCategory.ts`

**Files:**
- Create: `mobile/hooks/useViatorCategory.ts`

- [ ] **Step 1: Create the hook file**

```ts
// mobile/hooks/useViatorCategory.ts
import { useCallback, useEffect, useState } from 'react';
import type { ViatorProduct } from '@/types/viator.types';
import { pickViatorImageUrls } from '@/utils/viator/pickViatorImageUrls';
import {
  type CategoryKey,
  CATEGORY_LABELS,
  getCategorySnapshot,
  isCategoryFresh,
  loadCategoryProducts,
  VIATOR_DEFAULT_STALE_MS,
} from '@/utils/viator/viatorCategoryCache';
import { VIATOR_DEFAULT_STALE_MS as STALE_MS } from '@/utils/viator/viatorSearchSingleton';

export interface MappedViatorIdea {
  id: string;
  title: string;
  description: string;
  imageUri: string;
  category: string;
  categoryLabel: string;
}

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

> **Note on missing fields:** `ViatorProduct` has no `tags` array field — the type only exposes the fields listed in `viator.types.ts`. If you need to re-filter by tag client-side, it is not possible from the current type. `images[0]` alone is not used; `pickViatorImageUrls` picks the best variant via `isCover` and `variants[]`. `description` is `optional` and may be empty string.

- [ ] **Step 2: Implement `useViatorCategory`**

Append to the same file:

```ts
export function useViatorCategory(category: CategoryKey) {
  const initialSnapshot = getCategorySnapshot(category);

  const [products, setProducts] = useState<MappedViatorIdea[]>(() =>
    mapSnapshot(initialSnapshot, category)
  );
  const [loading, setLoading] = useState(
    () => !isCategoryFresh(category, STALE_MS)
  );
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (force = false) => {
      setError(null);
      setLoading(true);
      try {
        const raw = await loadCategoryProducts(
          category,
          {},
          force ? 0 : STALE_MS
        );
        setProducts(mapSnapshot(raw, category));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [category]
  );

  useEffect(() => {
    let cancelled = false;

    if (isCategoryFresh(category, STALE_MS)) {
      const snap = getCategorySnapshot(category);
      if (!cancelled) setProducts(mapSnapshot(snap, category));
      setLoading(false);
      return () => { cancelled = true; };
    }

    setLoading(true);
    loadCategoryProducts(category, {}, STALE_MS)
      .then((raw) => {
        if (!cancelled) setProducts(mapSnapshot(raw, category));
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Something went wrong');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [category]);

  return { products, loading, error, retry: () => load(true) };
}
```

- [ ] **Step 3: Add the `mapSnapshot` helper above `useViatorCategory`**

This needs to be inserted between the `mapProduct` function and `useViatorCategory`. Add after `mapProduct`:

```ts
function mapSnapshot(
  raw: ViatorProduct[],
  category: CategoryKey
): MappedViatorIdea[] {
  if (category === 'All') {
    // Products already have category embedded — we need to re-derive per product
    // For All, we map each product against its leaf category label.
    // Since executeViatorProductSearch doesn't return tag info in the type,
    // we use the catch-all CATEGORY_LABELS['All'] label for All-mode rendering.
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

> **Note on 'All' labels:** Because the Viator API does not return which tag matched in the product response, we cannot determine which leaf category a product belongs to when loaded from the 'All' union. For 'All' mode we use the `categoryLabel` from the snapshot (which was built per-leaf-category). See Task 3 for the better approach: keep three separate `useViatorCategory` hooks per leaf category and render them in stacked sections, each with the correct label.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Users/christopherobocha/Documents/GitHub/Runwae-OneStop/mobile
npx tsc --noEmit --project tsconfig.json 2>&1 | head -40
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add mobile/hooks/useViatorCategory.ts
git commit -m "feat: add useViatorCategory hook with MappedViatorIdea mapping"
```

---

## Task 3: SearchIdeasSheet — Prefetch + ViatorCategorySection + Search

**Files:**
- Modify: `mobile/components/trip-activity/SearchIdeasSheet.tsx`

### Sub-task 3a: Add imports

- [ ] **Step 1: Add imports at top of SearchIdeasSheet.tsx**

After the existing import block (after line 28 `import { ItemType } from '@/hooks/useItineraryActions';`), add:

```ts
import {
  loadCategoryProducts,
  getCategorySnapshot,
  CATEGORY_LABELS,
  type CategoryKey,
} from '@/utils/viator/viatorCategoryCache';
import { useViatorCategory, type MappedViatorIdea } from '@/hooks/useViatorCategory';
```

### Sub-task 3b: ViatorCategorySection component

- [ ] **Step 2: Add `ViatorCategorySection` component above `SearchIdeasSheet`**

Insert between the `SpinningLoader` component and the `MOCK_CATEGORIES` constant:

```tsx
interface ViatorCategorySectionProps {
  category: CategoryKey;
  localQuery: string;
  colors: ReturnType<typeof import('@/constants').Colors['light' | 'dark']>;
  dark: boolean;
  onAdd: (idea: MappedViatorIdea) => void;
}

function ViatorCategorySection({
  category,
  localQuery,
  colors,
  dark,
  onAdd,
}: ViatorCategorySectionProps) {
  const { products, loading, error, retry } = useViatorCategory(category);

  const filtered = React.useMemo(() => {
    if (!localQuery) return products;
    const q = localQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [products, localQuery]);

  if (loading) {
    return (
      <View style={sectionStyles.center}>
        <SpinningLoader size={28} color="#FF1F8C" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={sectionStyles.center}>
        <Text style={[sectionStyles.errorText, { color: colors.textColors.subtle }]}>
          {error}
        </Text>
        <TouchableOpacity onPress={retry} style={sectionStyles.retryBtn}>
          <Text style={sectionStyles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.ideaGridRow}
      contentContainerStyle={styles.ideaGridContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={() => (
        <View style={styles.emptyState}>
          <Text
            style={[styles.emptyStateTitle, { color: colors.textColors.default }]}>
            No ideas found
          </Text>
          <Text
            style={[styles.emptyStateSub, { color: colors.textColors.subtle }]}>
            Try searching for something else or changing the category.
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <IdeaCard
          imageUri={item.imageUri}
          categoryLabel={item.categoryLabel}
          title={item.title}
          description={item.description}
          onAdd={() => onAdd(item)}
        />
      )}
    />
  );
}

const sectionStyles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  errorText: {
    fontSize: 14,
    fontFamily: AppFonts.inter.regular,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FF2E92',
    borderRadius: 99,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: AppFonts.inter.semiBold,
  },
});
```

> **Note:** `ReturnType<typeof Colors['light' | 'dark']>` won't work as a generic — use `any` for the `colors` prop type since `Colors` is an existing `any`-typed prop pattern in this codebase. Or import the concrete `Colors` type if it's exported. Check `@/constants` to pick the cleanest option.

**Correction for the `colors` type:** Replace the `ViatorCategorySectionProps` `colors` type with:

```ts
interface ViatorCategorySectionProps {
  category: CategoryKey;
  localQuery: string;
  colors: { textColors: { default: string; subtle: string }; [key: string]: any };
  dark: boolean;
  onAdd: (idea: MappedViatorIdea) => void;
}
```

### Sub-task 3c: AllCategoryView component

- [ ] **Step 3: Add `AllCategoryView` component above `SearchIdeasSheet`**

Insert after `ViatorCategorySection`:

```tsx
interface AllCategoryViewProps {
  localQuery: string;
  colors: { textColors: { default: string; subtle: string }; [key: string]: any };
  dark: boolean;
  onAdd: (idea: MappedViatorIdea) => void;
}

const LEAF_CATEGORY_KEYS: Array<Exclude<CategoryKey, 'All'>> = [
  'Eat/Drink',
  'Do',
  'Shop',
];

function AllCategoryView({ localQuery, colors, dark, onAdd }: AllCategoryViewProps) {
  if (localQuery) {
    // Search mode: render each leaf category's filtered results with a section header
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.ideaGridContent}>
        {LEAF_CATEGORY_KEYS.map((cat) => (
          <SearchResultGroup
            key={cat}
            category={cat}
            localQuery={localQuery}
            colors={colors}
            dark={dark}
            onAdd={onAdd}
          />
        ))}
      </ScrollView>
    );
  }

  // Normal mode: each leaf category in its own section
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {LEAF_CATEGORY_KEYS.map((cat) => (
        <View key={cat} style={allStyles.section}>
          <Text style={[allStyles.sectionHeader, { color: colors.textColors.default }]}>
            {CATEGORY_LABELS[cat]}
          </Text>
          <ViatorCategorySection
            category={cat}
            localQuery=""
            colors={colors}
            dark={dark}
            onAdd={onAdd}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const allStyles = StyleSheet.create({
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 15,
    fontFamily: AppFonts.inter.semiBold,
    marginBottom: 12,
    marginTop: 4,
  },
});
```

- [ ] **Step 4: Add `SearchResultGroup` component used by `AllCategoryView`**

Insert before `AllCategoryView`:

```tsx
interface SearchResultGroupProps {
  category: Exclude<CategoryKey, 'All'>;
  localQuery: string;
  colors: { textColors: { default: string; subtle: string }; [key: string]: any };
  dark: boolean;
  onAdd: (idea: MappedViatorIdea) => void;
}

function SearchResultGroup({
  category,
  localQuery,
  colors,
  dark,
  onAdd,
}: SearchResultGroupProps) {
  const { products } = useViatorCategory(category);
  const q = localQuery.toLowerCase();
  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
  );

  if (filtered.length === 0) return null;

  return (
    <View>
      <Text
        style={[allStyles.sectionHeader, { color: colors.textColors.default }]}>
        {CATEGORY_LABELS[category]} · {filtered.length} result
        {filtered.length !== 1 ? 's' : ''}
      </Text>
      <View style={styles.ideaGridRow}>
        {filtered.map((item) => (
          <IdeaCard
            key={item.id}
            imageUri={item.imageUri}
            categoryLabel={item.categoryLabel}
            title={item.title}
            description={item.description}
            onAdd={() => onAdd(item)}
          />
        ))}
      </View>
    </View>
  );
}
```

> **Note:** `SearchResultGroup` must be defined **before** `AllCategoryView` so it's in scope.

### Sub-task 3d: Prefetch on `visible → true`

- [ ] **Step 5: Update the `useEffect([visible])` in `SearchIdeasSheet`**

Find this block in `SearchIdeasSheet` (around line 175):

```ts
useEffect(() => {
  if (visible) {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
    setTimeout(() => inputRef.current?.focus(), 150);
  } else {
    Animated.timing(translateY, {
      toValue: 600,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setQuery('');
    setLocalQuery('');
    clearResults();
    setActiveCategory('All');
  }
}, [visible]);
```

Replace with:

```ts
useEffect(() => {
  if (visible) {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
    setTimeout(() => inputRef.current?.focus(), 150);
    // Warm the category caches in parallel — makes pill taps instant
    Promise.all([
      loadCategoryProducts('Eat/Drink'),
      loadCategoryProducts('Do'),
      loadCategoryProducts('Shop'),
    ]).catch(() => {
      /* swallow prefetch errors — hooks will retry on mount */
    });
  } else {
    Animated.timing(translateY, {
      toValue: 600,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setQuery('');
    setLocalQuery('');
    clearResults();
    setActiveCategory('All');
  }
}, [visible]);
```

### Sub-task 3e: Replace the FlatList render section

- [ ] **Step 6: Replace the category rendering block in the JSX**

Find this block (around line 409):

```tsx
{activeCategory === 'Stay' ? (
  <HotelsSection trip={trip} onAdd={handleSaveIdea} />
) : (
  <FlatList
    data={filteredIdeas}
    keyExtractor={(item) => item.id}
    numColumns={2}
    columnWrapperStyle={styles.ideaGridRow}
    contentContainerStyle={styles.ideaGridContent}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
    ListEmptyComponent={() => (
      <View style={styles.emptyState}>
        <Text
          style={[
            styles.emptyStateTitle,
            { color: colors.textColors.default },
          ]}>
          No ideas found
        </Text>
        <Text
          style={[
            styles.emptyStateSub,
            { color: colors.textColors.subtle },
          ]}>
          Try searching for something else or changing the category.
        </Text>
      </View>
    )}
    renderItem={({ item }) => (
      <IdeaCard
        imageUri={item.imageUri}
        categoryLabel={item.categoryLabel}
        title={item.title}
        description={item.description}
        onAdd={() => handleSaveIdea(item)}
      />
    )}
  />
)}
```

Replace with:

```tsx
{activeCategory === 'Stay' ? (
  <HotelsSection trip={trip} onAdd={handleSaveIdea} />
) : activeCategory === 'All' ? (
  <AllCategoryView
    localQuery={localQuery}
    colors={colors}
    dark={dark}
    onAdd={handleSaveIdea}
  />
) : (
  <ViatorCategorySection
    category={activeCategory as CategoryKey}
    localQuery={localQuery}
    colors={colors}
    dark={dark}
    onAdd={handleSaveIdea}
  />
)}
```

### Sub-task 3f: Remove now-unused `filteredIdeas` memo

- [ ] **Step 7: Remove the `filteredIdeas` useMemo block**

Delete lines (approx 197–228):

```ts
const filteredIdeas = React.useMemo(() => {
  let result = MOCK_IDEAS.filter((idea) => { ... });
  ...
  return result;
}, [activeCategory, localQuery, activeIdeaFilter]);
```

Remove `MOCK_IDEAS` from the file too (the `export const MOCK_IDEAS = [...]` constant around line 78).

> Keep `MOCK_CATEGORIES` — it's still used for the category pills.

- [ ] **Step 8: Verify TypeScript compiles**

```bash
cd /Users/christopherobocha/Documents/GitHub/Runwae-OneStop/mobile
npx tsc --noEmit --project tsconfig.json 2>&1 | head -60
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add mobile/components/trip-activity/SearchIdeasSheet.tsx
git commit -m "feat: replace mock data with live Viator category sections in SearchIdeasSheet"
```

---

## Self-Review Against Spec

### Spec Coverage

| Spec Item | Covered |
|-----------|---------|
| Keyed cache module `viatorCategoryCache.ts` | ✅ Task 1 |
| `loadCategoryProducts`, `getCategorySnapshot`, `isCategoryFresh` | ✅ Task 1 |
| Reuse `executeViatorProductSearch` — no duplicate fetch | ✅ Task 1, Step 4 |
| Category tag mapping (Eat/Drink→21911, Do→21913+, Shop→21970) | ✅ Task 1, Step 1 |
| `useViatorCategory` hook with `{ products, loading, error }` | ✅ Task 2 |
| IdeaCard mapping (title, description, imageUri, categoryLabel, id) | ✅ Task 2, Steps 1–3 |
| Prefetch on sheet open via `Promise.all` | ✅ Task 3d, Step 5 |
| `'Stay'` → `HotelsSection` unchanged | ✅ Task 3e, Step 6 |
| `'Eat/Drink'`, `'Do'`, `'Shop'` → `ViatorCategorySection` | ✅ Task 3b, Step 2 |
| `'All'` → stacked leaf sections | ✅ Task 3c, Steps 3–4 |
| Client-side filter by `localQuery` (single category) | ✅ Task 3b, Step 2 |
| `'All'` + non-empty query → grouped search results | ✅ Task 3c, Steps 3–4 (`SearchResultGroup`) |
| `'All'` + empty query → normal stacked view | ✅ Task 3c, Step 3 |
| Spinner while loading (`SpinningLoader`) | ✅ Task 3b, Step 2 |
| Error + retry button | ✅ Task 3b, Step 2 |
| Stale time 15 min / `VIATOR_DEFAULT_STALE_MS` | ✅ Throughout; imported not hardcoded |
| Do NOT modify singleton or `useViator.ts` | ✅ Only `executeViatorProductSearch` imported |
| Do NOT change `IdeaCard` props | ✅ All props passed correctly |
| TypeScript strict / no `any` except existing patterns | ✅ Noted with `colors` workaround |

### Missing/undefined ViatorProduct fields

- **`tags`**: Not in the type — cannot re-filter client-side by tag. Products come pre-filtered by tag from the API.
- **`description`**: Optional (`description?: string`) — fallback to `''` applied throughout.
- **`images`**: Optional array — `pickViatorImageUrls` handles `undefined`/empty and returns `cover: ''` safely.
- **`pricing`**: Optional nested — not used for `IdeaCard` (IdeaCard doesn't show price), but available for future use.
- **`reviews.combinedAverageRating`**: Optional — not surfaced in `IdeaCard` (card has no rating display in current props).
