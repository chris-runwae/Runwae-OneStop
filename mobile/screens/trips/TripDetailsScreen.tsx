import { View, StyleSheet, Alert, Pressable, TextStyle } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ImageBackground } from 'expo-image';

import { AvatarGroup, Spacer, Text } from '@/components';
import { useTrips } from '@/context/TripsContext';
import { useAuth } from '@/context/AuthContext';
import { Colors, textStyles } from '@/constants';

type Segment = "DISCOVER" | "SAVED" | "ITINERARY" | "ACTIVITY";

const SEGMENTS: Segment[] = ["DISCOVER", "SAVED", "ITINERARY", "ACTIVITY"];

const EMPTY_CONTENT: Record<Segment, { header: string; subtext: string }> = {
  DISCOVER: {
    header: "Nothing to discover yet!",
    subtext: "Add a destination to get started.",
  },
  SAVED: {
    header: "Nothing saved yet!",
    subtext: "Save destinations to your trip.",
  },
  ITINERARY: {
    header: "Nothing in your itinerary yet!",
    subtext: "Add activities to your itinerary.",
  },
  ACTIVITY: {
    header: "Nothing in your activity yet!",
    subtext: "Add activities to your trip.",
  },
};

export default function TripDetailScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { activeTrip, loadTrip, deleteTrip, leaveTrip, isLoading } = useTrips();
  const [selectedSegment, setSelectedSegment] = useState<Segment>('DISCOVER');
  useEffect(() => {
    loadTrip(tripId);
  }, [tripId, loadTrip]);

  // const isOwner = activeTrip?.owner_id === user?.id;

  // const handleDelete = () => {
  //   Alert.alert('Delete Trip', 'This will permanently delete the trip for everyone.', [
  //     { text: 'Cancel', style: 'cancel' },
  //     {
  //       text: 'Delete',
  //       style: 'destructive',
  //       onPress: async () => {
  //         await deleteTrip(tripId);
  //         router.back();
  //       },
  //     },
  //   ]);
  // };

  // const handleLeave = () => {
  //   Alert.alert('Leave Trip', 'You will lose access to this trip.', [
  //     { text: 'Cancel', style: 'cancel' },
  //     {
  //       text: 'Leave',
  //       style: 'destructive',
  //       onPress: async () => {
  //         await leaveTrip(tripId);
  //         router.back();
  //       },
  //     },
  //   ]);
  // };

  if (isLoading || !activeTrip) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const details = activeTrip.trip_details;
  
  const getSegmentStyle = (segment: Segment): TextStyle => ({
    ...styles.segmentedControlText,
    color: selectedSegment === segment ? Colors.light.primary : Colors.light.text,
    borderBottomWidth: selectedSegment === segment ? 2 : 0,
    borderBottomColor:
      selectedSegment === segment ? Colors.light.primary : Colors.light.borderDefault,
  });


  return (
    <View style={styles.container}>
      <ImageBackground 
        source={activeTrip?.cover_image_url ? { uri: activeTrip?.cover_image_url } : undefined} 
        style={styles.backgroundImage}
        contentFit="cover"
      >
        <View style={[styles.header, { paddingTop: insets.top + 24 }] }>
          <Text style={styles.title}>{activeTrip?.name}</Text>
        </View>
      </ImageBackground>


      <View style={styles.content}>
        <Spacer size={16} vertical />
        <Text style={styles.title}>{activeTrip?.name}</Text>
        <Spacer size={8} vertical />

        <View style={styles.infoButtonContainer}>
          <Pressable onPress={() => router.push(`/(tabs)/(trips)/${activeTrip?.id}/add-destination`)} style={styles.infoButton}>
            <Text style={styles.infoButtonText}>{`📍 ${details?.destination_label ?? 'Add Destination'}`}</Text>
          </Pressable>

          <Pressable onPress={() => router.push(`/(tabs)/(trips)/${activeTrip?.id}/add-duration`)} style={styles.infoButton}>
            <Text style={styles.infoButtonText}>{`🗓️ ${details?.start_date ?? 'Add a  trip duration'}`}</Text>
          </Pressable>
        </View>

        <Spacer size={12} vertical />
        <Text style={styles.description}>{activeTrip?.description}</Text>

        <Spacer size={8} vertical />
        <AvatarGroup members={activeTrip?.group_members ?? []} size={24} overlap={6} />

        <Spacer size={40} vertical />
        
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
        <Spacer size={4} vertical /> 
        {/* For the divider - Unsure on if this should stay in design */}
        <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backgroundImage: {
    height: 350,
    width: "100%",
  },
  content: {
    // flex: 1,
    paddingHorizontal: 16,
    
  },
  header: {
    padding: 16,
  },
  title: {
    ...textStyles.textHeading16,
  },
  description: {
    ...textStyles.textBody12,
  },
  infoButtonContainer: {
    alignSelf: 'flex-start',  // 👈 important
    flexDirection: 'row',
    gap: 8,
  },
  
  infoButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.borderDefault,
    alignSelf: 'flex-start',  // 👈 makes it size to content
  },
  infoButtonText: {
    ...textStyles.textBody12,
    color: Colors.light.textSubtitle,
  },

  //SEGMENTED CONTROL
  segmentedControlContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  segmentedControlText: {
    ...textStyles.textBody12,
    fontSize: 14,
    paddingBottom: 8,
  },
  divider: {
    height: 4,
    backgroundColor: Colors.light.borderDefault,
  }
});