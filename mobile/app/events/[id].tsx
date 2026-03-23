import EventInfo from "@/components/event/EventInfo";
import DetailNotFound from "@/components/experience/DetailNotFound";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import ItineraryHeader from "@/components/itinerary/ItineraryHeader";
import { Event, UPCOMING_EVENTS } from "@/constants/home.constant";
import { useTheme } from "@react-navigation/native";
import { AppleMaps, GoogleMaps } from "expo-maps";
import { useLocalSearchParams } from "expo-router";
import { MapPin, Navigation, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MapComponent = (props: any) => {
  if (Platform.OS === "ios") {
    return <AppleMaps.View {...props} />;
  }
  return <GoogleMaps.View {...props} />;
};

const EventDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const [showFullMap, setShowFullMap] = useState(false);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const event = useMemo(() => {
    return UPCOMING_EVENTS.find((e) => e.id === id) as Event | undefined;
  }, [id]);

  const relatedEvents = useMemo(() => {
    if (!event) return [];
    return UPCOMING_EVENTS.filter(
      (e) => e.id !== id && e.category === event.category,
    );
  }, [id, event]);

  const otherEvents = useMemo(() => {
    if (!event) return [];
    return UPCOMING_EVENTS.filter(
      (e) => e.id !== id && e.category !== event.category,
    ).slice(0, 6);
  }, [id, event]);

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

  if (!event) {
    return <DetailNotFound type="experience" />;
  }

  const { dark } = useTheme();

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
        contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
      >
        {/* Hero Image */}
        <Image
          source={{ uri: event.image }}
          className="w-full h-[300px]"
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

        <View className="h-2 bg-gray-100 dark:bg-dark-seconndary/20 mt-8" />

        {/* About Section */}
        <View className="px-5 py-6">
          <Text
            className="text-lg font-bold dark:text-white mb-3"
            style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
          >
            About this event
          </Text>
          <Text
            className="text-gray-500 dark:text-gray-400 leading-6 text-sm"
            style={{ fontFamily: "Inter" }}
          >
            Join us for {event.title} in {event.location}. This{" "}
            {event.category.toLowerCase()} event takes place on {event.date}{" "}
            starting at {event.time}. Don't miss out on this incredible
            experience — gather your friends, plan your trip, and get ready for
            an unforgettable time.
          </Text>
        </View>

        <View className="h-2 bg-gray-100 dark:bg-dark-seconndary/20" />

        <View className="px-5 py-6">
          <Text
            className="text-lg font-bold dark:text-white mb-4"
            style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
          >
            Location
          </Text>
          <Pressable
            onPress={() => setShowFullMap(true)}
            className="bg-gray-100 dark:bg-dark-seconndary rounded-xl overflow-hidden border border-gray-200 dark:border-white/10"
          >
            <View pointerEvents="none">
              <MapComponent
                style={{ width: "100%", height: 180 }}
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
            <View className="px-4 py-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-x-2 flex-1">
                <MapPin size={15} color="#9ca3af" />
                <Text
                  className="text-sm text-gray-600 dark:text-gray-300 flex-1"
                  numberOfLines={1}
                >
                  {event.location}
                </Text>
              </View>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleGetDirections();
                }}
                className="bg-primary/10 px-3 py-1.5 rounded-full flex-row items-center gap-x-1"
              >
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
        onRequestClose={() => setShowFullMap(false)}
      >
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
            className="absolute top-0 left-0 right-0 px-5 flex-row items-center justify-between"
          >
            <TouchableOpacity
              onPress={() => setShowFullMap(false)}
              className="w-10 h-10 bg-white/90 dark:bg-black/80 rounded-full items-center justify-center shadow-sm"
            >
              <X size={20} color={dark ? "#FFFFFF" : "#000000"} />
            </TouchableOpacity>
          </View>

          <View className="absolute bottom-6 left-5 right-5 bg-white dark:bg-dark-seconndary rounded-2xl p-5 shadow-xl border border-gray-100 dark:border-white/10 flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-bold dark:text-white mb-1">
                {event.title}
              </Text>
              <View className="flex-row items-center gap-x-2">
                <MapPin size={16} color="#9ca3af" />
                <Text className="text-gray-500 dark:text-gray-400 flex-1">
                  {event.location}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleGetDirections}
              className="bg-primary px-4 py-3 rounded-full flex-row items-center gap-x-2 shadow-sm"
            >
              <Navigation size={16} color="#fff" />
              <Text className="text-white font-bold">Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EventDetailScreen;
