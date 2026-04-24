import type { ViatorProduct } from '@/types/viator.types';

let cachedProducts: ViatorProduct[] = [];

export function setViatorProductsCache(products: ViatorProduct[]): void {
  cachedProducts = products;
}

/**
 * Upserts products into the cache by productCode.
 * Does not wipe existing entries — safe to call from multiple sources.
 */
export function mergeViatorProductsCache(products: ViatorProduct[]): void {
  const existing = new Map(cachedProducts.map((p) => [p.productCode, p]));
  for (const p of products) {
    existing.set(p.productCode, p);
  }
  cachedProducts = Array.from(existing.values());
}

export function getViatorProductByCode(
  productCode: string
): ViatorProduct | undefined {
  return cachedProducts.find((p) => p.productCode === productCode);
}
