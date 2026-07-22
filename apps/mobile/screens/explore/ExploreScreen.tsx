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
  useColorScheme
} from 'react-native';

import { Spacer, Text as AppText } from '@/components';
import { Colors, AppFonts } from "@/constants";

const SECTION_GAP = 32;

const ExploreScreen = () => {
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [selectedTopCategory, setSelectedTopCategory] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('$50 - $200');
  const [searchQuery, setSearchQuery] = useState('');
  const { data, loading, refreshing, refresh } = useExploreData();
  const { itineraries, events, experiences, destinations } = data;
  const colorScheme: any = useColorScheme() ?? 'light';
  // @ts-ignore
  const colors = Colors[colorScheme];

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

  return (
    <AppSafeAreaView edges={['top']}>
      <MainTabHeader title="Explore" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        {loading ? (
          <ExploreSkeleton />
        ) : (
          <>
            {searchQuery.trim() === '' &&
              selectedSubCategory === 'All' &&
              selectedTopCategory === 'All' &&
              destinations[0] && <ExploreHero destination={destinations[0]} />}

            {itineraries.length > 0 && (
              <>
                <Spacer size={SECTION_GAP} vertical />
                <ItineraryForYou
                  data={itineraries}
                  title="Featured Trip Itineraries"
                  subtitle="Recommended by Runwae"
                  loading={loading}
                  noTopMargin
                />
              </>
            )}

            {/*{(publicTripsLoading || filteredPublicTrips.length > 0) && (*/}
            {/*  <>*/}
            {/*    <Spacer size={SECTION_GAP} vertical />*/}
            {/*    <PublicTripsSection*/}
            {/*      data={filteredPublicTrips}*/}
            {/*      loading={publicTripsLoading}*/}
            {/*      noTopMargin*/}
            {/*    />*/}
            {/*  </>*/}
            {/*)}*/}

            {/*{filteredExperiences.length > 0 && (*/}
            {/*  <>*/}
            {/*    <Spacer size={SECTION_GAP} vertical />*/}
            {/*    <AddOnsForYou*/}
            {/*      data={filteredExperiences}*/}
            {/*      title="Experience Highlights"*/}
            {/*      subtitle="Top picks for you"*/}
            {/*      loading={loading}*/}
            {/*    />*/}
            {/*  </>*/}
            {/*)}*/}

            {/*{(viatorLoading || mappedViatorExperiences.length > 0) && (*/}
            {/*  <>*/}
            {/*    <Spacer size={SECTION_GAP} vertical />*/}
            {/*    <AddOnsForYou*/}
            {/*      data={mappedViatorExperiences}*/}
            {/*      title="Tours & Activities"*/}
            {/*      subtitle="powered by viator"*/}
            {/*      loading={viatorLoading}*/}
            {/*      itemPathPrefix="/viator"*/}
            {/*      headerPath="/viator"*/}
            {/*    />*/}
            {/*  </>*/}
            {/*)}*/}

            {destinations.length > 0 && (
              <>
                <Spacer size={SECTION_GAP} vertical />
                <DestinationsForYou
                  data={destinations}
                  title="Popular Destinations"
                  subtitle="Places that everyone else is crazy about"
                  loading={loading}
                  noTopMargin
                />
              </>
            )}

            <Spacer size={SECTION_GAP} vertical />
            <View className="mx-5 mb-2 overflow-hidden rounded-2xl bg-primary">
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push('/create' as any)}
                className="flex-row items-center justify-between px-5 py-5">
                <View className="flex-1 pr-4">
                  <AppText
                    replaceDefaultStyle
                    testID='explore-footer-header'
                    style={{
                      color: colors.backgroundColors.default,
                      fontFamily: AppFonts.bricolage.semiBold,
                      fontSize: 13
                    }}
                  >
                    Have a destination in mind?
                  </AppText>
                  <AppText
                    className="mt-1"
                    testID='explore-footer-text'
                    style={{
                      color: colors.backgroundColors.default,
                      fontSize: 13
                    }}
                  >
                    Plan a trip in minutes — invite friends, vote, book.
                  </AppText>
                </View>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <ArrowRight size={18} color="#fff" strokeWidth={2.4} />
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </AppSafeAreaView>
  );
};

export default ExploreScreen;
