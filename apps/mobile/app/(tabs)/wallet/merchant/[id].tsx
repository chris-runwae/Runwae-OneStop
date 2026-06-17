import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import { MOCK_MERCHANTS } from '@/utils/wallet/mockData';
import { useTheme } from '@react-navigation/native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Info,
  MapPin,
  Sparkles,
  Tag,
  Zap,
} from 'lucide-react-native';
import React from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const REWARD_TYPE_COLORS: Record<string, { bg: string; text: string; pill: string }> = {
  cashback: { bg: '#10b98115', text: '#10b981', pill: '#10b981' },
  discount: { bg: '#8b5cf615', text: '#8b5cf6', pill: '#8b5cf6' },
  perk: { bg: '#f59e0b15', text: '#f59e0b', pill: '#f59e0b' },
};

const HERO_HEIGHT = 280;
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const HOW_TO_EARN_STEPS = [
  { icon: CreditCard, text: 'Link your card to your Runwae Pass' },
  { icon: Zap, text: 'Pay normally at this merchant' },
  { icon: CheckCircle2, text: 'Cashback is automatically credited' },
];

export default function MerchantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { dark } = useTheme();
  const scrollY = useSharedValue(0);

  const merchant = MOCK_MERCHANTS.find((m) => m.id === id) ?? MOCK_MERCHANTS[0];
  const colors = REWARD_TYPE_COLORS[merchant.rewardType] ?? REWARD_TYPE_COLORS.cashback;

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, HERO_HEIGHT],
          [0, -HERO_HEIGHT / 3],
          'clamp'
        ),
      },
      {
        scale: interpolate(scrollY.value, [-80, 0], [1.15, 1], 'clamp'),
      },
    ],
  }));

  const headerOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [HERO_HEIGHT - 80, HERO_HEIGHT - 40], [0, 1], 'clamp'),
  }));

  return (
    <AppSafeAreaView edges={[]} className="bg-white dark:bg-black">
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      {/* Floating back button */}
      <Animated.View
        entering={FadeIn.duration(300)}
        className="absolute left-5 z-10"
        style={{ top: Platform.OS === 'ios' ? 56 : 20 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
          style={styles.glassButton}>
          <ArrowLeft size={18} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Sticky header (fades in on scroll) */}
      <Animated.View
        style={[headerOpacity, { top: Platform.OS === 'ios' ? 0 : 0 }]}
        className="absolute left-0 right-0 z-10 flex-row items-center gap-x-4 border-b border-gray-100 bg-white/90 px-5 pb-3 pt-14 dark:border-gray-800 dark:bg-black/90">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-dark-seconndary">
          <ArrowLeft size={16} color={dark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text
          className="flex-1 text-base font-bold text-black dark:text-white"
          style={{ fontFamily: 'BricolageGrotesque-Bold' }}
          numberOfLines={1}>
          {merchant.name}
        </Text>
      </Animated.View>

      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Hero image */}
        <View style={{ height: HERO_HEIGHT, overflow: 'hidden' }}>
          <Animated.View style={[{ height: HERO_HEIGHT + 60 }, heroStyle]}>
            <Image
              source={{ uri: merchant.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            {/* Gradient overlay */}
            <View
              className="absolute inset-0"
              style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
            />
          </Animated.View>

          {/* Reward badge on hero */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(400)}
            className="absolute bottom-4 left-4">
            <View
              className="rounded-full px-4 py-2"
              style={{ backgroundColor: colors.pill }}>
              <Text
                className="text-sm font-bold text-white"
                style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
                {merchant.rewardValue}
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Content */}
        <View className="bg-white dark:bg-black">
          {/* Name + category */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            className="border-b border-gray-100 px-5 py-5 dark:border-gray-800">
            <View className="mb-2 flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text
                  className="text-2xl font-bold text-black dark:text-white"
                  style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
                  {merchant.name}
                </Text>
                <View className="mt-1.5 flex-row items-center gap-x-2">
                  <Tag size={12} color="#9ca3af" />
                  <Text className="text-sm text-gray-400">{merchant.category}</Text>
                  {merchant.isNearby && (
                    <>
                      <View className="h-1 w-1 rounded-full bg-gray-300" />
                      <MapPin size={12} color="#9ca3af" />
                      <Text className="text-sm text-gray-400">Nearby</Text>
                    </>
                  )}
                </View>
              </View>
              {/* Reward type tag */}
              <View
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: colors.bg }}>
                <Text
                  className="text-xs font-bold capitalize"
                  style={{ color: colors.text, fontFamily: 'BricolageGrotesque-Bold' }}>
                  {merchant.rewardType}
                </Text>
              </View>
            </View>

            {/* Event connection */}
            {merchant.eventName && (
              <View className="mt-3 flex-row items-center gap-x-2 rounded-[10px] bg-primary/8 px-3 py-2"
                style={{ backgroundColor: '#FF2E9215' }}>
                <Sparkles size={13} color="#FF2E92" />
                <Text className="text-xs text-primary">
                  via <Text className="font-semibold">{merchant.eventName}</Text>
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Description */}
          {merchant.description && (
            <Animated.View
              entering={FadeInDown.delay(150).duration(400)}
              className="border-b border-gray-100 px-5 py-5 dark:border-gray-800">
              <Text
                className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400"
                style={{ fontFamily: 'BricolageGrotesque-SemiBold' }}>
                About this offer
              </Text>
              <Text className="text-sm leading-5 text-gray-600 dark:text-gray-300">
                {merchant.description}
              </Text>
            </Animated.View>
          )}

          {/* How to earn */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            className="border-b border-gray-100 px-5 py-5 dark:border-gray-800">
            <Text
              className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400"
              style={{ fontFamily: 'BricolageGrotesque-SemiBold' }}>
              How to earn
            </Text>
            <View className="gap-y-4">
              {HOW_TO_EARN_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <View key={i} className="flex-row items-center gap-x-3">
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-dark-seconndary">
                      <Icon size={15} color={dark ? '#fff' : '#374151'} />
                    </View>
                    <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                      {step.text}
                    </Text>
                    {i < HOW_TO_EARN_STEPS.length - 1 && (
                      <View className="absolute bottom-[-16px] left-4 h-4 w-px bg-gray-200 dark:bg-gray-700" />
                    )}
                  </View>
                );
              })}
            </View>
          </Animated.View>

          {/* Address */}
          {merchant.address && (
            <Animated.View
              entering={FadeInDown.delay(250).duration(400)}
              className="border-b border-gray-100 px-5 py-5 dark:border-gray-800">
              <Text
                className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400"
                style={{ fontFamily: 'BricolageGrotesque-SemiBold' }}>
                Location
              </Text>
              <View className="flex-row items-center gap-x-2">
                <MapPin size={15} color="#9ca3af" />
                <Text className="text-sm text-gray-600 dark:text-gray-300">
                  {merchant.address}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Terms */}
          {merchant.terms && (
            <Animated.View
              entering={FadeInDown.delay(300).duration(400)}
              className="px-5 py-5">
              <View className="flex-row items-start gap-x-2 rounded-[12px] bg-gray-50 p-3 dark:bg-dark-seconndary">
                <Info size={14} color="#9ca3af" style={{ marginTop: 1 }} />
                <Text className="flex-1 text-[11px] leading-4 text-gray-400">
                  {merchant.terms}
                </Text>
              </View>
            </Animated.View>
          )}
        </View>
      </AnimatedScrollView>

      {/* Bottom CTA */}
      <Animated.View
        entering={FadeInUp.delay(400).duration(400)}
        className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 pb-10 pt-4 dark:border-gray-800 dark:bg-black">
        <TouchableOpacity
          className="items-center rounded-full bg-primary py-4">
          <Text
            className="text-sm font-bold text-white"
            style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
            Earn {merchant.rewardValue} Here
          </Text>
        </TouchableOpacity>
        <Text className="mt-2 text-center text-[10px] text-gray-400">
          Pay with your linked card at {merchant.name}
        </Text>
      </Animated.View>
    </AppSafeAreaView>
  );
}

const styles = StyleSheet.create({
  glassButton: {
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }
      : { elevation: 4 }),
  },
});
