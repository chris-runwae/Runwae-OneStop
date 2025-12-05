import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
// import BottomSheet from '@gorhom/bottom-sheet';
import * as Clipboard from 'expo-clipboard';
import Share, { ShareOptions } from 'react-native-share';

import {
  DateRange,
  HomeScreenSkeleton,
  Spacer,
  Text,
  TripDiscoverySection,
} from '@/components';
import { AvatarGroup } from '@/components/ui/AvatarGroup';
import { HorizontalTabs } from '@/components/ui/HorizontalTabs';
import useTrips from '@/hooks/useTrips';
import { Trip, TripAttendee } from '@/types/trips.types';
import { ArrowLeftIcon, ForwardIcon, Menu } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/utils/styles';
import { TripItinerary } from '@/components/containers/TripItinerary';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TripsDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const {
    fetchTripById,
    loading: tripLoading,
    fetchTripAttendees,
  } = useTrips();
  const insets = useSafeAreaInsets();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const HEADER_HEIGHT = 350;
  const TRANSITION_START = 100; // Start transitioning early when text approaches top
  const TRANSITION_END = 250; // Complete transition at 250px
  const TRANSITION_RANGE = TRANSITION_END - TRANSITION_START; // 150px smooth transition window

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, opacity: number): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [attendees, setAttendees] = useState<TripAttendee[]>([]);
  const [activeTab, setActiveTab] = useState<string>('discover');

  const bottomSheetRef = useRef<BottomSheet>(null);

  const fetchTrip = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchTripById(id as string);
      if (result && !Array.isArray(result)) {
        setTrip(result as Trip);
      } else if (Array.isArray(result)) {
        setTrip(result[0] as Trip);
      }
    } catch (error) {
      console.log('Error fetching trip: ', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  useEffect(() => {
    fetchAttendees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip]);

  const join_code = trip?.join_code ?? '';

  const fetchAttendees = useCallback(async () => {
    try {
      setLoading(true);
      if (!trip?.id) return;
      const result = await fetchTripAttendees(trip?.id);
      if (result) {
        setAttendees(result as TripAttendee[]);
      }
    } catch (error) {
      console.log('Error fetching attendees: ', error);
    } finally {
      setLoading(false);
    }
  }, [trip?.id, fetchTripAttendees]);

  // Animated styles for large header - must be called before early return
  const largeHeaderAnimatedStyle = useAnimatedStyle(() => {
    // Calculate progress: 0 when scroll < TRANSITION_START, 1 when scroll >= TRANSITION_END
    const scrollValue = scrollOffset.value;
    const progress =
      scrollValue < TRANSITION_START
        ? 0
        : scrollValue > TRANSITION_END
          ? 1
          : (scrollValue - TRANSITION_START) / TRANSITION_RANGE;

    const headerHeight = interpolate(
      progress,
      [0, 1],
      [HEADER_HEIGHT, 0],
      'clamp'
    );
    const opacity = interpolate(
      progress,
      [0, 0.3, 0.7, 1],
      [1, 0.8, 0.3, 0],
      'clamp'
    );
    const translateY = interpolate(
      progress,
      [0, 1],
      [0, -HEADER_HEIGHT / 2],
      'clamp'
    );

    return {
      height: headerHeight,
      opacity,
      transform: [{ translateY }],
    };
  });

  // Animated styles for compact header
  const compactHeaderAnimatedStyle = useAnimatedStyle(() => {
    // Calculate progress: 0 when scroll < TRANSITION_START, 1 when scroll >= TRANSITION_END
    const scrollValue = scrollOffset.value;
    const progress =
      scrollValue < TRANSITION_START
        ? 0
        : scrollValue > TRANSITION_END
          ? 1
          : (scrollValue - TRANSITION_START) / TRANSITION_RANGE;

    // Make it visible - ensure it shows up as soon as transition starts
    const opacity = interpolate(
      progress,
      [0, 0.2, 0.6, 1],
      [0, 0.6, 0.95, 1],
      'clamp'
    );
    const translateY = interpolate(progress, [0, 1], [-10, 0], 'clamp');

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const dynamicStyles = StyleSheet.create({
    infoContainer: {
      borderColor: colors.borderColors.default,
      maxWidth: 200,
    },
    emptyText: {
      color: colors.textColors.subtle,
    },
    iconButton: {
      backgroundColor: colors.backgroundColors.subtle,
    },
    iconContentContainer: {
      // position: 'absolute',
      top: 0 + insets.top,
      left: 0,
      right: 0,
      // bottom: 0,
      // paddingTop: insets.top + 12,
    },
  });

  const parseDestination = (destination: string | undefined) => {
    if (!destination) return { city: '', countryCode: '' };

    const parts = destination.split(',');
    const countryCode = parts.pop()?.trim() ?? ''; // last section after comma
    const city = parts.join(',').trim(); // everything before the last comma

    return { city, countryCode };
  };

  const { city, countryCode } = parseDestination(trip?.destination);

  const dummyAttendees: TripAttendee[] = [
    {
      id: '1',
      trip_id: '09e7a393-3919-46cb-b16e-5ee45410abc1',
      user_id: 'user_33wEUdT7FLSOj95DSJfpZYM2cKi',
      role: 'owner',
      name: 'Christopher',
      profile_photo_url: 'https://i.pravatar.cc/150?img=1',
      inserted_at: '2025-11-22T20:00:00Z',
      updated_at: '2025-11-22T20:00:00Z',
    },
    {
      id: '2',
      trip_id: '09e7a393-3919-46cb-b16e-5ee45410abc1',
      user_id: 'user_2',
      role: 'admin',
      name: 'Alice',
      profile_photo_url: null,
      inserted_at: '2025-11-22T20:01:00Z',
      updated_at: '2025-11-22T20:01:00Z',
    },
    {
      id: '3',
      trip_id: '09e7a393-3919-46cb-b16e-5ee45410abc1',
      user_id: 'user_3',
      role: 'member',
      name: 'Bob',
      profile_photo_url: null,
      inserted_at: '2025-11-22T20:02:00Z',
      updated_at: '2025-11-22T20:02:00Z',
    },
    {
      id: '4',
      trip_id: '09e7a393-3919-46cb-b16e-5ee45410abc1',
      user_id: 'user_4',
      role: 'member',
      name: 'Diana',
      profile_photo_url: 'https://i.pravatar.cc/150?img=4',
      inserted_at: '2025-11-22T20:03:00Z',
      updated_at: '2025-11-22T20:03:00Z',
    },
    {
      id: '5',
      trip_id: '09e7a393-3919-46cb-b16e-5ee45410abc1',
      user_id: 'user_5',
      role: 'member',
      name: 'Eve',
      profile_photo_url: 'https://i.pravatar.cc/150?img=5',
      inserted_at: '2025-11-22T20:04:00Z',
      updated_at: '2025-11-22T20:04:00Z',
    },
    {
      id: '6',
      trip_id: '09e7a393-3919-46cb-b16e-5ee45410abc1',
      user_id: 'user_6',
      role: 'member',
      name: 'Frank',
      profile_photo_url: 'https://i.pravatar.cc/150?img=6',
      inserted_at: '2025-11-22T20:05:00Z',
      updated_at: '2025-11-22T20:05:00Z',
    },
  ];

  //Share trip
  const deepLink = `runwae://join/${id}/${join_code}`;

  function openSheet() {
    bottomSheetRef.current?.expand();
  }

  async function copyCode() {
    await Clipboard.setStringAsync(join_code);
  }

  async function shareCode() {
    await Share.open({
      message: `Join my trip on Runwae! Code: ${join_code}`,
    });
  }

  async function shareLink() {
    const title = 'Join my trip on Runwae';
    const message = 'Join my trip on Runwae';
    const url = deepLink;
    const icon = require('@/assets/images/icon.png');

    const options = Platform.select({
      ios: {
        activityItemSources: [
          {
            placeholderItem: {
              type: 'url',
              content: icon,
            },
            item: {
              default: {
                type: 'text',
                content: `${message} ${url}`,
              },
            },
            linkMetadata: {
              title: title,
              icon: icon,
            },
          },
        ],
      },
      default: {
        title,
        subject: title,
        message: `${message} ${url}`,
      },
    });

    await Share.open(options as ShareOptions);
  }

  if (loading || tripLoading) {
    return <HomeScreenSkeleton />;
  }

  // Compact header component for Stack.Screen
  const CompactHeader = () => {
    return (
      <Animated.View
        style={[
          styles.compactHeader,
          compactHeaderAnimatedStyle,
          {
            backgroundColor: colors.backgroundColors.default,
            paddingTop: insets.top,
            minHeight: 44 + insets.top,
          },
        ]}>
        <View style={styles.compactHeaderContent}>
          <Pressable
            onPress={() => {
              console.log('Back pressed in CompactHeader');
              router.back();
            }}
            style={[
              styles.compactIconButton,
              { backgroundColor: colors.backgroundColors.subtle },
            ]}>
            <ArrowLeftIcon size={20} color={colors.textColors.default} />
          </Pressable>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {trip?.title}
          </Text>
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
            <Pressable
              onPress={() => {
                bottomSheetRef.current?.expand();
              }}
              style={[
                styles.compactIconButton,
                { backgroundColor: colors.backgroundColors.subtle },
              ]}>
              <ForwardIcon size={20} color={colors.textColors.default} />
            </Pressable>

            <Pressable
              onPress={() => {}}
              style={[
                styles.compactIconButton,
                { backgroundColor: colors.backgroundColors.subtle },
              ]}>
              <Menu size={20} color={colors.textColors.default} />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    );
  };

  // Large header component
  const LargeHeader = () => {
    return (
      <Animated.View style={largeHeaderAnimatedStyle}>
        <ImageBackground
          source={{ uri: trip?.cover_image_url ?? '' }}
          style={styles.imageBackground}
          contentFit="cover"
          transition={1000}>
          <View
            style={[
              styles.iconContentContainer,
              dynamicStyles.iconContentContainer,
              { position: 'absolute' },
            ]}>
            <Pressable
              onPress={() => {
                router.back();
                console.log('Back pressed in LargeHeader');
              }}
              style={[
                styles.iconButton,
                {
                  backgroundColor: colors.backgroundColors.default,
                  zIndex: 1000,
                },
              ]}>
              <ArrowLeftIcon size={20} color={colors.textColors.default} />
            </Pressable>
            <View
              style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
              <Pressable
                onPress={() => {
                  bottomSheetRef.current?.expand();
                }}
                style={[
                  styles.iconButton,
                  {
                    backgroundColor: colors.backgroundColors.default,
                    zIndex: 1000,
                  },
                ]}>
                <ForwardIcon size={20} color={colors.textColors.default} />
              </Pressable>

              <Pressable
                onPress={() => {}}
                style={[
                  styles.iconButton,
                  {
                    backgroundColor: colors.backgroundColors.default,
                    zIndex: 1000,
                  },
                ]}>
                <Menu size={20} color={colors.textColors.default} />
              </Pressable>
            </View>
          </View>
          <LinearGradient
            colors={[
              'transparent',
              hexToRgba(colors.backgroundColors.default, 0),
              hexToRgba(colors.backgroundColors.default, 0.25),
              hexToRgba(colors.backgroundColors.default, 0.6),
              hexToRgba(colors.backgroundColors.default, 0.85),
              colors.backgroundColors.default,
            ]}
            locations={[0, 0.2, 0.5, 0.75, 0.9, 1]}
            style={styles.gradientOverlay}>
            <View style={styles.gradientContent}>
              <Spacer size={16} vertical />
              <Text style={styles.title}>{trip?.title}</Text>
              <Spacer size={8} vertical />
            </View>
          </LinearGradient>
        </ImageBackground>
      </Animated.View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View
        style={{ flex: 1, backgroundColor: colors.backgroundColors.default }}>
        <CompactHeader />
        <Animated.ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}>
          <LargeHeader />

          <View
            style={[
              styles.contentContainer,
              { backgroundColor: colors.backgroundColors.default },
            ]}>
            <Spacer size={16} vertical />
            <View style={styles.locationTimeSpan}>
              <View style={[styles.infoContainer, dynamicStyles.infoContainer]}>
                <Text style={styles.infoText} numberOfLines={1}>
                  📍 {trip?.destination}
                </Text>
              </View>
              <View style={[styles.infoContainer, dynamicStyles.infoContainer]}>
                <DateRange
                  startDate={trip?.start_date ?? ''}
                  endDate={trip?.end_date ?? ''}
                  emoji={true}
                  color={colors.textColors.default}
                />
              </View>
            </View>

            <Spacer size={14} vertical />
            <Text style={styles.description}>{trip?.description}</Text>
            <Spacer size={14} vertical />
            <AvatarGroup
              attendees={dummyAttendees}
              maxVisible={4}
              size={30}
              overlap={12}
            />
            <Spacer size={32} vertical />

            <HorizontalTabs
              tabs={[
                { id: 'discover', label: 'Discover' },
                { id: 'saved', label: 'Saved' },
                { id: 'itinerary', label: 'Itinerary' },
                { id: 'activity', label: 'Activity' },
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            <Spacer size={24} vertical />

            {activeTab === 'itinerary' && (
              <>
                <TripItinerary tripId={trip?.id as string} />
                <Spacer size={14} vertical />
              </>
            )}
            {activeTab === 'discover' && (
              <TripDiscoverySection
                countryCode={countryCode as string}
                city={city as string}
              />
            )}
            {activeTab === 'saved' && (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
                  Saved content coming soon
                </Text>
              </View>
            )}
            {activeTab === 'activity' && (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
                  Activity content coming soon
                </Text>
              </View>
            )}
            <Spacer size={740} vertical />
          </View>
        </Animated.ScrollView>

        {/* BOTTOM SHEET CONTENT */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={['50%']}
          detached={true}
          backgroundStyle={{
            backgroundColor: colors.backgroundColors.subtle,
          }}
          enablePanDownToClose>
          <BottomSheetView
            style={{
              flex: 1,
              backgroundColor: colors.backgroundColors.subtle,
              height: '100%',
            }}>
            <View style={{ padding: 20, gap: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600' }}>
                Share Join Code
              </Text>

              {/* Join Code */}
              <View
                style={{
                  padding: 16,
                  backgroundColor: colors.backgroundColors.default,
                  borderRadius: 12,
                  alignItems: 'center',
                }}>
                <Text
                  style={{ fontSize: 22, fontWeight: '700', letterSpacing: 3 }}>
                  {join_code}
                </Text>
              </View>

              {/* COPY */}
              <TouchableOpacity
                onPress={copyCode}
                style={{
                  padding: 14,
                  backgroundColor: colors.primaryColors.default,
                  borderRadius: 10,
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 16,
                    color: colors.textColors.default,
                  }}>
                  Copy Code
                </Text>
              </TouchableOpacity>

              {/* SHARE CODE */}
              <TouchableOpacity
                onPress={shareCode}
                style={{
                  padding: 14,
                  backgroundColor: colors.primaryColors.default,
                  borderRadius: 10,
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 16,
                    color: colors.textColors.default,
                  }}>
                  Share Code
                </Text>
              </TouchableOpacity>

              {/* SHARE LINK */}
              <TouchableOpacity
                onPress={shareLink}
                style={{
                  padding: 14,
                  backgroundColor: colors.backgroundColors.default,
                  borderRadius: 10,
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 16,
                    color: colors.textColors.default,
                  }}>
                  Share Deep Link
                </Text>
              </TouchableOpacity>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </View>
      {/* </ScreenContainer> */}
    </>
  );
};

export default TripsDetailsScreen;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 12,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    flex: 1,
    flexDirection: 'column',
    position: 'relative',
  },
  gradientOverlay: {
    // position: 'absolute',
    // bottom: 0,
    // left: 0,
    // right: 0,
    height: '100%',
    justifyContent: 'flex-end',
  },
  gradientContent: {
    width: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    // alignItems: 'center',
    // paddingBottom: 16,
  },
  iconContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 99,
  },
  locationTimeSpan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoContainer: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 99,
  },
  infoText: {
    ...textStyles.subtitle_Regular,
    fontSize: 13,
    lineHeight: 19.5,
  },

  //Text styles
  title: {
    ...textStyles.bold_20,
    fontSize: 32,
    lineHeight: 38.4,
  },
  description: {
    ...textStyles.subtitle_Regular,
    fontSize: 14,
    lineHeight: 19.5,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...textStyles.subtitle_Regular,
    fontSize: 14,
    lineHeight: 19.5,
  },
  compactHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: Dimensions.get('window').width,
    zIndex: 1000,
    justifyContent: 'flex-end',
  },
  compactHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 44,
    width: '100%',
  },
  compactIconButton: {
    padding: 8,
    borderRadius: 99,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTitle: {
    ...textStyles.bold_20,
    fontSize: 17,
    lineHeight: 22,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
});
