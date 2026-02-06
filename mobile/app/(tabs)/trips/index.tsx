import { useUser } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';
import { useRouter, RelativePathString } from 'expo-router';
import React, { useCallback } from 'react';

import { HomeSkeleton, ScreenContainer } from '@/components';
import useTrips from '@/hooks/useTrips';
import TripHeader from '@/components/trips/TripHeader';
import TripList from '@/components/trips/TripList';

const TripsScreen = () => {
  const router = useRouter();
  const { isLoaded } = useUser();
  const { trips, loading, fetchTrips } = useTrips();

  const handleNewTripPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/trips/trip-creation' as RelativePathString);
  }, [router]);

  const handleRefresh = useCallback(() => {
    fetchTrips();
  }, [fetchTrips]);

  if (!isLoaded || loading) {
    return <HomeSkeleton />;
  }

  return (
    <ScreenContainer
      header={{
        title: 'Trips',
        rightComponent: <TripHeader onNewTripPress={handleNewTripPress} />,
      }}
      contentContainerStyle={{ flex: 1 }}>
      <TripList
        trips={trips}
        loading={loading}
        onRefresh={handleRefresh}
        onNewTripPress={handleNewTripPress}
      />
    </ScreenContainer>
  );
};

export default TripsScreen;
