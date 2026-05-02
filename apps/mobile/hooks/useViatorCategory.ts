import { useCallback, useEffect, useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';

import {
  type CategoryKey,
  CATEGORY_LABELS,
} from '@/utils/viator/viatorCategoryCache';

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

// Convex `discovery.searchByCategory` accepts a single discovery
// category string. Map mobile's curated categories to that vocabulary.
function toDiscoveryCategory(
  cat: Exclude<CategoryKey, 'All'>,
): string {
  switch (cat) {
    case 'Eat/Drink':
      return 'eat';
    case 'Do':
      return 'tour';
    case 'Shop':
      return 'shop';
    default:
      return 'other';
  }
}

function toIdea(
  item: any,
  category: CategoryKey,
): MappedViatorIdea {
  return {
    id: item.apiRef,
    title: item.title,
    description: item.description ?? '',
    imageUri: item.imageUrl ?? '',
    category: category === 'All' ? 'All' : (category as string),
    categoryLabel: CATEGORY_LABELS[category],
    price: item.price ?? null,
    currency: item.currency ?? null,
  };
}

export function useViatorCategory(
  category: CategoryKey,
  destinationId?: string | null,
): {
  products: MappedViatorIdea[];
  loading: boolean;
  error: string | null;
  retry: () => void;
} {
  const [products, setProducts] = useState<MappedViatorIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchByCategory = useAction(api.discovery.searchByCategory);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const term = destinationId ?? '';
      const items =
        category === 'All'
          ? await searchByCategory({ category: 'tour', term, limit: 30 })
          : await searchByCategory({
              category: toDiscoveryCategory(
                category as Exclude<CategoryKey, 'All'>,
              ),
              term,
              limit: 30,
            });
      setProducts(items.map((it) => toIdea(it, category)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [category, destinationId, searchByCategory]);

  useEffect(() => {
    load();
  }, [load]);

  return { products, loading, error, retry: load };
}
