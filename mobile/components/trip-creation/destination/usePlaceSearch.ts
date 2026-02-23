import { useCallback, useRef, useEffect } from 'react';
import { searchPlaces } from '@/services/liteapi';
import type { LiteAPIPlace } from '@/types/liteapi.types';
import {
  placeSearchCache,
  validatePlace,
  validateSearchQuery,
  getSearchErrorMessage,
} from './placeSearchUtils';

interface UsePlaceSearchResult {
  performSearch: (query: string) => Promise<void>;
  debouncedSearch: (query: string, delay?: number) => void;
  clearSearch: () => void;
  clearCache: () => void;
}

export const usePlaceSearch = (
  onResults: (places: LiteAPIPlace[]) => void,
  onLoading: (loading: boolean) => void,
  onError: (error: string | null) => void,
  onShowSuggestions: (show: boolean) => void
): UsePlaceSearchResult => {
  const debounceTimeoutRef = useRef<number | null>(null);

  const performSearch = useCallback(
    async (query: string) => {
      const validation = validateSearchQuery(query);

      if (!validation.isValid) {
        onError(validation.error || null);
        onResults([]);
        onShowSuggestions(false);
        return;
      }

      onLoading(true);
      onError(null);

      try {
        // Check cache first
        const cached = placeSearchCache.get(query);
        if (cached) {
          onResults(cached);
          onShowSuggestions(true);
          return;
        }

        // Perform API search
        const response = await searchPlaces(query);
        const validPlaces = (response.data || []).filter(validatePlace);

        // Cache the results
        placeSearchCache.set(query, validPlaces);

        onResults(validPlaces);
        onShowSuggestions(validPlaces.length > 0);

        if (validPlaces.length === 0) {
          onError('No results found');
        }
      } catch (error: any) {
        console.error('Error searching places:', error);
        const errorMessage = getSearchErrorMessage(error);
        if (errorMessage) {
          onError(errorMessage);
        } else {
          onError('Unknown error occurred');
        }
        onResults([]);
        onShowSuggestions(false);
      } finally {
        onLoading(false);
      }
    },
    [onResults, onLoading, onError, onShowSuggestions]
  );

  const debouncedSearch = useCallback(
    (query: string, delay = 1000) => {
      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Show loading state immediately if text is long enough
      if (query.trim().length >= 3) {
        onShowSuggestions(true);
      }

      // Set new timeout
      debounceTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, delay);
    },
    [performSearch, onShowSuggestions]
  );

  const clearSearch = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  const clearCache = useCallback(() => {
    placeSearchCache.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return clearSearch;
  }, [clearSearch]);

  return {
    performSearch,
    clearSearch,
    clearCache,
    debouncedSearch,
  };
};
