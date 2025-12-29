// Save as: @/components/TripDiscoverySection/HotelsSection.tsx

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RelativePathString } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Text, SectionHeader } from '@/components';
import { textStyles } from '@/utils/styles';
import { SavedItem } from '@/types';
import { DiscoveryItem } from './DiscoveryItem';

type HotelsSectionProps = {
  hotels: any[];
  tripsHotels?: any[];
  colors: any;
  addSavedItemLoading: boolean;
  onAddToSavedItems: (item: SavedItem) => void;
  showHeader?: boolean;
};

export const HotelsSection = ({
  hotels,
  colors,
  addSavedItemLoading,
  onAddToSavedItems,
  showHeader = false,
}: HotelsSectionProps) => {
  const styles = createStyles(colors);

  if (hotels.length === 0) {
    return <Text style={styles.emptyText}>No hotels available</Text>;
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
});
