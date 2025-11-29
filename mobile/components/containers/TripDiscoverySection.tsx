import { ActivityIndicator, StyleSheet, View, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ImageBackground } from 'expo-image';
import { RelativePathString } from 'expo-router';

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

const TripDiscoverySection = () => {
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
      color: colors.primaryColors.default,
      textDecorationLine: 'underline',
    },
  });

  useEffect(() => {
    fetchHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterOptions: FilterOption[] = ['All', 'Stays 🏨', 'Do 🎨'];

  const HotelItem = ({ hotel }: { hotel: any }) => {
    const coverImage = hotel.thumbnail
      ? { uri: hotel.thumbnail }
      : 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80';

    return (
      <Pressable
        style={styles.hotelItem}
        onPress={() => console.log('Hotel pressed: ', hotel)}>
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

  const getHotelsList = () => {
    // Handle both array and object with data property
    return Array.isArray(hotels) ? hotels : (hotels as any)?.data || [];
  };

  const renderHotelsList = (showHeader: boolean = false) => {
    const hotelsList = getHotelsList();

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
          renderItem={({ item }: { item: any }) => <HotelItem hotel={item} />}
          keyExtractor={(item: any) => item.hotelId || `hotel-${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <Spacer size={16} horizontal />}
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
});
