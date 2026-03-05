import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

const LITE_API_KEY = process.env.EXPO_PUBLIC_LITEAPI_KEY!;

export type LiteAPIPlace = {
  placeId: string;
  displayName: string;
  formattedAddress: string;
  types: string[];
};

export const usePlacesAutocomplete = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LiteAPIPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery] = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.liteapi.travel/v3.0/data/places?textQuery=${encodeURIComponent(debouncedQuery)}&type=locality`,
          {
            headers: {
              accept: 'application/json',
              'X-API-Key': LITE_API_KEY,
            },
            signal: controller.signal,
          }
        );
        const data = await response.json();
        setResults(data.data ?? []);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
    return () => controller.abort(); // cancel in-flight request if query changes
  }, [debouncedQuery]);

  const clearResults = () => {
    setQuery('');
    setResults([]);
  };

  return { query, setQuery, results, loading, clearResults };
};