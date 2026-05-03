import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, Sparkles, X } from 'lucide-react-native';
import React, { useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const PRIMARY = '#FF2E92';

interface Props {
  seedDestination?: string;
  // Some entry points (formSheet) can dismiss themselves; the in-tab variant
  // doesn't have anywhere to "go back" to without leaving the tab.
  showCloseButton?: boolean;
  onDismiss?: () => void;
  // Display title — defaults to "Start a new trip" but the in-tab variant
  // uses "New trip" since it's already a top-level page.
  title?: string;
}

export function CreateTripChooser({
  seedDestination,
  showCloseButton = true,
  onDismiss,
  title = 'Start a new trip',
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const dark = colorScheme === 'dark';

  const goManual = useCallback(() => {
    onDismiss?.();
    router.push({
      pathname: '/create-trip',
      params: seedDestination ? { seedDestination } : undefined,
    } as any);
  }, [router, onDismiss, seedDestination]);

  const goAi = useCallback(() => {
    onDismiss?.();
    router.push({
      pathname: '/create-trip-ai',
      params: seedDestination ? { seedDestination } : undefined,
    } as any);
  }, [router, onDismiss, seedDestination]);

  return (
    <View
      className="flex-1 bg-white dark:bg-black"
      style={{ paddingBottom: insets.bottom + 12 }}>
      <View className="flex-row items-center justify-between px-5 pt-5">
        <Text
          className="text-[22px] text-black dark:text-white"
          style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
          {title}
        </Text>
        {showCloseButton && (
          <Pressable
            onPress={onDismiss}
            accessibilityLabel="Close"
            hitSlop={12}
            className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10">
            <X size={18} color={dark ? '#fff' : '#0F0F0F'} strokeWidth={2.2} />
          </Pressable>
        )}
      </View>

      <Text className="px-5 pt-1 text-[13.5px] text-gray-500 dark:text-gray-400">
        Pick how you want to start. You can always add more details later.
      </Text>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(40).springify().damping(18)}>
          <ChoiceCard
            title="Create trip"
            description="Start blank — pick a destination, dates, and details. You'll build the itinerary yourself."
            badge="Recommended"
            onPress={goManual}
            dark={dark}
            primary
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify().damping(18)}>
          <ChoiceCard
            title="Create with AI"
            description="Tell us roughly what you're looking for and we'll draft an itinerary for you to refine."
            badge="Beta"
            icon={<Sparkles size={18} color={PRIMARY} strokeWidth={2.2} />}
            onPress={goAi}
            dark={dark}
          />
        </Animated.View>

        <Animated.Text
          entering={FadeIn.delay(220)}
          className="mt-4 px-1 text-[11.5px] text-gray-400 dark:text-gray-500">
          Both flows create a real trip you can invite friends to. The
          difference: AI gives you a starting itinerary; manual starts empty.
        </Animated.Text>
      </ScrollView>
    </View>
  );
}

const ChoiceCard = ({
  title,
  description,
  badge,
  icon,
  onPress,
  dark,
  primary,
}: {
  title: string;
  description: string;
  badge?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  dark: boolean;
  primary?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => ({
      transform: [{ scale: pressed ? 0.98 : 1 }],
      marginBottom: 14,
    })}>
    <View
      className="overflow-hidden rounded-2xl"
      style={{
        borderWidth: 1.5,
        borderColor: primary
          ? PRIMARY
          : dark
            ? 'rgba(255,255,255,0.10)'
            : 'rgba(0,0,0,0.08)',
        backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#fff',
      }}>
      {primary && (
        <LinearGradient
          colors={['rgba(255,46,146,0.10)', 'rgba(255,46,146,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      )}
      <View className="flex-row items-start gap-3 px-5 py-5">
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            {icon}
            <Text
              className="text-[18px] text-black dark:text-white"
              style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
              {title}
            </Text>
            {badge && (
              <View
                className="rounded-full px-2 py-0.5"
                style={{
                  backgroundColor: primary
                    ? PRIMARY
                    : 'rgba(123,104,238,0.12)',
                }}>
                <Text
                  className="text-[10px] font-bold uppercase"
                  style={{
                    color: primary ? '#fff' : '#7B68EE',
                    letterSpacing: 0.6,
                  }}>
                  {badge}
                </Text>
              </View>
            )}
          </View>
          <Text className="mt-1.5 text-[13px] leading-[18px] text-gray-600 dark:text-gray-400">
            {description}
          </Text>
        </View>
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{
            backgroundColor: primary
              ? PRIMARY
              : dark
                ? 'rgba(255,255,255,0.08)'
                : '#F3F4F6',
          }}>
          <ArrowRight
            size={16}
            color={primary ? '#fff' : dark ? '#fff' : '#0F0F0F'}
            strokeWidth={2.4}
          />
        </View>
      </View>
    </View>
  </Pressable>
);
