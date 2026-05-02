import type { LiteAPIPlace } from '@/types/liteapi.types';

// Simple in-memory cache with TTL
interface CacheEntry {
  data: LiteAPIPlace[];
  timestamp: number;
}

class PlaceSearchCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  get(key: string): LiteAPIPlace[] | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: LiteAPIPlace[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const placeSearchCache = new PlaceSearchCache();

// Validation utilities
export const validatePlace = (place: any): place is LiteAPIPlace => {
  return (
    place &&
    typeof place.placeId === 'string' &&
    typeof place.displayName === 'string'
  );
};

export const validateSearchQuery = (
  query: string
): { isValid: boolean; error?: string } => {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 3) {
    return { isValid: false, error: 'Please enter at least 3 characters' };
  }

  return { isValid: true };
};

// Error handling utilities
export const getSearchErrorMessage = (error: any): string | null => {
  if (error?.message?.includes('request limit')) {
    return 'Too many searches — please wait a moment';
  }
  if (error?.message?.includes('network')) {
    return 'Network error — please check your connection';
  }
  return 'Failed to search places';
};
