import { useCallback, useEffect, useRef, useState } from 'react';
import type { ViatorProduct } from '@/types/viator.types';
import { pickViatorImageUrls } from '@/utils/viator/pickViatorImageUrls';
import {
  type CategoryKey,
  CATEGORY_LABELS,
  getCategorySnapshot,
  isCategoryFresh,
  loadCategoryProducts,
} from '@/utils/viator/viatorCategoryCache';
import { VIATOR_DEFAULT_STALE_MS } from '@/utils/viator/viatorSearchSingleton';

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

export function useViatorCategory(category: CategoryKey): {
  products: MappedViatorIdea[];
  loading: boolean;
  error: string | null;
  retry: () => void;
} {
  const isMountedRef = useRef(true);

  const [products, setProducts] = useState<MappedViatorIdea[]>(() =>
    mapSnapshot(getCategorySnapshot(category), category)
  );
  const [loading, setLoading] = useState(
    () => !isCategoryFresh(category, VIATOR_DEFAULT_STALE_MS)
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const load = useCallback(
    async (staleMs: number) => {
      setError(null);
      setLoading(true);
      try {
        const raw = await loadCategoryProducts(category, {}, staleMs);
        if (isMountedRef.current) setProducts(mapSnapshot(raw, category));
      } catch (err) {
        if (isMountedRef.current)
          setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    },
    [category]
  );

  useEffect(() => {
    let cancelled = false;

    if (isCategoryFresh(category, VIATOR_DEFAULT_STALE_MS)) {
      const snap = getCategorySnapshot(category);
      setProducts(mapSnapshot(snap, category));
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError(null);
    loadCategoryProducts(category, {}, VIATOR_DEFAULT_STALE_MS)
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

    return () => {
      cancelled = true;
    };
  }, [category]);

  const retry = useCallback(() => {
    load(0); // staleMs=0 forces a fresh fetch
  }, [load]);

  return { products, loading, error, retry };
}
