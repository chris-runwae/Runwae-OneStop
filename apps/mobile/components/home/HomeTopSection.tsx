import { api } from '@runwae/convex/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

interface HomeTopSectionProps {
  user: any;
  dark?: boolean;
}

function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeTopSection({ user, dark }: HomeTopSectionProps) {
  const router = useRouter();
  const viewer = useQuery(api.users.getCurrentUser, {});
  const unread = useQuery(api.notifications.unreadCount, {}) ?? 0;

  const firstName = useMemo(() => {
    const fromConvex = (viewer?.name ?? '').trim().split(/\s+/)[0];
    if (fromConvex) return fromConvex;
    return user?.full_name?.split(' ')[0] || 'there';
  }, [viewer?.name, user?.full_name]);

  const greeting = useMemo(() => greetingFor(new Date()), []);
  const avatarUrl = viewer?.avatarUrl ?? viewer?.image ?? null;
  const initial = (firstName?.[0] ?? '?').toUpperCase();

  const greetingText = `${greeting}, ${firstName}`;

  return (
    <View className="flex-row items-start justify-between px-5 pb-4 pt-8">
      <View className="min-w-0 flex-1 pr-3">
        <Text
          className="text-2xl font-bold leading-tight text-black dark:text-white"
          style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}
          numberOfLines={2}>
          {greetingText}
        </Text>
        <Text className="mt-1 text-[15px] text-gray-500 dark:text-gray-400">
          Where are you going next?
        </Text>
      </View>

      <View className="flex-row items-center gap-2 pt-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={() => router.push('/notifications')}
          className="relative h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-dark-seconndary">
          <Bell size={20} color={dark ? '#ffffff' : '#0F0F0F'} strokeWidth={1.8} />
          {unread > 0 && (
            <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-pink-600 dark:border-black" />
          )}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profile"
          onPress={() => router.push('/profile')}
          className="h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-pink-100 dark:bg-pink-950">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
              recyclingKey={avatarUrl}
            />
          ) : (
            <Text className="text-base font-bold text-pink-600 dark:text-pink-300">
              {initial}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

