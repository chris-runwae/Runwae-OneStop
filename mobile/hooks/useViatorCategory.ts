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
  const [products, setProducts] = useState<MappedViatorIdea[]>(() =>
    mapSnapshot(getCategorySnapshot(category), category)
  );
  const [loading, setLoading] = useState(
    () => !isCategoryFresh(category, VIATOR_DEFAULT_STALE_MS)
  );
  const [error, setError] = useState<string | null>(null);

  // Generation counter: incremented on every new load call.
  // Guards against both stale category-change fetches and stale retry fetches.
  const loadGenRef = useRef(0);

  const load = useCallback(
    async (staleMs: number) => {
      const gen = ++loadGenRef.current;
      setError(null);
      setLoading(true);
      try {
        const raw = await loadCategoryProducts(category, {}, staleMs);
        if (loadGenRef.current === gen) {
          setProducts(mapSnapshot(raw, category));
        }
      } catch (err) {
        if (loadGenRef.current === gen) {
          setError(err instanceof Error ? err.message : 'Something went wrong');
        }
      } finally {
        if (loadGenRef.current === gen) {
          setLoading(false);
        }
      }
    },
    [category]
  );

  useEffect(() => {
    if (isCategoryFresh(category, VIATOR_DEFAULT_STALE_MS)) {
      setProducts(mapSnapshot(getCategorySnapshot(category), category));
      setLoading(false);
      return;
    }
    load(VIATOR_DEFAULT_STALE_MS);
  }, [category, load]);

  const retry = useCallback(() => {
    load(0); // staleMs=0 forces a fresh fetch regardless of cache
  }, [load]);

  return { products, loading, error, retry };
}
