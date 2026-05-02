import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';

import AppSafeAreaView from '@/components/ui/AppSafeAreaView';

type SavedRow = {
  _id: string;
  category: string;
  provider: string;
  apiRef: string;
  title: string;
  imageUrl?: string;
  locationName?: string;
};

const CATEGORY_LABELS: Record<string, { emoji: string; label: string }> = {
  hotel: { emoji: '🏨', label: 'Stays' },
  flight: { emoji: '✈️', label: 'Flights' },
  tour: { emoji: '🎟️', label: 'Tours' },
  activity: { emoji: '🎭', label: 'Activities' },
  restaurant: { emoji: '🍽️', label: 'Eat & Drink' },
  event: { emoji: '🎫', label: 'Events' },
  destination: { emoji: '🌍', label: 'Destinations' },
  trip: { emoji: '🧳', label: 'Trips' },
  other: { emoji: '💡', label: 'Other' },
};

export default function SavedScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const groupedRaw = useQuery(api.user_saves.listGrouped, {});
  // listGrouped returns either a flat array (anonymous viewer) or
  // a record-by-category. Coerce to the by-category map either way.
  const grouped: Record<string, SavedRow[]> | undefined = (() => {
    if (groupedRaw === undefined) return undefined;
    if (Array.isArray(groupedRaw)) return {};
    return groupedRaw as unknown as Record<string, SavedRow[]>;
  })();
  const removeSave = useMutation(api.user_saves.remove);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loading = grouped === undefined;
  const isEmpty =
    !loading &&
    grouped !== undefined &&
    Object.values(grouped).every((arr) => arr.length === 0);

  return (
    <AppSafeAreaView edges={['top']}>
      <View className="px-5 pt-4 pb-2">
        <Text
          className="text-3xl text-black dark:text-white"
          style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
          Saved
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          Things you&apos;ve hearted across Discover
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#FF1F8C" />
        </View>
      ) : isEmpty ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text
            className="text-lg text-black dark:text-white text-center"
            style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
            Nothing saved yet
          </Text>
          <Text className="text-sm text-gray-500 text-center mt-2">
            Tap the heart on a hotel, tour or destination to start a wishlist.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}>
          {Object.entries(grouped ?? {}).map(([category, items]) => {
            const list = items;
            if (list.length === 0) return null;
            const meta = CATEGORY_LABELS[category] ?? CATEGORY_LABELS.other;
            return (
              <View key={category} className="mb-6">
                <Text
                  className="text-base text-black dark:text-white mb-3"
                  style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
                  {meta.emoji} {meta.label} ({list.length})
                </Text>
                {list.map((row) => {
                  const id = row._id as unknown as string;
                  return (
                    <View
                      key={id}
                      className="flex-row items-center bg-white dark:bg-dark-seconndary/50 rounded-xl p-3 mb-3 border border-gray-100 dark:border-dark-seconndary">
                      <Image
                        source={{
                          uri:
                            row.imageUrl ??
                            'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400',
                        }}
                        className="w-[60px] h-[60px] rounded-lg"
                      />
                      <View className="flex-1 ml-3">
                        <Text
                          className="text-sm text-black dark:text-white"
                          numberOfLines={1}>
                          {row.title}
                        </Text>
                        {row.locationName ? (
                          <Text
                            className="text-xs text-gray-500 mt-1"
                            numberOfLines={1}>
                            {row.locationName}
                          </Text>
                        ) : null}
                      </View>
                      <Pressable
                        hitSlop={10}
                        disabled={busyId === id}
                        onPress={async () => {
                          setBusyId(id);
                          try {
                            await removeSave({
                              provider: row.provider,
                              apiRef: row.apiRef,
                            });
                          } finally {
                            setBusyId(null);
                          }
                        }}>
                        <Trash2
                          size={18}
                          color={
                            colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'
                          }
                        />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      )}
    </AppSafeAreaView>
  );
}
