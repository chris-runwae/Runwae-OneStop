import React, { useState, useMemo } from 'react';
import { StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { ScreenContainer, Spacer } from '@/components';
import { Colors } from '@/constants';
import { CategorySelector } from '@/components/explore/CategorySelector';
import { ExploreSection } from '@/components/explore/ExploreSection';
import { SearchBar } from '@/components/explore/SearchBar';
import { FilterModal } from '@/components/explore/FilterModal';
import { EmptyState } from '@/components/explore/EmptyState';
import {
  useExploreFilters,
  type FilterCategory,
} from '@/hooks/useExploreFilters';
import {
  Music,
  Utensils,
  Camera,
  MapPin,
  Calendar,
  Heart,
} from 'lucide-react-native';

type Category = 'all' | 'romantic-getaway' | 'sports' | 'relax';

export default function ExploreScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    filterOptions,
    featuredItineraries,
    featuredEvents,
    experienceHighlights,
    popularDestinations,
  } = useExploreFilters(selectedCategory);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColors.default,
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterPress = () => {
    setFilterModalVisible(true);
  };

  const handleFilterSelect = (filter: FilterCategory | null) => {
    setSelectedFilter(filter);
  };

  // Check if all sections are empty
  const hasNoResults =
    featuredItineraries.length === 0 &&
    featuredEvents.length === 0 &&
    experienceHighlights.length === 0 &&
    popularDestinations.length === 0;

  // Determine empty state type
  const getEmptyStateType = (): 'search' | 'filter' => {
    if (searchQuery.trim()) return 'search';
    if (selectedFilter) return 'filter';
    return 'search'; // default
  };

  const getEmptyStateProps = () => {
    const type = getEmptyStateType();
    return {
      type,
      query: type === 'search' ? searchQuery : undefined,
      filter: type === 'filter' ? selectedFilter || undefined : undefined,
    };
  };

  return (
    <ScreenContainer header={{ title: 'Explore' }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}>
        <Spacer size={16} vertical />
        <SearchBar onSearch={handleSearch} onFilter={handleFilterPress} />

        <CategorySelector
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {hasNoResults ? (
          <EmptyState {...getEmptyStateProps()} />
        ) : (
          <>
            {featuredItineraries.length > 0 && (
              <ExploreSection
                title="Featured Itineraries"
                linkTo="/(tabs)/explore/itineraries"
                data={featuredItineraries}
                type="itinerary"
              />
            )}

            {featuredEvents.length > 0 && (
              <ExploreSection
                title="Featured Events"
                linkTo="/(tabs)/explore/events"
                data={featuredEvents}
                type="event"
              />
            )}

            {experienceHighlights.length > 0 && (
              <ExploreSection
                title="Experience Highlights"
                linkTo="/(tabs)/explore/experiences"
                data={experienceHighlights}
                type="experience"
              />
            )}

            {popularDestinations.length > 0 && (
              <ExploreSection
                title="Popular Destinations"
                linkTo="/(tabs)/explore/destinations"
                data={popularDestinations}
                type="destination"
              />
            )}
          </>
        )}
      </ScrollView>
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        options={filterOptions}
        selectedFilter={selectedFilter}
        onSelectFilter={handleFilterSelect}
      />
    </ScreenContainer>
  );
}
