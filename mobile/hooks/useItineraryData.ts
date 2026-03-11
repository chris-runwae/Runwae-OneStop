import { useMemo } from 'react';
import { exploreDummyData } from '@/stores/exploreStore';
import type { Experience, ItineraryItem, Destination } from '@/types/explore';

const DAYS_PER_ITINERARY = 2;

export function useItineraryData(experienceId: string) {
  const experience = useMemo(() => {
    return exploreDummyData.experiences.find((exp) => exp.id === experienceId);
  }, [experienceId]);

  const itineraryItems = useMemo(() => {
    if (!experience) return [];
    return exploreDummyData.itineraries
      .filter((it) => it.experienceId === experience.id)
      .sort((a, b) => a.order - b.order);
  }, [experience]);

  const days = useMemo(() => {
    if (!itineraryItems.length) return [];
    
    const itemsPerDay = Math.ceil(itineraryItems.length / DAYS_PER_ITINERARY);
    return Array.from({ length: DAYS_PER_ITINERARY }, (_, index) => ({
      day: index + 1,
      items: itineraryItems.slice(index * itemsPerDay, (index + 1) * itemsPerDay),
    }));
  }, [itineraryItems]);

  const destination = useMemo(() => {
    if (!experience) return undefined;
    return exploreDummyData.destinations.find(
      (dest) => dest.id === experience.destinationId
    );
  }, [experience]);

  const relatedItineraries = useMemo(() => {
    if (!experience) return [];
    return exploreDummyData.experiences
      .filter((exp) => exp.id !== experience.id && exp.isFeatured)
      .slice(0, 3);
  }, [experience]);

  const getItineraryItemsForExperience = (expId: string): ItineraryItem[] => {
    return exploreDummyData.itineraries.filter((it) => it.experienceId === expId);
  };

  const getDestinationForExperience = (expId: string): Destination | undefined => {
    const exp = exploreDummyData.experiences.find((e) => e.id === expId);
    if (!exp) return undefined;
    return exploreDummyData.destinations.find((dest) => dest.id === exp.destinationId);
  };

  return {
    experience,
    itineraryItems,
    days,
    destination,
    relatedItineraries,
    getItineraryItemsForExperience,
    getDestinationForExperience,
  };
}

export function useCurrentDayItems(days: Array<{ day: number; items: ItineraryItem[] }>, selectedDay: number) {
  return useMemo(() => {
    return days.find((d) => d.day === selectedDay)?.items || [];
  }, [days, selectedDay]);
}
