import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  useColorScheme,
  FlatList,
} from 'react-native';
import { Search, Filter, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { format, parseISO } from 'date-fns';

import { ScreenContainer, SectionHeader, Spacer, Text } from '@/components';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';
import { exploreDummyData } from '@/stores/exploreStore';
import type { Experience, Destination, FeaturedEvent } from '@/types/explore';

type Category = 'all' | 'romantic-getaway' | 'sports' | 'relax';

export default function ExploreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  const categories = [
    { id: 'all' as Category, label: 'All', emoji: '' },
    {
      id: 'romantic-getaway' as Category,
      label: 'Romantic Getaway',
      emoji: '❤️',
    },
    { id: 'sports' as Category, label: 'Sports', emoji: '🏆' },
    { id: 'relax' as Category, label: 'Relax', emoji: '🧘' },
  ];

  // Get data from store
  const featuredItineraries = useMemo(() => {
    // Use featured experiences as itinerary cards
    return exploreDummyData.experiences
      .filter((exp) => exp.isFeatured)
      .slice(0, 5)
      .map((exp) => ({
        id: exp.id,
        title: exp.title,
        image_url: exp.heroImage,
        activity_count: exploreDummyData.itineraries.filter(
          (it) => it.experienceId === exp.id
        ).length,
        duration_days: Math.ceil(exp.durationMinutes / (60 * 24)),
      }));
  }, []);

  const featuredEvents = useMemo(() => {
    return exploreDummyData.featuredEvents;
  }, []);

  const experienceHighlights = useMemo(() => {
    return exploreDummyData.experiences.filter((exp) => exp.isFeatured);
  }, []);

  const popularDestinations = useMemo(() => {
    return exploreDummyData.destinations.filter((dest) => dest.isFeatured);
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColors.default,
    },
    contentContainer: {
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.borderColors.subtle,
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 48,
      gap: 12,
    },
    searchInput: {
      flex: 1,
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      color: colors.textColors.default,
    },
    filterButton: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.borderColors.subtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    categoriesContainer: {
      marginBottom: 24,
    },
    categoryButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginRight: 8,
      borderWidth: 1,
    },
    categoryButtonActive: {
      backgroundColor: colors.primaryColors.default,
      borderColor: colors.primaryColors.default,
    },
    categoryButtonInactive: {
      backgroundColor: 'transparent',
      borderColor: colors.borderColors.subtle,
    },
    categoryText: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
    },
    sectionContainer: {
      marginBottom: 32,
    },
    itineraryCard: {
      width: 300,
      marginRight: 16,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.backgroundColors.subtle,
    },
    itineraryImage: {
      width: '100%',
      height: 200,
    },
    itineraryContent: {
      padding: 12,
    },
    itineraryTitle: {
      ...textStyles.bold_20,
      fontSize: 16,
      marginBottom: 4,
      color: colors.textColors.default,
    },
    itineraryMeta: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.subtle,
    },
    eventCard: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundColors.subtle,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
    },
    eventImage: {
      width: 120,
      height: 120,
    },
    eventContent: {
      flex: 1,
      padding: 12,
      justifyContent: 'space-between',
    },
    eventTitle: {
      ...textStyles.bold_20,
      fontSize: 16,
      marginBottom: 4,
      color: colors.textColors.default,
    },
    eventLocation: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.subtle,
      marginBottom: 4,
    },
    eventDate: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.subtle,
    },
    eventTag: {
      alignSelf: 'flex-start',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 8,
      marginTop: 4,
    },
    highlightCard: {
      width: 320,
      marginRight: 16,
      backgroundColor: colors.backgroundColors.subtle,
      borderRadius: 16,
      overflow: 'hidden',
    },
    highlightImage: {
      width: '100%',
      height: 200,
    },
    highlightContent: {
      padding: 16,
    },
    highlightLocation: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.subtle,
      marginBottom: 4,
    },
    highlightTitle: {
      ...textStyles.bold_20,
      fontSize: 18,
      marginBottom: 8,
      color: colors.textColors.default,
    },
    highlightDescription: {
      ...textStyles.subtitle_Regular,
      fontSize: 13,
      color: colors.textColors.subtle,
      marginBottom: 12,
      lineHeight: 18,
    },
    highlightPrice: {
      ...textStyles.bold_20,
      fontSize: 16,
      color: colors.textColors.default,
      marginBottom: 12,
    },
    highlightButton: {
      backgroundColor: colors.primaryColors.default,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    highlightButtonText: {
      ...textStyles.bold_20,
      fontSize: 14,
      color: colors.white,
    },
    destinationCard: {
      width: 280,
      marginRight: 16,
      borderRadius: 16,
      overflow: 'hidden',
    },
    destinationImage: {
      width: '100%',
      height: 200,
    },
    destinationContent: {
      padding: 12,
      backgroundColor: colors.backgroundColors.subtle,
    },
    destinationTitle: {
      ...textStyles.bold_20,
      fontSize: 16,
      marginBottom: 4,
      color: colors.textColors.default,
    },
    destinationLocation: {
      ...textStyles.subtitle_Regular,
      fontSize: 13,
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

  const renderItineraryCard = ({ item }: { item: any }) => (
    <Pressable
      style={styles.itineraryCard}
      onPress={() => {
        router.push(`/(tabs)/explore/itineraries/${item.id}`);
      }}>
      <View style={{ position: 'relative' }}>
        <Image
          source={{
            uri: item.image_url || 'https://via.placeholder.com/300x200',
          }}
          style={styles.itineraryImage}
          contentFit="cover"
        />
        <View style={styles.imageOverlay}>
          <Heart size={18} color={colors.white} />
        </View>
      </View>
      <View style={styles.itineraryContent}>
        <Text style={styles.itineraryTitle}>{item.title}</Text>
        <Text style={styles.itineraryMeta}>
          {item.activity_count || 0} activities • {item.duration_days || 0}{' '}
          {item.duration_days === 1 ? 'day' : 'days'}
        </Text>
      </View>
    </Pressable>
  );

  const renderEventCard = ({ item }: { item: FeaturedEvent }) => {
    const formatDate = (dateString: string) => {
      try {
        const date = parseISO(dateString);
        return format(date, 'MMM d');
      } catch {
        return dateString;
      }
    };

    const formatDateRange = (start: string, end?: string) => {
      if (end) {
        try {
          const startDate = parseISO(start);
          const endDate = parseISO(end);
          const startFormatted = format(startDate, 'MMM d');
          const endFormatted = format(endDate, 'MMM d, yyyy');
          return `${startFormatted} - ${endFormatted}`;
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
      return colors.primaryColors.background;
    };

    return (
      <Pressable
        style={styles.eventCard}
        onPress={() => {
          router.push(`/(tabs)/explore/events/${item.id}`);
        }}>
        <Image
          source={{ uri: item.heroImage }}
          style={styles.eventImage}
          contentFit="cover"
        />
        <View style={styles.eventContent}>
          <View>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventLocation}>{item.location}</Text>
            <Text style={styles.eventDate}>
              {formatDateRange(item.startDate, item.endDate)}
              {item.time ? ` | ${item.time}` : ''}
            </Text>
            {item.category && (
              <View
                style={[
                  styles.eventTag,
                  {
                    backgroundColor: getCategoryColor(item.category),
                  },
                ]}>
                <Text
                  style={[
                    styles.categoryText,
                    { fontSize: 10, color: colors.textColors.default },
                  ]}>
                  {item.category.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  const renderHighlightCard = ({ item }: { item: Experience }) => (
    <Pressable
      style={styles.highlightCard}
      onPress={() => {
        router.push(`/(tabs)/explore/experiences/${item.id}`);
      }}>
      <Image
        source={{ uri: item.heroImage }}
        style={styles.highlightImage}
        contentFit="cover"
      />
      <View style={styles.highlightContent}>
        <Text style={styles.highlightLocation}>{item.location}</Text>
        <Text style={styles.highlightTitle}>{item.title}</Text>
        <Text style={styles.highlightDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.highlightPrice}>
          from ${item.priceFrom} {item.currency}
        </Text>
        <Pressable
          style={styles.highlightButton}
          onPress={(e) => {
            e.stopPropagation();
            // Add to trip logic
            console.log('Add to trip:', item.id);
          }}>
          <Text style={styles.highlightButtonText}>Add to trip</Text>
        </Pressable>
      </View>
    </Pressable>
  );

  const renderDestinationCard = ({ item }: { item: Destination }) => (
    <Pressable
      style={styles.destinationCard}
      onPress={() => {
        router.push(`/(tabs)/explore/destinations/${item.id}`);
      }}>
      <Image
        source={{ uri: item.heroImage || item.thumbnailImage }}
        style={styles.destinationImage}
        contentFit="cover"
      />
      <View style={styles.destinationContent}>
        <Text style={styles.destinationTitle}>{item.name}</Text>
        <Text style={styles.destinationLocation}>
          {item.city}, {item.country}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer header={{ title: 'Explore' }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <Spacer size={16} vertical />
        {/* Search Bar */}
        {/* <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={colors.textColors.subtle} />
            <Text
              style={styles.searchInput}
              onPress={() => {
                // Handle search
                console.log('Search pressed');
              }}>
              Search...
            </Text>
          </View>
          <Pressable
            style={styles.filterButton}
            onPress={() => {
              // Handle filter
              console.log('Filter pressed');
            }}>
            <Filter size={20} color={colors.textColors.default} />
          </Pressable>
        </View> */}

        {/* Category Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id
                  ? styles.categoryButtonActive
                  : styles.categoryButtonInactive,
              ]}
              onPress={() => setSelectedCategory(category.id)}>
              <Text
                style={[
                  styles.categoryText,
                  {
                    color:
                      selectedCategory === category.id
                        ? colors.white
                        : colors.textColors.default,
                  },
                ]}>
                {category.emoji} {category.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Featured Itineraries */}
        {featuredItineraries.length > 0 && (
          <View style={styles.sectionContainer}>
            <SectionHeader
              title="Featured Itineraries"
              linkText="More →"
              linkTo={'/(tabs)/explore/itineraries' as any}
            />
            <Spacer size={16} vertical />
            <FlashList
              data={featuredItineraries}
              renderItem={renderItineraryCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <View style={styles.sectionContainer}>
            <SectionHeader
              title="Featured Events"
              linkText="More →"
              linkTo={'/(tabs)/explore/events' as any}
            />
            <Spacer size={16} vertical />
            <FlatList
              data={featuredEvents}
              renderItem={renderEventCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Experience Highlights */}
        {experienceHighlights.length > 0 && (
          <View style={styles.sectionContainer}>
            <SectionHeader
              title="Experience Highlights"
              linkText="More →"
              linkTo={'/(tabs)/explore/experiences' as any}
            />
            <Spacer size={16} vertical />
            <FlashList
              data={experienceHighlights}
              renderItem={renderHighlightCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {/* Popular Destinations */}
        {popularDestinations.length > 0 && (
          <View style={styles.sectionContainer}>
            <SectionHeader
              title="Popular Destinations"
              linkText="More →"
              linkTo={'/(tabs)/explore/destinations' as any}
            />
            <Spacer size={16} vertical />
            <FlashList
              data={popularDestinations}
              renderItem={renderDestinationCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
