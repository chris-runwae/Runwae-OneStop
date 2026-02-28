import { ScrollView, StyleSheet, TextStyle, View,} from "react-native";
import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { Spacer, Text, UserTripCard } from "@/components";
import { Colors } from "@/constants";
import { FlashList } from "@shopify/flash-list";
import { useTrips } from "@/context/TripsContext";

const EmptyImage = require("@/assets/svgs/empty-trip.svg");

type Segment = "Active" | "Saved" | "Past";

const SEGMENTS: Segment[] = ["Active", "Saved", "Past"];

const EMPTY_CONTENT: Record<Segment, { header: string; subtext: string }> = {
  Active: {
    header: "No active trips!",
    subtext: "Tap the + below to start planning your next adventure!",
  },
  Saved: {
    header: "No saved trips!",
    subtext: "Start browsing for destinations and add them here!",
  },
  Past: {
    header: "No past trips!",
    subtext: "Your completed adventures will show up here. Start planning your next journey!",
  },
};

const TripsIndexScreen = () => {
  const insets = useSafeAreaInsets();
  const { myTrips, joinedTrips, isLoading, refreshMyTrips } = useTrips();
  const [selectedSegment, setSelectedSegment] = useState<Segment>('Active');

  // Combine and derive — no separate fetches needed
  const allTrips = [...myTrips, ...joinedTrips];

  const now = new Date().toISOString().split('T')[0];

  const filteredTrips = allTrips.filter(trip => {
    const end = trip.trip_details?.end_date;
    if (selectedSegment === 'Active') return !end || end >= now;
    if (selectedSegment === 'Past') return !!end && end < now;
    return false; // Saved — implement saved/bookmarked logic later
  });

  const { header, subtext } = EMPTY_CONTENT[selectedSegment];

  const getSegmentStyle = (segment: Segment): TextStyle => ({
    ...styles.segmentedControlText,
    color: selectedSegment === segment ? Colors.light.primary : Colors.light.text,
    borderBottomWidth: selectedSegment === segment ? 2 : 1,
    borderBottomColor:
      selectedSegment === segment ? Colors.light.primary : Colors.light.borderDefault,
  });

  const EmptyContent = () => {
    return (
      <View style={styles.emptyContainer}>
          <Image source={EmptyImage} style={styles.emptyImage} contentFit="contain" />
          <Spacer size={32} vertical />
          <Text style={styles.emptyTitle}>{header}</Text>
          <Spacer size={6} vertical />
          <Text style={styles.emptySubtext}>{subtext}</Text>
        </View>
    );
  };

  return (
    <>
      <View style={[
        styles.headerContainer, 
        { paddingTop: insets.top }
        ]}>
        <Spacer size={12} vertical />
        <View style={styles.header}>
          <Text style={styles.title}>Trips</Text>
        </View>
        <Spacer size={12} vertical />
        <View style={styles.segmentedControlContainer}>
          {SEGMENTS.map((segment) => (
            <Text
              key={segment}
              style={getSegmentStyle(segment)}
              onPress={() => setSelectedSegment(segment)}
            >
              {segment}
            </Text>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flex: 1 }}
        contentInsetAdjustmentBehavior="never"
      >
        <Spacer size={16} vertical />
          <FlashList
            data={filteredTrips}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => <UserTripCard trip={item} />}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            refreshing={isLoading}
            onRefresh={refreshMyTrips}
            ListEmptyComponent={<EmptyContent />}
            ItemSeparatorComponent={() => <Spacer size={16} vertical />}
            ListFooterComponent={() => <Spacer size={160} vertical />}
          />
      </ScrollView>
    </>
  );
};

export default TripsIndexScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContainer: {
    paddingHorizontal: 16,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  segmentedControlContainer: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "50%",
  },
  segmentedControlText: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  emptyContainer: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyImage: {
    width: 150,
    height: 150,
    alignSelf: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.textHeading,
  },
  emptySubtext: {
    fontSize: 12,
    color: Colors.light.textBody,
    textAlign: "center",
    maxWidth: 256,
  },

  tripCard: { marginHorizontal: 16, marginVertical: 8, padding: 16, borderRadius: 12, backgroundColor: Colors.light.borderDefault, borderWidth: 1, borderColor: Colors.light.borderDefault },
  tripName: { fontSize: 16, fontWeight: '600' },
  tripDestination: { fontSize: 13, color: Colors.light.textBody, marginTop: 4 },
});
