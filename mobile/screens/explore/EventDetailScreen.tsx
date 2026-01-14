import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, Calendar, Clock } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';

import { ScreenWithImage, Spacer, Text } from '@/components';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';
import { exploreDummyData } from '@/stores/exploreStore';
import type { FeaturedEvent } from '@/types/explore';

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const event = useMemo(() => {
    return exploreDummyData.featuredEvents.find((evt) => evt.id === id);
  }, [id]);

  if (!event) {
    return (
      <View style={styles.container}>
        <Text>Event not found</Text>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMMM d, yyyy');
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
          return `${format(startDate, 'MMMM d')} - ${format(endDate, 'd, yyyy')}`;
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
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      paddingBottom: 32,
    },
    title: {
      ...textStyles.bold_20,
      fontSize: 24,
      lineHeight: 32,
      color: colors.textColors.default,
      marginBottom: 12,
    },
    metadataRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 16,
      flexWrap: 'wrap',
    },
    metadataItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    metadataText: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      color: colors.textColors.default,
    },
    categoryBadge: {
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    categoryText: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.white,
      fontWeight: '600',
    },
  });

  return (
    <ScreenWithImage
      image={event.heroImage}
      header={{
        leftComponent: (
          <Pressable onPress={() => router.back()}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(0,0,0,0.3)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ color: colors.white }}>←</Text>
            </View>
          </Pressable>
        ),
      }}>
      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>

        <View style={styles.metadataRow}>
          <View style={styles.metadataItem}>
            <MapPin size={16} color={colors.textColors.default} />
            <Text style={styles.metadataText}>{event.location}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Calendar size={16} color={colors.textColors.default} />
            <Text style={styles.metadataText}>
              {formatDateRange(event.startDate, event.endDate)}
            </Text>
          </View>
          {event.time && (
            <View style={styles.metadataItem}>
              <Clock size={16} color={colors.textColors.default} />
              <Text style={styles.metadataText}>{event.time}</Text>
            </View>
          )}
        </View>

        {event.category && (
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(event.category) },
            ]}>
            <Text style={styles.categoryText}>
              {event.category.toUpperCase()}
            </Text>
          </View>
        )}
        <Spacer size={120} vertical />
      </View>
    </ScreenWithImage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
