import AddOnsForYou from '@/components/home/AddOnsForYou';
import DiscoverGrid from '@/components/discover/DiscoverGrid';
import FindFriendsSheet from '@/components/social/FindFriendsSheet';
import FriendsActivity from '@/components/home/FriendsActivity';
import HeroFeatured from '@/components/home/HeroFeatured';
import HomeQuickActions from '@/components/home/HomeQuickActions';
import HomeTopSection from '@/components/home/HomeTopSection';
import ImportsInProgressPill from '@/components/home/ImportsInProgressPill';
import LocationPrompt from '@/components/home/LocationPrompt';
import OpenPollCard from '@/components/home/OpenPollCard';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import UpcomingTrips from '@/components/home/UpcomingTrips';
import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import WelcomeModal from '@/components/WelcomeModal';
import { useFeatureFlag } from '@/lib/featureFlags';
import { NATIVE_TABS_ENABLED } from '@/app/(tabs)/_layout';
import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripsContext';
import type { Trip } from '@/hooks/useTripActions';
import { useExploreData } from '@/hooks/useExploreData';
import { api } from '@runwae/convex/convex/_generated/api';
import { useTheme } from "expo-router/react-navigation";
import { useQuery } from 'convex/react';
import { Image as ExpoImage } from 'expo-image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

// Consistent vertical rhythm between every home section. 32px is the
// standard mobile section gap and gives the page enough breathing room
// without feeling sparse on smaller phones.
const SECTION_GAP = 32;

export default function HomeScreen() {
  const { showWelcomeModal, setShowWelcomeModal, user } = useAuth();
  const { dark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [findFriendsOpen, setFindFriendsOpen] = useState(false);
  const { myTrips, joinedTrips } = useTrips();
  const { data: exploreData, loading, refresh: refreshExplore } =
    useExploreData();
  const featuredEvents = exploreData.events;
  const featuredExperiences = exploreData.experiences;

  const viewer = useQuery(api.users.getCurrentUser, {});
  const showLocationPrompt =
    viewer !== undefined && viewer !== null && !viewer.homeCoords;
  const discoverEnabled = useFeatureFlag('flag_discover_grid');

  function isActive(trip: Trip): boolean {
    if (!trip.endDate) return true;
    return new Date(trip.endDate) >= new Date(new Date().toDateString());
  }

  const allTrips = useMemo(() => {
    const combined = [...myTrips, ...joinedTrips];
    if (!user?.id) return combined;
    return [...combined].sort((a, b) => b.createdAt - a.createdAt);
  }, [myTrips, joinedTrips, user?.id]);

  const upcomingTrips = useMemo(() => allTrips.filter(isActive), [allTrips]);

  // Prefetch hero images for the visible carousels as soon as URLs are
  // known. expo-image dedupes with its on-disk cache, so the actual
  // <Image> mounts later just hit the cache instead of waiting on the
  // network — this is what removes the multi-second blank-card window
  // on first home-screen mount.
  useEffect(() => {
    const urls = [
      ...featuredEvents.map((e) => e.image),
      ...featuredExperiences.map((x) => x.image),
      ...upcomingTrips.map((t) => t.coverImageUrl ?? ''),
    ].filter((u): u is string => typeof u === 'string' && u.length > 0);
    if (urls.length === 0) return;
    ExpoImage.prefetch(urls, { cachePolicy: 'memory-disk' }).catch(() => {});
  }, [featuredEvents, featuredExperiences, upcomingTrips]);

  // Convex queries are reactive, so the listed data is already live. Pull-
  // to-refresh re-runs the explore hook (acts as a confirmation gesture)
  // and re-prefetches any hero images that failed to load on first paint.
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const urls = [
        ...featuredEvents.map((e) => e.image),
        ...featuredExperiences.map((x) => x.image),
        ...upcomingTrips.map((t) => t.coverImageUrl ?? ''),
      ].filter((u): u is string => typeof u === 'string' && u.length > 0);
      await Promise.all([
        refreshExplore(),
        urls.length > 0
          ? ExpoImage.prefetch(urls, { cachePolicy: 'memory-disk' })
          : Promise.resolve(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [
    refreshExplore,
    featuredEvents,
    featuredExperiences,
    upcomingTrips,
  ]);

  return (
    <AppSafeAreaView edges={['top']}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: NATIVE_TABS_ENABLED ? 32 : 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={dark ? '#ffffff' : '#000000'}
          />
        }>
        <HomeTopSection user={user} dark={dark} />

        {showLocationPrompt && (
          <View style={{ marginBottom: SECTION_GAP }}>
            <LocationPrompt />
          </View>
        )}

        <View style={{ gap: SECTION_GAP }}>
          <ImportsInProgressPill />
          <HomeQuickActions dark={dark} />

          <HeroFeatured />
          <UpcomingTrips trips={upcomingTrips} loading={loading} />
          {/*<UpcomingEvents*/}
          {/*  data={featuredEvents}*/}
          {/*  title="Featured Events"*/}
          {/*  showSubtitle={false}*/}
          {/*  loading={loading}*/}
          {/*  headerPath="/events/featured"*/}
          {/*/>*/}
          {/*<AddOnsForYou data={featuredExperiences} loading={loading} />*/}
          {/*{discoverEnabled ? (*/}
          {/*  <DiscoverGrid*/}
          {/*    city={viewer?.homeCity ?? viewer?.homeCountry ?? 'London'}*/}
          {/*    coords={viewer?.homeCoords ?? undefined}*/}
          {/*    originIata={viewer?.homeIata ?? null}*/}
          {/*  />*/}
          {/*) : null}*/}
          <OpenPollCard />
          <FriendsActivity onFindFriends={() => setFindFriendsOpen(true)} />
        </View>
      </ScrollView>

      <WelcomeModal
        visible={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />
      <FindFriendsSheet
        open={findFriendsOpen}
        onClose={() => setFindFriendsOpen(false)}
      />
    </AppSafeAreaView>
  );
}
