import type { ViatorProduct } from '@/types/viator.types';
import { setViatorProductsCache } from '@/utils/viator/viatorProductCache';

/** How long cached search results are considered fresh (no refetch on remount). */
export const VIATOR_DEFAULT_STALE_MS = 15 * 60 * 1000; // 15 minutes

export type ViatorSearchFilters = {
  destination?: string;
  tags?: number[];
  flags?: string[];
  lowestPrice?: number;
  highestPrice?: number;
  startDate?: string;
  endDate?: string;
  includeAutomaticTranslations?: boolean;
  confirmationType?: string;
  durationInMinutes?: { from: number; to: number };
  rating?: { from: number; to: number };
  currency?: string;
};

let cachedAtMs = 0;
let cachedProducts: ViatorProduct[] = [];
/** Single in-flight default search shared by all useViator() subscribers */
let inflightDefault: Promise<ViatorProduct[]> | null = null;

function isDefaultSearch(filters?: ViatorSearchFilters): boolean {
  return filters == null;
}

export function getViatorSearchSnapshot(): {
  products: ViatorProduct[];
  fetchedAtMs: number;
} {
  return { products: cachedProducts, fetchedAtMs: cachedAtMs };
}

export function isViatorSearchFresh(
  staleMs: number = VIATOR_DEFAULT_STALE_MS
): boolean {
  return cachedProducts.length > 0 && Date.now() - cachedAtMs < staleMs;
}

/**
 * Performs the partner products/search request. When `filters` is omitted,
 * results are cached and deduped across the app.
 */
export async function executeViatorProductSearch(
  filters?: ViatorSearchFilters
): Promise<ViatorProduct[]> {
  const startDate = new Date().toISOString().split('T')[0];
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const defaultFilters: ViatorSearchFilters = {
    destination: '732',
    tags: [21913, 21725, 22046],
    flags: ['LIKELY_TO_SELL_OUT', 'FREE_CANCELLATION'],
    lowestPrice: 5,
    highestPrice: 500,
    startDate: startDate,
    endDate: endDate,
    includeAutomaticTranslations: true,
    confirmationType: 'INSTANT',
    durationInMinutes: { from: 20, to: 360 },
    rating: { from: 3, to: 5 },
  };

  const body = {
    filtering: { ...defaultFilters, ...filters },
    sorting: {
      sort: 'TRAVELER_RATING' as const,
      order: 'DESCENDING' as const,
    },
    currency: 'USD',
  };

  const response = await fetch(
    `https://api.sandbox.viator.com/partner/products/search`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json;version=2.0',
        'Content-Type': 'application/json;version=2.0',
        'exp-api-key': 'c6eb1e0b-45be-40d3-a855-513d36bd361e',
        'Accept-Language': 'en-US',
      },
      body: JSON.stringify(body),
    }
  );

  const text = await response.text();
  const data = JSON.parse(text);
  const raw: ViatorProduct[] = Array.isArray(data)
    ? data
    : (data?.products?.results ?? data?.products ?? data?.data ?? []);

  return raw;
}

/**
 * Returns cached data if fresh, joins in-flight request, or starts a new fetch.
 * Only applies to the default search (no filter overrides).
 */
export function loadViatorProductsCached(
  filters: ViatorSearchFilters | undefined,
  options: { force?: boolean; staleMs?: number }
): Promise<ViatorProduct[]> {
  const { force = false, staleMs = VIATOR_DEFAULT_STALE_MS } = options;

  if (!isDefaultSearch(filters)) {
    return executeViatorProductSearch(filters);
  }

  if (force) {
    return executeViatorProductSearch(undefined).then((raw) => {
      cachedProducts = raw;
      cachedAtMs = Date.now();
      setViatorProductsCache(raw);
      return raw;
    });
  }

  if (cachedProducts.length > 0 && Date.now() - cachedAtMs < staleMs) {
    return Promise.resolve(cachedProducts);
  }

  if (inflightDefault) {
    return inflightDefault;
  }

  inflightDefault = executeViatorProductSearch(undefined)
    .then((raw) => {
      cachedProducts = raw;
      cachedAtMs = Date.now();
      setViatorProductsCache(raw);
      return raw;
    })
    .finally(() => {
      inflightDefault = null;
    });

  return inflightDefault;
}
