// Save as: @/components/TripDiscoverySection/ActivitiesSection.tsx

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RelativePathString } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import {
  Text,
  SectionHeader,
  Spacer,
  TripDiscoverySkeleton,
} from '@/components';
import { textStyles } from '@/utils/styles';
import { SavedItem } from '@/types';
import { DiscoveryItem } from './DiscoveryItem';

type ActivitiesSectionProps = {
  currentCategory: any;
  categoryData: Record<number, any[]>;
  activitiesLoading: boolean;
  colors: any;
  addSavedItemLoading: boolean;
  onAddToSavedItems: (item: SavedItem) => void;
};

export const ActivitiesSection = ({
  currentCategory,
  categoryData,
  activitiesLoading,
  colors,
  addSavedItemLoading,
  onAddToSavedItems,
}: ActivitiesSectionProps) => {
  const styles = createStyles(colors);

  if (activitiesLoading) {
    return <TripDiscoverySkeleton />;
  }

  const hasAnyData = Object.values(categoryData).some(
    (data) => data.length > 0
  );

  if (!hasAnyData) {
    return (
      <Text style={styles.emptyText}>
        No activities available for {currentCategory.displayName}
      </Text>
    );
  }

  return (
    <>
      {currentCategory.subcategories.map((subcategory: any) => {
        const data = categoryData[subcategory.id] || [];
        if (data.length === 0) return null;

        return (
          <View
            key={`${currentCategory.name}-${subcategory.name}`}
            style={localStyles.sectionContainer}>
            <SectionHeader
              title={subcategory.displayName}
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
                  <DiscoveryItem
                    item={item}
                    colors={colors}
                    addSavedItemLoading={addSavedItemLoading}
                    onAddToSavedItems={onAddToSavedItems}
                  />
                </View>
              )}
              keyExtractor={(item: any) =>
                `activity-${currentCategory.name}-${subcategory.name}-${item.productCode}`
              }
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={localStyles.horizontalListContent}
            />
          </View>
        );
      })}

      <View style={localStyles.moreSection}>
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
  sectionContainer: {
    marginBottom: 32,
  },
  horizontalListContent: {
    paddingRight: 16,
  },
  moreSection: {
    marginTop: 16,
    marginBottom: 32,
  },
});
