import type { ViatorProduct, ViatorProductImage } from '@/types/viator.types';

function bestVariantUrl(image: ViatorProductImage): string | undefined {
  const variants = image.variants ?? [];
  if (variants.length === 0) return undefined;
  const best = variants.reduce((a, b) =>
    a.width * a.height >= b.width * b.height ? a : b
  );
  return best.url;
}

/** Cover + ordered gallery URLs for cards and detail screens */
export function pickViatorImageUrls(product: ViatorProduct): {
  cover: string;
  gallery: string[];
} {
  const images = product.images ?? [];
  const ordered = [...images].sort((a, b) => {
    if (a.isCover && !b.isCover) return -1;
    if (!a.isCover && b.isCover) return 1;
    return 0;
  });

  const urls = ordered
    .map((img) => bestVariantUrl(img))
    .filter((u): u is string => Boolean(u));

  const cover = urls[0] ?? '';
  const gallery = urls.slice(1);

  return { cover, gallery };
}
