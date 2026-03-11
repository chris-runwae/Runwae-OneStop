import React, { useMemo } from 'react';
import { StyleSheet, View, Pressable, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import { Image } from 'expo-image';
import { format, parseISO } from 'date-fns';
import { FlashList } from '@shopify/flash-list';

import { ScreenContainer, Spacer, Text } from '@/components';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';
import { exploreDummyData } from '@/stores/exploreStore';
import type { FeaturedEvent } from '@/types/explore';
import { EventCard } from '@/components/explore/EventCard';

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
        if (
          startDate.getFullYear() === endDate.getFullYear() &&
          startDate.getMonth() === endDate.getMonth()
        ) {
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
  });

  const renderItem = ({ item }: { item: FeaturedEvent }) => (
    <EventCard item={item} />
  );

  return (
    <ScreenContainer header={{ title: 'Featured Events' }}>
      <FlashList
        data={events}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
        ItemSeparatorComponent={() => <Spacer size={8} vertical />}
        ListFooterComponent={() => <Spacer size={120} vertical />}
      />
    </ScreenContainer>
  );
}
