import type { EventReward, RewardItem } from '@/types/wallet.types';
import { useTheme } from '@react-navigation/native';
import { ChevronRight, Sparkles } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface EventRewardsSectionProps {
  eventRewards: EventReward[];
}

const REWARD_COLORS = {
  cashback: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-900',
    dot: '#10b981',
  },
  discount: {
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    text: 'text-violet-700 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-900',
    dot: '#8b5cf6',
  },
  perk: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-900',
    dot: '#f59e0b',
  },
};

const RewardPill: React.FC<{ item: RewardItem; index: number }> = ({
  item,
  index,
}) => {
  const colors = REWARD_COLORS[item.type];

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(400).springify()}>
      <View
        className={`mr-3 flex-row items-center gap-x-2 rounded-[14px] border px-3.5 py-2.5 ${colors.bg} ${colors.border}`}>
        <Text className="text-base">{item.emoji}</Text>
        <View>
          <Text
            className={`text-xs font-bold ${colors.text}`}
            style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
            {item.value}
          </Text>
          <Text className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
            {item.description}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const EventRewardsSection: React.FC<EventRewardsSectionProps> = ({
  eventRewards,
}) => {
  const { dark } = useTheme();

  if (!eventRewards.length) return null;

  const activeEvent = eventRewards[0];

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-between px-5">
        <View className="flex-row items-center gap-x-2">
          <View className="h-7 w-7 items-center justify-center rounded-full bg-primary/10">
            <Sparkles size={14} color="#FF2E92" />
          </View>
          <View>
            <Text
              className="text-base font-bold dark:text-white"
              style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
              {activeEvent.eventName}
            </Text>
            <Text className="text-[11px] text-gray-400">
              {activeEvent.rewards.length} active rewards
            </Text>
          </View>
        </View>
        <TouchableOpacity className="flex-row items-center gap-x-0.5">
          <Text className="text-xs font-medium text-primary">View all</Text>
          <ChevronRight size={12} color="#FF2E92" />
        </TouchableOpacity>
      </View>

      {/* Rewards horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4 }}>
        {activeEvent.rewards.map((reward, i) => (
          <RewardPill key={reward.id} item={reward} index={i} />
        ))}
      </ScrollView>
    </Animated.View>
  );
};

export default EventRewardsSection;
