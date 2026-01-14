import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, Calendar, Heart } from 'lucide-react-native';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';

import { ScreenWithImage, SectionHeader, Spacer, Text } from '@/components';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';
import { exploreDummyData } from '@/stores/exploreStore';
import type { Experience, Destination } from '@/types/explore';

export default function ItineraryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [selectedDay, setSelectedDay] = useState(1);

  // For now, we'll create a mock itinerary from an experience
  // In a real app, you'd have a separate itineraries table
  const experience = useMemo(() => {
    return exploreDummyData.experiences.find((exp) => exp.id === id);
  }, [id]);

  const itineraryItems = useMemo(() => {
    if (!experience) return [];
    return exploreDummyData.itineraries
      .filter((it) => it.experienceId === experience.id)
      .sort((a, b) => a.order - b.order);
  }, [experience]);

  // Mock data for itinerary - split into days
  const days = useMemo(() => {
    if (!itineraryItems.length) return [];
    // Split items into 2 days for demo
    const midPoint = Math.ceil(itineraryItems.length / 2);
    return [
      {
        day: 1,
        items: itineraryItems.slice(0, midPoint),
      },
      {
        day: 2,
        items: itineraryItems.slice(midPoint),
      },
    ];
  }, [itineraryItems]);

  const currentDayItems = useMemo(() => {
    return days.find((d) => d.day === selectedDay)?.items || [];
  }, [days, selectedDay]);

  const relatedItineraries = useMemo(() => {
    if (!experience) return [];
    return exploreDummyData.experiences
      .filter((exp) => exp.id !== experience.id && exp.isFeatured)
      .slice(0, 3);
  }, [experience]);

  if (!experience) {
    return (
      <View style={styles.container}>
        <Text>Itinerary not found</Text>
      </View>
    );
  }

  const destination = exploreDummyData.destinations.find(
    (dest) => dest.id === experience.destinationId
  );

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
      fontSize: 28,
      lineHeight: 36,
      color: colors.textColors.default,
      marginBottom: 16,
    },
    metadataRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 20,
      flexWrap: 'wrap',
    },
    metadataPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: colors.borderColors.subtle,
      borderRadius: 20,
    },
    metadataText: {
      ...textStyles.subtitle_Regular,
      fontSize: 13,
      color: colors.textColors.default,
    },
    description: {
      ...textStyles.subtitle_Regular,
      fontSize: 15,
      lineHeight: 22,
      color: colors.textColors.subtle,
      marginBottom: 32,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      ...textStyles.bold_20,
      fontSize: 20,
      color: colors.textColors.default,
      marginBottom: 16,
    },
    dayTabs: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    dayTab: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      borderWidth: 1,
    },
    dayTabActive: {
      backgroundColor: colors.primaryColors.default,
      borderColor: colors.primaryColors.default,
    },
    dayTabInactive: {
      backgroundColor: 'transparent',
      borderColor: colors.borderColors.subtle,
    },
    dayTabText: {
      ...textStyles.bold_20,
      fontSize: 15,
    },
    activityItem: {
      marginBottom: 24,
    },
    activityTitle: {
      ...textStyles.bold_20,
      fontSize: 18,
      color: colors.textColors.default,
      marginBottom: 8,
    },
    activityDescription: {
      ...textStyles.subtitle_Regular,
      fontSize: 15,
      lineHeight: 22,
      color: colors.textColors.subtle,
    },
    itineraryCard: {
      width: 280,
      marginRight: 16,
      borderRadius: 16,
      overflow: 'hidden',
    },
    itineraryImage: {
      width: '100%',
      height: 180,
    },
    itineraryContent: {
      padding: 12,
      backgroundColor: colors.backgroundColors.subtle,
    },
    itineraryTitle: {
      ...textStyles.bold_20,
      fontSize: 16,
      color: colors.textColors.default,
      marginBottom: 8,
    },
    itineraryMeta: {
      flexDirection: 'row',
      gap: 12,
    },
    itineraryMetaText: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.subtle,
    },
    imageOverlay: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: 20,
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  const renderItineraryCard = ({ item }: { item: Experience }) => {
    const itemItinerary = exploreDummyData.itineraries.filter(
      (it) => it.experienceId === item.id
    );
    const destination = exploreDummyData.destinations.find(
      (dest) => dest.id === item.destinationId
    );

    return (
      <Pressable
        style={styles.itineraryCard}
        onPress={() => {
          router.push(`/(tabs)/explore/itineraries/${item.id}`);
        }}>
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: item.heroImage }}
            style={styles.itineraryImage}
            contentFit="cover"
          />
          <View style={styles.imageOverlay}>
            <Heart size={18} color={colors.white} />
          </View>
        </View>
        <View style={styles.itineraryContent}>
          <Text style={styles.itineraryTitle}>{item.title}</Text>
          <View style={styles.itineraryMeta}>
            <Text style={styles.itineraryMetaText}>
              {itemItinerary.length} activities
            </Text>
            <Text style={styles.itineraryMetaText}>•</Text>
            <Text style={styles.itineraryMetaText}>
              {Math.ceil(item.durationMinutes / (60 * 24))} day
              {Math.ceil(item.durationMinutes / (60 * 24)) !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenWithImage
      image={experience.heroImage}
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
        <Text style={styles.title}>DITL: New York Edition!</Text>

        <View style={styles.metadataRow}>
          <View style={styles.metadataPill}>
            <MapPin size={14} color={colors.textColors.default} />
            <Text style={styles.metadataText}>
              {itineraryItems.length} activities
            </Text>
          </View>
          <View style={styles.metadataPill}>
            <Calendar size={14} color={colors.textColors.default} />
            <Text style={styles.metadataText}>{days.length} days</Text>
          </View>
        </View>

        <Text style={styles.description}>
          Explore New York's iconic landmarks and hidden gems. From Central Park
          picnics to museum hopping, discover the city's vibrant culture. Get
          ready for a laid-back adventure!
        </Text>

        {/* Daily Itinerary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Itinerary</Text>
          <View style={styles.dayTabs}>
            {days.map((day) => (
              <Pressable
                key={day.day}
                style={[
                  styles.dayTab,
                  selectedDay === day.day
                    ? styles.dayTabActive
                    : styles.dayTabInactive,
                ]}
                onPress={() => setSelectedDay(day.day)}>
                <Text
                  style={[
                    styles.dayTabText,
                    {
                      color:
                        selectedDay === day.day
                          ? colors.white
                          : colors.textColors.default,
                    },
                  ]}>
                  Day {day.day}
                </Text>
              </Pressable>
            ))}
          </View>

          {currentDayItems.map((item) => (
            <View key={item.order} style={styles.activityItem}>
              <Text style={styles.activityTitle}>{item.title}</Text>
              <Text style={styles.activityDescription}>{item.description}</Text>
            </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
