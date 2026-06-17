import type { RewardActivity } from '@/types/wallet.types';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, Clock } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface RewardActivityFeedProps {
  activities: RewardActivity[];
  preview?: boolean;
}

const ActivityItem: React.FC<{ item: RewardActivity; index: number }> = ({
  item,
  index,
}) => {
  const isConfirmed = item.status === 'confirmed';

  const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);

  const timeAgo = formatDistanceToNow(new Date(item.createdAt), {
    addSuffix: true,
  });

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70).duration(400)}
      className="flex-row items-center gap-x-3 px-5 py-3.5">

      {/* Icon */}
      <View
        className={`h-10 w-10 items-center justify-center rounded-full ${
          isConfirmed
            ? 'bg-emerald-50 dark:bg-emerald-950/50'
            : 'bg-amber-50 dark:bg-amber-950/50'
        }`}>
        {isConfirmed ? (
          <CheckCircle2 size={18} color="#10b981" />
        ) : (
          <Clock size={18} color="#f59e0b" />
        )}
      </View>

      {/* Details */}
      <View className="flex-1">
        <Text
          className="text-sm font-semibold text-black dark:text-white"
          style={{ fontFamily: 'BricolageGrotesque-SemiBold' }}>
          {item.merchantName}
        </Text>
        <View className="mt-0.5 flex-row items-center gap-x-1.5">
          <Text className="text-[11px] text-gray-400">{timeAgo}</Text>
          {!isConfirmed && (
            <>
              <View className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              <Text className="text-[11px] text-amber-500">Pending</Text>
            </>
          )}
          {item.eventName && (
            <>
              <View className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              <Text className="text-[10px] text-gray-400" numberOfLines={1}>
                {item.eventName}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Amount */}
      <View className="items-end">
        <Text
          className={`text-sm font-bold ${
            isConfirmed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
          }`}
          style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
          +{formatAmount(item.amount, item.currency)}
        </Text>
        <Text className="mt-0.5 text-[10px] capitalize text-gray-400">
          {item.type}
        </Text>
      </View>
    </Animated.View>
  );
};

const RewardActivityFeed: React.FC<RewardActivityFeedProps> = ({
  activities,
  preview = false,
}) => {
  const displayItems = preview ? activities.slice(0, 4) : activities;

  if (!displayItems.length) {
    return (
      <View className="items-center px-5 py-8">
        <Text className="text-sm text-gray-400">No reward activity yet</Text>
        <Text className="mt-1 text-xs text-gray-300 dark:text-gray-600">
          Earn rewards by shopping at partner merchants
        </Text>
      </View>
    );
  }

  return (
    <View className="overflow-hidden rounded-[18px] bg-white dark:bg-dark-seconndary mx-5">
      {displayItems.map((item, index) => (
        <View key={item.id}>
          <ActivityItem item={item} index={index} />
          {index < displayItems.length - 1 && (
            <View className="mx-5 h-px bg-gray-100 dark:bg-gray-800" />
          )}
        </View>
      ))}
    </View>
  );
};

export default RewardActivityFeed;
