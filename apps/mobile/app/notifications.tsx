import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, UserPlus } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Image, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';
import type { Doc, Id } from '@runwae/convex/convex/_generated/dataModel';

import AppSafeAreaView from '@/components/ui/AppSafeAreaView';

type ConvexNotification = Doc<'notifications'>;

const SOCIAL_TYPES = new Set(['friend_request', 'friend_accepted', 'friend_trip_created']);

function notificationCopy(n: ConvexNotification): {
  title: string;
  body: string;
} {
  const data = (n.data ?? {}) as Record<string, any>;
  switch (n.type) {
    case 'trip_invite':
      return {
        title: 'Trip invite',
        body: `You were invited to ${data.tripTitle ?? 'a trip'}`,
      };
    case 'friend_request':
      return { title: 'Friend request', body: 'Someone wants to follow you' };
    case 'friend_accepted':
      return { title: 'Friend accepted', body: 'Your follow request was accepted' };
    case 'expense_added':
      return { title: 'Expense added', body: data.description ?? 'A new expense was added' };
    case 'expense_settled':
      return { title: 'Expense settled', body: data.description ?? 'A split was settled' };
    case 'poll_created':
      return { title: 'New poll', body: data.pollTitle ?? 'A poll was created' };
    case 'poll_closed':
      return { title: 'Poll closed', body: data.pollTitle ?? 'A poll has closed' };
    case 'ticket_issued':
      return { title: 'Ticket issued', body: 'Your ticket is ready' };
    default:
      return { title: 'Notification', body: '' };
  }
}

const NotificationScreen = () => {
  const router = useRouter();
  const { dark } = useTheme();
  const [activeTab, setActiveTab] = useState<'For You' | 'Activity'>('For You');

  const notifications = useQuery(api.notifications.list, {}) ?? [];
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);

  const filtered = notifications.filter((n) =>
    activeTab === 'Activity' ? SOCIAL_TYPES.has(n.type) : !SOCIAL_TYPES.has(n.type),
  );

  const renderItem = ({ item }: { item: ConvexNotification }) => {
    const { title, body } = notificationCopy(item);
    const Icon = SOCIAL_TYPES.has(item.type) ? UserPlus : Bell;
    const time = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });
    return (
      <Pressable
        onPress={() => markRead({ notificationId: item._id })}
        className="flex-row items-start py-4 border-b border-gray-100 dark:border-dark-seconndary/50">
        <View className="h-[40px] w-[40px] rounded-full bg-gray-200 dark:bg-dark-seconndary mr-3 items-center justify-center">
          <Icon size={17} color={dark ? '#9CA3AF' : '#6B7280'} strokeWidth={1.5} />
        </View>
        <View className="flex-1">
          <Text className="text-[14px] leading-5 dark:text-gray-200">
            <Text className="font-bold text-black dark:text-white">{title} </Text>
            <Text className="text-gray-400 font-normal">{body}</Text>
          </Text>
          <Text className="text-gray-400 text-[12px] mt-2">{time}</Text>
        </View>
        {!item.isRead && (
          <View className="h-2 w-2 rounded-full bg-primary mt-2 ml-2" />
        )}
      </Pressable>
    );
  };

  const EmptyState = () => (
    <View className="flex-1 items-center justify-center px-10">
      <Image
        source={require('@/assets/images/notification-bell.png')}
        className="h-[80px] w-[80px] mb-5"
        resizeMode="contain"
      />
      <Text
        className="text-black dark:text-white text-xl text-center mb-2"
        style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
        No Notifications
      </Text>
      <Text className="text-gray-400 dark:text-gray-400 text-center text-sm leading-6 max-w-[240px]">
        You don&apos;t have any notifications yet. Check back later!
      </Text>
    </View>
  );

  return (
    <AppSafeAreaView edges={['top']}>
      <View className="flex-1">
        <View className="px-[20px] pt-4 pb-2 gap-x-5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-x-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-[35px] w-[35px] flex items-center justify-center rounded-full bg-gray-200 dark:bg-dark-seconndary">
              <ArrowLeft size={18} strokeWidth={1.5} color={dark ? '#ffffff' : '#000000'} />
            </TouchableOpacity>
            <Text
              className="font-semibold text-2xl text-black dark:text-white ml-3"
              style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
              Notifications
            </Text>
          </View>
          {notifications.some((n) => !n.isRead) && (
            <Pressable onPress={() => markAllRead({})} hitSlop={10}>
              <Text className="text-primary text-sm">Mark all read</Text>
            </Pressable>
          )}
        </View>

        <View className="flex-row px-[20px] py-4 gap-x-3 border-b border-gray-100 dark:border-dark-seconndary">
          {(['For You', 'Activity'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-5 py-[6px] rounded-full ${
                activeTab === tab ? 'bg-primary' : 'bg-gray-100 dark:bg-dark-seconndary'
              }`}>
              <Text
                className={`text-sm  ${
                  activeTab === tab ? 'text-white' : 'text-gray-500 dark:text-gray-300'
                }`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length > 0 ? (
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={(item) => item._id as unknown as string}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          />
        ) : (
          <EmptyState />
        )}
      </View>
    </AppSafeAreaView>
  );
};

export default NotificationScreen;
