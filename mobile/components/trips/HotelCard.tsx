import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Star, Wifi, Utensils, Waves } from "lucide-react-native";
import React from "react";
import {
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

import { Spacer, Text } from "@/components";
import { Colors, textStyles } from "@/constants";
import type { HotelSummary } from "@/types/hotel.types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi size={12} color="#fff" />,
  breakfast: <Utensils size={12} color="#fff" />,
  pool: <Waves size={12} color="#fff" />,
};

function amenityIcon(tag: string) {
  const lower = tag.toLowerCase();
  if (lower.includes("wifi") || lower.includes("internet"))
    return AMENITY_ICONS.wifi;
  if (lower.includes("breakfast") || lower.includes("restaurant"))
    return AMENITY_ICONS.breakfast;
  if (lower.includes("pool") || lower.includes("swim"))
    return AMENITY_ICONS.pool;
  return null;
}

interface Props {
  hotel: HotelSummary;
  tripId: string;
  checkin: string;
  checkout: string;
  adults: number;
}

export default function HotelCard({
  hotel,
  tripId,
  checkin,
  checkout,
  adults,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const visibleAmenityIcons = (hotel.amenities ?? [])
    .map(amenityIcon)
    .filter(Boolean)
    .slice(0, 3);

  const handleBook = () => {
    router.push({
      pathname: "/hotel/[hotelId]",
      params: { hotelId: hotel.hotelId, tripId, checkin, checkout, adults },
    });
  };

  return (
    <Pressable style={styles.card} onPress={handleBook}>
      <ImageBackground
        source={{ uri: hotel.thumbnail || FALLBACK_IMAGE }}
        style={styles.image}
        contentFit="cover">
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.72)"]}
          style={StyleSheet.absoluteFill}
        />

        {/* Amenity icons */}
        {visibleAmenityIcons.length > 0 && (
          <View style={styles.amenityRow}>
            {visibleAmenityIcons.map((icon, i) => (
              <View key={i} style={styles.amenityChip}>
                {icon}
              </View>
            ))}
          </View>
        )}

        {/* Rating badge */}
        <View style={styles.ratingBadge}>
          <Star size={10} color="#FFD700" fill="#FFD700" />
          <Text style={styles.ratingText}>
            {hotel.rating > 0 ? hotel.rating.toFixed(1) : "—"}
          </Text>
        </View>
      </ImageBackground>

      <View style={[styles.info, { backgroundColor: colors.backgroundColors.default }]}>
        <Text style={styles.name} numberOfLines={1}>
          {hotel.name}
        </Text>
        <Text style={[styles.address, { color: colors.textColors.subtle }]} numberOfLines={1}>
          {hotel.address}
        </Text>

        <Spacer size={12} vertical />

        <View style={styles.footer}>
          <View>
            <Text style={[styles.from, { color: colors.textColors.subtle }]}>
              from
            </Text>
            <Text style={styles.price}>
              {hotel.currency} {hotel.minRate > 0 ? hotel.minRate.toFixed(0) : "—"}
              <Text style={[styles.perNight, { color: colors.textColors.subtle }]}>
                {" "}
                / night
              </Text>
            </Text>
          </View>

          <Pressable style={styles.bookButton} onPress={handleBook}>
            <Text style={styles.bookButtonText}>Book</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    height: 180,
    justifyContent: "flex-end",
  },
  amenityRow: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    gap: 6,
  },
  amenityChip: {
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 20,
    padding: 5,
  },
  ratingBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  info: {
    padding: 12,
  },
  name: {
    ...textStyles.bold_20,
    fontSize: 15,
  },
  address: {
    ...textStyles.regular_14,
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  from: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  price: {
    ...textStyles.bold_20,
    fontSize: 16,
    color: "#FF1F8C",
  },
  perNight: {
    fontSize: 12,
    fontWeight: "400",
  },
  bookButton: {
    backgroundColor: "#FF1F8C",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
