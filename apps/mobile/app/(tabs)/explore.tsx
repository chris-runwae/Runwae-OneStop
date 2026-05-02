import AddOnsForYou from '@/components/home/AddOnsForYou';
import DestinationsForYou from '@/components/home/DestinationsForYou';
import ExploreCategories from '@/components/home/ExploreCategories';
import ItineraryForYou from '@/components/home/IteneryForYou';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import PublicTripsSection from '@/components/home/PublicTripsSection';
import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import CustomModal from '@/components/ui/CustomModal';
import ExploreSkeleton from '@/components/ui/ExploreSkeleton';
import MainTabHeader from '@/components/ui/MainTabHeader';
import SearchInput from '@/components/ui/SearchInput';
import { EXPLORE_CATEGORIES } from '@/constants/home.constant';
import { useAuth } from '@/context/AuthContext';
import { useExploreData } from '@/hooks/useExploreData';
import type { Trip } from '@/hooks/useTripActions';
import { useViator } from '@/hooks/useViator';
import type { ViatorProduct } from '@/types/viator.types';
import { mapViatorProductToExperience } from '@/utils/viator/mapViatorProductToExperience';
import React, { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const ExploreScreen = () => {
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [selectedTopCategory, setSelectedTopCategory] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('$50 - $200');
  const [searchQuery, setSearchQuery] = useState('');
  const { data, loading, refreshing, refresh } = useExploreData();
  const { itineraries, events, experiences, destinations } = data;
  const { products: viatorProducts, loading: viatorLoading } = useViator();
  const { user } = useAuth();

  // Public trip discovery is wired up in Phase 4 (browse migration);
  // for now the section is hidden so the screen compiles cleanly.
  const publicTrips: Trip[] = [];
  const publicTripsLoading = false;

  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const handleApplyFilters = () => {
    console.log('Applying filters:', { selectedTopCategory, selectedPrice });
    setIsFilterModalVisible(false);
  };

  // Helper function for text search
  const matchesSearch = (text: string, query: string) => {
    if (!query) return true;
    return text.toLowerCase().includes(query.toLowerCase());
  };

  // Helper for sub-category matching
  const matchesSubCategory = (itemCategory: string, selected: string) => {
    if (selected === 'All') return true;
    return itemCategory === selected;
  };

  const filteredItineraries = useMemo(() => {
    if (selectedTopCategory !== 'All' && selectedTopCategory !== 'Trips')
      return [];
    return itineraries.filter(
      (item) =>
        matchesSearch(item.title + item.location, searchQuery) &&
        matchesSubCategory(item.category, selectedSubCategory)
    );
  }, [searchQuery, selectedSubCategory, selectedTopCategory, itineraries]);

  const filteredEvents = useMemo(() => {
    if (selectedTopCategory !== 'All' && selectedTopCategory !== 'Experiences')
      return [];
    return events.filter(
      (item) =>
        matchesSearch(item.title + item.location, searchQuery) &&
        matchesSubCategory(item.category, selectedSubCategory)
    );
  }, [searchQuery, selectedSubCategory, selectedTopCategory, events]);

  const getPriceBounds = (range: string) => {
    if (range === '$500+') return [500, Infinity] as const;
    const numbers = range.match(/\d+/g)?.map(Number) || [0, Infinity];
    return [numbers[0], numbers[1] ?? Infinity] as const;
  };

  const filteredExperiences = useMemo(() => {
    if (selectedTopCategory !== 'All' && selectedTopCategory !== 'Experiences')
      return [];

    const [minPrice, maxPrice] = getPriceBounds(selectedPrice);

    return experiences.filter(
      (item) =>
        matchesSearch(item.title, searchQuery) &&
        matchesSubCategory(item.category, selectedSubCategory) &&
        item.price >= minPrice &&
        item.price <= maxPrice
    );
  }, [
    searchQuery,
    selectedSubCategory,
    selectedTopCategory,
    selectedPrice,
    experiences,
  ]);

  /** Viator tours: same top-level and price/search filters as in-app experiences; sub-categories are not mapped to Viator tags yet. */
  const filteredViatorProducts = useMemo(() => {
    if (selectedTopCategory !== 'All' && selectedTopCategory !== 'Experiences')
      return [];

    const [minPrice, maxPrice] = getPriceBounds(selectedPrice);
    const list = viatorProducts as ViatorProduct[];

    return list.filter((p) => {
      const text = `${p.title} ${p.description ?? ''}`;
      const price = p.pricing?.summary?.fromPrice ?? 0;
      return (
        matchesSearch(text, searchQuery) &&
        price >= minPrice &&
        price <= maxPrice
      );
    });
  }, [searchQuery, selectedTopCategory, selectedPrice, viatorProducts]);

  const filteredDestinations = useMemo(() => {
    if (selectedTopCategory !== 'All' && selectedTopCategory !== 'Trips')
      return [];
    return destinations.filter((item) =>
      matchesSearch(item.title + item.location, searchQuery)
    );
  }, [searchQuery, selectedTopCategory, destinations]);

  const filteredPublicTrips = useMemo(() => {
    if (selectedTopCategory !== 'All' && selectedTopCategory !== 'Trips')
      return [];
    return publicTrips.filter((item) =>
      matchesSearch(item.title + (item.destinationLabel ?? ''), searchQuery),
    );
  }, [searchQuery, selectedTopCategory, publicTrips]);

  const mappedViatorExperiences = useMemo(() => {
    return filteredViatorProducts.map(mapViatorProductToExperience);
  }, [filteredViatorProducts]);

  return (
    <AppSafeAreaView edges={['top']}>
      <MainTabHeader title="Explore" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <View className="mt-4 px-[20px]">
          <SearchInput
            placeholder="Search trips, hotels, experiences..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFilterPress={() => setIsFilterModalVisible(true)}
          />
        </View>

        {loading ? (
          <ExploreSkeleton />
        ) : (
          <>
            <ExploreCategories
              categories={EXPLORE_CATEGORIES}
              selectedCategory={selectedSubCategory}
              onCategoryPress={(cat) => setSelectedSubCategory(cat)}
              showClear={
                searchQuery !== '' ||
                selectedSubCategory !== 'All' ||
                selectedTopCategory !== 'All' ||
                selectedPrice !== '$50 - $200'
              }
              onClear={() => {
                setSearchQuery('');
                setSelectedSubCategory('All');
                setSelectedTopCategory('All');
                setSelectedPrice('$50 - $200');
              }}
            />

            {filteredItineraries.length > 0 && (
              <ItineraryForYou
                data={filteredItineraries}
                title="Featured Trip Itineraries"
                subtitle="Recommended by Runwae"
                loading={loading}
              />
            )}

            {filteredPublicTrips.length > 0 && (
              <PublicTripsSection
                data={filteredPublicTrips}
                loading={publicTripsLoading}
              />
            )}

            {filteredEvents.length > 0 && (
              <UpcomingEvents data={filteredEvents} loading={loading} />
            )}

            {filteredExperiences.length > 0 && (
              <AddOnsForYou
                data={filteredExperiences}
                title="Experience Highlights"
                subtitle="Top picks for you"
                loading={loading}
              />
            )}

            {mappedViatorExperiences.length > 0 && (
              <AddOnsForYou
                data={mappedViatorExperiences}
                title="Tours & Activities"
                subtitle="powered by viator"
                loading={viatorLoading}
                itemPathPrefix="/viator"
                headerPath="/viator"
              />
            )}

            {filteredDestinations.length > 0 && (
              <DestinationsForYou
                data={filteredDestinations}
                title="Popular Destinations"
                subtitle="Places that everyone else is crazy about"
                loading={loading}
              />
            )}

            {filteredItineraries.length === 0 &&
              filteredEvents.length === 0 &&
              filteredExperiences.length === 0 &&
              filteredDestinations.length === 0 && (
                <View className="items-center justify-center px-5 py-10">
                  <Text className="text-center text-lg font-medium text-gray-400">
                    No results found for "{searchQuery}"
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedSubCategory('All');
                      setSelectedTopCategory('All');
                    }}
                    className="mt-4">
                    <Text className="font-semibold text-primary">
                      Clear all filters
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
          </>
        )}
      </ScrollView>

      <CustomModal
        isVisible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        title="Filter Options">
        <View className="flex-col gap-y-6 py-2">
          {/* Category Filter */}
          <View>
            <Text className="mb-3 text-lg font-semibold text-black dark:text-white">
              Category
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {['All', 'Trips', 'Hotels', 'Experiences'].map((cat, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedTopCategory(cat)}
                  className={`rounded-full border px-4 py-2 ${
                    cat === selectedTopCategory
                      ? 'border-primary bg-primary'
                      : 'border-gray-200 bg-transparent dark:border-gray-600'
                  }`}>
                  <Text
                    className={`${
                      cat === selectedTopCategory
                        ? 'text-white'
                        : 'text-sm text-black dark:text-white'
                    }`}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Range */}
          <View>
            <Text className="mb-3 text-lg font-semibold text-black dark:text-white">
              Price Range
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {['$0 - $50', '$50 - $200', '$200 - $500', '$500+'].map(
                (price, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedPrice(price)}
                    className={`rounded-full border px-4 py-2 ${
                      price === selectedPrice
                        ? 'border-primary bg-primary'
                        : 'border-gray-200 bg-transparent dark:border-gray-600'
                    }`}>
                    <Text
                      className={`${
                        price === selectedPrice
                          ? 'text-white'
                          : 'text-sm text-black dark:text-white'
                      }`}>
                      {price}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          {/* Apply Button */}
          <TouchableOpacity
            className="mt-4 w-full items-center rounded-[6px] bg-primary py-3.5"
            onPress={handleApplyFilters}>
            <Text className="text-base font-semibold text-white">
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </CustomModal>
    </AppSafeAreaView>
  );
};

export default ExploreScreen;
