import type { Experience } from '@/types/content.types';
import type { ViatorProduct } from '@/types/viator.types';

import { pickViatorImageUrls } from './pickViatorImageUrls';

function parseCityFromProductUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    const toursIdx = parts.indexOf('tours');
    if (toursIdx >= 0 && parts[toursIdx + 1]) {
      return decodeURIComponent(parts[toursIdx + 1]).replace(/-/g, ' ');
    }
  } catch {
    /* ignore invalid URL */
  }
  return undefined;
}

function itineraryTypeLabel(itineraryType?: string): string {
  switch (itineraryType) {
    case 'STANDARD':
      return 'Tour';
    case 'ACTIVITY':
      return 'Activity';
    default:
      return itineraryType ? itineraryType.replace(/_/g, ' ') : 'Experience';
  }
}

export function getViatorDurationMinutes(
  product: ViatorProduct
): number | undefined {
  const d = product.duration;
  if (!d) return undefined;
  if (d.fixedDurationInMinutes != null) return d.fixedDurationInMinutes;
  if (d.variableDurationFromMinutes != null) {
    const from = d.variableDurationFromMinutes;
    const to = d.variableDurationToMinutes ?? from;
    return Math.round((from + to) / 2);
  }
  return undefined;
}

export function mapViatorProductToExperience(product: ViatorProduct): Experience {
  const { cover, gallery } = pickViatorImageUrls(product);
  const fromPrice = product.pricing?.summary?.fromPrice ?? 0;
  const currency = product.pricing?.currency ?? 'USD';
  const reviews = product.reviews;
  const rating = reviews?.combinedAverageRating ?? 0;
  const reviewCount = reviews?.totalReviews ?? 0;

  return {
    id: product.productCode,
    title: product.title,
    category: itineraryTypeLabel(product.itineraryType),
    rating,
    reviewCount,
    description: product.description ?? '',
    image: cover,
    gallery: gallery.length ? gallery : cover ? [cover] : [],
    price: fromPrice,
    currency,
    cost: fromPrice,
    included: [],
    whatToKnow: [],
    itinerary: [],
    reviews: [],
    durationMinutes: getViatorDurationMinutes(product),
    location: parseCityFromProductUrl(product.productUrl),
    bookingReference: product.productCode,
  };
}
