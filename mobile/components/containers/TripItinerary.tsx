import React, { useCallback, useState, useEffect } from 'react';
import { View, SectionList, Pressable, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { ImageBackground } from 'expo-image';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { TripItineraryItem } from '@/types/trips.types';
import useTrips from '@/hooks/useTrips';
import { textStyles } from '@/utils/styles';
import { Colors } from '@/constants/theme';
import { Spacer, Text } from '..';

type ItinerarySection = {
  title: string; // date
  data: TripItineraryItem[];
};

export const TripItinerary = ({ tripId }: { tripId: string }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { getTripItinerary } = useTrips();
  const [itinerary, setItinerary] = useState<ItinerarySection[]>([]);
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    fetchItinerary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const fetchItinerary = useCallback(async () => {
    const data = await getTripItinerary(tripId);
    if (data) {
      // group by date
      const grouped: Record<string, TripItineraryItem[]> = {};
      data.forEach((item) => {
        if (!grouped[item.date]) grouped[item.date] = [];
        grouped[item.date].push(item);
      });
      const sections: ItinerarySection[] = Object.keys(grouped)
        .sort()
        .map((date) => ({ title: date, data: grouped[date] }));
      setItinerary(sections);
      setDates(Object.keys(grouped).sort());
    }
  }, [tripId, getTripItinerary]);

  const scrollToDate = (date: string) => {
    // implement using SectionList ref if needed
  };

  const dynamicStyles = StyleSheet.create({
    dateButton: {
      backgroundColor: colors.primaryColors.default,
      borderWidth: 1,
      borderColor: colors.primaryColors.border,
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

  const RenderDateButton = ({ date, key }: { date: string; key: number }) => {
    return (
      <Pressable
        key={key}
        onPress={() => scrollToDate(date)}
        style={[styles.dateButton, dynamicStyles.dateButton]}>
        <Text
          style={[
            styles.dateButtonText,
            { color: colors.white, fontWeight: '300' },
          ]}>
          {dayjs(date).format('ddd').toUpperCase()}
        </Text>
        <Text
          style={[
            styles.dateButtonText,
            { color: colors.white, fontWeight: '600' },
          ]}>
          {dayjs(date).format('DD')}
        </Text>
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

  return (
    <View style={{ flex: 1 }}>
      {/* Date buttons */}
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
        }}>
        {dates.map((date, index) => (
          <RenderDateButton date={date} key={index} />
        ))}
      </View>
      <Spacer size={24} vertical />

      <SectionList
        sections={itinerary}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ItineraryItem item={item} />}
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
    height: 70,
    width: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
});
