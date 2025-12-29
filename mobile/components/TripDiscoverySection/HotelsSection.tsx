import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RelativePathString } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Text, SectionHeader } from '@/components';
import { textStyles } from '@/utils/styles';
import { SavedItem } from '@/types';
import { DiscoveryItem } from './DiscoveryItem';
import { HotelsSectionSkeleton } from './HotelsSectionSkeleton';
import { HotelIcon } from 'lucide-react-native';

type HotelsSectionProps = {
  hotels: any[];
  tripsHotels?: any[];
  colors: any;
  addSavedItemLoading: boolean;
  onAddToSavedItems: (item: SavedItem) => void;
  showHeader?: boolean;
  loading?: boolean;
};

export const HotelsSection = ({
  hotels,
  colors,
  addSavedItemLoading,
  onAddToSavedItems,
  showHeader = false,
  loading = false,
}: HotelsSectionProps) => {
  const styles = createStyles(colors);

  // Show skeleton while loading
  if (loading) {
    return (
      <>
        {showHeader && (
          <SectionHeader
            title="Hotels"
            linkText="More"
            linkTo={'/explore' as RelativePathString}
          />
        )}
        <HotelsSectionSkeleton />
      </>
    );
  }

  // Show empty state when no hotels
  if (hotels.length === 0) {
    return (
      <>
        {showHeader && (
          <SectionHeader
            title="Hotels"
            linkText="More"
            linkTo={'/explore' as RelativePathString}
          />
        )}
        <View style={localStyles.emptyContainer}>
          <View
            style={[
              localStyles.emptyIconContainer,
              { backgroundColor: colors.backgroundColors.subtle },
            ]}>
            <HotelIcon size={40} color={colors.textColors.subtle} />
          </View>
          <Text style={[styles.emptyText, localStyles.emptyTitle]}>
            No hotels found
          </Text>
          <Text style={[styles.emptyText, localStyles.emptySubtitle]}>
            We couldn&apos;t find any hotels for this destination. Try searching
            in the Explore tab.
          </Text>
        </View>
      </>
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
        data={hotels}
        renderItem={({ item, index }: { item: any; index: number }) => (
          <View
            style={{
              flex: 1,
              paddingLeft: index % 2 === 0 ? 0 : 4,
              paddingRight: index % 2 === 0 ? 4 : 0,
            }}>
            <DiscoveryItem
              item={item}
              colors={colors}
              addSavedItemLoading={addSavedItemLoading}
              onAddToSavedItems={onAddToSavedItems}
            />
          </View>
        )}
        keyExtractor={(item: any) => item.hotelId || `hotel-${item.id}`}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={localStyles.listContent}
      />
    </>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    emptyText: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      lineHeight: 19.5,
      color: colors.textColors.subtle,
    },
  });

const localStyles = StyleSheet.create({
  listContent: {},
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
  },
});
