import React from 'react';
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';

import AppSafeAreaView from '@/components/ui/AppSafeAreaView';

export default function FeedScreen() {
  const feed = useQuery(api.social.getFriendActivityHydrated, { limit: 50 });
  const loading = feed === undefined;

  return (
    <AppSafeAreaView edges={['top']}>
      <View className="px-5 pt-4 pb-2">
        <Text
          className="text-3xl text-black dark:text-white"
          style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
          Feed
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          What your friends are up to
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#FF1F8C" />
        </View>
      ) : !feed || feed.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text
            className="text-lg text-black dark:text-white text-center"
            style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
            Nothing in your feed yet
          </Text>
          <Text className="text-sm text-gray-500 text-center mt-2">
            Follow friends to see their saves, trips, and reviews here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={feed}
          keyExtractor={(item) =>
            (item as any)._id ??
            `${(item as any).actor?._id ?? 'a'}-${item.createdAt}`
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          renderItem={({ item }) => {
            const actor = (item as any).actor;
            const verb = (item as any).verb ?? 'shared';
            return (
              <View className="flex-row items-start py-4 border-b border-gray-100 dark:border-dark-seconndary/50">
                {actor?.avatarUrl || actor?.image ? (
                  <Image
                    source={{ uri: actor?.avatarUrl ?? actor?.image }}
                    className="h-10 w-10 rounded-full mr-3"
                  />
                ) : (
                  <View className="h-10 w-10 rounded-full bg-primary/10 mr-3 items-center justify-center">
                    <Text className="text-primary font-bold">
                      {(actor?.name ?? 'U').charAt(0)}
                    </Text>
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-sm text-black dark:text-white">
                    <Text className="font-bold">{actor?.name ?? 'A friend'}</Text>{' '}
                    <Text className="text-gray-500">{verb}</Text>{' '}
                    <Text className="font-semibold">{(item as any).subjectTitle ?? ''}</Text>
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                    })}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </AppSafeAreaView>
  );
}
