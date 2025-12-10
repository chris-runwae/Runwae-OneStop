import { StyleSheet, View, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ImageBackground } from 'expo-image';
import { RelativePathString, router } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';

import { FlashList } from '@shopify/flash-list';
import { useHotels, useColorScheme } from '@/hooks';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';
import {
  Spacer,
  Text,
  FilterTabs,
  SectionHeader,
  TripDiscoverySkeleton,
} from '@/components';

type FilterOption = 'All' | 'Stays 🏨' | 'Do 🎨';

const TripDiscoverySection = ({
  countryCode,
  city,
}: {
  countryCode?: string;
  city?: string;
}) => {
  const { hotels, loading, fetchHotels } = useHotels();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('All');

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
    fetchHotels(countryCode, city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterOptions: FilterOption[] = ['All', 'Stays 🏨', 'Do 🎨'];

  const HotelItem = ({ hotel }: { hotel: any }) => {
    // console.log('Hotel: ', hotel);
    const coverImage = hotel.thumbnail
      ? { uri: hotel.thumbnail }
      : 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80';

    return (
      <Pressable
        style={styles.hotelItem}
        onPress={() => router.push(`/trips/hotels/${hotel.id}`)}>
        <View style={styles.hotelContentContainer}>
          <ImageBackground
            contentFit="cover"
            source={coverImage}
            style={styles.hotelCoverImage}
          />
          <Text style={dynamicStyles.hotelItemTitle}>
            {hotel.name || 'Hotel Name'}
          </Text>
          <Text style={dynamicStyles.hotelItemDescription}>
            {hotel.address?.line1 || hotel.location || 'Location not available'}
          </Text>
          <Spacer size={16} vertical />
          <Text style={dynamicStyles.viewMore}>View more</Text>
        </View>
      </Pressable>
    );
  };

  const DiscoveryItem = ({ item }: { item: any }) => {
    let coverImage =
      'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80';
    let title = 'No title';
    let description = 'No description';

    if (item?.hotelDescription) {
      coverImage = item?.thumbnail;
      title = item.name || 'Hotel Name';
      description = item.hotelDescription || '';
    }

    return (
      <Pressable
        style={styles.discoveryItem}
        onPress={() => router.push(`/trips/discovery/${item.id}`)}>
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
            onPress={() => console.log('Add to itinerary pressed')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: colors.primaryColors.default,
              padding: 8,
              borderRadius: 8,
            }}>
            <PlusIcon size={20} color={colors.textColors.default} />
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
    // Handle both array and object with data property
    return Array.isArray(hotels) ? hotels : (hotels as any)?.data || [];
  };

  const renderHotelsList = (showHeader: boolean = false) => {
    const hotelsList = getHotelsList();

    console.log('Hotels List: ', JSON.stringify(hotelsList[0]));

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
    if (loading) {
      return <TripDiscoverySkeleton />;
    }

    if (selectedFilter === 'All') {
      return renderHotelsList(true);
    }

    if (selectedFilter === 'Stays 🏨') {
      return renderHotelsList(false);
    }

    if (selectedFilter === 'Do 🎨') {
      return (
        <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
          Activities coming soon
        </Text>
      );
    }

    return null;
  };

  return (
    <View style={{ flex: 1 }}>
      <FilterTabs
        options={filterOptions}
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
    // marginBottom: 16,
  },
  discoveryImage: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  listContent: {
    // paddingHorizontal: 8,
    // gap: 8,
  },
});
