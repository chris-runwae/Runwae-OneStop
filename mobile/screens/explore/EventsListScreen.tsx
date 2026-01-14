import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Calendar, Clock } from 'lucide-react-native';
import { Image } from 'expo-image';
import { format, parseISO } from 'date-fns';
import { FlashList } from '@shopify/flash-list';

import { ScreenContainer, Spacer, Text } from '@/components';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';
import { exploreDummyData } from '@/stores/exploreStore';
import type { FeaturedEvent } from '@/types/explore';

export default function EventsListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const events = useMemo(() => {
    return exploreDummyData.featuredEvents;
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDateRange = (start: string, end?: string) => {
    if (end) {
      try {
        const startDate = parseISO(start);
        const endDate = parseISO(end);
        if (startDate.getFullYear() === endDate.getFullYear() &&
            startDate.getMonth() === endDate.getMonth()) {
          return `${format(startDate, 'MMM d')} - ${format(endDate, 'd, yyyy')}`;
        }
        return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
      } catch {
        return `${start} - ${end}`;
      }
    }
    return formatDate(start);
  };

  const getCategoryColor = (category: string) => {
    const upperCategory = category.toUpperCase();
    if (upperCategory.includes('MUSIC') || upperCategory.includes('FEST')) {
      return '#10B981';
    }
    if (upperCategory.includes('CULTURAL')) {
      return '#A855F7';
    }
    if (upperCategory.includes('FOOD')) {
      return '#3B82F6';
    }
    return colors.primaryColors.default;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColors.default,
    },
    contentContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 32,
    },
    card: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundColors.subtle,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
    },
    image: {
      width: 140,
      height: 140,
    },
    content: {
      flex: 1,
      padding: 16,
      justifyContent: 'space-between',
    },
    title: {
      ...textStyles.bold_20,
      fontSize: 18,
      color: colors.textColors.default,
      marginBottom: 8,
    },
    location: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    locationText: {
      ...textStyles.subtitle_Regular,
      fontSize: 13,
      color: colors.textColors.subtle,
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    dateText: {
      ...textStyles.subtitle_Regular,
      fontSize: 13,
      color: colors.textColors.subtle,
    },
    categoryBadge: {
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginTop: 4,
    },
    categoryText: {
      ...textStyles.subtitle_Regular,
      fontSize: 11,
      color: colors.white,
      fontWeight: '600',
    },
  });

  const renderItem = ({ item }: { item: FeaturedEvent }) => (
    <Pressable
      style={styles.card}
      onPress={() => {
        router.push(`/(tabs)/explore/events/${item.id}`);
      }}>
      <Image source={{ uri: item.heroImage }} style={styles.image} contentFit="cover" />
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.location}>
            <MapPin size={14} color={colors.textColors.subtle} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
          <View style={styles.dateRow}>
            <Calendar size={14} color={colors.textColors.subtle} />
            <Text style={styles.dateText}>
              {formatDateRange(item.startDate, item.endDate)}
            </Text>
            {item.time && (
              <>
                <Text style={styles.dateText}>•</Text>
                <Clock size={14} color={colors.textColors.subtle} />
                <Text style={styles.dateText}>{item.time}</Text>
              </>
            )}
          </View>
          {item.category && (
            <View
              style={[
                styles.categoryBadge,
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

  return (
    <ScreenContainer header={{ title: 'Featured Events' }}>
      <FlashList
        data={events}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
        estimatedItemSize={140}
        ItemSeparatorComponent={() => <Spacer size={16} vertical />}
      />
    </ScreenContainer>
  );
}
