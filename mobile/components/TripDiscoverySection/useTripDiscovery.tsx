// Save as: @/components/TripDiscoverySection/useTripDiscovery.ts

import { useEffect, useState } from 'react';
import { useHotels, useTrips, useViator } from '@/hooks';
import { useViatorStore } from '@/stores/useViatorStore';
import { VIATOR_CATEGORIES } from '@/utils/viatorCategories';
import { SavedItem } from '@/types';

type UseTripDiscoveryProps = {
  tripId: string;
  countryCode?: string;
  city?: string;
  tripsHotels?: any[];
  placeDisplayName?: string;
  startDate?: string;
  endDate?: string;
  selectedFilter: string;
};

export const useTripDiscovery = ({
  tripId,
  countryCode,
  city,
  tripsHotels,
  placeDisplayName,
  startDate,
  endDate,
  selectedFilter,
}: UseTripDiscoveryProps) => {
  const { hotels, loading: hotelsLoading, fetchHotels } = useHotels();
  const { addSavedItem } = useTrips();
  const { getLifetimeExperiences } = useViator();
  const { destinations } = useViatorStore();

  const [addSavedItemLoading, setAddSavedItemLoading] = useState(false);
  const [categoryData, setCategoryData] = useState<Record<number, any[]>>({});
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Get the current category object based on selected filter
  const getCurrentCategory = () => {
    return VIATOR_CATEGORIES.find(
      (cat) => selectedFilter === `${cat.displayName} ${cat.emoji}`
    );
  };

  // Find destinationId from placeDisplayName
  const getDestinationId = (): string | null => {
    if (!placeDisplayName || destinations.length === 0) return null;
    const destination = destinations.find(
      (dest) => dest.name.toLowerCase() === placeDisplayName.toLowerCase()
    );
    return destination ? destination.destinationId.toString() : null;
  };

  // Fetch activities for a specific tag
  const fetchActivitiesByTag = async (tagId: number) => {
    const destinationId = getDestinationId();
    if (!destinationId) return [];

    const body = {
      filtering: {
        destination: destinationId,
        tags: [tagId],
        durationInMinutes: {
          from: 0,
          to: 360,
        },
      },
      pagination: {
        start: 1,
        count: 10,
      },
      currency: 'USD',
    };

    if (startDate && endDate) {
      (body.filtering as any).startDate = startDate;
      (body.filtering as any).endDate = endDate;
    }

    try {
      const data = await getLifetimeExperiences(body);
      return data?.products || [];
    } catch (error) {
      console.log('Error fetching activities: ', error);
      return [];
    }
  };

  // Fetch hotels
  useEffect(() => {
    if (tripsHotels === undefined) {
      fetchHotels(countryCode, city);
    }
  }, [countryCode, city, tripsHotels, fetchHotels]);

  // Fetch activities for selected category
  useEffect(() => {
    const currentCategory = getCurrentCategory();

    if (
      currentCategory &&
      placeDisplayName &&
      destinations &&
      destinations.length > 0
    ) {
      setActivitiesLoading(true);

      const subcategoryPromises = currentCategory.subcategories.map((sub) =>
        fetchActivitiesByTag(sub.id).then((data) => ({ id: sub.id, data }))
      );

      Promise.all(subcategoryPromises)
        .then((results) => {
          const newData: Record<number, any[]> = {};
          results.forEach(({ id, data }) => {
            newData[id] = data;
          });
          setCategoryData(newData);
        })
        .finally(() => {
          setActivitiesLoading(false);
        });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter, placeDisplayName, destinations, startDate, endDate]);

  // Handle adding items to saved items
  const handleAddToSavedItems = async (item: SavedItem) => {
    setAddSavedItemLoading(true);
    const savedItem = {
      source_type: item.source_type,
      id: item.id,
      title: item.title,
      description: item.description,
      location: item.location,
      cover_image: item.cover_image,
    };

    await addSavedItem(tripId, savedItem);
    setAddSavedItemLoading(false);
  };

  // Get hotels list (prefer tripsHotels if provided)
  const getHotelsList = () => {
    if (tripsHotels !== undefined) {
      return Array.isArray(tripsHotels)
        ? tripsHotels
        : (tripsHotels as any)?.data || [];
    }
    return Array.isArray(hotels) ? hotels : (hotels as any)?.data || [];
  };

  return {
    hotels: getHotelsList(),
    hotelsLoading,
    categoryData,
    activitiesLoading,
    addSavedItemLoading,
    handleAddToSavedItems,
    getCurrentCategory,
  };
};
