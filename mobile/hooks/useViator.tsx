// hooks/useDestinations.ts
import { useCallback, useEffect, useState } from 'react';
const BASE_URL = 'https://api.sandbox.viator.com/partner';

interface SearchFilters {
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
}

interface ViatorSearchParams {
  text?: string;
  filters?: SearchFilters;
}

export async function searchViator({ text, filters }: ViatorSearchParams) {
  // Default filtering values
  const defaultFilters: SearchFilters = {
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
      filtering: { ...defaultFilters, ...filters }, // allow overrides
    },
  };

  const res = await fetch(`https://${BASE_URL}/viator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;version=2.0' },
    body: JSON.stringify(body),
  });

  console.log('Viator response:', await res?.json());

  if (!res.ok) {
    throw new Error(`Viator API error: ${res.status}`);
  }

  return res.json();
}

export function useViator() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (filters?: SearchFilters) => {
    setLoading(true);
    setError(null);

    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const defaultFilters: SearchFilters = {
      destination: '732',
      tags: [21972],
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
      endpoint: 'products/search',
      method: 'POST',
      body: {
        filtering: { ...defaultFilters, ...filters }, // allow overrides
        sorting: {
          sort: 'TRAVELER_RATING',
          order: 'DESCENDING',
        },
        currency: 'USD',
      },
    };

    try {
      console.log('1. Starting fetch...');

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
          body: JSON.stringify(body?.body),
        }
      );

      console.log('2. Response status:', response.status);
      console.log('3. Response ok:', response.ok);

      const text = await response.text(); // read as text first
      console.log('4. Raw text:', text);

      const data = JSON.parse(text);
      console.log('5. Parsed data keys:', Object.keys(data));

      setProducts(
        data?.products?.results ?? data?.products ?? data?.data ?? []
      );
    } catch (err) {
      console.log('CAUGHT ERROR:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}
