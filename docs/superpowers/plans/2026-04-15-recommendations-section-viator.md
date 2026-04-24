# RecommendationsSection Viator Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded mock data in `RecommendationsSection` with live Viator products filtered to the current destination, add a hotel-backed Stay tab, and ensure the Add-to-Trip button saves to the user's real active trips.

**Architecture:** `DestinationDetailsScreen` passes its `destination` object down to `RecommendationsSection`, which resolves a Viator destination ID on mount then feeds it to `useViatorCategory` for All/Eat/Drink/Do/Shop tabs and `useHotels` for the Stay tab. Each card opens `AddToTripContent` which already correctly reads `myTrips` + `joinedTrips` from `TripsContext`.

**Tech Stack:** React Native, Expo Router, NativeWind (className), `useViatorCategory`, `useHotels`, `lookupViatorDestinationId`, `FlashList`, `TripsContext`

---

## File Map

| File | Action | What changes |
|---|---|---|
| `mobile/utils/savedIdeaInputs.ts` | Modify | Add `savedItemFromViatorIdea` and `savedItemFromHotel` |
| `mobile/components/destination/RecommendationCard.tsx` | Modify | Swap `AddOn` → `MappedViatorIdea`; update nav to `/viator/:id`; add price line |
| `mobile/components/destination/RecommendationsSection.tsx` | Rewrite | Destination prop; Viator data per tab; hotel Stay tab inline |
| `mobile/screens/destinations/DestinationDetailsScreen.tsx` | Modify | Pass `destination` prop to `<RecommendationsSection />` |

---

## Task 1: Add saved-item helpers for Viator ideas and hotels

**Files:**
- Modify: `mobile/utils/savedIdeaInputs.ts`

- [ ] **Step 1: Open the file and append the two new helpers**

  Current imports at top of `mobile/utils/savedIdeaInputs.ts`:
  ```ts
  import type { AddOn } from '@/constants/home.constant';
  import type { CreateSavedItemInput } from '@/hooks/useIdeaActions';
  import type { ItemType } from '@/hooks/useItineraryActions';
  import type { Event, Experience } from '@/types/content.types';
  ```

  Add two new imports and two new exports. The complete additions to append **after** the last export in the file:

  ```ts
  import type { MappedViatorIdea } from '@/hooks/useViatorCategory';
  import type { LiteAPIHotelRateItem } from '@/types/liteapi.types';
  ```

  Add the import lines at the top of the file alongside the existing imports, then append these two functions at the bottom:

  ```ts
  export function savedItemFromViatorIdea(
    idea: MappedViatorIdea
  ): CreateSavedItemInput {
    return {
      name: idea.title,
      type: 'activity',
      location: idea.category,
      external_id: idea.id,
      cover_image: idea.imageUri,
      notes: idea.description,
    };
  }

  export function savedItemFromHotel(
    hotel: LiteAPIHotelRateItem
  ): CreateSavedItemInput {
    const roomCount = hotel.roomTypes?.length ?? 0;
    return {
      name: hotel.name,
      type: 'hotel',
      location: 'Stay',
      external_id: hotel.hotelId,
      cover_image: hotel.thumbnail ?? null,
      notes: `${hotel.address} | ${roomCount} room${roomCount !== 1 ? 's' : ''}`,
      all_data: hotel,
    };
  }
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  cd mobile && npx tsc --noEmit 2>&1 | head -30
  ```
  Expected: zero errors referencing `savedIdeaInputs.ts`.

- [ ] **Step 3: Commit**

  ```bash
  git add mobile/utils/savedIdeaInputs.ts
  git commit -m "feat: add savedItemFromViatorIdea and savedItemFromHotel helpers"
  ```

---

## Task 2: Update RecommendationCard to accept MappedViatorIdea

**Files:**
- Modify: `mobile/components/destination/RecommendationCard.tsx`

- [ ] **Step 1: Replace the file contents entirely**

  ```tsx
  import AddToTripContent from '@/components/home/AddToTripContent';
  import CustomModal from '@/components/ui/CustomModal';
  import { useTrips } from '@/context/TripsContext';
  import { savedItemFromViatorIdea } from '@/utils/savedIdeaInputs';
  import type { MappedViatorIdea } from '@/hooks/useViatorCategory';
  import { useRouter } from 'expo-router';
  import { Plus } from 'lucide-react-native';
  import React from 'react';
  import {
    Alert,
    Image,
    Pressable,
    Text,
    TouchableOpacity,
    View,
  } from 'react-native';

  interface RecommendationCardProps {
    item: MappedViatorIdea;
  }

  const RecommendationCard = ({ item }: RecommendationCardProps) => {
    const router = useRouter();
    const { addIdeaToTrip } = useTrips();
    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const isNavigating = React.useRef(false);

    const handlePress = () => {
      if (isNavigating.current) return;
      isNavigating.current = true;
      router.navigate(`/viator/${item.id}`);
      setTimeout(() => {
        isNavigating.current = false;
      }, 1000);
    };

    const handleModalDone = async (tripId: string) => {
      try {
        await addIdeaToTrip(tripId, savedItemFromViatorIdea(item));
        setIsModalVisible(false);
        Alert.alert('Saved', 'Added to your trip Ideas.');
      } catch (e) {
        Alert.alert(
          'Could not save',
          e instanceof Error ? e.message : 'Please try again.'
        );
      }
    };

    return (
      <>
        <Pressable onPress={handlePress} className="mb-6 mr-4" style={{ width: 177 }}>
          <View className="relative">
            <Image
              source={{ uri: item.imageUri }}
              className="w-full aspect-square rounded-t-2xl"
              resizeMode="cover"
            />
            <View className="absolute top-2 left-2 bg-black/50 px-2.5 py-1 rounded-full flex-row items-center">
              <Text className="text-[10px] text-white font-medium">
                {item.categoryLabel}
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
            <Text
              numberOfLines={2}
              className="text-sm text-gray-500 dark:text-gray-400 mt-1"
              style={{ fontFamily: 'Inter' }}>
              {item.description}
            </Text>
            {item.price != null && (
              <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                From {item.currency === 'USD' ? '$' : `${item.currency} `}
                {item.price.toFixed(0)}
              </Text>
            )}

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
  };

  export default RecommendationCard;
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  cd mobile && npx tsc --noEmit 2>&1 | head -30
  ```
  Expected: zero errors referencing `RecommendationCard.tsx`.

- [ ] **Step 3: Commit**

  ```bash
  git add mobile/components/destination/RecommendationCard.tsx
  git commit -m "feat: update RecommendationCard to accept MappedViatorIdea with Viator navigation"
  ```

---

## Task 3: Refactor RecommendationsSection with destination prop, Viator data, and hotel Stay tab

**Files:**
- Rewrite: `mobile/components/destination/RecommendationsSection.tsx`

- [ ] **Step 1: Replace the file contents entirely**

  ```tsx
  import AddToTripContent from '@/components/home/AddToTripContent';
  import CustomModal from '@/components/ui/CustomModal';
  import { useTrips } from '@/context/TripsContext';
  import { useHotels } from '@/hooks/useHotels';
  import type { MappedViatorIdea } from '@/hooks/useViatorCategory';
  import { useViatorCategory } from '@/hooks/useViatorCategory';
  import type { LiteAPIHotelRateItem } from '@/types/liteapi.types';
  import { savedItemFromHotel } from '@/utils/savedIdeaInputs';
  import { lookupViatorDestinationId } from '@/utils/viator/viatorDestinationLookup';
  import type { CategoryKey } from '@/utils/viator/viatorCategoryCache';
  import { FlashList } from '@shopify/flash-list';
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
        estimatedItemSize={177}
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
  }

  function HotelRecommendationCard({ hotel }: HotelRecommendationCardProps) {
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

    return (
      <>
        <View className="mb-6 mr-4" style={{ width: 177 }}>
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
                From ${lowestPrice.toFixed(0)}
              </Text>
            )}

            <View className="flex-row items-end justify-between mt-4">
              <View />
              <TouchableOpacity
                onPress={() => setIsModalVisible(true)}
                className="bg-primary flex-row items-center gap-x-1 h-[35px] w-[66px] justify-center rounded-[6px]">
                <Plus size={14} color="#fff" />
                <Text className="text-white text-sm">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

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
  }

  function StayRecommendationsList({
    destinationTitle,
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
        estimatedItemSize={177}
        renderItem={({ item }) => <HotelRecommendationCard hotel={item} />}
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
  }

  const RecommendationsSection = ({
    destination,
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
          estimatedItemSize={90}
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
          <StayRecommendationsList destinationTitle={destination.title} />
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
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  cd mobile && npx tsc --noEmit 2>&1 | head -30
  ```
  Expected: zero errors referencing `RecommendationsSection.tsx`.

- [ ] **Step 3: Commit**

  ```bash
  git add mobile/components/destination/RecommendationsSection.tsx
  git commit -m "feat: refactor RecommendationsSection with Viator data and hotel Stay tab"
  ```

---

## Task 4: Pass destination prop from DestinationDetailsScreen

**Files:**
- Modify: `mobile/screens/destinations/DestinationDetailsScreen.tsx:129`

- [ ] **Step 1: Update the RecommendationsSection call**

  Find line 129 in `DestinationDetailsScreen.tsx`:
  ```tsx
  <RecommendationsSection />
  ```

  Replace with:
  ```tsx
  <RecommendationsSection destination={destination} />
  ```

  `destination` is already in scope from line 31: `const { destination, loading } = useDestinationById(id ?? null);` and the null/loading cases are already guarded above (lines 56–62), so `destination` is guaranteed non-null here.

- [ ] **Step 2: Verify TypeScript compiles with zero errors**

  ```bash
  cd mobile && npx tsc --noEmit 2>&1 | head -30
  ```
  Expected: no output (zero errors).

- [ ] **Step 3: Commit**

  ```bash
  git add mobile/screens/destinations/DestinationDetailsScreen.tsx
  git commit -m "feat: pass destination to RecommendationsSection for Viator filtering"
  ```

---

## Task 5: End-to-end smoke test

This project has no automated component tests, so verification is manual.

- [ ] **Step 1: Start the dev server**

  ```bash
  cd mobile && npx expo start
  ```

- [ ] **Step 2: Navigate to any destination detail screen**

  Open a destination. Confirm:
  - "Recommendations" section renders below Featured Itineraries
  - Category pills show: All · 🍹 Eat/Drink · 🏨 Stay · 🎭 Do · 🛍️ Shop
  - All tab loads a horizontal list of Viator cards with images, titles, price lines

- [ ] **Step 3: Test category tabs**

  Tap Eat/Drink, Do, Shop individually. Confirm:
  - Each shows a different set of Viator products relevant to the destination
  - Loading spinner appears briefly while fetching
  - Empty state shows if no products found

- [ ] **Step 4: Test Stay tab**

  Tap Stay. Confirm:
  - Hotel cards appear (thumbnail, name, address, price, Add button)
  - Loading spinner shown while hotels fetch

- [ ] **Step 5: Test Add to Trip flow (Viator card)**

  Tap "Add" on any Viator card. Confirm:
  - "Add to Trip" modal opens
  - Modal lists the user's real trips (not empty, not hardcoded)
  - Selecting a trip and tapping Done shows "Added to your trip Ideas." alert
  - Modal dismisses

- [ ] **Step 6: Test Add to Trip flow (hotel card)**

  Tap "Add" on a hotel card in the Stay tab. Confirm same modal and save behaviour as Step 5.

- [ ] **Step 7: Final commit if any manual fixes were needed**

  ```bash
  git add -p
  git commit -m "fix: address smoke test issues in RecommendationsSection"
  ```
  (Only needed if Step 1–6 revealed bugs requiring fixes.)
