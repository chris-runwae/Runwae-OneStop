import { useUser } from "@clerk/clerk-expo";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { useRouter, RelativePathString } from "expo-router";
import React from "react";
import { StyleSheet, useColorScheme, Platform, View } from "react-native";
import { Image } from "expo-image";

import { Colors } from "@/constants";

import {
  HomeSkeleton,
  Spacer,
  PrimaryButton,
  ScreenContainer,
  WideTripCard,
  Text,
} from "@/components";
import useTrips from "@/hooks/useTrips";
import { Trip } from "@/types/trips.types";

const TripsScreen = () => {
  const router = useRouter();
  const { isLoaded } = useUser();
  const colorScheme = useColorScheme() || "light";
  const {
    // trips,
    loading,
  } = useTrips();

  const trips = [];

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

  const renderItem = ({ item }: { item: Trip[] | null }) => {
    return <WideTripCard data={item} />;
  };

  const NoTripsContainer = () => {
    return (
      <View style={styles.emptyStateContainer}>
        <Image
          source={require("@/assets/images/noActiveTrip.png")}
          style={styles.noTripsImage}
          contentFit="cover"
        />
        <Spacer size={32} vertical />

        <Text style={styles.noTripsText}>No Planned Trips 😔</Text>
        <Text style={styles.noTripsSubtitle}>
          It looks like you have no active trips planned yet. Click on the
          button below to plan one.
        </Text>
        <Spacer size={12} vertical />
        <PrimaryButton
          onPress={handleNewListPress}
          title="Create your first list"
        />
      </View>
    );
  };

  return (
    <ScreenContainer
      header={{ title: "Trips" }}
      contentContainerStyle={styles.container}
    >
      <FlashList
        data={trips}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => <NoTripsContainer />}
        ListFooterComponent={() => <Spacer size={100} vertical />}
        ItemSeparatorComponent={() => <Spacer size={8} vertical />}
      />

      {/* <PrimaryButton
        title="Create Trip"
        onPress={() => {
          router.push("/(tabs)/explore" as RelativePathString);
        }}
      /> */}
      {/* <Spacer size={100} vertical /> */}
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
  noTripsImage: {
    width: 275,
    height: 220,
  },
  noTripsText: {
    fontSize: 20,
    fontWeight: "bold",
    // color: Colors[colorScheme].textColors.default,
  },
  noTripsSubtitle: {
    fontSize: 13,
    // color: Colors[colorScheme].textColors.default,
  },
});
