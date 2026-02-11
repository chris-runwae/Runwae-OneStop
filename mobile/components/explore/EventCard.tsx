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
      marginBottom: 4,
      color: colors.textColors.default,
    },
    location: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.subtle,
      marginBottom: 4,
    },
    date: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.subtle,
    },
    tag: {
      alignSelf: 'flex-start',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 8,
      marginTop: 4,
    },
    categoryText: {
      ...textStyles.subtitle_Regular,
      fontSize: 10,
      color: colors.textColors.default,
    },
  });

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/(tabs)/explore/events/${item.id}`)}>
      <Image
        source={{ uri: item.heroImage }}
        style={styles.image}
        contentFit="cover"
      />
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.location}>{item.location}</Text>
          <Text style={styles.date}>
            {formatDateRange(item.startDate, item.endDate)}
            {item.time ? ` | ${item.time}` : ''}
          </Text>
          {item.category && (
            <View
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
