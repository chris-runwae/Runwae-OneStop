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
import { TripWithEverything } from '@/hooks/useTripActions';
import { Event, Experience } from '@/types/content.types';
import { getFeaturedEvents } from '@/utils/supabase/events.service';
import { getFeaturedExperiences } from '@/utils/supabase/experiences.service';

export default function HomeScreen() {
  const {
    showWelcomeModal,
    setShowWelcomeModal,
    user,
    isLoading: authLoading,
  } = useAuth();
  const { dark } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { myTrips, joinedTrips } = useTrips();
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [featuredExperiences, setFeaturedExperiences] = useState<Experience[]>(
    []
  );

  function isActive(trip: TripWithEverything): boolean {
    const endDate = trip.trip_details?.end_date;
    if (!endDate) return true;
    return new Date(endDate) >= new Date(new Date().toDateString());
  }

  const allTrips = useMemo(() => {
    const combined = [...myTrips, ...joinedTrips];
    if (!user?.id) return combined;

    return combined.sort((a, b) => {
      const getInteractionDate = (trip: TripWithEverything) => {
        if (trip.created_by === user.id) {
          return new Date(trip.created_at).getTime();
        }
        const membership = trip.group_members?.find(
          (m) => m.user_id === user.id
        );
        return membership
          ? new Date(membership.joined_at).getTime()
          : new Date(trip.created_at).getTime();
      };

      return getInteractionDate(b) - getInteractionDate(a);
    });
  }, [myTrips, joinedTrips, user?.id]);

  const upcomingTrips = useMemo(
    () => allTrips.filter((t) => isActive(t as TripWithEverything)),
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
