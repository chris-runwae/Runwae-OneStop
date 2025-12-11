import React, { useCallback, useState, useEffect, useMemo } from 'react';
import {
  View,
  SectionList,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import dayjs from 'dayjs';
import { ImageBackground } from 'expo-image';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Trip, TripItineraryItem } from '@/types/trips.types';
import useTrips from '@/hooks/useTrips';
import { textStyles } from '@/utils/styles';
import { Colors, addOpacity } from '@/constants/theme';
import { PrimaryButton, Spacer, Text } from '..';
import { RelativePathString, useRouter } from 'expo-router';

interface TripItineraryProps {
  tripId: string;
  trip: Trip;
}

export const TripItinerary = ({ tripId, trip }: TripItineraryProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { getTripItinerary } = useTrips();
  const [itinerary, setItinerary] = useState<ItinerarySection[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchItinerary();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const scrollToDate = (date: string) => {
    // Toggle: if same date is clicked, deselect (show all)
    setSelectedDate(selectedDate === date ? null : date);
  };

  const dynamicStyles = StyleSheet.create({
    dateNumberContainer: {
      height: 40,
      width: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateNumberContainerActive: {
      backgroundColor: addOpacity(colors.primaryColors.default, 0.3),
    },
    dateButtonTextActive: {
      color: colors.primaryColors.default,
    },

    viewMore: {
      ...textStyles.regular_12,
      color: colors.primaryColors.default,
      textDecorationLine: 'underline',
    },

    itemTime: {
      ...textStyles.regular_12,
      color: colors.textColors.subtle,
    },
  });

  // Generate all dates between start and end
  const generateDateRange = (startDate: string, endDate: string): string[] => {
    const dates: string[] = [];
    let current = dayjs(startDate);
    const end = dayjs(endDate);

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      dates.push(current.format('YYYY-MM-DD'));
      current = current.add(1, 'day');
    }

    return dates;
  };

  // Get day number for a date
  const getDayNumber = (date: string, startDate: string): number => {
    return dayjs(date).diff(dayjs(startDate), 'day') + 1;
  };

  // In your component
  const allDates = useMemo(() => {
    if (!trip?.start_date || !trip?.end_date) return [];
    return ['Undated', ...generateDateRange(trip.start_date, trip.end_date)];
  }, [trip?.start_date, trip?.end_date]);

  const fetchItinerary = useCallback(async () => {
    const data = await getTripItinerary(tripId);
    if (data) {
      const sections = organizeItineraryByDate(
        data,
        trip?.start_date as string,
        trip?.end_date as string
      );
      setItinerary(sections);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, getTripItinerary, trip?.start_date, trip?.end_date]);

  const organizeItineraryByDate = (
    items: TripItineraryItem[],
    startDate?: string,
    endDate?: string
  ): ItinerarySection[] => {
    if (!startDate || !endDate) return [];

    // Separate dated and undated items
    const undated: TripItineraryItem[] = [];
    const itemsByDate: Record<string, TripItineraryItem[]> = {};

    items.forEach((item) => {
      if (item.date) {
        if (!itemsByDate[item.date]) itemsByDate[item.date] = [];
        itemsByDate[item.date].push(item);
      } else {
        undated.push(item);
      }
    });

    // Create sections for all dates in range
    const dateRange = generateDateRange(startDate, endDate);
    const sections: ItinerarySection[] = dateRange.map((date) => ({
      title: date,
      dayNumber: getDayNumber(date, startDate),
      data: itemsByDate[date] || [], // Empty array if no items for this date
    }));

    // Add undated section at the top
    sections.unshift({
      title: 'Undated',
      dayNumber: null,
      data: undated,
    });

    return sections;
  };

  // Update your type
  type ItinerarySection = {
    title: string;
    dayNumber: number | null;
    data: TripItineraryItem[];
  };

  // Filter based on selected date
  const filteredItinerary = useMemo(() => {
    if (selectedDate === null) return itinerary;
    return itinerary.filter((section) => section.title === selectedDate);
  }, [itinerary, selectedDate]);

  // Updated RenderDateButton component
  const RenderDateButton = ({ date }: { date: string }) => {
    const isActive = selectedDate === date;
    const isUndated = date === 'Undated';

    return (
      <Pressable onPress={() => scrollToDate(date)} style={styles.dateButton}>
        {isUndated ? (
          <View
            style={[
              dynamicStyles.dateNumberContainer,
              isActive && dynamicStyles.dateNumberContainerActive,
            ]}>
            <Text
              style={[
                styles.dateButtonText,
                { fontWeight: '600' },
                isActive && dynamicStyles.dateButtonTextActive,
              ]}>
              TBD
            </Text>
          </View>
        ) : (
          <>
            <Text
              style={[
                styles.dateButtonText,
                { fontWeight: '300' },
                isActive && dynamicStyles.dateButtonTextActive,
              ]}>
              {dayjs(date).format('ddd').toUpperCase()}
            </Text>
            <View
              style={[
                dynamicStyles.dateNumberContainer,
                isActive && dynamicStyles.dateNumberContainerActive,
              ]}>
              <Text
                style={[
                  styles.dateButtonText,
                  { fontWeight: '600' },
                  isActive && dynamicStyles.dateButtonTextActive,
                ]}>
                {dayjs(date).format('DD')}
              </Text>
            </View>
          </>
        )}
      </Pressable>
    );
  };

  const ItineraryItem = ({ item }: { item: TripItineraryItem }) => {
    const coverImage = item.cover_image
      ? { uri: item.cover_image }
      : 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80';
    const time = item.time
      ? dayjs(`${item.date} ${item.time}`).format('H:mm A')
      : 'NAN';

    return (
      <Pressable
        style={styles.item}
        onPress={() => console.log('Item pressed: ', item)}>
        <Text style={dynamicStyles.itemTime}>{time}</Text>
        <View style={styles.contentContainer}>
          <ImageBackground
            contentFit="cover"
            source={coverImage}
            style={styles.coverImage}></ImageBackground>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemDescription}>{item.location}</Text>
          <Spacer size={16} vertical />
          <Text style={dynamicStyles.viewMore}>View more</Text>
        </View>
      </Pressable>
    );
  };

  const EmptyItinerary = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No itinerary items found</Text>

        <Spacer size={16} vertical />

        <PrimaryButton
          title="Add Item"
          // onPress={() => router.push('/(tabs)/trips/itinerary/create')}
          onPress={() =>
            router.push('/(tabs)/trips/itinerary/modal' as RelativePathString)
          }
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Date buttons - always show all dates */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}>
        {allDates.map((date, index) => (
          <RenderDateButton date={date} key={index} />
        ))}
      </ScrollView>

      <Spacer size={24} vertical />

      <SectionList
        sections={filteredItinerary}
        keyExtractor={(item) => item.id}
        // horizontal
        // showsHorizontalScrollIndicator={false}
        renderSectionHeader={({ section }) => {
          // Don't show header if filtering to single date
          if (selectedDate !== null) {
            return section.dayNumber ? (
              <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeader}>
                  Day {section.dayNumber}
                </Text>
              </View>
            ) : (
              <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeader}>Undated Items</Text>
              </View>
            );
          }

          // Show full date when viewing all
          return section.title === 'Undated' ? (
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>Undated Items</Text>
            </View>
          ) : (
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>
                Day {section.dayNumber} •{' '}
                {dayjs(section.title).format('MMMM DD, YYYY')}
              </Text>
            </View>
          );
        }}
        renderItem={({ item }) => <ItineraryItem item={item} />}
        ListEmptyComponent={<EmptyItinerary />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 48,
  },
  contentContainer: {
    flex: 1,
  },
  coverImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginBottom: 4,
    overflow: 'hidden',
  },
  dateButton: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    width: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative', // Add this
  },
  dateButtonText: {
    ...textStyles.regular_12,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 14,
  },
  itemTitle: {
    ...textStyles.bold_20,
    fontSize: 16,
  },
  itemDescription: {
    ...textStyles.regular_14,
  },

  sectionHeaderContainer: {
    paddingBottom: 8,
  },
  sectionHeader: {
    ...textStyles.bold_20,
    fontSize: 16,
  },
});
