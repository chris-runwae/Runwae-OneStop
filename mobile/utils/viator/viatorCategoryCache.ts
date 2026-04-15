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

/**
 * Returns cached data if fresh, joins any in-flight request, or starts a new fetch.
 * `filters` are merged in (caller may pass `{ destination }` etc.).
 * Tags are always set from the category mapping.
 * For 'All', loads all three leaf categories in parallel and returns deduped union.
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
