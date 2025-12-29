import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { ImageBackground } from 'expo-image';
import { RelativePathString, router } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';

import { FlashList } from '@shopify/flash-list';
import { useHotels, useColorScheme, useTrips, useViator } from '@/hooks';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';
import {
  Spacer,
  Text,
  FilterTabs,
  SectionHeader,
  TripDiscoverySkeleton,
} from '@/components';
import { ItinerarySourceType, SavedItem } from '@/types';
import { useViatorStore } from '@/stores/useViatorStore';
import { VIATOR_CATEGORIES } from '@/utils/viatorCategories';
import { useActivityStore } from '@/stores/activityStore';

type TripDiscoverySectionProps = {
  tripId: string;
  countryCode?: string;
  city?: string;
  tripsHotels?: any[];
  loading?: boolean;
  placeDisplayName?: string;
  startDate?: string;
  endDate?: string;
};
const TripDiscoverySection = ({
  tripId,
  countryCode,
  city,
  tripsHotels,
  loading = false,
  placeDisplayName,
  startDate,
  endDate,
}: TripDiscoverySectionProps) => {
  const { hotels, loading: hotelsLoading, fetchHotels } = useHotels();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  // const [selectedFilter, setSelectedFilter] = useState<FilterOption>('All');
  const { addSavedItem } = useTrips();
  const { getLifetimeExperiences } = useViator();
  const { destinations } = useViatorStore();
  const { setCurrentActivity } = useActivityStore();

  const [addSavedItemLoading, setAddSavedItemLoading] = useState(false);
  // const [activitiesLoading, setActivitiesLoading] = useState(false);

  // State for each category's data
  const [categoryData, setCategoryData] = useState<Record<number, any[]>>({});
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Available filters - including All, Stays, and all activity categories
  const filters = [
    'All',
    'Stays 🏨',
    ...VIATOR_CATEGORIES.map((cat) => `${cat.displayName} ${cat.emoji}`),
  ];

  const [selectedFilter, setSelectedFilter] = useState('All');

  // Get the current category object based on selected filter
  const getCurrentCategory = () => {
    return VIATOR_CATEGORIES.find(
      (cat) => selectedFilter === `${cat.displayName} ${cat.emoji}`
    );
  };

  // Fetch activities for a specific category
  useEffect(() => {
    const currentCategory = getCurrentCategory();

    if (
      currentCategory &&
      placeDisplayName &&
      destinations &&
      destinations.length > 0
    ) {
      setActivitiesLoading(true);

      // Fetch data for all subcategories of the selected main category
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

  //STYLE
  const dynamicStyles = StyleSheet.create({
    emptyText: {
      color: colors.textColors.subtle,
    },
    hotelItemTitle: {
      ...textStyles.bold_20,
      fontSize: 16,
    },
    hotelItemDescription: {
      ...textStyles.regular_14,
      color: colors.textColors.subtle,
    },
    viewMore: {
      ...textStyles.regular_12,
      fontSize: 14,
      color: colors.primaryColors.default,
      textDecorationLine: 'underline',
    },
  });

  useEffect(() => {
    // Only fetch hotels if tripsHotels prop is not provided (undefined)
    // If tripsHotels is provided (even if empty array), parent component handles fetching
    if (tripsHotels === undefined) {
      fetchHotels(countryCode, city);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, city, tripsHotels]);

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

  // Fetch all activity sections
  useEffect(() => {
    if (
      selectedFilter === 'Do 🎨' &&
      placeDisplayName &&
      destinations &&
      destinations.length > 0
    ) {
      setActivitiesLoading(true);
      Promise.all([
        fetchActivitiesByTag(11940), // Lifetime experiences
        fetchActivitiesByTag(21074), // Unique experiences
        fetchActivitiesByTag(22046), // Adventure tours
      ]).finally(() => {
        setActivitiesLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter, placeDisplayName, destinations, startDate, endDate]);

  const DiscoveryItem = ({ item }: { item: any }) => {
    let coverImage =
      'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80';
    let title = 'No title';
    let description = 'No description';
    let sourceType = 'accommodation';
    let location: string | undefined = undefined;
    let itemId = item.id;

    if (item?.hotelDescription) {
      sourceType = 'accommodation';
      coverImage = item?.thumbnail;
      title = item.name || 'Hotel Name';
      description = item.hotelDescription || '';
      location = `${item.city}, ${item.country}`;
      itemId = item.id;
    } else if (item?.productCode) {
      // Activity item
      sourceType = 'activity';
      coverImage =
        item?.images?.[0]?.variants?.[6]?.url ||
        item?.images?.[0]?.url ||
        'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80';
      title = item.title || 'Activity Name';
      description = item.description || '';
      itemId = item.productCode;
    }

    const handlePress = () => {
      if (sourceType === 'activity') {
        setCurrentActivity(item);
        router.push(`/(tabs)/trips/activity` as RelativePathString);
      } else if (sourceType === 'accommodation') {
        router.push(`/(tabs)/trips/hotels/${itemId}` as RelativePathString);
      } else {
      }
    };

    return (
      <Pressable style={styles.discoveryItem} onPress={handlePress}>
        <ImageBackground
          source={{ uri: coverImage }}
          style={styles.discoveryImage}
        />
        <Text style={dynamicStyles.hotelItemTitle}>{title}</Text>
        <Text style={dynamicStyles.hotelItemDescription} numberOfLines={3}>
          {description}
        </Text>
        <Spacer size={16} vertical />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            // alignItems: 'baseline',
          }}>
          <Text style={[dynamicStyles.viewMore, { alignSelf: 'flex-end' }]}>
            View more
          </Text>
          <Pressable
            onPress={() =>
              handleAddToSavedItems({
                source_type: sourceType as unknown as ItinerarySourceType,
                id: itemId,
                title: title,
                description: description,
                location: location,
                cover_image: coverImage,
              })
            }
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: colors.primaryColors.default,
              padding: 8,
              borderRadius: 8,
            }}>
            {addSavedItemLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <PlusIcon size={20} color={colors.white} />
              </>
            )}
            <Text
              style={{
                ...textStyles.regular_12,
                color: colors.white,
                fontSize: 14,
              }}>
              Add
            </Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  const getHotelsList = () => {
    // If tripsHotels prop is provided, use it (parent controls the data source)
    // This prevents switching between data sources during re-renders
    if (tripsHotels !== undefined) {
      return Array.isArray(tripsHotels)
        ? tripsHotels
        : (tripsHotels as any)?.data || [];
    }
    // Fallback to hotels (only when tripsHotels prop is not provided)
    return Array.isArray(hotels) ? hotels : (hotels as any)?.data || [];
  };

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

  // // RENDERS
  // Render a single activity section (subcategory)
  const renderActivitySection = (
    title: string,
    data: any[],
    keyPrefix: string
  ) => {
    if (data.length === 0) return null;

    return (
      <View key={keyPrefix} style={{ marginBottom: 32 }}>
        <SectionHeader
          title={title}
          linkText="More"
          linkTo={'/explore' as RelativePathString}
        />
        <Spacer size={16} vertical />
        <FlashList
          data={data}
          renderItem={({ item, index }: { item: any; index: number }) => (
            <View
              style={{
                width: 280,
                marginRight: index < data.length - 1 ? 16 : 0,
              }}>
              <DiscoveryItem item={item} key={item.productCode} />
            </View>
          )}
          keyExtractor={(item: any) =>
            `activity-${keyPrefix}-${item.productCode}`
          }
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContent}
        />
      </View>
    );
  };

  // Render all subcategories for the current main category
  const renderActivitiesSection = () => {
    if (activitiesLoading) {
      return <TripDiscoverySkeleton />;
    }

    const currentCategory = getCurrentCategory();
    if (!currentCategory) return null;

    // Check if we have any data
    const hasAnyData = Object.values(categoryData).some(
      (data) => data.length > 0
    );

    if (!hasAnyData) {
      return (
        <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
          No activities available for {currentCategory.displayName}
        </Text>
      );
    }

    // Render all subcategories that have data
    return (
      <>
        {currentCategory.subcategories.map((subcategory) => {
          const data = categoryData[subcategory.id] || [];
          return renderActivitySection(
            subcategory.displayName,
            data,
            `${currentCategory.name}-${subcategory.name}`
          );
        })}

        {/* "More" section for the entire main category */}
        <View style={{ marginTop: 16, marginBottom: 32 }}>
          <SectionHeader
            title={`More ${currentCategory.displayName}`}
            linkText="See All"
            linkTo={
              `/explore?category=${currentCategory.id}` as RelativePathString
            }
          />
        </View>
      </>
    );
  };

  const renderHotelsList = (showHeader: boolean = false) => {
    const hotelsList = getHotelsList();
    // console.log('hotelsList: ', hotelsList);

    if (hotelsList.length === 0) {
      return (
        <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
          No hotels available
        </Text>
      );
    }

    return (
      <>
        {showHeader && (
          <SectionHeader
            title="Hotels"
            linkText="More"
            linkTo={'/explore' as RelativePathString}
          />
        )}
        <FlashList
          data={hotelsList}
          renderItem={({ item, index }: { item: any; index: number }) => (
            <View
              style={{
                flex: 1,
                paddingLeft: index % 2 === 0 ? 0 : 4,
                paddingRight: index % 2 === 0 ? 4 : 0,
              }}>
              <DiscoveryItem item={item} key={item.id} />
            </View>
          )}
          keyExtractor={(item: any) => item.hotelId || `hotel-${item.id}`}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </>
    );
  };

  const renderContent = () => {
    if (loading || hotelsLoading) {
      return <TripDiscoverySkeleton />;
    }

    if (selectedFilter === 'All') {
      return renderHotelsList(true);
    }

    if (selectedFilter === 'Stays 🏨') {
      return renderHotelsList(true);
    }

    // if (selectedFilter === 'Do 🎨') {
    //   return renderActivitiesSection();
    // }

    // Check if it's any of the activity categories
    const currentCategory = getCurrentCategory();
    if (currentCategory) {
      return renderActivitiesSection();
    }

    return null;
  };

  return (
    <View style={{ flex: 1 }}>
      <FilterTabs
        // options={filterOptions}
        options={filters}
        selectedOption={selectedFilter}
        onOptionChange={setSelectedFilter}
      />
      <Spacer size={24} vertical />
      {renderContent()}
    </View>
  );
};

export default TripDiscoverySection;

const styles = StyleSheet.create({
  emptyText: {
    ...textStyles.subtitle_Regular,
    fontSize: 14,
    lineHeight: 19.5,
  },
  hotelItem: {
    marginBottom: 24,
  },
  hotelContentContainer: {
    flex: 1,
  },
  hotelCoverImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginBottom: 4,
    overflow: 'hidden',
  },
  discoveryItem: {
    flex: 1,
    // marginHorizontal: 4,
    marginBottom: 32,
  },
  discoveryImage: {
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  listContent: {
    // paddingHorizontal: 8,
    // gap: 8,
  },
  horizontalListContent: {
    paddingRight: 16,
  },
});
