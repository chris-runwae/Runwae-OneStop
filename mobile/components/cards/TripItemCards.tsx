import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Pressable,
  useColorScheme,
} from 'react-native';
import React from 'react';
import { ImageBackground } from 'expo-image';
import { router } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';

import { textStyles } from '@/utils/styles';
import { Colors } from '@/constants';
import { Spacer } from '@/components';
import { SavedItem } from '@/types';

type TripItemCardsProps = {
  item: any;
  onPress?: (item: SavedItem) => void;
  loading?: boolean;
};

const TripItemCards = ({ item, onPress, loading }: TripItemCardsProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const dynamicStyles = StyleSheet.create({
    discoveryItem: {
      backgroundColor: colors.background,
      overflow: 'hidden',
      marginBottom: 32,
    },
    discoveryImage: {
      height: 200,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      overflow: 'hidden',
      marginBottom: 8,
    },
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
  });

  let coverImage =
    item?.cover_image ||
    'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80';
  let title = item?.title || 'No title';
  let description = item?.description || 'No description';
  let sourceType = item?.source_type || 'hotel';
  let location: string | undefined = item?.location || undefined;

  return (
    <Pressable
      style={dynamicStyles.discoveryItem}
      onPress={() => router.push(`/trips/discovery/${item.id}`)}>
      <ImageBackground
        source={{ uri: coverImage }}
        style={dynamicStyles.discoveryImage}
      />

      <Text style={dynamicStyles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={dynamicStyles.description} numberOfLines={3}>
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
            onPress?.({
              source_type: sourceType,
              source_id: item.id,
              title: title,
              description: description,
              location: location,
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
          {loading ? (
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

export default TripItemCards;
