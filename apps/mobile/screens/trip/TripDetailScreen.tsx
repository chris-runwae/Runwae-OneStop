import ItineraryHeader from '@/components/itinerary/ItineraryHeader';
import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripsContext';
import { useTheme } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Copy, LogOut, MapPin, Pencil, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTripDetailActions } from '@/hooks/useTripDetailActions';
import { useCloneTrip } from '@/hooks/useTripActions';
import TripDetailSkeleton from './components/TripDetailSkeleton';
import TripItineraryTab from './tabs/TripItineraryTab';
import TripOverviewTab from './tabs/TripOverviewTab';

import {
  ActivityTab,
  AvatarGroup,
  DateRange,
  HorizontalTabs,
  ProfileAvatar,
  Spacer,
  Text,
} from '@/components';
import { AppFonts, COLORS, Colors, textStyles } from '@/constants';

export default function TripDetailScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const { dark } = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { user } = useAuth();
  const { activeTrip, activeTripMembers, isLoading, loadTrip } = useTrips();
  const cloneTripMut = useCloneTrip();
  const {
    isJoining,
    handleJoinTrip,
    handleLeaveTrip,
    handleDeleteTrip,
    showImagePicker,
  } = useTripDetailActions(tripId);
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<string>('ideas');
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  if (isLoading || !activeTrip) {
    return <TripDetailSkeleton insetTop={insets.top} />;
  }

  const coverUrl = activeTrip?.coverImageUrl;

  const dynamicStyles = StyleSheet.create({
    infoContainer: {
      borderColor: dark ? '#374151' : '#E9ECEF',
      maxWidth: 150,
    },
    soloBadge: {
      backgroundColor: dark ? 'rgba(255, 31, 140, 0.1)' : '#FDF2F8',
      borderColor: dark ? 'rgba(255, 31, 140, 0.2)' : '#FCE7F3',
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

  const isOwner = (activeTrip.creatorId as unknown as string) === user?.id;
  const isMember = activeTripMembers.some(
    (m) => (m.user?._id as unknown as string) === user?.id,
  );
  const isPublic = activeTrip.visibility === 'public';
  const isSolo = isOwner && activeTripMembers.length === 1;

  const creator = activeTripMembers.find((m) => m.role === 'owner');

  const handleCloneTrip = async () => {
    if (!activeTrip) return;
    try {
      const newTripId = await cloneTripMut({
        tripId: activeTrip._id,
      });
      Alert.alert('Trip cloned', 'A copy has been added to your trips.');
      loadTrip(newTripId as unknown as string);
      router.replace(`/(tabs)/(trips)/${newTripId}` as any);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to clone trip';
      Alert.alert('Clone failed', msg);
    }
  };

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
    {
      label: 'Clone Trip',
      onPress: handleCloneTrip,
      icon: Copy,
    },
    ...(isOwner
      ? [
          {
            label: 'Delete Trip',
            onPress: handleDeleteTrip,
            icon: Trash2,
            isDestructive: true,
          },
        ]
      : []),
    ...(!isOwner && isMember
      ? [
          {
            label: 'Leave Trip',
            onPress: handleLeaveTrip,
            icon: LogOut,
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
        title={activeTrip.title}
        isOwner={isOwner}
        isMember={isMember}
        onEdit={showImagePicker}
        showMoreOptions={true}
        dropdownOptions={dropdownOptions}
        hideFavorite={true}
        joinCode={activeTrip.joinCode ?? null}
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

          <Text style={styles.tripTitle}>{activeTrip.title}</Text>

          <Spacer size={16} vertical />

          <View style={styles.locationTimeSpan}>
            <View style={[styles.infoContainer, dynamicStyles.infoContainer]}>
              <Text
                style={[styles.infoText, dynamicStyles.infoText]}
                numberOfLines={1}>
                📍 {activeTrip.destinationLabel}
              </Text>
            </View>
            <View style={[styles.infoContainer, dynamicStyles.infoContainer]}>
              <DateRange
                startDate={activeTrip.startDate}
                endDate={activeTrip.endDate}
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
          <View style={styles.membershipRow}>
            {activeTripMembers.length > 1 ? (
              <AvatarGroup
                members={activeTripMembers}
                maxVisible={4}
                size={30}
                overlap={12}
              />
            ) : (
              <View style={styles.creatorInfo}>
                <ProfileAvatar
                  name={creator?.user?.name || 'User'}
                  imageUrl={creator?.user?.avatarUrl ?? creator?.user?.image}
                  size={32}
                />
                <Spacer size={8} horizontal />
                <View>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.creatorName}>
                    {creator?.user?.name || 'Guest'}
                    {isOwner ? ' (You)' : ''}
                  </Text>
                  <Text style={styles.createdByLabel}>Created by</Text>
                </View>
              </View>
            )}

            <View style={styles.actionArea}>
              {isSolo && (
                <View style={[styles.soloBadge, dynamicStyles.soloBadge]}>
                  <Text style={styles.soloBadgeText}>Solo Trip</Text>
                </View>
              )}
              {!isMember && (
                <TouchableOpacity
                  style={[
                    styles.soloBadge,
                    { backgroundColor: '#FF2E92', borderColor: '#FF2E92' },
                  ]}
                  onPress={handleJoinTrip}
                  disabled={isJoining}
                  activeOpacity={0.8}>
                  <Text style={[styles.soloBadgeText, { color: '#ffffff' }]}>
                    {isJoining ? 'Joining...' : 'Join Trip'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

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

          {activeTab === 'ideas' && (isMember || isPublic) && (
            <View style={styles.tabContent}>
              <TripOverviewTab trip={activeTrip} isMember={isMember} />
              <Spacer size={24} vertical />
            </View>
          )}
          {activeTab === 'itinerary' && (isMember || isPublic) && (
            <TripItineraryTab isMember={isMember} />
          )}
          {activeTab === 'activity' && (isMember || isPublic) && (
            <ActivityTab
              tripId={activeTrip._id as unknown as string}
              trip={activeTrip}
              isMember={isMember}
            />
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
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createdByLabel: {
    fontSize: 10,
    fontFamily: AppFonts.inter.medium,
    color: COLORS.gray[500],
    letterSpacing: 0.5,
  },
  creatorName: {
    fontSize: 14,
    maxWidth: 150,
    fontFamily: AppFonts.inter.semiBold,
  },
  membershipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  joinTripFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 20,
  },
  joinTripButton: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF2E92',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  joinTripButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: AppFonts.inter.bold,
  },
  inlineJoinButton: {
    marginTop: 20,
    height: 40,
    paddingHorizontal: 24,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    shadowColor: '#FF2E92',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  soloBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  soloBadgeText: {
    color: '#FF1F8C',
    fontSize: 10,
    fontFamily: AppFonts.inter.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
