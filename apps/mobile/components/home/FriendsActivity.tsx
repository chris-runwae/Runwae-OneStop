import { api } from '@runwae/convex/convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import { useQuery } from 'convex/react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View, useColorScheme } from 'react-native';
import { formatDistanceToNow } from 'date-fns';

import SectionHeader from '@/components/ui/SectionHeader';
import SkeletonBox from '@/components/ui/SkeletonBox';

type ActivityDoc = FunctionReturnType<
  typeof api.social.getFriendActivityHydrated
>[number];

interface FriendsActivityProps {
  onFindFriends: () => void;
}

const FriendsActivity = ({ onFindFriends }: FriendsActivityProps) => {
  const router = useRouter();
  const activity = useQuery(api.social.getFriendActivityHydrated, { limit: 5 });
  const items = activity?.slice(0, 5);

  return (
    <View>
      <SectionHeader title="Friends' activity" onPress={() => router.push('/feed' as any)} />
      <View className="px-5 pt-3">
        {activity === undefined ? (
          <View className="gap-y-2">
            <SkeletonBox width="100%" height={48} borderRadius={12} />
            <SkeletonBox width="100%" height={48} borderRadius={12} />
            <SkeletonBox width="100%" height={48} borderRadius={12} />
          </View>
        ) : items && items.length > 0 ? (
          items.map((a, i) => (
            <ActivityRow
              key={`${a.kind}-${a.createdAt}-${i}`}
              item={a}
              isLast={i === items.length - 1}
            />
          ))
        ) : (
          <View className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 dark:border-gray-700">
            <Text className="text-center text-[13px] text-gray-500 dark:text-gray-400">
              Add friends to see what they&apos;re planning.
            </Text>
            <Pressable onPress={onFindFriends} className="mt-2">
              <Text className="text-center text-[13px] font-semibold text-pink-600 dark:text-pink-400">
                Find friends
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

const ActivityRow = ({
  item,
  isLast,
}: {
  item: ActivityDoc;
  isLast: boolean;
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const dark = colorScheme === 'dark';
  const time = formatDistanceToNow(new Date(item.createdAt), {
    addSuffix: true,
  });
  const actor = item.actor;
  const actorName = actor.name ?? actor.username ?? 'A friend';

  const goTrip = (slug: string | undefined) => {
    if (!slug) return;
    router.push(`/(tabs)/(trips)/${slug}` as any);
  };
  const goEvent = (slug: string | undefined) => {
    if (!slug) return;
    router.push(`/events/${slug}` as any);
  };

  let body: React.ReactNode = null;
  let cta: React.ReactNode = null;

  if (item.kind === 'trip_created') {
    body = (
      <Text
        numberOfLines={2}
        className="text-[13.5px] text-black dark:text-white">
        <Text className="font-semibold">{actorName}</Text> started planning{' '}
        <Text className="font-semibold text-pink-600 dark:text-pink-400">
          {item.trip.title}
        </Text>
      </Text>
    );
    cta = (
      <CTA label="See trip" onPress={() => goTrip((item.trip as any).slug ?? (item.trip as any)._id)} />
    );
  } else if (item.kind === 'event_going') {
    body = (
      <Text
        numberOfLines={2}
        className="text-[13.5px] text-black dark:text-white">
        <Text className="font-semibold">{actorName}</Text> is going to{' '}
        <Text className="font-semibold text-pink-600 dark:text-pink-400">
          {item.event?.name ?? 'an event'}
        </Text>
      </Text>
    );
    if (item.event)
      cta = (
        <CTA
          label="See event"
          onPress={() => goEvent((item.event as any).slug ?? (item.event as any)._id)}
        />
      );
  } else if (item.kind === 'item_saved') {
    body = (
      <Text
        numberOfLines={2}
        className="text-[13.5px] text-black dark:text-white">
        <Text className="font-semibold">{actorName}</Text> saved{' '}
        <Text className="font-semibold text-pink-600 dark:text-pink-400">
          {item.savedItem.title}
        </Text>
      </Text>
    );
  } else if (item.kind === 'user_save') {
    body = (
      <Text
        numberOfLines={2}
        className="text-[13.5px] text-black dark:text-white">
        <Text className="font-semibold">{actorName}</Text> liked{' '}
        <Text className="font-semibold text-pink-600 dark:text-pink-400">
          {item.save.title}
        </Text>
      </Text>
    );
  } else {
    // trip_post
    body = (
      <View>
        <Text
          numberOfLines={2}
          className="text-[13.5px] text-black dark:text-white">
          <Text className="font-semibold">{actorName}</Text> posted on{' '}
          <Text className="font-semibold text-pink-600 dark:text-pink-400">
            {item.trip?.title ?? 'their trip'}
          </Text>
        </Text>
        {item.post?.content ? (
          <Text
            numberOfLines={1}
            className="mt-0.5 text-[11.5px] text-gray-500 dark:text-gray-400">
            {item.post.content}
          </Text>
        ) : null}
      </View>
    );
    if (item.trip)
      cta = (
        <CTA
          label="Open"
          onPress={() => goTrip((item.trip as any).slug ?? (item.trip as any)._id)}
        />
      );
  }

  return (
    <View
      className={`flex-row items-center gap-3 py-2.5 ${
        isLast ? '' : 'border-b border-gray-100 dark:border-white/10'
      }`}
      style={{ minHeight: 60 }}>
      {actor.image ? (
        <Image
          source={{ uri: actor.image }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={150}
          recyclingKey={actor.image}
        />
      ) : (
        <View className="h-10 w-10 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950">
          <Text className="font-bold text-pink-600 dark:text-pink-300">
            {(actorName[0] ?? '?').toUpperCase()}
          </Text>
        </View>
      )}
      <View className="min-w-0 flex-1">
        {body}
        <Text className="mt-0.5 text-[11.5px] text-gray-500 dark:text-gray-400">
          {time}
        </Text>
      </View>
      {cta}
    </View>
  );
};

const CTA = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    className="flex-row items-center gap-1 self-center">
    <Text className="text-xs font-semibold text-pink-600 dark:text-pink-400">
      {label}
    </Text>
    <ArrowRight size={11} color="#FF2E92" strokeWidth={2.4} />
  </Pressable>
);

export default FriendsActivity;
