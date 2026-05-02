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
    name: item.title,
    type: addOnCategoryToType(item.category),
    location: item.category,
    external_id: item.id,
    cover_image: item.image,
    notes: item.description,
  };
}

export function savedItemFromExperience(
  experience: Experience
): CreateSavedItemInput {
  return {
    name: experience.title,
    type: 'activity',
    location: experience.location ?? experience.category,
    external_id: experience.id,
    cover_image: experience.image,
    notes: experience.description,
  };
}

export function savedItemFromEvent(event: Event): CreateSavedItemInput {
  return {
    name: event.title,
    // DB check constraint only allows: activity, restaurant, hotel, transport, other
    type: 'activity',
    location: event.location,
    external_id: event.id,
    cover_image: event.image,
    notes:
      [event.date, event.time, event.description].filter(Boolean).join(' · ') ||
      null,
    all_data: event,
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
    name: destination.title,
    type: 'other',
    location: destination.location,
    external_id: destination.id,
    cover_image: destination.image,
    notes: destination.description ?? null,
  };
}

export function savedItemFromViatorIdea(
  idea: MappedViatorIdea
): CreateSavedItemInput {
  return {
    name: idea.title,
    type: 'activity',
    location: idea.category,
    external_id: idea.id,
    cover_image: idea.imageUri,
    notes: idea.description,
    all_data: idea.product,
  };
}

export function savedItemFromHotel(
  hotel: LiteAPIHotelRateItem
): CreateSavedItemInput {
  const roomCount = hotel.roomTypes?.length ?? 0;
  return {
    name: hotel.name,
    type: 'hotel',
    location: 'Stay',
    external_id: hotel.hotelId,
    cover_image: hotel.thumbnail ?? null,
    notes: `${hotel.address} | ${roomCount} room${roomCount !== 1 ? 's' : ''}`,
    all_data: hotel,
  };
}
