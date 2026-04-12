import type { ViatorProduct } from '@/types/viator.types';
import {
  getViatorSearchSnapshot,
  isViatorSearchFresh,
  loadViatorProductsCached,
  type ViatorSearchFilters,
  VIATOR_DEFAULT_STALE_MS,
} from '@/utils/viator/viatorSearchSingleton';
import { useCallback, useEffect, useState } from 'react';

const BASE_URL = 'https://api.sandbox.viator.com/partner';

interface ViatorSearchParams {
  text?: string;
  filters?: ViatorSearchFilters;
}

/** Legacy helper (proxy) — not cached; prefer `loadViatorProductsCached` / `useViator`. */
export async function searchViator({ text, filters }: ViatorSearchParams) {
  const defaultFilters: ViatorSearchFilters = {
    destination: '732',
    tags: [21972],
    flags: ['LIKELY_TO_SELL_OUT', 'FREE_CANCELLATION'],
    lowestPrice: 5,
    highestPrice: 500,
    startDate: '2023-01-30',
    endDate: '2023-02-28',
    includeAutomaticTranslations: true,
    confirmationType: 'INSTANT',
    durationInMinutes: { from: 20, to: 360 },
    rating: { from: 3, to: 5 },
  };

  const body = {
    endpoint: 'products/search',
    method: 'POST',
    body: {
      filtering: { ...defaultFilters, ...filters },
    },
  };

  const res = await fetch(`https://${BASE_URL}/viator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;version=2.0' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Viator API error: ${res.status}`);
  }

  return res.json();
}

type UseViatorOptions = {
  /** Max age of cached results before a background refetch (default 15 min). */
  staleMs?: number;
};

export function useViator(options?: UseViatorOptions) {
  const staleMs = options?.staleMs ?? VIATOR_DEFAULT_STALE_MS;

  const [products, setProducts] = useState<ViatorProduct[]>(() => [
    ...getViatorSearchSnapshot().products,
  ]);
  const [loading, setLoading] = useState(
    () => getViatorSearchSnapshot().products.length === 0
  );
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (filters?: ViatorSearchFilters, opts?: { force?: boolean }) => {
      setError(null);
      setLoading(true);
      try {
        const raw = await loadViatorProductsCached(filters, {
          force: opts?.force ?? false,
          staleMs,
        });
        setProducts(raw);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [staleMs]
  );

  useEffect(() => {
    let cancelled = false;
    setError(null);

    if (
      getViatorSearchSnapshot().products.length > 0 &&
      isViatorSearchFresh(staleMs)
    ) {
      setProducts([...getViatorSearchSnapshot().products]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    loadViatorProductsCached(undefined, { staleMs })
      .then((raw) => {
        if (!cancelled) {
          setProducts(raw);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Something went wrong'
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [staleMs]);

  return { products, loading, error, refetch: fetchProducts };
}
