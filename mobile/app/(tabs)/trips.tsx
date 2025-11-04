import { useUser } from "@clerk/clerk-expo";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { useRouter, RelativePathString } from "expo-router";
import React from "react";
import {
  StyleSheet,
  useColorScheme,
  Pressable,
  Platform,
  View,
} from "react-native";

// import { BodyScrollView } from '@/components/ui/BodyScrollView';
import { Colors } from "@/constants";
// import { MOCK_TRIPS } from '@/constants/tripData';
// import { TripCard } from '~/components/trip/TripComponents';

import {
  HomeSkeleton,
  Spacer,
  IconSymbol,
  PrimaryButton,
  ScreenContainer,
  Text,
  WideTripCard,
} from "@/components";
import useTrips from "@/hooks/useTrips";
import { Trip } from "@/types/trips.types";

const TripsScreen = () => {
  const router = useRouter();
  const { isLoaded } = useUser();
  const colorScheme = useColorScheme() || "light";
  const { trips, loading } = useTrips();

  // console.log("trips", trips);
  // Use mock trip data instead of store data
  // const tripIds = MOCK_TRIPS.map((trip) => trip.id);

  if (!isLoaded || loading) {
    return <HomeSkeleton />;
  }

  const handleNewListPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    return router.push("/explore" as RelativePathString);
  };

  const renderEmptyList = () => (
    <ScreenContainer contentContainerStyle={styles.emptyStateContainer}>
      <PrimaryButton
        onPress={handleNewListPress}
        title="Create your first list"
      />
    </ScreenContainer>
  );

  const renderHeaderRight = () => (
    <Pressable
      // work around for https://github.com/software-mansion/react-native-screens/issues/2219
      // onPress={handleNewListPress}
      // onPress={() => router.push('/(tabs)/(trips)/trip/new')}
      style={styles.headerButton}
    >
      <IconSymbol name="plus" color={Colors[colorScheme].primary} />
    </Pressable>
  );

  return (
    <ScreenContainer
      header={{ title: "Trips" }}
      contentContainerStyle={styles.container}
    >
      <FlashList
        data={trips}
        renderItem={({ item }: { item: Trip[] | null }) => (
          <WideTripCard data={item} />
        )}
        // renderItem={({ item }: { item: Trip }) => <Text>{item.title}</Text>}
        contentContainerStyle={styles.listContainer}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={() => <Spacer size={100} vertical />}
        ItemSeparatorComponent={() => <Spacer size={8} vertical />}
      />
    </ScreenContainer>
  );
};

export default TripsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 100,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    resizeMode: "contain",
  },
  userInfo: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
    paddingRight: 0,
    marginHorizontal: Platform.select({ web: 16, default: 0 }),
  },
  headerButtonLeft: {
    paddingLeft: 0,
  },
  headerButtonIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    resizeMode: "cover",
  },

  emptyStateContainer: {
    alignItems: "center",
    gap: 8,
    paddingTop: 100,
  },
});
