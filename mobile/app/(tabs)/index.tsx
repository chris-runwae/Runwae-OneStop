import { Spacer } from '@/components';
import AddOnsForYou from '@/components/home/AddOnsForYou';
import HomeTopSection from '@/components/home/HomeTopSection';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import UpcomingTrips from '@/components/home/UpcomingTrips';
import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import WelcomeModal from '@/components/WelcomeModal';
import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripsContext';
import { useEvents } from '@/hooks/useEvents';
import { useExperiences } from '@/hooks/useExperiences';
import { TripWithEverything } from '@/hooks/useTripActions';
import { useTheme } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

export default function HomeScreen() {
  const { showWelcomeModal, setShowWelcomeModal, user } = useAuth();
  const { dark } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const { myTrips, joinedTrips, isLoading: tripsLoading } = useTrips();
  const {
    data: events,
    loading: eventsLoading,
    refresh: refreshEvents,
  } = useEvents();
  const {
    data: experiences,
    loading: experiencesLoading,
    refresh: refreshExperiences,
  } = useExperiences();

  function isActive(trip: TripWithEverything): boolean {
    const endDate = trip.trip_details?.end_date;
    if (!endDate) return true;
    return new Date(endDate) >= new Date(new Date().toDateString());
  }

  const allTrips = useMemo(
    () => [...myTrips, ...joinedTrips],
    [myTrips, joinedTrips]
  );

  const upcomingTrips = useMemo(
    () => allTrips.filter((t) => isActive(t as TripWithEverything)),
    [allTrips]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([refreshEvents(), refreshExperiences()]).finally(() => {
      setRefreshing(false);
    });
  }, [refreshEvents, refreshExperiences]);

  return (
    <AppSafeAreaView>
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
        <UpcomingTrips trips={upcomingTrips} loading={tripsLoading} />

        <Spacer vertical size={32} />
        <UpcomingEvents
          data={events}
          title="Featured Events"
          showSubtitle={false}
          loading={eventsLoading}
        />
        <Spacer vertical size={32} />
        <AddOnsForYou data={experiences} loading={experiencesLoading} />
      </ScrollView>

      <WelcomeModal
        visible={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />
    </AppSafeAreaView>
  );
}
