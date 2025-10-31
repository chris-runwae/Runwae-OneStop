import {
  StyleSheet,
  useColorScheme,
  View,
  ImageBackground,
  Pressable,
} from "react-native";
import React from "react";

import { Text } from "@/components";
import { Colors } from "@/constants/theme";
import { Trip } from "@/types/trips.types";

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

  const coverImageUrl =
    trip?.cover_image_url ??
    "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80";

  // const { title, start_date, end_date, duration, image } = data;
  // console.log(trip.cover_image_url);

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
      justifyContent: "flex-end",
    },

    imageContainer: {
      width: "100%",
      height: 185,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    contentContainer: {
      paddingHorizontal: 12,
    },

    infoContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      justifyContent: "space-between",
      paddingBottom: 16,
    },
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 16,
    },

    //Text Styles
    title: {
      fontSize: 18,
      fontWeight: "600",
      lineHeight: 24,
      color: colors.white,
    },
    infoText: {
      fontSize: 12,
      fontWeight: "400",
      lineHeight: 16.5,
      color: colors.white,
    },
  });

  return (
    <ImageBackground source={{ uri: coverImageUrl }} style={styles.container}>
      <Pressable onPress={() => {}} style={styles.cardContent}>
        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{trip.title}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>{trip?.visibility}</Text>
            {/* <DateRange startDate={startDate} endDate={endDate} /> */}
          </View>
        </View>
      </Pressable>
    </ImageBackground>
  );
};

export default WideTripCard;

const styles = StyleSheet.create({});
