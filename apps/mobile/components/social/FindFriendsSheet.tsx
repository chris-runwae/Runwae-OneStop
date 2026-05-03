import { api } from '@runwae/convex/convex/_generated/api';
import type { Id } from '@runwae/convex/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { Check, Search, UserPlus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { useDebounce } from 'use-debounce';

import AppSafeAreaView from '@/components/ui/AppSafeAreaView';

interface FindFriendsSheetProps {
  open: boolean;
  onClose: () => void;
}

const FindFriendsSheet = ({ open, onClose }: FindFriendsSheetProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const dark = colorScheme === 'dark';

  const [term, setTerm] = useState('');
  const [debouncedTerm] = useDebounce(term, 250);

  const viewer = useQuery(api.users.getCurrentUser, {});
  const matches = useQuery(
    api.users.searchByUsername,
    debouncedTerm.trim().length >= 2 ? { term: debouncedTerm } : 'skip',
  );
  const sendRequest = useMutation(api.social.sendFriendRequest);
  const [sentTo, setSentTo] = useState<
    Record<string, 'pending' | 'sent' | 'error'>
  >({});

  const filtered =
    matches?.filter((u) => u._id !== viewer?._id) ?? matches;

  async function handleAdd(userId: Id<'users'>) {
    const key = userId as unknown as string;
    setSentTo((s) => ({ ...s, [key]: 'pending' }));
    try {
      await sendRequest({ addresseeId: userId });
      setSentTo((s) => ({ ...s, [key]: 'sent' }));
    } catch {
      setSentTo((s) => ({ ...s, [key]: 'error' }));
    }
  }

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle={
        Platform.OS === 'ios' ? 'formSheet' : 'fullScreen'
      }
      onRequestClose={onClose}>
      <AppSafeAreaView edges={['top']}>
        <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
          <Text
            className="text-2xl text-black dark:text-white"
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
            Find friends
          </Text>
          <Pressable
            onPress={onClose}
            accessibilityLabel="Close"
            className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-dark-seconndary">
            <X size={18} color={dark ? '#fff' : '#0F0F0F'} />
          </Pressable>
        </View>

        <Text className="px-5 pb-3 text-[13px] text-gray-500 dark:text-gray-400">
          Search by username — case-insensitive, minimum 2 characters.
        </Text>

        <View className="px-5">
          <View className="flex-row items-center gap-2 rounded-full bg-gray-100 px-3 py-2.5 dark:bg-dark-seconndary">
            <Search size={16} color={dark ? '#9CA3AF' : '#6B7280'} />
            <TextInput
              autoFocus
              value={term}
              onChangeText={setTerm}
              placeholder="@username"
              placeholderTextColor={dark ? '#6B7280' : '#9CA3AF'}
              autoCapitalize="none"
              autoCorrect={false}
              className="min-w-0 flex-1 text-sm text-black dark:text-white"
            />
            {term.length > 0 && (
              <Pressable onPress={() => setTerm('')}>
                <X size={14} color={dark ? '#9CA3AF' : '#6B7280'} />
              </Pressable>
            )}
          </View>
        </View>

        <View className="flex-1 px-5 pt-4">
          {term.trim().length < 2 ? (
            <View className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 dark:border-gray-700">
              <Text className="text-center text-[13px] text-gray-500 dark:text-gray-400">
                Type a username to search.
              </Text>
            </View>
          ) : filtered === undefined ? (
            <View className="items-center pt-6">
              <ActivityIndicator color="#FF1F8C" />
            </View>
          ) : filtered.length === 0 ? (
            <View className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 dark:border-gray-700">
              <Text className="text-center text-[13px] text-gray-500 dark:text-gray-400">
                No usernames matched <Text className="font-bold">{term}</Text>.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(u) => u._id as unknown as string}
              ItemSeparatorComponent={() => <View className="h-1" />}
              renderItem={({ item: u }) => {
                const key = u._id as unknown as string;
                const state = sentTo[key];
                const initial = (u.name ?? u.username ?? '?')
                  .charAt(0)
                  .toUpperCase();
                return (
                  <View className="flex-row items-center gap-3 rounded-xl px-2 py-2">
                    {u.image ? (
                      <Image
                        source={{ uri: u.image }}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                      />
                    ) : (
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950">
                        <Text className="font-bold text-pink-600 dark:text-pink-300">
                          {initial}
                        </Text>
                      </View>
                    )}
                    <View className="min-w-0 flex-1">
                      <Text
                        className="text-sm font-semibold text-black dark:text-white"
                        numberOfLines={1}>
                        {u.name ?? u.username}
                      </Text>
                      {u.username && (
                        <Text
                          className="text-xs text-gray-500"
                          numberOfLines={1}>
                          @{u.username}
                        </Text>
                      )}
                    </View>
                    <Pressable
                      onPress={() => handleAdd(u._id)}
                      disabled={state === 'pending' || state === 'sent'}
                      className={`h-9 flex-row items-center gap-1.5 rounded-full bg-pink-600 px-3 ${
                        state === 'pending' || state === 'sent'
                          ? 'opacity-60'
                          : ''
                      }`}>
                      {state === 'sent' ? (
                        <>
                          <Check size={14} color="#fff" />
                          <Text className="text-xs font-semibold text-white">
                            Requested
                          </Text>
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} color="#fff" />
                          <Text className="text-xs font-semibold text-white">
                            Add friend
                          </Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                );
              }}
            />
          )}
        </View>
      </AppSafeAreaView>
    </Modal>
  );
};

export default FindFriendsSheet;
