import React, { useState, useMemo } from 'react';
import { StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { ScreenContainer, Spacer } from '@/components';
import { Colors } from '@/constants';
import { exploreDummyData } from '@/stores/exploreStore';
import { CategorySelector } from '@/components/explore/CategorySelector';
import { ExploreSection } from '@/components/explore/ExploreSection';

type Category = 'all' | 'romantic-getaway' | 'sports' | 'relax';

export default function ExploreScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

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
      paddingBottom: 70,
    },
  });

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

        <CategorySelector
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <ExploreSection
          title="Featured Itineraries"
          linkTo="/(tabs)/explore/itineraries"
          data={featuredItineraries}
          type="itinerary"
        />

        <ExploreSection
          title="Featured Events"
          linkTo="/(tabs)/explore/events"
          data={featuredEvents}
          type="event"
        />

        <ExploreSection
          title="Experience Highlights"
          linkTo="/(tabs)/explore/experiences"
          data={experienceHighlights}
          type="experience"
        />

        <ExploreSection
          title="Popular Destinations"
          linkTo="/(tabs)/explore/destinations"
          data={popularDestinations}
          type="destination"
        />
      </ScrollView>
    </ScreenContainer>
  );
}
