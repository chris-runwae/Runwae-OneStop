import type { ItineraryTemplate } from '@/types/content.types';

// Maps a Convex `itinerary_templates` document to the legacy
// `ItineraryTemplate` shape consumed by mobile screens. The destination
// name isn't stored on the template, so callers that need it pass it in
// alongside (e.g. the destination details screen, which already knows
// which destination it's rendering).
export function toItineraryTemplate(
  t: any,
  opts: { location?: string } = {}
): ItineraryTemplate {
  return {
    id: t._id as unknown as string,
    title: t.title,
    location: opts.location ?? '',
    duration: `${t.durationDays} day${t.durationDays === 1 ? '' : 's'}`,
    category: t.category ?? '',
    image: t.coverImageUrl ?? '',
    rating: 0,
    reviewCount: 0,
    activities:
      t.days?.reduce(
        (acc: number, d: any) => acc + (d.items?.length ?? 0),
        0
      ) ?? 0,
    description: t.description,
    featured: !!t.isFeatured,
    included: [],
    dailyItinerary: [],
    currency: t.currency,
  };
}
