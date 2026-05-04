import { useCallback, useEffect, useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';

import type { ViatorProduct } from '@/types/viator.types';

// Convex's discovery layer returns DiscoveryItem[]. The mobile UI was
// historically built around the Viator partner-API ViatorProduct shape;
// for Phase 4 we adapt at the hook layer so screens can stay
// declarative. Fields that don't have a discovery analogue (pricing
// breakdowns, availability windows) default to null/undefined.
function toViatorProduct(item: any): ViatorProduct {
  return {
    productCode: item.apiRef,
    title: item.title,
    description: item.description ?? '',
    images: item.imageUrl
      ? [{ variants: [{ url: item.imageUrl, width: 800, height: 600 }] }]
      : [],
    pricing: item.price
      ? {
          summary: { fromPrice: item.price },
          currency: item.currency ?? 'GBP',
        }
      : undefined,
    duration: undefined,
    reviews: item.rating
      ? {
          combinedAverageRating: item.rating,
          totalReviews: 0,
        }
      : undefined,
  } as unknown as ViatorProduct;
}

export interface UseViatorOptions {
  // Free-text search term. Falls back to a sensible default when empty so
  // the row never renders blank on first paint.
  term?: string;
  // Pre-resolved coordinates from upstream geocoding (optional). When
  // provided, the discovery layer can rank results by proximity.
  latitude?: number;
  longitude?: number;
  category?: string;
  limit?: number;
}

const DEFAULT_TERM = 'top tours';

export function useViator(options: UseViatorOptions = {}) {
  const { term, latitude, longitude, category = 'tour', limit = 30 } = options;
  const [products, setProducts] = useState<ViatorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchByCategory = useAction(api.discovery.searchByCategory);

  const fetchProducts = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const trimmed = term?.trim();
      const items = await searchByCategory({
        category,
        term: trimmed && trimmed.length > 0 ? trimmed : DEFAULT_TERM,
        limit,
        ...(typeof latitude === 'number' && typeof longitude === 'number'
          ? { lat: latitude, lng: longitude }
          : {}),
      });
      setProducts(items.map(toViatorProduct));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [searchByCategory, term, category, limit, latitude, longitude]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}
