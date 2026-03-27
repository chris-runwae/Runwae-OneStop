import HomeTopSection from '@/components/home/HomeTopSection';
import ItineraryForYou from '@/components/home/IteneryForYou';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import UpcomingTrips from '@/components/home/UpcomingTrips';
import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import WelcomeModal from '@/components/WelcomeModal';
import {
  DESTINATIONS_FOR_YOU,
  ITINERARIES_FOR_YOU,
  UPCOMING_EVENTS,
  UPCOMING_TRIPS,
} from '@/constants/home.constant';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import DestinationsForYou from '@/components/home/DestinationsForYou';

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
        <UpcomingTrips trips={UPCOMING_TRIPS} loading={loading} />
        <UpcomingEvents
          data={UPCOMING_EVENTS}
          title="Featured Events"
          showSubtitle={false}
          loading={loading}
        />
        <ItineraryForYou data={ITINERARIES_FOR_YOU} loading={loading} />
        <DestinationsForYou data={DESTINATIONS_FOR_YOU} loading={loading} />
      </ScrollView>

      <WelcomeModal
        visible={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />
    </AppSafeAreaView>
  );
}
