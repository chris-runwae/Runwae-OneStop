import ExploreHero from '@/components/explore/ExploreHero';
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
import { useQuery } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';
import type { ViatorProduct } from '@/types/viator.types';
import { mapViatorProductToExperience } from '@/utils/viator/mapViatorProductToExperience';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Spacer } from '@/components';

const SECTION_GAP = 32;

const ExploreScreen = () => {
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [selectedTopCategory, setSelectedTopCategory] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('$50 - $200');
  const [searchQuery, setSearchQuery] = useState('');
  const { data, loading, refreshing, refresh } = useExploreData();
  const { itineraries, events, experiences, destinations } = data;
  // Drive the Viator row from the explore search query when present, falling
  // back to the first featured destination's name. This replaces a hardcoded
  // "London" search that pinned every user to the same tour list.
  const viatorTerm = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length > 0) return trimmed;
    return destinations[0]?.title ?? '';
  }, [searchQuery, destinations]);
  const { products: viatorProducts, loading: viatorLoading } = useViator({
    term: viatorTerm,
  });
  const { user } = useAuth();

  // Public trips for Explore — server-side filtering in
  // api.trips.listPublic excludes the caller's own memberships so the
  // section never shows a trip you can already see in My Trips.
  const publicTripsRaw = useQuery(api.trips.listPublic, { limit: 20 });
  const publicTrips: Trip[] = (publicTripsRaw ?? []) as Trip[];
  const publicTripsLoading = publicTripsRaw === undefined;

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

  // Sub-category matching is intentionally permissive: pills like "Romance" or
  // "Food & Drink" rarely match a single canonical `category` string in the
  // data, so we substring-match (case-insensitive) against category + tags.
  const matchesSubCategory = (
    item: { category?: string | null; tags?: readonly string[] | string[] | null },
    selected: string,
  ) => {
    if (selected === 'All') return true;
    const needle = selected.toLowerCase();
    const haystack = [item.category, ...(item.tags ?? [])]
      .filter((s): s is string => typeof s === 'string' && s.length > 0)
      .map((s) => s.toLowerCase())
      .join(' ');
    return haystack.includes(needle);
  };

  const filteredItineraries = useMemo(() => {
    if (selectedTopCategory !== 'All' && selectedTopCategory !== 'Trips')
      return [];
    return itineraries.filter(
      (item) =>
        matchesSearch(item.title + item.location, searchQuery) &&
        matchesSubCategory(item, selectedSubCategory)
    );
  }, [searchQuery, selectedSubCategory, selectedTopCategory, itineraries]);

  // Featured row tops out at 5 — backend sort already surfaces
  // `isFeatured` first, with `timesCopied` and recency as tie-breakers.
  // Section header arrow links to /itinerary for the full list.
  const featuredItinerariesForFeed = useMemo(
    () => filteredItineraries.slice(0, 5),
    [filteredItineraries]
  );

  const filteredEvents = useMemo(() => {
    if (selectedTopCategory !== 'All' && selectedTopCategory !== 'Experiences')
      return [];
    return events.filter(
      (item) =>
        matchesSearch(item.title + item.location, searchQuery) &&
        matchesSubCategory(item, selectedSubCategory)
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
        matchesSubCategory(item, selectedSubCategory) &&
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
    return destinations.filter(
      (item) =>
        matchesSearch(item.title + item.location, searchQuery) &&
        matchesSubCategory(item, selectedSubCategory),
    );
  }, [searchQuery, selectedSubCategory, selectedTopCategory, destinations]);

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
            {/* Hero banner — only when no filters/search are narrowing the
                feed, mirroring web's behaviour. Hidden when destinations
                hasn't loaded yet to avoid a layout pop. */}
            {searchQuery.trim() === '' &&
              selectedSubCategory === 'All' &&
              selectedTopCategory === 'All' &&
              destinations[0] && <ExploreHero destination={destinations[0]} />}

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

            {featuredItinerariesForFeed.length > 0 && (
              <>
                <Spacer size={SECTION_GAP} vertical />
                <ItineraryForYou
                  data={featuredItinerariesForFeed}
                  title="Featured Trip Itineraries"
                  subtitle="Recommended by Runwae"
                  loading={loading}
                  noTopMargin
                />
              </>
            )}

            {/* Public trips arrive on a separate query than the main
                explore feed, so keep the row mounted while it loads to
                avoid a layout pop when results stream in. */}
            {(publicTripsLoading || filteredPublicTrips.length > 0) && (
              <>
                <Spacer size={SECTION_GAP} vertical />
                <PublicTripsSection
                  data={filteredPublicTrips}
                  loading={publicTripsLoading}
                  noTopMargin
                />
              </>
            )}

            {filteredEvents.length > 0 && (
              <>
                <Spacer size={SECTION_GAP} vertical />
                <UpcomingEvents data={filteredEvents} loading={loading} />
              </>
            )}

            {filteredExperiences.length > 0 && (
              <>
                <Spacer size={SECTION_GAP} vertical />
                <AddOnsForYou
                  data={filteredExperiences}
                  title="Experience Highlights"
                  subtitle="Top picks for you"
                  loading={loading}
                />
              </>
            )}

            {/* Viator hits an external API; render a skeleton row while
                it's still resolving instead of a blank gap. */}
            {(viatorLoading || mappedViatorExperiences.length > 0) && (
              <>
                <Spacer size={SECTION_GAP} vertical />
                <AddOnsForYou
                  data={mappedViatorExperiences}
                  title="Tours & Activities"
                  subtitle="powered by viator"
                  loading={viatorLoading}
                  itemPathPrefix="/viator"
                  headerPath="/viator"
                />
              </>
            )}

            {filteredDestinations.length > 0 && (
              <>
                <Spacer size={SECTION_GAP} vertical />
                <DestinationsForYou
                  data={filteredDestinations}
                  title="Popular Destinations"
                  subtitle="Places that everyone else is crazy about"
                  loading={loading}
                  noTopMargin
                />
              </>
            )}

            {/* Plan-a-trip CTA — mirrors the bottom strip on web Explore so
                discovery flows always have a clear way back to creation. */}
            <Spacer size={SECTION_GAP} vertical />
            <View className="mx-5 mb-2 overflow-hidden rounded-2xl bg-primary">
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  router.push('/create-trip-options' as any)
                }
                className="flex-row items-center justify-between px-5 py-5">
                <View className="flex-1 pr-4">
                  <Text className="text-lg font-bold text-white">
                    Have a destination in mind?
                  </Text>
                  <Text className="mt-1 text-sm text-white/85">
                    Plan a trip in minutes — invite friends, vote, book.
                  </Text>
                </View>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <ArrowRight size={18} color="#fff" strokeWidth={2.4} />
                </View>
              </TouchableOpacity>
            </View>

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
              {['All', 'Trips', 'Experiences'].map((cat, i) => (
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
