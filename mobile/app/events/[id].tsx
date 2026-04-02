import EventInfo from '@/components/event/EventInfo';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import ItineraryHeader from '@/components/itinerary/ItineraryHeader';

import { useTheme } from '@react-navigation/native';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import { useLocalSearchParams } from 'expo-router';
import { MapPin, Navigation, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEvents } from '@/hooks/useEvents';
import { Colors } from '@/constants';

const MapComponent = (props: any) => {
  if (Platform.OS === 'ios') {
    return <AppleMaps.View {...props} />;
  }
  return <GoogleMaps.View {...props} />;
};

const EventDetailScreen = () => {
  const { dark } = useTheme();
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const colors = Colors[colorScheme];

  const { id } = useLocalSearchParams();
  const { data, event, fetchEventById, loading } = useEvents();

  useEffect(() => {
    fetchEventById(id as string);
  }, [id, fetchEventById]);

  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const [showFullMap, setShowFullMap] = useState(false);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const relatedEvents = useMemo(() => {
    if (!event) return [];
    return (
      data?.filter((e) => e.id !== id && e.category === event.category) ?? []
    );
  }, [id, event, data]);

  const otherEvents = useMemo(() => {
    if (!event) return [];
    return (
      data
        ?.filter((e) => e.id !== id && e.category !== event.category)
        ?.slice(0, 6) ?? []
    );
  }, [id, event, data]);

  const handleGetDirections = () => {
    if (!event) return;
    const { latitude, longitude, title } = event;
    const label = encodeURIComponent(title);
    const url = Platform.select({
      ios: `maps://0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });

    if (url) {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to browser
          const browserUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
          Linking.openURL(browserUrl);
        }
      });
    }
  };

  if (loading || !event) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ItineraryHeader
        scrollY={scrollY}
        imageUri={event.image}
        title={event.title}
      />

      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}>
        {/* Hero Image */}
        <Image
          source={{ uri: event.image }}
          className="h-[300px] w-full"
          resizeMode="cover"
        />

        {/* Event Info */}
        <EventInfo
          title={event.title}
          location={event.location}
          date={event.date}
          time={event.time}
          category={event.category}
        />

        <View className="mt-8 h-2 bg-gray-100 dark:bg-dark-seconndary/20" />

        {/* About Section */}
        <View className="px-5 py-6">
          <Text
            className="mb-3 text-lg font-bold dark:text-white"
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
            About this event
          </Text>
          <Text
            className="text-sm leading-6 text-gray-500 dark:text-gray-400"
            style={{ fontFamily: 'Inter' }}>
            Join us for {event.title} in {event.location}. This{' '}
            {event.category.toLowerCase()} event takes place on {event.date}{' '}
            starting at {event.time}. Don&apos;t miss out on this incredible
            experience — gather your friends, plan your trip, and get ready for
            an unforgettable time.
          </Text>
        </View>

        <View className="h-2 bg-gray-100 dark:bg-dark-seconndary/20" />

        <View className="px-5 py-6">
          <Text
            className="mb-4 text-lg font-bold dark:text-white"
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
            Location
          </Text>
          <Pressable
            onPress={() => setShowFullMap(true)}
            className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-dark-seconndary">
            <View pointerEvents="none">
              <MapComponent
                style={{ width: '100%', height: 180 }}
                cameraPosition={{
                  coordinates: {
                    latitude: event.latitude,
                    longitude: event.longitude,
                  },
                  zoom: 12,
                }}
                markers={[
                  {
                    coordinates: {
                      latitude: event.latitude,
                      longitude: event.longitude,
                    },
                    title: event.title,
                  },
                ]}
              />
            </View>
            <View className="flex-row items-center justify-between px-4 py-3">
              <View className="flex-1 flex-row items-center gap-x-2">
                <MapPin size={15} color="#9ca3af" />
                <Text
                  className="flex-1 text-sm text-gray-600 dark:text-gray-300"
                  numberOfLines={1}>
                  {event.location}
                </Text>
              </View>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleGetDirections();
                }}
                className="flex-row items-center gap-x-1 rounded-full bg-primary/10 px-3 py-1.5">
                <Text className="text-xs font-semibold text-primary">
                  Directions
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>

        <View className="h-2 bg-gray-100 dark:bg-dark-seconndary/20" />

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <>
            <UpcomingEvents
              data={relatedEvents}
              title={`More ${event.category.charAt(0) + event.category.slice(1).toLowerCase()} Events`}
              subtitle="Similar events you might enjoy"
            />
            <View className="h-2 bg-gray-100 dark:bg-dark-seconndary/20" />
          </>
        )}

        {/* Other Events */}
        {otherEvents.length > 0 && (
          <UpcomingEvents
            data={otherEvents}
            title="Other Events"
            subtitle="Explore different types of events"
          />
        )}
      </Animated.ScrollView>

      <Modal
        visible={showFullMap}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowFullMap(false)}>
        <View className="flex-1 bg-white dark:bg-black">
          <MapComponent
            style={{ flex: 1 }}
            cameraPosition={{
              coordinates: {
                latitude: event.latitude,
                longitude: event.longitude,
              },
              zoom: 15,
            }}
            markers={[
              {
                coordinates: {
                  latitude: event.latitude,
                  longitude: event.longitude,
                },
                title: event.title,
                snippet: event.location,
              },
            ]}
          />

          <View
            style={{ paddingTop: insets.top || 20 }}
            className="absolute left-0 right-0 top-0 flex-row items-center justify-between px-5">
            <TouchableOpacity
              onPress={() => setShowFullMap(false)}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm dark:bg-black/80">
              <X size={20} color={dark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>

          <View className="absolute bottom-6 left-5 right-5 flex-row items-center justify-between rounded-[30px] border border-gray-100 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-dark-seconndary">
            <View>
              <Text className="mb-1 text-xl font-bold dark:text-white">
                {event.title}
              </Text>
              <View className="flex-row items-center gap-x-2">
                <MapPin size={13} color="#9ca3af" />
                <Text className="flex-1 text-sm text-gray-500 dark:text-gray-400">
                  {event.location}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleGetDirections}
              className="flex-row items-center gap-x-2 rounded-full bg-primary px-4 py-4">
              <Navigation size={16} color="#fff" />
              <Text className="font-bold text-white">Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EventDetailScreen;
