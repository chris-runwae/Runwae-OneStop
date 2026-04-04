import AddOnsForYou from '@/components/home/AddOnsForYou';
import HomeTopSection from '@/components/home/HomeTopSection';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import UpcomingTrips from '@/components/home/UpcomingTrips';
import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import WelcomeModal from '@/components/WelcomeModal';
import { ADD_ONS_FOR_YOU, UPCOMING_EVENTS } from '@/constants/home.constant';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { useTrips } from '@/context/TripsContext';
import { TripWithEverything } from '@/hooks/useTripActions';

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

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate a network request
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
          data={UPCOMING_EVENTS}
          title="Featured Events"
          showSubtitle={false}
          loading={loading}
        />
        <AddOnsForYou data={ADD_ONS_FOR_YOU} loading={loading} />
        {/* <DestinationsForYou data={DESTINATIONS_FOR_YOU} loading={loading} /> */}
      </ScrollView>

      <WelcomeModal
        visible={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />
    </AppSafeAreaView>
  );
}
