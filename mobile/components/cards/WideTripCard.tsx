import {
  StyleSheet,
  useColorScheme,
  View,
  ImageBackground,
  Pressable,
} from "react-native";
import React from "react";

import { DateRange, Text } from "@/components";
import { Colors } from "@/constants/theme";
import { Trip } from "@/types/trips.types";
import { toSentenceCase } from "@/utils/stringManipulation";

interface WideTripCardProps {
  data: Trip[] | null;
}

const WideTripCard = ({ data }: WideTripCardProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  if (!data) {
    return null;
  }
  const trip: Trip = data[0] as Trip;
  if (!trip) {
    return null;
  }

  const coverImageUrl =
    trip?.cover_image_url ??
    "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80";

  const styles = StyleSheet.create({
    container: {
      height: 260,
      width: "100%",
      overflow: "hidden",
      borderRadius: 12,
    },
    cardContent: {
      flex: 1,
      backgroundColor: colors.imageOverlay,
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 12,
    },
    contentContainer: {},
    infoContainer: {
      width: "100%",
      height: 50,
      justifyContent: "center",
    },
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 16,
    },
    pillContainer: {
      backgroundColor: "#000000A6",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },

    //Text Styles
    title: {
      fontSize: 20,
      fontWeight: "bold",
      lineHeight: 24,
      color: colors.white,
    },
    infoText: {
      fontSize: 13,
      fontWeight: "400",
      lineHeight: 19.5,
      color: colors.white,
    },
    pillText: {
      fontSize: 12,
      fontWeight: "bold",
      lineHeight: 16,
      color: colors.white,
    },
  });

  return (
    <ImageBackground source={{ uri: coverImageUrl }} style={styles.container}>
      <Pressable onPress={() => {}} style={styles.cardContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{trip.title}</Text>
          <View style={styles.pillContainer}>
            <Text style={styles.pillText}>
              {toSentenceCase(trip.category ?? "")}
            </Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>📍 {trip.destination}</Text>
          <DateRange
            startDate={trip?.start_date ?? ""}
            endDate={trip?.end_date ?? ""}
            emoji={true}
          />
        </View>
      </Pressable>
    </ImageBackground>
  );
};

export default WideTripCard;
