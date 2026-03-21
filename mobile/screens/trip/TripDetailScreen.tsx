import SkeletonBox from '@/components/ui/SkeletonBox';
import { useTrips } from '@/context/TripsContext';
import { useTheme } from '@react-navigation/native';
import { Image, ImageBackground } from 'expo-image';
import * as ImagePicker from "expo-image-picker";
import { router } from 'expo-router';
import { ChevronLeft, MapPin, Pencil } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import TripActivityTab from './tabs/TripActivityTab';
import TripItineraryTab from './tabs/TripItineraryTab';
import TripMembersTab from './tabs/TripMembersTab';
import TripOverviewTab from './tabs/TripOverviewTab';
import { uploadGroupCoverImage } from '@/utils/supabase/storage';
import { supabase } from '@/utils/supabase/client';

// ================================================================
// Constants
// ================================================================

const HERO_HEIGHT = 260;

const TABS = [
  { key: 'overview',   label: 'Overview'   },
  { key: 'itinerary', label: 'Itinerary'  },
  { key: 'activity',  label: 'Activity'   },
  { key: 'members',   label: 'Members'    },
] as const;

type TabKey = typeof TABS[number]['key'];

// ================================================================
// Loading skeleton
// ================================================================

function TripDetailSkeleton({ insetTop }: { insetTop: number }) {
  return (
    <View style={styles.container}>
      {/* Hero skeleton */}
      <SkeletonBox width={9999} height={HERO_HEIGHT} borderRadius={0} />

      {/* Padded area */}
      <View style={styles.skeletonBody}>
        <SkeletonBox width={200} height={24} borderRadius={6} />
        <View style={{ height: 8 }} />
        <SkeletonBox width={140} height={16} borderRadius={6} />
        <View style={{ height: 24 }} />
        <SkeletonBox width={9999} height={72} borderRadius={12} />
        <View style={{ height: 10 }} />
        <SkeletonBox width={9999} height={72} borderRadius={12} />
        <View style={{ height: 10 }} />
        <SkeletonBox width={9999} height={72} borderRadius={12} />
      </View>
    </View>
  );
}

// ================================================================
// TripDetailScreen
// ================================================================

export default function TripDetailScreen() {
  const { dark } = useTheme();
  const { activeTrip, isLoading } = useTrips();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // --- Loading state ---
  if (isLoading || !activeTrip) {
    return <TripDetailSkeleton insetTop={insets.top} />;
  }

  const coverUrl = activeTrip?.cover_image_url;

  //Image picker functions
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need camera roll permissions to select a profile image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadTripCoverImage(result.assets[0].uri);
      // setCoverImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need camera permissions to take a photo.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadTripCoverImage(result.assets[0].uri);
      // setCoverImage(result.assets[0].uri);
    }
  };

  const showImagePicker = () => {
    Alert.alert("Select Profile Image", "Choose an option", [
      { text: "Camera", onPress: takePhoto },
      { text: "Photo Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const uploadTripCoverImage = async (coverImage: string) => {
    let coverImageUrl: string | null = null;
      if (coverImage && activeTrip) {
        try {
          coverImageUrl = await uploadGroupCoverImage(activeTrip.id, coverImage);
        } catch (err) {
          console.error("Failed to upload cover image:", err);
          Alert.alert(
            "Warning",
            "Failed to upload cover image. You can add it later."
          );
        }

        // 3️⃣ Update the trip with cover URL
        if (coverImageUrl) {
          const { error: updateError } = await supabase
            .from("groups")
            .update({ cover_image_url: coverImageUrl })
            .eq("id", activeTrip.id);

          if (updateError) console.error(
            "Failed to update trip with cover image URL",
            updateError
          );
        }
      }
  };

  return (
    <View style={[styles.container, { backgroundColor: dark ? '#000000' : '#ffffff' }]}>
      {/* ── Hero ── */}
      <View style={[styles.hero, { height: HERO_HEIGHT + insets.top }]}>
        {coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            cachePolicy="none"
          />
        ) : (
          <View style={[styles.heroPlaceholder, { backgroundColor: dark ? '#1c1c1e' : '#e5e7eb' }]}>
            <MapPin size={48} strokeWidth={1.2} color={dark ? '#4b5563' : '#9ca3af'} />
          </View>
        )}

        {/* Bottom overlay for text readability */}
        <View style={styles.heroOverlay} />

        {/* Back button */}
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 12 }]}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={22} strokeWidth={2.5} color="#ffffff" />
        </TouchableOpacity>

        {/* {Edit image button} */}
        <TouchableOpacity
          style={[styles.editImageButton, { top: insets.top + 12 }]}
          onPress={showImagePicker}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Pencil size={22} strokeWidth={2.5} color="#ffffff" />
        </TouchableOpacity>

        {/* Trip name */}
        <View style={[styles.heroNameContainer, { bottom: 16 }]}>
          <Text style={styles.heroName} numberOfLines={2}>
            {activeTrip.name}
          </Text>
          {activeTrip.destination_label ? (
            <View style={styles.heroDestRow}>
              <MapPin size={13} strokeWidth={1.5} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroDestText} numberOfLines={1}>
                {activeTrip.destination_label}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* ── Tab Bar ── */}
      <View style={[styles.tabBar, { borderBottomColor: dark ? '#2c2c2e' : '#e5e7eb', backgroundColor: dark ? '#000000' : '#ffffff' }]}>
        {TABS.map(({ key, label }) => {
          const isActive = activeTab === key;
          return (
            <TouchableOpacity
              key={key}
              style={styles.tabItem}
              onPress={() => setActiveTab(key)}
            >
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive
                      ? '#FF1F8C'
                      : (dark ? '#6b7280' : '#9ca3af'),
                    fontWeight: isActive ? '600' : '400',
                  },
                ]}
              >
                {label}
              </Text>
              {isActive && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Tab Content ── */}
      <View style={styles.tabContent}>
        {activeTab === 'overview'   && <TripOverviewTab   trip={activeTrip} />}
        {activeTab === 'itinerary'  && <TripItineraryTab  />}
        {activeTab === 'activity'   && <TripActivityTab   />}
        {activeTab === 'members'    && <TripMembersTab    trip={activeTrip} />}
      </View>
    </View>
  );
}

// ================================================================
// Styles
// ================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Hero
  hero: {
    width: '100%',
    overflow: 'hidden',
  },
  heroPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editImageButton: {
    position: 'absolute',
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroNameContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    gap: 4,
  },
  heroName: {
    color: '#ffffff',
    fontSize: 24,
    fontFamily: 'BricolageGrotesque-Bold',
    lineHeight: 30,
  },
  heroDestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroDestText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    flex: 1,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 13,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FF1F8C',
  },

  // Tab content
  tabContent: {
    flex: 1,
  },

  // Skeleton
  skeletonBody: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
});
