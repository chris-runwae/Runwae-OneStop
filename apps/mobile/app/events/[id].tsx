import EventDetailSkeleton from '@/components/event/EventDetailSkeleton';
import FullScreenMapModal from '@/components/event/FullScreenMapModal';
import {
  BulletRow,
  Divider,
  SectionTitle,
} from '@/components/event/detail/EventDetailPrimitives';
import EventGallery from '@/components/event/detail/EventGallery';
import EventHero from '@/components/event/detail/EventHero';
import EventItinerary from '@/components/event/detail/EventItinerary';
import EventLocationSection from '@/components/event/detail/EventLocationSection';
import EventParticipantsBar from '@/components/event/detail/EventParticipantsBar';
import EventPricingBar from '@/components/event/detail/EventPricingBar';
import EventQuickStats from '@/components/event/detail/EventQuickStats';
import DetailNotFound from '@/components/experience/DetailNotFound';
import AddToTripContent from '@/components/home/AddToTripContent';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import ItineraryHeader from '@/components/itinerary/ItineraryHeader';
import CustomModal from '@/components/ui/CustomModal';
import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripsContext';
import { useDirections } from '@/hooks/useDirections';
import { useEvent } from '@/hooks/useEvent';
import { savedItemFromEvent } from '@/utils/savedIdeaInputs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';
import type { Id } from '@runwae/convex/convex/_generated/dataModel';
import { useLocalSearchParams } from 'expo-router';
import { AlertCircle, CheckCircle2, Star } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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
  const [isRegistered, setIsRegistered] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const { event, relatedEvents, otherEvents, loading, error } = useEvent(id);
  const { openDirections } = useDirections();
  const { addIdeaToTrip } = useTrips();
  const { user } = useAuth();
  // Stripe handles re-introduce in Phase 8 alongside payments.createPaymentIntent.

  // Convex tracks current rsvp via api.events.getViewerRsvp; the
  // analytics view-counter is api.events.incrementViewCount.
  const viewerRsvp = useQuery(
    api.events.getViewerRsvp,
    event?.id ? { eventId: event.id as unknown as Id<'events'> } : 'skip',
  );
  const incrementViewCount = useMutation(api.events.incrementViewCount);
  const rsvpMut = useMutation(api.events.rsvp);

  useEffect(() => {
    if (viewerRsvp === 'going') setIsRegistered(true);
  }, [viewerRsvp]);

  useEffect(() => {
    if (event?.id) {
      void incrementViewCount({
        eventId: event.id as unknown as Id<'events'>,
      }).catch(() => {});
    }
  }, [event?.id, incrementViewCount]);

  if (loading) return <EventDetailSkeleton />;
  if (error || !event) return <DetailNotFound type="experience" />;

  const handleRegister = async () => {
    if (!event) return;
    if (!user?.id) {
      Alert.alert('Sign in required', 'Please sign in to register for events.');
      return;
    }
    setRegisterLoading(true);
    try {
      // Phase 4 wires free / external RSVPs only. Paid ticketing flows
      // through api.bookings.createTicketBooking and the native Stripe
      // Payment Sheet — ramping up alongside the PaymentIntent action
      // in Phase 8.
      if (event.price && event.price > 0) {
        Alert.alert(
          'Ticket purchases coming soon',
          'Paid event ticketing is rolling out shortly. Please check back later.',
        );
        return;
      }
      await rsvpMut({
        eventId: event.id as unknown as Id<'events'>,
        status: 'going',
      });
      setIsRegistered(true);
      Alert.alert("You're in!", `Successfully registered for ${event.title}.`);
    } catch (err) {
      Alert.alert('Registration failed', (err as Error).message);
    } finally {
      setRegisterLoading(false);
    }
  };

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
    event.price != null && event.price > 0
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
          paddingBottom: 100 + insets.bottom,
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

      <EventPricingBar
        formattedPrice={formattedPrice}
        isSoldOut={spotsLeft != null && spotsLeft <= 0}
        isRegistered={isRegistered}
        isLoading={registerLoading}
        onPress={handleRegister}
      />

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
