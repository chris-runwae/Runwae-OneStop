import AddOnsForYou from '@/components/home/AddOnsForYou';
import HomeTopSection from '@/components/home/HomeTopSection';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import UpcomingTrips from '@/components/home/UpcomingTrips';
import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import WelcomeModal from '@/components/WelcomeModal';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { useTrips } from '@/context/TripsContext';
import type { Trip } from '@/hooks/useTripActions';
import { Event, Experience } from '@/types/content.types';
import { getFeaturedEvents } from '@/utils/supabase/events.service';
import { getFeaturedExperiences } from '@/utils/supabase/experiences.service';

export default function HomeScreen() {
  const {
    showWelcomeModal,
    setShowWelcomeModal,
    user,
  } = useAuth();
  const { dark } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { myTrips, joinedTrips } = useTrips();
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [featuredExperiences, setFeaturedExperiences] = useState<Experience[]>(
    []
  );

  function isActive(trip: Trip): boolean {
    if (!trip.endDate) return true;
    return new Date(trip.endDate) >= new Date(new Date().toDateString());
  }

  const allTrips = useMemo(() => {
    const combined = [...myTrips, ...joinedTrips];
    if (!user?.id) return combined;
    // Newest interaction first; for trips the viewer created, that's
    // createdAt. For joined trips we don't have the per-user joinedAt
    // here (the activeTrip query owns members), so fall back to
    // createdAt — close enough for the home-screen list.
    return [...combined].sort((a, b) => b.createdAt - a.createdAt);
  }, [myTrips, joinedTrips, user?.id]);

  const upcomingTrips = useMemo(
    () => allTrips.filter(isActive),
    [allTrips]
  );

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventsData, experiencesData] = await Promise.all([
          getFeaturedEvents(),
          getFeaturedExperiences(),
        ]);
        setFeaturedEvents(eventsData);
        setFeaturedExperiences(experiencesData);
      } catch (err) {
        console.error('HomeScreen: Error fetching featured data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <AppSafeAreaView edges={['top']}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={dark ? '#ffffff' : '#000000'}
          />
        }>
        <HomeTopSection user={user} dark={dark} />
        <UpcomingTrips trips={upcomingTrips} loading={loading} />
        <UpcomingEvents
          data={featuredEvents}
          title="Featured Events"
          showSubtitle={false}
          loading={loading}
        />
        <AddOnsForYou data={featuredExperiences} loading={loading} />
      </ScrollView>

      <WelcomeModal
        visible={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />
    </AppSafeAreaView>
  );
}
