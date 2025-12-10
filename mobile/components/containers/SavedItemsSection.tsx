import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { ImageBackground } from 'expo-image';
import { RelativePathString, router } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';

import { FlashList } from '@shopify/flash-list';
import { useHotels, useColorScheme, useTrips } from '@/hooks';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';
import {
  Spacer,
  Text,
  FilterTabs,
  SectionHeader,
  TripDiscoverySkeleton,
  TripItemCards,
} from '@/components';
import { SavedItem } from '@/types';

type FilterOption = 'All' | 'Stays 🏨' | 'Do 🎨';

type SavedItemsSectionProps = {
  tripId: string;
  savedItems: SavedItem[];
};
const SavedItemsSection = ({ tripId, savedItems }: SavedItemsSectionProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  console.log('savedItems', savedItems);

  // RENDERS

  return (
    <FlashList
      data={savedItems}
      renderItem={({ item, index }: { item: SavedItem; index: number }) => (
        <View
          style={{
            flex: 1,
            paddingLeft: index % 2 === 0 ? 0 : 4,
            paddingRight: index % 2 === 0 ? 4 : 0,
          }}>
          <TripItemCards item={item} key={item.source_id} />
        </View>
      )}
      keyExtractor={(item: SavedItem) => item.source_id}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
};

export default SavedItemsSection;

const styles = StyleSheet.create({
  listContent: {
    // paddingHorizontal: 8,
    // gap: 8,
  },
});
