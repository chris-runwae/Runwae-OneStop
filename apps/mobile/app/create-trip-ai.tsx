import { useRouter } from 'expo-router';
import { ArrowRight, Sparkles, X } from 'lucide-react-native';
import React from 'react';
import {
  Pressable,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIMARY = '#FF2E92';

// Placeholder for the AI trip planner — the user is implementing the
// chatbot-driven flow next. Until then, this lets users land here and
// fall back to the manual flow without hitting a white screen.
export default function CreateTripAiScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const dark = colorScheme === 'dark';

  return (
    <View
      className="flex-1 bg-white dark:bg-black"
      style={{ paddingBottom: insets.bottom + 12 }}>
      <View className="flex-row items-center justify-between px-5 pt-5">
        <View className="flex-row items-center gap-2">
          <Sparkles size={20} color={PRIMARY} strokeWidth={2.2} />
          <Text
            className="text-[22px] text-black dark:text-white"
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
            Plan with AI
          </Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Close"
          hitSlop={12}
          className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10">
          <X size={18} color={dark ? '#fff' : '#0F0F0F'} strokeWidth={2.2} />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <View
          className="mb-5 h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(255,46,146,0.12)' }}>
          <Sparkles size={28} color={PRIMARY} strokeWidth={2.2} />
        </View>
        <Text
          className="text-center text-[20px] text-black dark:text-white"
          style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
          AI trip planner — coming soon
        </Text>
        <Text className="mt-2 text-center text-[13.5px] leading-[19px] text-gray-500 dark:text-gray-400">
          We&apos;re building a chat-driven planner that turns a sentence into a
          full itinerary. For now, the manual flow gets you there fastest.
        </Text>

        <Pressable
          onPress={() => {
            router.back();
            router.push('/create-trip' as any);
          }}
          className="mt-8 flex-row items-center justify-center gap-2 rounded-full px-5"
          style={{ backgroundColor: PRIMARY, height: 46 }}>
          <Text className="text-[14px] font-semibold text-white">
            Use the manual flow
          </Text>
          <ArrowRight size={16} color="#fff" strokeWidth={2.4} />
        </Pressable>
      </View>
    </View>
  );
}
