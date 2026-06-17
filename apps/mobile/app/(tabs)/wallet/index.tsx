import CurrencyPickerSheet from '@/components/wallet/CurrencyPickerSheet';
import EventRewardsSection from '@/components/wallet/EventRewardsSection';
import MerchantOfferCard from '@/components/wallet/MerchantOfferCard';
import RewardActivityFeed from '@/components/wallet/RewardActivityFeed';
import WalletBalanceCard from '@/components/wallet/WalletBalanceCard';
import WalletEmptyState from '@/components/wallet/WalletEmptyState';
import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import SectionHeader from '@/components/ui/SectionHeader';
import type { MerchantOffer } from '@/types/wallet.types';
import {
  MOCK_ACTIVITY,
  MOCK_BALANCE,
  MOCK_EVENT_REWARDS,
  MOCK_LINKED_CARD,
  MOCK_MERCHANTS,
} from '@/utils/wallet/mockData';
import { convertFromGBP } from '@/utils/wallet/currencies';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Bell, Settings } from 'lucide-react-native';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const SECTION_GAP = 32;

export default function WalletScreen() {
  const router = useRouter();
  const { dark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState(MOCK_BALANCE.currency);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const linkedCard = MOCK_LINKED_CARD;
  const hasLinkedCard = !!linkedCard;

  // Convert all balance amounts to the selected display currency
  const convertedBalance = {
    available: convertFromGBP(MOCK_BALANCE.available, displayCurrency),
    pending: convertFromGBP(MOCK_BALANCE.pending, displayCurrency),
    lifetime: convertFromGBP(MOCK_BALANCE.lifetime, displayCurrency),
    currency: displayCurrency,
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const handleMerchantPress = (merchant: MerchantOffer) => {
    router.push(`/wallet/merchant/${merchant.id}` as any);
  };

  const handleLinkCard = () => {
    router.push('/wallet/link-card' as any);
  };

  return (
    <AppSafeAreaView edges={['top']}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        className="flex-row items-center justify-between border-b border-b-gray-100 px-5 py-5 dark:border-b-gray-800">
        <View>
          <Text
            className="text-2xl text-black dark:text-white"
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
            Wallet
          </Text>
          {hasLinkedCard && (
            <Text className="mt-0.5 text-xs text-gray-400">
              Earning rewards at partner merchants
            </Text>
          )}
        </View>
        <View className="flex-row items-center gap-x-2">
          <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <Bell size={16} strokeWidth={1.5} color={dark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <Settings size={16} strokeWidth={1.5} color={dark ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={dark ? '#ffffff' : '#000000'}
          />
        }>

        {hasLinkedCard ? (
          <>
            {/* Balance card */}
            <WalletBalanceCard
              balance={convertedBalance}
              card={linkedCard}
              onCurrencyPress={() => setShowCurrencyPicker(true)}
            />

            {/* Quick actions */}
            <Animated.View
              entering={FadeInDown.delay(150).duration(400)}
              style={{ marginTop: 12 }}
              className="mx-5 flex-row gap-x-2">
              <TouchableOpacity
                onPress={() => router.push('/wallet/activity' as any)}
                className="flex-1 items-center rounded-[14px] bg-gray-100 py-3.5 dark:bg-gray-800">
                <Text
                  className="text-xs font-semibold text-black dark:text-white"
                  style={{ fontFamily: 'BricolageGrotesque-SemiBold' }}>
                  View History
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 items-center rounded-[14px] bg-primary py-3.5">
                <Text
                  className="text-xs font-bold text-white"
                  style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
                  Explore Merchants
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Event Rewards */}
            <View style={{ marginTop: SECTION_GAP }}>
              <EventRewardsSection eventRewards={MOCK_EVENT_REWARDS} />
            </View>

            {/* Merchant Offers */}
            <View style={{ marginTop: SECTION_GAP }}>
              <SectionHeader
                title="Partner Merchants"
                subtitle="Earn rewards when you pay with your linked card"
                onPress={() => {}}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4 }}>
                {MOCK_MERCHANTS.map((merchant, i) => (
                  <MerchantOfferCard
                    key={merchant.id}
                    merchant={merchant}
                    index={i}
                    onPress={handleMerchantPress}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Recent Activity */}
            <View style={{ marginTop: SECTION_GAP }}>
              <SectionHeader
                title="Recent Activity"
                subtitle="Your latest reward earnings"
                onPress={() => router.push('/wallet/activity' as any)}
              />
              <View style={{ marginTop: 14 }}>
                <RewardActivityFeed activities={MOCK_ACTIVITY} preview />
              </View>
            </View>
          </>
        ) : (
          <View>
            <WalletEmptyState onLinkCard={handleLinkCard} />

            <Animated.View
              entering={FadeInDown.delay(400).duration(500)}
              style={{ marginTop: SECTION_GAP }}>
              <SectionHeader
                title="Available at AfroNation Weekend"
                subtitle="Link your card to unlock these rewards"
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4 }}>
                {MOCK_MERCHANTS.map((merchant, i) => (
                  <MerchantOfferCard
                    key={merchant.id}
                    merchant={merchant}
                    index={i}
                    onPress={handleMerchantPress}
                  />
                ))}
              </ScrollView>
            </Animated.View>
          </View>
        )}
      </ScrollView>

      <CurrencyPickerSheet
        visible={showCurrencyPicker}
        selected={displayCurrency}
        onSelect={setDisplayCurrency}
        onClose={() => setShowCurrencyPicker(false)}
      />
    </AppSafeAreaView>
  );
}
