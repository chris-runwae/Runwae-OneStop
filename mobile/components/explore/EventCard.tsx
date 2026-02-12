import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Text } from '@/components';
import { textStyles } from '@/utils/styles';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants';
import { useDateFormatting, useCategoryColors } from '@/hooks/useExploreUtils';
import type { FeaturedEvent } from '@/types/explore';
import { MapPin } from 'lucide-react-native';

interface EventCardProps {
  item: FeaturedEvent;
}

export const EventCard: React.FC<EventCardProps> = ({ item }) => {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { formatDateRange } = useDateFormatting();
  const getCategoryColor = useCategoryColors();

  const styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundColors.subtle,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
    },
    image: {
      width: 120,
      height: '100%',
    },
    content: {
      flex: 1,
      padding: 12,
      justifyContent: 'space-between',
    },
    title: {
      ...textStyles.bold_20,
      fontSize: 16,
      marginBottom: 2,
      color: colors.textColors.default,
    },
    location: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.subtle,
    },
    date: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.subtle,
    },
    tag: {
      alignSelf: 'flex-start',
      paddingVertical: 1,
      paddingHorizontal: 3,
      borderRadius: 4,
    },
    categoryText: {
      ...textStyles.subtitle_Regular,
      fontSize: 10,
      fontWeight: 700,
      color: colors.textColors.default,
    },
  });

  return (
    <Pressable
      style={styles.card}
      className="relative"
      onPress={() => router.push(`/(tabs)/explore/events/${item.id}`)}>
      <Image
        source={{ uri: item.heroImage }}
        style={styles.image}
        contentFit="cover"
      />
      <View style={styles.content}>
        <View>
          <Text
            className="max-w-[150px] overflow-hidden"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.title}>
            {item.title}
          </Text>
          <View className="mb-[15px] flex flex-row items-center gap-1">
            <MapPin
              size={15}
              color={colors.textColors.subtle}
              strokeWidth={1.5}
            />
            <Text style={styles.location}>{item.location}</Text>
          </View>
          <Text style={styles.date}>
            {formatDateRange(item.startDate, item.endDate)}
            {item.time ? ` | ${item.time}` : ''}
          </Text>
          {item.category && (
            <View
              className="absolute right-0 top-0"
              style={[
                styles.tag,
                { backgroundColor: getCategoryColor(item.category) },
              ]}>
              <Text style={styles.categoryText}>
                {item.category.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};
