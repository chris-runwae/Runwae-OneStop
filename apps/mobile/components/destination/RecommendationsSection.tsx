import AddToTripContent from '@/components/home/AddToTripContent';
import CustomModal from '@/components/ui/CustomModal';
import { useTrips } from '@/context/TripsContext';
import { savedItemFromDiscoveryItem } from '@/utils/savedIdeaInputs';
import { api } from '@runwae/convex/convex/_generated/api';
import { useAction } from 'convex/react';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'All', name: 'All', emoji: '' },
  { id: 'Eat/Drink', name: 'Eat/Drink', emoji: '🍹' },
  { id: 'Stay', name: 'Stay', emoji: '🏨' },
  { id: 'Do', name: 'Do', emoji: '🎭' },
  { id: 'Shop', name: 'Shop', emoji: '🛍️' },
] as const;

type ActiveCategory = 'All' | 'Eat/Drink' | 'Stay' | 'Do' | 'Shop';

// Maps the Recommendations UI pills to the categories `discovery.searchByCategory`
// understands. The action picks the right provider per category (yelp for eat,
// liteapi for stay, viator for tour/adventure, etc.) and falls back to geoapify
// when the primary returns nothing.
const CATEGORY_TO_DISCOVERY: Record<
  ActiveCategory,
  { discovery: string; termSuffix?: string }
> = {
  All: { discovery: 'tour' },
  'Eat/Drink': { discovery: 'eat' },
  Stay: { discovery: 'stay' },
  Do: { discovery: 'tour' },
  Shop: { discovery: 'tour', termSuffix: ' shopping' },
};

function defaultCheckinCheckout() {
  const today = new Date();
  const checkin = new Date(today);
  checkin.setDate(today.getDate() + 1);
  const checkout = new Date(today);
  checkout.setDate(today.getDate() + 2);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { checkin: fmt(checkin), checkout: fmt(checkout) };
}

type DiscoveryItem = {
  provider: string;
  apiRef: string;
  category: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  rating?: number;
  externalUrl?: string;
};

interface DiscoveryRecommendationCardProps {
  item: DiscoveryItem;
  categoryLabel: string;
}

function DiscoveryRecommendationCard({
  item,
  categoryLabel,
}: DiscoveryRecommendationCardProps) {
  const { addIdeaToTrip } = useTrips();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const isNavigating = React.useRef(false);

  const handlePress = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);

    if (item.provider === 'viator') {
      router.navigate(`/viator/${item.apiRef}`);
      return;
    }
    if (item.provider === 'liteapi') {
      const { checkin, checkout } = defaultCheckinCheckout();
      router.push({
        pathname: '/hotel/[hotelId]',
        params: {
          hotelId: item.apiRef,
          checkin,
          checkout,
          adults: '2',
        },
      });
      return;
    }
    if (item.externalUrl) {
      Linking.openURL(item.externalUrl).catch(() => {
        Alert.alert('Could not open link');
      });
    }
  };

  const handleModalDone = async (tripId: string) => {
    try {
      await addIdeaToTrip(tripId, savedItemFromDiscoveryItem(item));
      setIsModalVisible(false);
      Alert.alert('Saved', 'Added to your trip Ideas.');
    } catch (e) {
      Alert.alert(
        'Could not save',
        e instanceof Error ? e.message : 'Please try again.'
      );
    }
  };

  const priceLabel =
    item.price != null
      ? `From ${item.currency === 'USD' || !item.currency ? '$' : `${item.currency} `}${item.price.toFixed(0)}`
      : null;

  return (
    <>
      <Pressable onPress={handlePress} className="mb-6 mr-4" style={{ width: 177 }}>
        <View className="relative">
          <Image
            source={{ uri: item.imageUrl ?? undefined }}
            className="w-full aspect-square rounded-t-2xl"
            resizeMode="cover"
          />
          <View className="absolute top-2 left-2 bg-black/50 px-2.5 py-1 rounded-full flex-row items-center">
            <Text className="text-[10px] text-white font-medium">
              {categoryLabel}
            </Text>
          </View>
        </View>

        <View className="mt-3">
          <Text
            numberOfLines={1}
            className="text-lg font-bold dark:text-white"
            style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
            {item.title}
          </Text>
          {item.description ? (
            <Text
              numberOfLines={2}
              className="text-sm text-gray-500 dark:text-gray-400 mt-1"
              style={{ fontFamily: 'Inter' }}>
              {item.description}
            </Text>
          ) : null}
          {priceLabel ? (
            <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {priceLabel}
            </Text>
          ) : null}

          <View className="flex-row items-end justify-between mt-4">
            <TouchableOpacity onPress={handlePress}>
              <Text className="text-primary text-sm font-semibold underline">
                View Details
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              className="bg-primary flex-row items-center gap-x-1 h-[35px] w-[66px] justify-center rounded-[6px]">
              <Plus size={14} color="#fff" />
              <Text className="text-white text-sm">Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>

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

interface RecommendationsSectionProps {
  destination: {
    title: string;
    location: string;
    coords?: { lat: number; lng: number };
  };
  /** Reserved for future event-specific saved-item plumbing. */
  eventId?: string;
}

const RecommendationsSection = ({
  destination,
}: RecommendationsSectionProps) => {
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>('All');
  const search = useAction(api.discovery.searchByCategory);
  const [items, setItems] = useState<DiscoveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const lat = destination.coords?.lat;
  const lng = destination.coords?.lng;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    const cfg = CATEGORY_TO_DISCOVERY[activeCategory];
    const term = cfg.termSuffix
      ? `${destination.title}${cfg.termSuffix}`
      : destination.title;
    const args: Record<string, unknown> = {
      category: cfg.discovery,
      term,
      limit: 12,
    };
    if (lat !== undefined) args.lat = lat;
    if (lng !== undefined) args.lng = lng;
    if (cfg.discovery === 'stay') {
      const { checkin, checkout } = defaultCheckinCheckout();
      args.checkin = checkin;
      args.checkout = checkout;
    }
    (search(args as any) as Promise<DiscoveryItem[]>)
      .then((res) => {
        if (!cancelled) setItems(res ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeCategory, destination.title, lat, lng, search]);

  const categoryLabel = useMemo(
    () => CATEGORIES.find((c) => c.id === activeCategory)?.name ?? activeCategory,
    [activeCategory]
  );

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

      {loading ? (
        <View
          className="items-center justify-center py-10"
          style={{ width: SCREEN_WIDTH - 40 }}>
          <ActivityIndicator color="#FF1F8C" />
        </View>
      ) : error ? (
        <View
          className="items-center justify-center py-10"
          style={{ width: SCREEN_WIDTH - 40 }}>
          <Text className="text-sm text-gray-400 dark:text-gray-500">
            Couldn&apos;t load recommendations
          </Text>
        </View>
      ) : (
        <FlashList
          data={items}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          keyExtractor={(item) => `${item.provider}:${item.apiRef}`}
          renderItem={({ item }) => (
            <DiscoveryRecommendationCard
              item={item}
              categoryLabel={categoryLabel}
            />
          )}
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
      )}
    </View>
  );
};

export default RecommendationsSection;
