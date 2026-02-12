import React, { useState } from 'react';
import { View, ScrollView, Pressable, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, Calendar } from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';

import { ScreenWithImage, SectionHeader, Spacer, Text } from '@/components';
import { Colors } from '@/constants';
import { MetadataPill } from '@/components/explore/MetadataPill';
import { DayTab } from '@/components/explore/DayTab';
import { ActivityItem } from '@/components/explore/ActivityItem';
import { ItineraryCard } from '@/components/explore/ItineraryCard';
import { useItineraryData, useCurrentDayItems } from '@/hooks/useItineraryData';
import { ITINERARY_CONSTANTS } from '@/constants/itinerary';
import { createItineraryDetailStyles } from './ItineraryDetailScreen.styles';
import type { Experience } from '@/types/explore';

export default function ItineraryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [selectedDay, setSelectedDay] = useState(1);

  const {
    experience,
    itineraryItems,
    days,
    destination,
    relatedItineraries,
    getItineraryItemsForExperience,
  } = useItineraryData(id);

  const currentDayItems = useCurrentDayItems(days, selectedDay);
  const styles = createItineraryDetailStyles(colors);

  if (!experience) {
    return (
      <View style={styles.container}>
        <Text>Itinerary not found</Text>
      </View>
    );
  }

  const renderItineraryCard = ({ item }: { item: Experience }) => {
    const itemItinerary = getItineraryItemsForExperience(item.id);

    // Transform Experience to match ItineraryCard interface
    const transformedItem = {
      id: item.id,
      title: item.title,
      image_url: item.heroImage,
      activity_count: itemItinerary.length,
      duration_days: Math.ceil(item.durationMinutes / (24 * 60)) || 1,
    };

    return <ItineraryCard item={transformedItem} />;
  };

  return (
    <ScreenWithImage
      image={experience.heroImage}
      header={{
        leftComponent: (
          <Pressable onPress={() => router.back()}>
            <View style={styles.backButtonContainer}>
              <Text style={styles.backButtonText}>←</Text>
            </View>
          </Pressable>
        ),
      }}>
      <View style={styles.content}>
        <Text style={styles.title}>{experience.title}</Text>

        <View style={styles.metadataRow}>
          <MetadataPill
            icon={<MapPin size={14} color={colors.textColors.default} />}
            text={`${itineraryItems.length} activities`}
            colors={colors}
          />
          <MetadataPill
            icon={<Calendar size={14} color={colors.textColors.default} />}
            text={`${days.length} days`}
            colors={colors}
          />
        </View>

        <Text style={styles.description}>{experience.description}</Text>

        {/* Daily Itinerary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Itinerary</Text>
          <View style={styles.dayTabs}>
            {days.map((day) => (
              <DayTab
                key={day.day}
                day={day.day}
                isActive={selectedDay === day.day}
                onPress={() => setSelectedDay(day.day)}
                colors={colors}
              />
            ))}
          </View>

          {currentDayItems.map((item) => (
            <ActivityItem key={item.order} item={item} colors={colors} />
          ))}
        </View>

        {/* More trips */}
        {relatedItineraries.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={`More trips from ${destination?.name || 'New York'}`}
              linkText="More →"
              linkTo={'/(tabs)/explore/itineraries' as any}
            />
            <Spacer size={16} vertical />
            <FlashList
              data={relatedItineraries}
              renderItem={renderItineraryCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}
        <Spacer size={120} vertical />
      </View>
    </ScreenWithImage>
  );
}
