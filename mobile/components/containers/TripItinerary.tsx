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
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { getSupabaseClient } from '@/lib/supabase';
import { useUser, useAuth } from '@clerk/clerk-expo';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Trip, TripItineraryItem } from '@/types/trips.types';
import useTrips from '@/hooks/useTrips';
import { textStyles } from '@/utils/styles';
import { Colors, addOpacity } from '@/constants/theme';
import { PrimaryButton, Spacer, Text } from '..';
import { RelativePathString, useRouter } from 'expo-router';
import { PlusIcon, GripVertical } from 'lucide-react-native';

interface TripItineraryProps {
  tripId: string;
  trip: Trip;
}

export const TripItinerary = ({ tripId, trip }: TripItineraryProps) => {
  const { getToken } = useAuth();
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

    addPlaceButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    viewMore: {
      ...textStyles.subtitle_Regular,
      color: colors.primaryColors.default,
      textDecorationLine: 'underline',
    },
    addPlaceText: {
      ...textStyles.subtitle_Regular,
      color: colors.primaryColors.default,
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
      setSelectedDate(sections[0].title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, getTripItinerary, trip?.start_date, trip?.end_date]);

  const organizeItineraryByDate = (
    items: TripItineraryItem[],
    startDate?: string,
    endDate?: string
  ): ItinerarySection[] => {
    if (!startDate || !endDate) return [];

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

    // Sort items within each date by order_index
    Object.keys(itemsByDate).forEach((date) => {
      itemsByDate[date].sort(
        (a, b) => (a.order_index || 0) - (b.order_index || 0)
      );
    });
    undated.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    const dateRange = generateDateRange(startDate, endDate);
    const sections: ItinerarySection[] = dateRange.map((date) => ({
      title: date,
      dayNumber: getDayNumber(date, startDate),
      data: itemsByDate[date] || [],
    }));

    sections.unshift({
      title: 'TBD',
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

  const handleReorder = async (
    sectionDate: string,
    reorderedData: TripItineraryItem[]
  ) => {
    // Update local state immediately
    setItinerary((prev) =>
      prev.map((section) =>
        section.title === sectionDate
          ? { ...section, data: reorderedData }
          : section
      )
    );

    // Update order_index in Supabase
    try {
      const updates = reorderedData.map((item, index) => ({
        id: item.id,
        order_index: index,
      }));

      await updateItemsOrder(updates);
    } catch (error) {
      console.error('Failed to update order:', error);
      // Optionally revert local state on error
    }
  };

  const updateItemsOrder = async (
    updates: { id: string; order_index: number }[]
  ) => {
    const supabase = await getSupabaseClient(getToken);

    // Batch update using RPC function (more efficient)
    const { error } = await supabase.rpc('update_itinerary_order', {
      updates: updates,
    });

    if (error) throw error;
  };

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
            <Text style={[styles.dateButtonText, { fontWeight: '300' }]}>
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
        <GripVertical size={16} color={colors.textColors.subtle} />
        <View style={styles.contentContainer}>
          <ImageBackground
            contentFit="cover"
            source={coverImage}
            style={styles.coverImage}></ImageBackground>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemDescription}>{item.location}</Text>
          <Spacer size={16} vertical />
          <Text style={dynamicStyles.viewMore}>View more</Text>
          <Text style={dynamicStyles.itemTime}>{time}</Text>
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

  // Draggable item component
  const DraggableItineraryItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<TripItineraryItem>) => {
    const coverImage = item.cover_image
      ? { uri: item.cover_image }
      : 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80';

    const time = item.time
      ? dayjs(`${item.date} ${item.time}`).format('h:mm A')
      : 'TBD';

    return (
      <ScaleDecorator>
        <Pressable
          style={[styles.item, isActive && styles.itemActive]}
          onLongPress={drag}
          disabled={isActive}
          onPress={() => console.log('Item pressed: ', item)}>
          <GripVertical size={16} color={colors.textColors.subtle} />
          <View style={styles.contentContainer}>
            <ImageBackground
              contentFit="cover"
              source={coverImage}
              style={styles.coverImage}
            />
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDescription}>{item.location}</Text>
            <Spacer size={16} vertical />
            <Text style={dynamicStyles.viewMore}>View more</Text>
            <Text style={dynamicStyles.itemTime}>{time}</Text>
          </View>
        </Pressable>
      </ScaleDecorator>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Date buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}>
        {allDates.map((date, index) => (
          <RenderDateButton date={date} key={index} />
        ))}
      </ScrollView>

      <Spacer size={24} vertical />

      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredItinerary.map((section) => (
          <View key={section.title}>
            {/* Section Header */}
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>
                {section.dayNumber ? `Day ${section.dayNumber}` : 'TBD Items'}
              </Text>
            </View>

            {/* Draggable Items */}
            {section.data.length === 0 ? (
              <EmptyItinerary />
            ) : (
              <DraggableFlatList
                data={section.data}
                onDragEnd={({ data }) => handleReorder(section.title, data)}
                keyExtractor={(item) => item.id}
                renderItem={(params) => <DraggableItineraryItem {...params} />}
                scrollEnabled={true} // Disable since parent ScrollView handles it
                activationDistance={10}
                containerStyle={{ flex: 0 }}
              />
            )}
          </View>
        ))}
      </ScrollView>
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
  itemActive: {
    opacity: 0.8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
    ...textStyles.subtitle_Regular,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    ...textStyles.bold_20,
    fontSize: 16,
  },
});
