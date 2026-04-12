import AddToTripContent from '@/components/home/AddToTripContent';
import CustomModal from '@/components/ui/CustomModal';
import EventDetailSkeleton from '@/components/event/EventDetailSkeleton';
import FullScreenMapModal from '@/components/event/FullScreenMapModal';
import EventGallery from '@/components/event/detail/EventGallery';
import EventHero from '@/components/event/detail/EventHero';
import EventItinerary from '@/components/event/detail/EventItinerary';
import EventLocationSection from '@/components/event/detail/EventLocationSection';
import EventParticipantsBar from '@/components/event/detail/EventParticipantsBar';
import EventPricingBar from '@/components/event/detail/EventPricingBar';
import EventQuickStats from '@/components/event/detail/EventQuickStats';
import {
  BulletRow,
  Divider,
  SectionTitle,
} from '@/components/event/detail/EventDetailPrimitives';
import DetailNotFound from '@/components/experience/DetailNotFound';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import ItineraryHeader from '@/components/itinerary/ItineraryHeader';
import { useTrips } from '@/context/TripsContext';
import { useDirections } from '@/hooks/useDirections';
import { useEvent } from '@/hooks/useEvent';
import { savedItemFromEvent } from '@/utils/savedIdeaInputs';
import { useLocalSearchParams } from 'expo-router';
import { AlertCircle, CheckCircle2, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EventDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const [showFullMap, setShowFullMap] = useState(false);
  const [addToTripOpen, setAddToTripOpen] = useState(false);
  const [ideaSaved, setIdeaSaved] = useState(false);
  const { event, relatedEvents, otherEvents, loading, error } = useEvent(id);
  const { openDirections } = useDirections();
  const { addIdeaToTrip } = useTrips();

  if (loading) return <EventDetailSkeleton />;
  if (error || !event) return <DetailNotFound type="experience" />;

  const handleGetDirections = () =>
    openDirections({ title: event.title, location: event.location });

  const handleAddToTripDone = async (tripId: string) => {
    try {
      await addIdeaToTrip(tripId, savedItemFromEvent(event));
      setAddToTripOpen(false);
      setIdeaSaved(true);
      Alert.alert('Saved', 'Added to your trip Ideas.');
    } catch (e) {
      Alert.alert(
        'Could not save',
        e instanceof Error ? e.message : 'Please try again.'
      );
      console.error('Error adding event to trip:', e);
    }
  };

  const spotsLeft =
    event.maxParticipants != null && event.currentParticipants != null
      ? event.maxParticipants - event.currentParticipants
      : null;

  const fillPct =
    event.maxParticipants && event.currentParticipants
      ? Math.min((event.currentParticipants / event.maxParticipants) * 100, 100)
      : null;

  const galleries = event.imageUrls?.length
    ? event.imageUrls
    : event.image
      ? [event.image]
      : [];

  const formattedPrice =
    event.price != null
      ? `${event.currency ?? 'USD'} ${event.price.toLocaleString()}`
      : null;

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <ItineraryHeader
        scrollY={scrollY}
        imageUri={event.image}
        title={event.title}
        onFavoritePress={() => setAddToTripOpen(true)}
        favoriteFilled={ideaSaved}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingBottom: (formattedPrice ? 100 : 40) + insets.bottom,
        }}>
        <EventHero
          imageUri={event.image}
          status={event.status}
          difficultyLevel={event.difficultyLevel}
          isFeatured={event.isFeatured}
        />

        <EventQuickStats
          title={event.title}
          location={event.location}
          date={event.date}
          time={event.time}
          maxParticipants={event.maxParticipants}
          currentParticipants={event.currentParticipants}
        />

        {fillPct != null && (
          <EventParticipantsBar
            fillPct={fillPct}
            spotsLeft={spotsLeft}
            currentParticipants={event.currentParticipants}
          />
        )}

        <Divider />

        {!!event.description && (
          <>
            <View className="px-5 py-6">
              <SectionTitle title="About this event" />
              <Text
                className="text-sm leading-[22px] text-gray-600 dark:text-gray-300"
                style={{ fontFamily: 'Inter' }}>
                {event.description}
              </Text>
            </View>
            <Divider />
          </>
        )}

        {galleries.length > 1 && (
          <>
            <EventGallery images={galleries} />
            <Divider />
          </>
        )}

        {event.highlights && event.highlights.length > 0 && (
          <>
            <View className="px-5 py-6">
              <SectionTitle title="Highlights" />
              {event.highlights.map((item, i) => (
                <BulletRow
                  key={i}
                  text={item}
                  icon={<Star size={14} color="#FF2E92" fill="#FF2E92" />}
                />
              ))}
            </View>
            <Divider />
          </>
        )}

        {event.whatsIncluded && event.whatsIncluded.length > 0 && (
          <>
            <View className="px-5 py-6">
              <SectionTitle title="What's Included" />
              <View className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-white/5">
                {event.whatsIncluded.map((item, i) => (
                  <BulletRow
                    key={i}
                    text={item}
                    icon={<CheckCircle2 size={14} color="#16a34a" />}
                  />
                ))}
              </View>
            </View>
            <Divider />
          </>
        )}

        {event.requirements && event.requirements.length > 0 && (
          <>
            <View className="px-5 py-6">
              <SectionTitle title="Requirements" />
              <View className="rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
                {event.requirements.map((item, i) => (
                  <BulletRow
                    key={i}
                    text={item}
                    icon={<AlertCircle size={14} color="#d97706" />}
                  />
                ))}
              </View>
            </View>
            <Divider />
          </>
        )}

        {event.itinerary && event.itinerary.length > 0 && (
          <>
            <EventItinerary steps={event.itinerary} />
            <Divider />
          </>
        )}

        <EventLocationSection
          location={event.location}
          title={event.title}
          latitude={event.latitude}
          longitude={event.longitude}
          onOpenMap={() => setShowFullMap(true)}
          onDirections={handleGetDirections}
        />

        {relatedEvents.length > 0 && (
          <>
            <Divider />
            <UpcomingEvents
              data={relatedEvents}
              title={`More ${event.category.charAt(0) + event.category.slice(1).toLowerCase()} Events`}
              subtitle="Similar events you might enjoy"
            />
          </>
        )}

        {otherEvents.length > 0 && (
          <>
            <Divider />
            <UpcomingEvents
              data={otherEvents}
              title="Other Events"
              subtitle="Explore different types of events"
            />
          </>
        )}
      </Animated.ScrollView>

      {formattedPrice && (
        <EventPricingBar
          formattedPrice={formattedPrice}
          isSoldOut={spotsLeft != null && spotsLeft <= 0}
        />
      )}

      <FullScreenMapModal
        visible={showFullMap}
        onClose={() => setShowFullMap(false)}
        onDirections={handleGetDirections}
        location={event.location}
        title={event.title}
        latitude={event.latitude}
        longitude={event.longitude}
      />

      <CustomModal
        isVisible={addToTripOpen}
        onClose={() => setAddToTripOpen(false)}
        title="Add to Trip"
        centeredTitle
        showCloseButton={false}
        showIndicator>
        <AddToTripContent
          onCancel={() => setAddToTripOpen(false)}
          onDone={handleAddToTripDone}
        />
      </CustomModal>
    </View>
  );
};

export default EventDetailScreen;
