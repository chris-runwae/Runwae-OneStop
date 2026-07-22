import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useDestinationById, useDestinations } from '@/hooks/useDestinations';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';
import type { Id } from '@runwae/convex/convex/_generated/dataModel';

import { Spacer } from '@/components';
import DestinationInfo from '@/components/destination/DestinationInfo';
import RecommendationsSection from '@/components/destination/RecommendationsSection';
import DetailNotFound from '@/components/experience/DetailNotFound';
import AddToTripContent from '@/components/home/AddToTripContent';
import CustomModal from '@/components/ui/CustomModal';
import DestinationCard from '@/components/home/DestinationCard';
import ItineraryForYou from '@/components/home/IteneryForYou';
import ItineraryHeader, {
  EXPANDED_HEIGHT,
} from '@/components/itinerary/ItineraryHeader';
import { useTrips } from '@/context/TripsContext';
import { savedItemFromDestination } from '@/utils/savedIdeaInputs';
import { toItineraryTemplate } from '@/utils/adapters/toItineraryTemplate';

const DestinationDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { destination, loading } = useDestinationById(id ?? null);
  const { destinations } = useDestinations();
  const { addIdeaToTrip } = useTrips();
  const [addToTripOpen, setAddToTripOpen] = useState(false);
  const [ideaSaved, setIdeaSaved] = useState(false);

  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const templatesRaw = useQuery(
    api.itinerary.listByDestination,
    id ? { destinationId: id as Id<'destinations'>, limit: 8 } : 'skip'
  );

  const destinationItineraries = useMemo(() => {
    if (!templatesRaw) return [];
    const location = destination?.location ?? '';
    return templatesRaw.map((t: any) => toItineraryTemplate(t, { location }));
  }, [templatesRaw, destination?.location]);

  const similarDestinations = useMemo(() => {
    if (!id) return destinations;
    return destinations.filter((d) => d.id !== id);
  }, [id, destinations]);

  if (loading) {
    return null; // swap for a skeleton if you have one
  }

  if (!destination) {
    return <DetailNotFound type="destination" />;
  }

  const handleAddToTripDone = async (tripId: string) => {
    try {
      await addIdeaToTrip(tripId, savedItemFromDestination(destination));
      setAddToTripOpen(false);
      setIdeaSaved(true);
      Alert.alert('Saved', 'Added to your trip Ideas.');
    } catch (e) {
      Alert.alert(
        'Could not save',
        e instanceof Error ? e.message : 'Please try again.'
      );
    }
  };

  return (
    <View className="flex-1">
      {/* <Link.AppleZoomTarget> */}
      <ItineraryHeader
        scrollY={scrollY}
        imageUri={destination?.image ?? ''}
        title={destination.title}
        onFavoritePress={() => setAddToTripOpen(true)}
        favoriteFilled={ideaSaved}
      />
      {/* </Link.AppleZoomTarget> */}

      <Animated.ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}>
        {/* Spacer that the header sits over. Replaces the duplicate Image. */}
        <View style={styles.headerSpacer} />

        <DestinationInfo
          title={destination.title}
          location={destination.location}
          rating={destination.rating ?? 4.5}
          description={destination.description ?? ''}
        />

        {destinationItineraries.length > 0 && (
          <>
            <View className="mt-5 h-2 bg-gray-100 dark:bg-dark-seconndary/20" />

            <ItineraryForYou
              data={destinationItineraries}
              title="Featured Itineraries"
              showSubtitle={false}
              showBorder={false}
              loading={templatesRaw === undefined}
            />
          </>
        )}

        <View className="mt-5 h-2 bg-gray-100 dark:bg-dark-seconndary/20" />

        <RecommendationsSection
          destination={{
            title: destination.title,
            location: destination.location ?? '',
            coords: destination.coords,
          }}
        />

        <View className="mt-5 h-2 bg-gray-100 dark:bg-dark-seconndary/20" />

        <View className="mt-8 pb-10">
          <Text
            className="mb-6 px-5 text-xl font-bold dark:text-white"
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
            Similar Destinations
          </Text>

          <FlashList
            data={similarDestinations}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
            }}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <Spacer size={12} horizontal />}
            renderItem={({ item }) => (
              <DestinationCard
                item={item}
                fullWidth={false}
                width={170}
                imageHeight={100}
              />
            )}
          />
        </View>
      </Animated.ScrollView>

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

export default DestinationDetailScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  headerSpacer: { height: EXPANDED_HEIGHT },
  divider: { marginTop: 20, height: 8, backgroundColor: '#f3f4f6' },
  sectionTitle: {
    marginBottom: 24,
    paddingHorizontal: 20,
    fontSize: 20,
    fontFamily: 'BricolageGrotesque-ExtraBold',
  },
  similarWrap: { marginTop: 32, paddingBottom: 40 },
  listContent: { paddingHorizontal: 20 },
});
