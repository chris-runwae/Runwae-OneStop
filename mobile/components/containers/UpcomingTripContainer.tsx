import { StyleSheet, View, useColorScheme } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { router, RelativePathString } from "expo-router";

import useTrips from "@/hooks/useTrips";
import {
  PrimaryButton,
  SectionHeader,
  Spacer,
  Text,
  ExpandLinkProps,
  WideTripCard,
} from "@/components";
import { Colors } from "@/constants";

const UpcomingTripContainer = ({ linkText, linkTo }: ExpandLinkProps) => {
  const { nextTrip } = useTrips();
  const colorScheme = useColorScheme() ?? "light";

  const styles = StyleSheet.create({
    noActiveTripCard: {
      height: 265,
      width: "100%",
      overflow: "hidden",
      borderRadius: 12,
      backgroundColor: Colors[colorScheme].backgroundColors.subtle,
      alignItems: "center",
      paddingTop: 22,
      paddingBottom: 12,
    },
    noActiveTripCardHeader: {
      fontSize: 20,
      fontWeight: "bold",
      color: Colors[colorScheme].textColors.default,
    },
    noActiveTripCardSubtitle: {
      fontSize: 13,
      color: Colors[colorScheme].textColors.default,
    },
    noActiveTripCardImage: {
      width: 117,
      height: 94,
      resizeMode: "cover",
    },
    noActiveTripCardContent: {
      alignItems: "center",
    },
  });

  const NoActiveTripCard = () => {
    return (
      <View style={styles.noActiveTripCard}>
        <Image
          source={require("@/assets/images/noActiveTrip.png")}
          style={styles.noActiveTripCardImage}
        />
        <Spacer size={32} vertical />
        <View style={styles.noActiveTripCardContent}>
          <Text style={styles.noActiveTripCardHeader}>No active trip</Text>
          <Text style={styles.noActiveTripCardSubtitle}>
            Click on the button below to create a new trip
          </Text>
          <Spacer size={12} vertical />
          <PrimaryButton
            title="Create Trip"
            onPress={() => {
              router.push("/(tabs)/trip" as RelativePathString);
            }}
          />
        </View>
      </View>
    );
  };

  if (!nextTrip) {
    return <NoActiveTripCard />;
  }

  return (
    <View>
      <SectionHeader
        title="Upcoming Trip"
        linkText={linkText}
        linkTo={linkTo}
      />
      <WideTripCard data={nextTrip} />
    </View>
  );
};

export default UpcomingTripContainer;
