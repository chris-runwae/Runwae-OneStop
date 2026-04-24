import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { CalendarCheck, CheckCircle2, ClipboardList } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacer, Text } from "@/components";
import { Colors, textStyles } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase/client";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";

export default function ConfirmationScreen() {
  const {
    hotelName,
    hotelThumb,
    bookingRef,
    confirmationCode,
    checkin,
    checkout,
    hotelId,
    tripId,
  } = useLocalSearchParams<{
    hotelName: string;
    hotelThumb: string;
    bookingRef: string;
    confirmationCode: string;
    checkin: string;
    checkout: string;
    hotelId: string;
    tripId: string;
  }>();

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [addingToItinerary, setAddingToItinerary] = useState(false);
  const [addedToItinerary, setAddedToItinerary] = useState(false);

  const fmt = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleAddToItinerary = async () => {
    if (!tripId || !user) return;
    setAddingToItinerary(true);
    try {
      await supabase.from("itinerary_items").insert({
        group_id: tripId,
        added_by: user.id,
        type: "hotel",
        title: hotelName,
        external_id: hotelId,
        notes: `Check-in: ${checkin} · Check-out: ${checkout}`,
      });
      setAddedToItinerary(true);
    } catch (err) {
      console.error("Failed to add to itinerary:", err);
    } finally {
      setAddingToItinerary(false);
    }
  };

  const handleDone = () => {
    // Pop back to the trip screen
    router.dismissAll();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.backgroundColors.default },
      ]}>
      <View style={[styles.content, { paddingTop: insets.top + 24 }]}>
        {/* Success icon */}
        <View style={styles.iconWrap}>
          <CheckCircle2 size={56} color="#22C55E" strokeWidth={1.5} />
        </View>

        <Spacer size={16} vertical />
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={[styles.subtitle, { color: colors.textColors.subtle }]}>
          Your stay has been booked successfully.
        </Text>

        <Spacer size={28} vertical />

        {/* Hotel card */}
        <View
          style={[
            styles.hotelCard,
            { borderColor: colorScheme === "dark" ? "#374151" : "#E9ECEF" },
          ]}>
          <Image
            source={{ uri: hotelThumb || FALLBACK_IMAGE }}
            style={styles.hotelThumb}
            contentFit="cover"
          />
          <View style={styles.hotelInfo}>
            <Text style={styles.hotelName} numberOfLines={2}>
              {hotelName}
            </Text>

            <Spacer size={8} vertical />

            <View style={styles.detailRow}>
              <CalendarCheck size={13} color="#FF1F8C" />
              <Text style={[styles.detailText, { color: colors.textColors.subtle }]}>
                {fmt(checkin)} → {fmt(checkout)}
              </Text>
            </View>

            <Spacer size={6} vertical />

            <View style={styles.detailRow}>
              <ClipboardList size={13} color="#FF1F8C" />
              <Text style={[styles.detailText, { color: colors.textColors.subtle }]}>
                Ref: {bookingRef}
              </Text>
            </View>

            {confirmationCode ? (
              <>
                <Spacer size={4} vertical />
                <Text style={[styles.detailText, { color: colors.textColors.subtle, marginLeft: 17 }]}>
                  Hotel code: {confirmationCode}
                </Text>
              </>
            ) : null}
          </View>
        </View>

        <Spacer size={32} vertical />

        {/* Add to itinerary */}
        {tripId && !addedToItinerary && (
          <Pressable
            style={[
              styles.secondaryBtn,
              { borderColor: colorScheme === "dark" ? "#374151" : "#E9ECEF" },
              addingToItinerary && { opacity: 0.6 },
            ]}
            onPress={handleAddToItinerary}
            disabled={addingToItinerary}>
            {addingToItinerary ? (
              <ActivityIndicator color="#FF1F8C" />
            ) : (
              <Text style={styles.secondaryBtnText}>+ Add to Itinerary</Text>
            )}
          </Pressable>
        )}

        {addedToItinerary && (
          <View style={styles.addedBadge}>
            <CheckCircle2 size={14} color="#22C55E" />
            <Text style={styles.addedText}>Added to itinerary</Text>
          </View>
        )}

        <Spacer size={16} vertical />

        <Pressable style={styles.primaryBtn} onPress={handleDone}>
          <Text style={styles.primaryBtnText}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#22C55E15",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...textStyles.bold_20,
    fontSize: 24,
    textAlign: "center",
  },
  subtitle: {
    ...textStyles.regular_14,
    textAlign: "center",
    lineHeight: 22,
  },
  hotelCard: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  hotelThumb: {
    width: "100%",
    height: 140,
  },
  hotelInfo: {
    padding: 14,
  },
  hotelName: {
    ...textStyles.bold_20,
    fontSize: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  detailText: {
    ...textStyles.regular_14,
    fontSize: 12,
  },
  secondaryBtn: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#FF1F8C",
    fontWeight: "600",
    fontSize: 15,
  },
  addedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addedText: {
    color: "#22C55E",
    fontSize: 14,
    fontWeight: "600",
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: "#FF1F8C",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
