import AddToTripContent from '@/components/home/AddToTripContent';
import CustomModal from '@/components/ui/CustomModal';
import { useTrips } from '@/context/TripsContext';
import { useHotels } from '@/hooks/useHotels';
import { useViatorCategory } from '@/hooks/useViatorCategory';
import type { LiteAPIHotelRateItem } from '@/types/liteapi.types';
import { savedItemFromHotel } from '@/utils/savedIdeaInputs';
import { lookupViatorDestinationId } from '@/utils/viator/viatorDestinationLookup';
import type { CategoryKey } from '@/utils/viator/viatorCategoryCache';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RecommendationCard from './RecommendationCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'All', name: 'All', emoji: '' },
  { id: 'Eat/Drink', name: 'Eat/Drink', emoji: '🍹' },
  { id: 'Stay', name: 'Stay', emoji: '🏨' },
  { id: 'Do', name: 'Do', emoji: '🎭' },
  { id: 'Shop', name: 'Shop', emoji: '🛍️' },
] as const;

type ActiveCategory = 'All' | 'Eat/Drink' | 'Stay' | 'Do' | 'Shop';

function defaultCheckinCheckout() {
  const today = new Date();
  const checkin = new Date(today);
  checkin.setDate(today.getDate() + 1);
  const checkout = new Date(today);
  checkout.setDate(today.getDate() + 2);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { checkin: fmt(checkin), checkout: fmt(checkout) };
}

// ─── Viator list (All / Eat/Drink / Do / Shop) ────────────────────────────

interface ViatorRecommendationsListProps {
  category: CategoryKey;
  destinationId: string | null;
}

function ViatorRecommendationsList({
  category,
  destinationId,
}: ViatorRecommendationsListProps) {
  const { products, loading, error, retry } = useViatorCategory(
    category,
    destinationId
  );

  if (loading) {
    return (
      <View
        className="items-center justify-center py-10"
        style={{ width: SCREEN_WIDTH - 40 }}>
        <ActivityIndicator color="#FF1F8C" />
      </View>
    );
  }

  if (error) {
    return (
      <View
        className="items-center justify-center py-10"
        style={{ width: SCREEN_WIDTH - 40 }}>
        <Text className="text-sm text-gray-400 dark:text-gray-500 mb-3">
          Couldn&apos;t load recommendations
        </Text>
        <TouchableOpacity
          onPress={retry}
          className="px-5 py-2 bg-primary rounded-full">
          <Text className="text-white text-sm font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlashList
      data={products}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20 }}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <RecommendationCard item={item} />}
      ListEmptyComponent={
        <View
          className="flex items-center justify-center py-10"
          style={{ width: SCREEN_WIDTH - 40 }}>
          <Image
            source={require('@/assets/images/trip-empty-state.png')}
            className="mb-5 h-[44px] w-[44px]"
            resizeMode="contain"
          />
          <Text
            className="text-lg font-semibold dark:text-white"
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
            No recommendations found
          </Text>
          <Text className="mt-1 px-10 text-center text-sm text-gray-400 dark:text-gray-500">
            We couldn&apos;t find any items for this category. Try exploring
            other categories.
          </Text>
        </View>
      }
    />
  );
}

// ─── Hotel card (Stay tab) ─────────────────────────────────────────────────

interface HotelRecommendationCardProps {
  hotel: LiteAPIHotelRateItem;
  eventId?: string;
}

function HotelRecommendationCard({ hotel, eventId }: HotelRecommendationCardProps) {
  const { addIdeaToTrip } = useTrips();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const lowestPrice = useMemo(() => {
    if (!hotel.roomTypes?.length) return null;
    let min = Infinity;
    for (const rt of hotel.roomTypes) {
      const a = rt.suggestedSellingPrice?.amount;
      if (a != null && a < min) min = a;
    }
    return min === Infinity ? null : min;
  }, [hotel]);

  const handleModalDone = async (tripId: string) => {
    try {
      await addIdeaToTrip(tripId, savedItemFromHotel(hotel));
      setIsModalVisible(false);
      Alert.alert('Saved', 'Added to your trip Ideas.');
    } catch (e) {
      Alert.alert(
        'Could not save',
        e instanceof Error ? e.message : 'Please try again.'
      );
    }
  };

  const handleViewHotel = () => {
    const { checkin, checkout } = defaultCheckinCheckout();
    router.push({
      pathname: '/hotel/[hotelId]',
      params: {
        hotelId: hotel.hotelId,
        checkin,
        checkout,
        adults: '2',
        ...(eventId ? { eventId } : {}),
      },
    });
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleViewHotel}
        className="mb-6 mr-4"
        style={{ width: 177 }}>
        <View className="relative">
          <Image
            source={{ uri: hotel.thumbnail ?? undefined }}
            className="w-full aspect-square rounded-t-2xl"
            resizeMode="cover"
          />
          <View className="absolute top-2 left-2 bg-black/50 px-2.5 py-1 rounded-full flex-row items-center">
            <Text className="text-[10px] text-white font-medium">🏨 Stay</Text>
          </View>
        </View>

        <View className="mt-3">
          <Text
            numberOfLines={1}
            className="text-lg font-bold dark:text-white"
            style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
            {hotel.name}
          </Text>
          <Text
            numberOfLines={2}
            className="text-sm text-gray-500 dark:text-gray-400 mt-1"
            style={{ fontFamily: 'Inter' }}>
            {hotel.address}
          </Text>
          {lowestPrice != null && (
            <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {`From $${lowestPrice.toFixed(0)}`}
            </Text>
          )}

          <View className="flex-row items-end justify-between mt-4">
            <View />
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation?.(); setIsModalVisible(true); }}
              className="bg-primary flex-row items-center gap-x-1 h-[35px] w-[66px] justify-center rounded-[6px]">
              <Plus size={14} color="#fff" />
              <Text className="text-white text-sm">Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      <CustomModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title="Add to Trip"
        centeredTitle
        showCloseButton={false}
        showIndicator>
        <AddToTripContent
          onCancel={() => setIsModalVisible(false)}
          onDone={handleModalDone}
        />
      </CustomModal>
    </>
  );
}

// ─── Hotel list (Stay tab) ─────────────────────────────────────────────────

interface StayRecommendationsListProps {
  destinationTitle: string;
  eventId?: string;
}

function StayRecommendationsList({
  destinationTitle,
  eventId,
}: StayRecommendationsListProps) {
  const { checkin, checkout } = useMemo(() => defaultCheckinCheckout(), []);
  const { data, citySections, loading, error } = useHotels(
    destinationTitle,
    checkin,
    checkout,
    2,
    null
  );

  if (loading) {
    return (
      <View
        className="items-center justify-center py-10"
        style={{ width: SCREEN_WIDTH - 40 }}>
        <ActivityIndicator color="#FF1F8C" />
      </View>
    );
  }

  if (error) {
    return (
      <View
        className="items-center justify-center py-10"
        style={{ width: SCREEN_WIDTH - 40 }}>
        <Text className="text-sm text-gray-400 dark:text-gray-500">
          Couldn&apos;t load hotels
        </Text>
      </View>
    );
  }

  // citySections=true means multi-city response — flatten to first city or show empty
  const hotels = citySections ? [] : (data as LiteAPIHotelRateItem[]);

  return (
    <FlashList
      data={hotels}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20 }}
      keyExtractor={(item) => item.hotelId}
      renderItem={({ item }) => <HotelRecommendationCard hotel={item} eventId={eventId} />}
      ListEmptyComponent={
        <View
          className="flex items-center justify-center py-10"
          style={{ width: SCREEN_WIDTH - 40 }}>
          <Image
            source={require('@/assets/images/trip-empty-state.png')}
            className="mb-5 h-[44px] w-[44px]"
            resizeMode="contain"
          />
          <Text
            className="text-lg font-semibold dark:text-white"
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
            No hotels found
          </Text>
          <Text className="mt-1 px-10 text-center text-sm text-gray-400 dark:text-gray-500">
            No hotels available for this destination.
          </Text>
        </View>
      }
    />
  );
}

// ─── Main section ──────────────────────────────────────────────────────────

interface RecommendationsSectionProps {
  destination: { title: string; location: string };
  eventId?: string;
}

const RecommendationsSection = ({
  destination,
  eventId,
}: RecommendationsSectionProps) => {
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>('All');
  const [destinationId, setDestinationId] = useState<string | null>(null);

  useEffect(() => {
    lookupViatorDestinationId(destination.title).then(setDestinationId);
  }, [destination.title]);

  return (
    <View className="mt-8">
      <Text
        className="mb-6 text-xl font-bold dark:text-white"
        style={{
          fontFamily: 'BricolageGrotesque-ExtraBold',
          paddingHorizontal: 16,
        }}>
        Recommendations
      </Text>

      <FlashList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        className="mb-8"
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="w-2" />}
        renderItem={({ item: cat }) => (
          <TouchableOpacity
            onPress={() => setActiveCategory(cat.id as ActiveCategory)}
            className={`flex-row items-center rounded-full border px-4 py-2.5 ${
              activeCategory === cat.id
                ? 'border-primary bg-primary'
                : 'border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-dark-seconndary'
            }`}>
            <Text
              className={`text-sm font-medium ${
                activeCategory === cat.id
                  ? 'text-white'
                  : 'text-gray-500 dark:text-gray-300'
              }`}>
              {cat.emoji ? `${cat.emoji} ` : ''}
              {cat.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {activeCategory === 'Stay' ? (
        <StayRecommendationsList destinationTitle={destination.title} eventId={eventId} />
      ) : (
        <ViatorRecommendationsList
          category={activeCategory as CategoryKey}
          destinationId={destinationId}
        />
      )}
    </View>
  );
};

export default RecommendationsSection;
