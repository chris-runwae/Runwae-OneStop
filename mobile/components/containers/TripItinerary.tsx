import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  SectionList,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import dayjs from 'dayjs';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { TripItineraryItem } from '@/types/trips.types';
import useTrips from '@/hooks/useTrips';
import { textStyles } from '@/utils/styles';
import { Colors } from '@/constants/theme';

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

  return (
    <View style={{ flex: 1 }}>
      {/* Date buttons */}
      <View
        style={{
          flexDirection: 'row',
          padding: 8,
          gap: 8,
        }}>
        {dates.map((date, index) => (
          <RenderDateButton date={date} key={index} />
        ))}
      </View>

      <SectionList
        sections={itinerary}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 8 }}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {item.cover_image && (
              <Image
                source={{ uri: item.cover_image }}
                style={styles.coverImage}
              />
            )}
            <Text style={{ fontSize: 16, fontWeight: '600' }}>
              {item.title}
            </Text>
            {item.time && <Text>{item.time}</Text>}
            {item.location && <Text>{item.location}</Text>}
            {item.description && <Text>{item.description}</Text>}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 8,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  coverImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 4,
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
});
