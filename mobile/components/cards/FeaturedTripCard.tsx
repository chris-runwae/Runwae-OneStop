import { BlurView } from "expo-blur";
import { ImageBackground } from "expo-image";
import { MapPin, MoveUpRight } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, View, useColorScheme } from "react-native";

import { Spacer, Text } from "@/components";

import { Colors } from "@/constants";
import { FeaturedTrip } from "@/types/trips.types";

interface FeaturedItemsCardProps {
  data: FeaturedTrip;
}

const FeaturedItemsCard = ({ data }: FeaturedItemsCardProps) => {
  const colorScheme = useColorScheme() ?? "light";

  const { title, destination, coverImageUrl } = data;
  const image =
    coverImageUrl ??
    "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80";

  const styles = StyleSheet.create({
    blurView: {
      width: "100%",
      justifyContent: "center",
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderRadius: 8,
      overflow: "hidden",
    },
    destinationContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    imageContainer: {
      width: "100%",
      height: 370,
      borderRadius: 16,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingBottom: 12,
      paddingHorizontal: 12,
    },

    linkContainer: {
      backgroundColor: Colors[colorScheme].white,
      position: "absolute",
      top: 0,
      right: 0,
      height: 60,
      aspectRatio: 1,
      borderBottomLeftRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },

    //Text Styles
    title: {
      color: Colors[colorScheme].white,
      fontSize: 24,
      fontWeight: "bold",
    },
    subtitle: {
      color: Colors[colorScheme].white,
      fontSize: 16,
      fontWeight: "normal",
    },
  });

  const LinkArrow = () => {
    return (
      <Pressable onPress={() => {}} style={styles.linkContainer}>
        <MoveUpRight
          size={20}
          color={Colors[colorScheme].primaryColors.default}
        />
      </Pressable>
    );
  };

  return (
    <ImageBackground
      source={image}
      style={styles.imageContainer}
      contentFit="cover"
    >
      <LinkArrow />
      <BlurView intensity={13} style={styles.blurView}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Spacer size={4} vertical />
        <View style={styles.destinationContainer}>
          <MapPin size={16} color="white" />
          <Text style={styles.subtitle}>{destination}</Text>
        </View>
        {/* This should be dynamic */}
        <Text style={styles.subtitle}>April 15 - May 15, 2026</Text>
      </BlurView>
    </ImageBackground>
  );
};

export default FeaturedItemsCard;
