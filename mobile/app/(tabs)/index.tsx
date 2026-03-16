import HomeHeader from "@/components/home/HomeHeader";
import ItineraryForYou from "@/components/home/IteneryForYou";
import AddOnsForYou from "@/components/home/AddOnsForYou";
import UpcomingTrips from "@/components/home/UpcomingTrips";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import WelcomeModal from "@/components/WelcomeModal";
import {
  ADD_ONS_FOR_YOU,
  DESTINATIONS_FOR_YOU,
  ITINERARIES_FOR_YOU,
  UPCOMING_TRIPS,
} from "@/constants/home.constant";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@react-navigation/native";
import React, { useState, useCallback } from "react";
import { ScrollView, RefreshControl } from "react-native";

import DestinationsForYou from "@/components/home/DestinationsForYou";

export default function HomeScreen() {
  const { showWelcomeModal, setShowWelcomeModal, user, isLoading } = useAuth();
  const { dark } = useTheme();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate a network request
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <AppSafeAreaView edges={["top"]}>
      <HomeHeader user={user} isLoading={isLoading} dark={dark} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={dark ? "#ffffff" : "#000000"}
          />
        }
      >
        <UpcomingTrips trips={UPCOMING_TRIPS} />
        <ItineraryForYou data={ITINERARIES_FOR_YOU} />
        <AddOnsForYou data={ADD_ONS_FOR_YOU} />
        <DestinationsForYou data={DESTINATIONS_FOR_YOU} />
      </ScrollView>

      <WelcomeModal
        visible={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />
    </AppSafeAreaView>
  );
}
