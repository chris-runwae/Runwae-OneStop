import RewardActivityFeed from '@/components/wallet/RewardActivityFeed';
import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { MOCK_ACTIVITY, MOCK_BALANCE } from '@/utils/wallet/mockData';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ActivityScreen() {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: MOCK_BALANCE.currency,
      minimumFractionDigits: 2,
    }).format(amount);

  const confirmed = MOCK_ACTIVITY.filter((a) => a.status === 'confirmed');
  const pending = MOCK_ACTIVITY.filter((a) => a.status === 'pending');
  const totalConfirmed = confirmed.reduce((s, a) => s + a.amount, 0);
  const totalPending = pending.reduce((s, a) => s + a.amount, 0);

  return (
    <AppSafeAreaView edges={['top']}>
      <ScreenHeader title="Reward Activity" hasBorder />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}>

        {/* Summary chips */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          className="mx-5 mb-6 flex-row gap-x-3">
          <View className="flex-1 items-center rounded-[14px] bg-emerald-50 p-3 dark:bg-emerald-950/40">
            <Text className="text-[10px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Confirmed
            </Text>
            <Text
              className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-400"
              style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
              {formatCurrency(totalConfirmed)}
            </Text>
          </View>
          <View className="flex-1 items-center rounded-[14px] bg-amber-50 p-3 dark:bg-amber-950/40">
            <Text className="text-[10px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Pending
            </Text>
            <Text
              className="mt-1 text-lg font-bold text-amber-700 dark:text-amber-400"
              style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
              {formatCurrency(totalPending)}
            </Text>
          </View>
        </Animated.View>

        {/* All activity */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text
            className="mb-3 px-5 text-xs font-semibold uppercase tracking-wider text-gray-400"
            style={{ fontFamily: 'BricolageGrotesque-SemiBold' }}>
            All transactions
          </Text>
          <RewardActivityFeed activities={MOCK_ACTIVITY} />
        </Animated.View>
      </ScrollView>
    </AppSafeAreaView>
  );
}
