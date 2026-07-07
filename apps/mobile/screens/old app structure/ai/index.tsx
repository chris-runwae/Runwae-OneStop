import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@runwae/convex/convex/_generated/api';

import AppSafeAreaView from '@/components/ui/AppSafeAreaView';

export default function AiTripsScreen() {
  const router = useRouter();
  const quota = useQuery(api.ai.getQuota, {});
  const trips = useQuery(api.ai.getMyAiTrips, {});

  return (
    <AppSafeAreaView edges={['top']}>
      <View className="px-5 pt-4 pb-2 flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 rounded-full bg-gray-200 dark:bg-dark-seconndary items-center justify-center">
          <ArrowLeft size={18} color="#000" />
        </Pressable>
        <View className="flex-row items-center gap-2">
          <Sparkles size={20} color="#FF1F8C" />
          <Text
            className="text-2xl text-black dark:text-white"
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
            AI Trip Planner
          </Text>
        </View>
      </View>

      <View className="px-5 mt-3">
        {quota ? (
          <View className="bg-primary/10 dark:bg-primary/20 rounded-xl p-4">
            <Text className="text-sm font-semibold text-primary">
              {quota.remaining} of {quota.limit} plans remaining
            </Text>
            <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Tap a discoverable event and choose &ldquo;Plan with AI&rdquo; to
              generate a trip from it.
            </Text>
          </View>
        ) : (
          <ActivityIndicator color="#FF1F8C" />
        )}
      </View>

      <Text
        className="px-5 mt-6 mb-2 text-base text-black dark:text-white"
        style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
        Recent generations
      </Text>

      {trips === undefined ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#FF1F8C" />
        </View>
      ) : trips.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-sm text-gray-500 text-center">
            You haven&apos;t generated any AI trips yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(t) => t._id as unknown as string}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View className="bg-white dark:bg-dark-seconndary/50 rounded-xl p-4 mb-3 border border-gray-100 dark:border-dark-seconndary">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs uppercase text-primary font-semibold">
                  {item.status}
                </Text>
                <Text className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  })}
                </Text>
              </View>
              <Text
                className="text-sm text-black dark:text-white"
                numberOfLines={3}>
                {item.prompt}
              </Text>
            </View>
          )}
        />
      )}
    </AppSafeAreaView>
  );
}
