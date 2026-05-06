import type { AddOn } from '@/constants/home.constant';
import type { CreateSavedItemInput } from '@/hooks/useIdeaActions';
import type { ItemType } from '@/hooks/useItineraryActions';
import type { Event, Experience } from '@/types/content.types';
import type { MappedViatorIdea } from '@/hooks/useViatorCategory';
import type { LiteAPIHotelRateItem } from '@/types/liteapi.types';

function addOnCategoryToType(category: string): ItemType {
  switch (category) {
    case 'Food':
      return 'restaurant';
    case 'Stay':
      return 'hotel';
    default:
      return 'activity';
  }
}

export function savedItemFromAddOn(item: AddOn): CreateSavedItemInput {
  return {
    title: item.title,
    type: addOnCategoryToType(item.category),
    locationName: item.category,
    apiRef: item.id,
    imageUrl: item.image,
    notes: item.description,
    isManual: false,
  };
}

export function savedItemFromExperience(
  experience: Experience,
): CreateSavedItemInput {
  return {
    title: experience.title,
    type: 'activity',
    locationName: experience.location ?? experience.category,
    apiSource: 'viator',
    apiRef: experience.id,
    imageUrl: experience.image,
    notes: experience.description,
    isManual: false,
  };
}

export function savedItemFromEvent(event: Event): CreateSavedItemInput {
  const notesParts = [event.date, event.time, event.description].filter(Boolean);
  return {
    title: event.title,
    type: 'event',
    locationName: event.location,
    apiSource: 'internal',
    apiRef: event.id,
    imageUrl: event.image,
    notes: notesParts.length ? notesParts.join(' · ') : undefined,
    isManual: false,
  };
}

export function savedItemFromDestination(destination: {
  id: string;
  title: string;
  location: string;
  image: string | null;
  description?: string | null;
}): CreateSavedItemInput {
  return {
    title: destination.title,
    type: 'other',
    locationName: destination.location,
    apiRef: destination.id,
    imageUrl: destination.image ?? undefined,
    notes: destination.description ?? undefined,
    isManual: false,
  };
}

export function savedItemFromViatorIdea(
  idea: MappedViatorIdea,
): CreateSavedItemInput {
  return {
    title: idea.title,
    type: 'activity',
    locationName: idea.category,
    apiSource: 'viator',
    apiRef: idea.id,
    imageUrl: idea.imageUri,
    notes: idea.description,
    isManual: false,
  };
}

export function savedItemFromHotel(
  hotel: LiteAPIHotelRateItem,
): CreateSavedItemInput {
  const roomCount = hotel.roomTypes?.length ?? 0;
  return {
    title: hotel.name,
    type: 'hotel',
    locationName: 'Stay',
    apiSource: 'liteapi',
    apiRef: hotel.hotelId,
    imageUrl: hotel.thumbnail ?? undefined,
    notes: `${hotel.address} | ${roomCount} room${roomCount !== 1 ? 's' : ''}`,
    isManual: false,
  };
}

// Generic adapter for the discovery.searchByCategory action's items.
// Maps each provider's category to an itinerary item type so the saved
// item shows up under the right rail in the trip Ideas tab.
type DiscoveryItemLike = {
  provider: string;
  apiRef: string;
  category: string;
  title: string;
  description?: string;
  imageUrl?: string;
};

export function savedItemFromDiscoveryItem(
  item: DiscoveryItemLike,
): CreateSavedItemInput {
  const typeByCategory: Record<string, CreateSavedItemInput['type']> = {
    stay: 'hotel',
    tour: 'activity',
    adventure: 'activity',
    explore: 'activity',
    event: 'event',
    attend: 'event',
    eat: 'restaurant',
    ride: 'car_rental',
    fly: 'flight',
  };
  return {
    title: item.title,
    type: typeByCategory[item.category] ?? 'activity',
    locationName: item.category,
    apiSource: item.provider,
    apiRef: item.apiRef,
    imageUrl: item.imageUrl ?? undefined,
    notes: item.description,
    isManual: false,
  };
}
