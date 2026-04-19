import ItineraryHeader from '@/components/itinerary/ItineraryHeader';
import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripsContext';
import { useTheme } from '@react-navigation/native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, Pencil, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, StyleSheet, useColorScheme, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { uploadGroupCoverImage } from '@/utils/supabase/storage';
import TripDetailSkeleton from './components/TripDetailSkeleton';
import HotelsSection from '@/components/trips/HotelsSection';
import TripItineraryTab from './tabs/TripItineraryTab';
import TripOverviewTab from './tabs/TripOverviewTab';

import {
  ActivityTab,
  AvatarGroup,
  DateRange,
  HorizontalTabs,
  Spacer,
  Text,
} from '@/components';
import { Colors, textStyles } from '@/constants';

export default function TripDetailScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const { dark } = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { user } = useAuth();
  const { activeTrip, isLoading, updateTrip } = useTrips();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<string>('ideas');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  if (isLoading || !activeTrip) {
    return <TripDetailSkeleton insetTop={insets.top} />;
  }

  const coverUrl = activeTrip?.cover_image_url;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'We need camera roll permissions to select a profile image.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadTripCoverImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'We need camera permissions to take a photo.'
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
    }
  };

  const showImagePicker = () => {
    Alert.alert('Select Profile Image', 'Choose an option', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Photo Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const uploadTripCoverImage = async (imageUri: string) => {
    if (!activeTrip) return;
    try {
      const coverImageUrl = await uploadGroupCoverImage(
        activeTrip.id,
        imageUri
      );
      if (coverImageUrl) {
        await updateTrip(activeTrip.id, { cover_image_url: coverImageUrl });
      }
    } catch (err) {
      console.error('Failed to upload cover image:', err);
      Alert.alert(
        'Warning',
        'Failed to upload cover image. You can add it later.'
      );
    }
  };

  const dynamicStyles = StyleSheet.create({
    infoContainer: {
      borderColor: dark ? '#374151' : '#E9ECEF',
      maxWidth: 150,
    },
    infoText: {
      color: dark ? '#ADB5BD' : '#A8A8A8',
    },
    emptyText: {
      color: colors.textColors.subtle,
    },
    iconButton: {
      backgroundColor: colors.backgroundColors.subtle,
    },
    iconContentContainer: {
      top: 0 + insets.top,
      left: 0,
      right: 0,
    },
  });

  const isOwner = activeTrip.created_by === user?.id;
  const dropdownOptions = [
    ...(isOwner
      ? [
          {
            label: 'Edit Trip',
            onPress: () => router.push(`/(tabs)/(trips)/${tripId}/edit`),
            icon: Pencil,
          },
        ]
      : []),
    ...(isOwner
      ? [
          {
            label: 'Delete Trip',
            onPress: () => {},
            icon: Trash2,
            isDestructive: true,
          },
        ]
      : []),
  ];

  return (
    <View style={styles.container}>
      <ItineraryHeader
        scrollY={scrollY}
        imageUri={coverUrl || ''}
        title={activeTrip.name}
        isOwner={isOwner}
        onEdit={showImagePicker}
        showMoreOptions={true}
        dropdownOptions={dropdownOptions}
        hideFavorite={true}
        joinCode={activeTrip?.join_code ?? null}
      />

      <Animated.ScrollView
        style={[
          styles.container,
          { backgroundColor: dark ? '#000000' : '#ffffff' },
        ]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>
        <View style={{ height: 300 }}>
          {coverUrl ? (
            <Image
              source={{ uri: coverUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          ) : (
            <View
              style={[
                styles.heroPlaceholder,
                { backgroundColor: dark ? '#1c1c1e' : '#e5e7eb' },
              ]}>
              <MapPin
                size={48}
                strokeWidth={1.2}
                color={dark ? '#4b5563' : '#9ca3af'}
              />
            </View>
          )}
        </View>

        <View
          style={[
            styles.contentContainer,
            { backgroundColor: colors.backgroundColors.default },
          ]}>
          <Spacer size={24} vertical />

          <Text style={styles.tripTitle}>{activeTrip.name}</Text>

          <Spacer size={16} vertical />

          <View style={styles.locationTimeSpan}>
            <View style={[styles.infoContainer, dynamicStyles.infoContainer]}>
              <Text
                style={[styles.infoText, dynamicStyles.infoText]}
                numberOfLines={1}>
                📍 {activeTrip?.destination_label}
              </Text>
            </View>
            <View style={[styles.infoContainer, dynamicStyles.infoContainer]}>
              <DateRange
                startDate={activeTrip?.trip_details?.start_date ?? ''}
                endDate={activeTrip?.trip_details?.end_date ?? ''}
                emoji={true}
                color={dark ? '#ADB5BD' : '#A8A8A8'}
                fontSize={12}
              />
            </View>
          </View>

          <Spacer size={14} vertical />
          <Text
            style={[
              styles.description,
              !activeTrip?.description && { color: colors.textColors.subtle },
            ]}>
            {activeTrip?.description ||
              'No description provided for this trip.'}
          </Text>

          <Spacer size={14} vertical />
          {activeTrip?.group_members && activeTrip.group_members.length > 1 ? (
            <AvatarGroup
              members={activeTrip.group_members}
              maxVisible={4}
              size={30}
              overlap={12}
            />
          ) : (
            <View style={styles.soloBadge}>
              <Text style={styles.soloBadgeText}>Solo Trip</Text>
            </View>
          )}

          <Spacer size={32} vertical />

          <HorizontalTabs
            tabs={[
              { id: 'ideas', label: 'IDEAS' },
              { id: 'itinerary', label: 'ITINERARY' },
              { id: 'activity', label: 'ACTIVITY' },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          <Spacer size={24} vertical />

          {activeTab === 'ideas' && (
            <View style={styles.tabContent}>
              <TripOverviewTab trip={activeTrip} />
              <Spacer size={24} vertical />
              {/* <HotelsSection trip={activeTrip} onAdd={() => {}} />
              <Spacer size={14} vertical /> */}
            </View>
          )}
          {activeTab === 'itinerary' && <TripItineraryTab />}
          {activeTab === 'activity' && (
            <ActivityTab tripId={activeTrip.id} trip={activeTrip} />
          )}
          <Spacer size={100} vertical />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 12,
  },
  description: {
    ...textStyles.textBody14,
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
  // Tab content
  tabContent: {
    flex: 1,
  },

  // Skeleton
  locationTimeSpan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoContainer: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 99,
  },
  infoText: {
    ...textStyles.textBody14,
    fontSize: 12,
    lineHeight: 21,
  },
  tripTitle: {
    ...textStyles.textHeading24,
    fontSize: 20,
    fontFamily: 'BricolageGrotesque-Bold',
  },
  soloBadge: {
    backgroundColor: '#FF1F8C15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FF1F8C30',
  },
  soloBadgeText: {
    ...textStyles.textBody12,
    color: '#FF1F8C',
    fontWeight: '500',
    fontSize: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF1F8C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
});
