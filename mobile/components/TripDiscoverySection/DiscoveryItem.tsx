// Save as: @/components/TripDiscoverySection/DiscoveryItem.tsx

import React from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { ImageBackground } from 'expo-image';
import { RelativePathString, router } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import { Text, Spacer } from '@/components';
import { textStyles } from '@/utils/styles';
import { ItinerarySourceType, SavedItem } from '@/types';
import { useActivityStore } from '@/stores/activityStore';

type DiscoveryItemProps = {
  item: any;
  colors: any;
  addSavedItemLoading: boolean;
  onAddToSavedItems: (item: SavedItem) => void;
};

export const DiscoveryItem = ({
  item,
  colors,
  addSavedItemLoading,
  onAddToSavedItems,
}: DiscoveryItemProps) => {
  const { setCurrentActivity } = useActivityStore();

  const { coverImage, title, description, sourceType, location, itemId } =
    parseItemData(item);

  const handlePress = () => {
    if (sourceType === 'activity') {
      setCurrentActivity(item);
      router.push(`/(tabs)/trips/activity` as RelativePathString);
    } else if (sourceType === 'accommodation') {
      router.push(`/(tabs)/trips/hotels/${itemId}` as RelativePathString);
    }
  };

  const handleAddPress = () => {
    onAddToSavedItems({
      source_type: sourceType as unknown as ItinerarySourceType,
      id: itemId,
      title,
      description,
      location,
      cover_image: coverImage,
    });
  };

  const styles = createStyles(colors);

  return (
    <Pressable style={localStyles.container} onPress={handlePress}>
      <ImageBackground source={{ uri: coverImage }} style={localStyles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description} numberOfLines={3}>
        {description}
      </Text>
      <Spacer size={16} vertical />
      <View style={localStyles.footer}>
        <Text style={[styles.viewMore, { alignSelf: 'flex-end' }]}>
          View more
        </Text>
        <Pressable onPress={handleAddPress} style={styles.addButton}>
          {addSavedItemLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <PlusIcon size={20} color={colors.white} />
          )}
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

const parseItemData = (item: any) => {
  const defaultImage =
    'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80';

  if (item?.hotelDescription) {
    return {
      sourceType: 'accommodation',
      coverImage: item?.thumbnail || defaultImage,
      title: item.name || 'Hotel Name',
      description: item.hotelDescription || '',
      location: `${item.city}, ${item.country}`,
      itemId: item.id,
    };
  }

  if (item?.productCode) {
    return {
      sourceType: 'activity',
      coverImage:
        item?.images?.[0]?.variants?.[6]?.url ||
        item?.images?.[0]?.url ||
        defaultImage,
      title: item.title || 'Activity Name',
      description: item.description || '',
      location: undefined,
      itemId: item.productCode,
    };
  }

  return {
    sourceType: 'accommodation',
    coverImage: defaultImage,
    title: 'No title',
    description: 'No description',
    location: undefined,
    itemId: item.id,
  };
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    title: {
      ...textStyles.bold_20,
      fontSize: 16,
    },
    description: {
      ...textStyles.regular_14,
      color: colors.textColors.subtle,
    },
    viewMore: {
      ...textStyles.regular_12,
      fontSize: 14,
      color: colors.primaryColors.default,
      textDecorationLine: 'underline',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.primaryColors.default,
      padding: 8,
      borderRadius: 8,
    },
    addButtonText: {
      ...textStyles.regular_12,
      color: colors.white,
      fontSize: 14,
    },
  });

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 32,
  },
  image: {
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
