import type { ViatorProduct } from '@/types/viator.types';

let cachedProducts: ViatorProduct[] = [];

export function setViatorProductsCache(products: ViatorProduct[]): void {
  cachedProducts = products;
}

export function getViatorProductByCode(
  productCode: string
): ViatorProduct | undefined {
  return cachedProducts.find((p) => p.productCode === productCode);
}
