import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { ArrowLeft, Search, UserPlus, UserCheck, X } from 'lucide-react-native';
import { useDebounce } from 'use-debounce';
import { useRouter } from 'expo-router';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';
import type { Id } from '@runwae/convex/convex/_generated/dataModel';

import AppSafeAreaView from '@/components/ui/AppSafeAreaView';

export default function FriendsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const dark = colorScheme === 'dark';

  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);

  const search = useQuery(
    api.users.searchByUsername,
    debouncedQuery.trim().length >= 2 ? { term: debouncedQuery } : 'skip',
  );
  const friends = useQuery(api.social.getFriends, {}) ?? [];
  const pending = useQuery(api.social.listPendingFriendRequests, {}) ?? [];

  const sendRequest = useMutation(api.social.sendFriendRequest);
  const respond = useMutation(api.social.respondToFriendRequest);

  const sectionLabel = (text: string) => (
    <Text
      className="text-base text-black dark:text-white mt-6 mb-3"
      style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
      {text}
    </Text>
  );

  return (
    <AppSafeAreaView edges={['top']}>
      <View className="px-5 pt-4 pb-2 flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 rounded-full bg-gray-200 dark:bg-dark-seconndary items-center justify-center">
          <ArrowLeft size={18} color={dark ? '#fff' : '#000'} />
        </Pressable>
        <Text
          className="text-2xl text-black dark:text-white"
          style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
          Friends
        </Text>
      </View>

      <View className="px-5 mt-3">
        <View className="flex-row items-center bg-gray-100 dark:bg-dark-seconndary rounded-full px-4 py-2">
          <Search size={16} color={dark ? '#9CA3AF' : '#6B7280'} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by username"
            placeholderTextColor={dark ? '#6B7280' : '#9CA3AF'}
            className="flex-1 ml-2 text-black dark:text-white"
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <X size={16} color={dark ? '#9CA3AF' : '#6B7280'} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={search ?? []}
        ListHeaderComponent={
          debouncedQuery.length >= 2 ? sectionLabel('Search results') : null
        }
        keyExtractor={(u) => u._id as unknown as string}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        ListEmptyComponent={
          <View>
            {pending.length > 0 ? sectionLabel('Pending requests') : null}
            {pending.map((p) => (
              <View
                key={p.friendshipId as unknown as string}
                className="flex-row items-center py-3">
                {p.requester.image ? (
                  <Image
                    source={{ uri: p.requester.image }}
                    className="h-10 w-10 rounded-full mr-3"
                  />
                ) : (
                  <View className="h-10 w-10 rounded-full bg-primary/10 mr-3 items-center justify-center">
                    <Text className="text-primary font-bold">
                      {(p.requester.name ?? 'U').charAt(0)}
                    </Text>
                  </View>
                )}
                <Text className="flex-1 text-black dark:text-white">
                  {p.requester.name ?? p.requester.username ?? 'User'}
                </Text>
                <Pressable
                  onPress={() =>
                    respond({ friendshipId: p.friendshipId, action: 'accept' })
                  }
                  className="bg-primary px-4 py-2 rounded-full">
                  <Text className="text-white text-xs font-semibold">
                    Accept
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    respond({ friendshipId: p.friendshipId, action: 'decline' })
                  }
                  className="ml-2 px-3 py-2">
                  <Text className="text-gray-500 text-xs">Decline</Text>
                </Pressable>
              </View>
            ))}

            {sectionLabel(`Friends (${friends.length})`)}
            {friends.length === 0 && (
              <Text className="text-sm text-gray-500">
                No friends yet — search above to send a request.
              </Text>
            )}
            {friends.map((f) => (
              <View
                key={f._id as unknown as string}
                className="flex-row items-center py-3">
                {f.image ? (
                  <Image
                    source={{ uri: f.image }}
                    className="h-10 w-10 rounded-full mr-3"
                  />
                ) : (
                  <View className="h-10 w-10 rounded-full bg-primary/10 mr-3 items-center justify-center">
                    <Text className="text-primary font-bold">
                      {(f.name ?? 'U').charAt(0)}
                    </Text>
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-black dark:text-white">
                    {f.name ?? f.username ?? 'Friend'}
                  </Text>
                  {f.username ? (
                    <Text className="text-xs text-gray-500">
                      @{f.username}
                    </Text>
                  ) : null}
                </View>
                <UserCheck size={18} color="#22C55E" />
              </View>
            ))}
          </View>
        }
        renderItem={({ item }) => (
          <View className="flex-row items-center py-3">
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                className="h-10 w-10 rounded-full mr-3"
              />
            ) : (
              <View className="h-10 w-10 rounded-full bg-primary/10 mr-3 items-center justify-center">
                <Text className="text-primary font-bold">
                  {(item.name ?? 'U').charAt(0)}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-black dark:text-white">
                {item.name ?? item.username ?? 'User'}
              </Text>
              {item.username ? (
                <Text className="text-xs text-gray-500">@{item.username}</Text>
              ) : null}
            </View>
            <Pressable
              onPress={() =>
                sendRequest({ addresseeId: item._id as Id<'users'> })
              }
              className="flex-row items-center bg-primary px-4 py-2 rounded-full">
              <UserPlus size={14} color="#fff" />
              <Text className="text-white text-xs font-semibold ml-1">
                Add
              </Text>
            </Pressable>
          </View>
        )}
      />

      {search === undefined && debouncedQuery.length >= 2 ? (
        <View className="px-5 py-4">
          <ActivityIndicator color="#FF1F8C" />
        </View>
      ) : null}
    </AppSafeAreaView>
  );
}
