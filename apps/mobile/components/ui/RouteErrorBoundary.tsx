import { useRouter } from 'expo-router';
import { AlertTriangle, ArrowLeft, Home, RotateCw } from 'lucide-react-native';
import React from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIMARY = '#FF2E92';

// Expo Router renders this when a route or layout throws during render. It
// replaces the previous "white screen / app crash" experience with a
// recoverable fallback that lets the user back out without losing their
// session.
export function ErrorBoundary({
  error,
  retry,
}: {
  error: Error;
  retry: () => Promise<void>;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const dark = colorScheme === 'dark';

  const goHome = () => {
    try {
      router.replace('/(tabs)' as any);
    } catch {
      // If the router itself is in a bad state, leave the user on the
      // boundary screen — retry/back are still available.
    }
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else goHome();
  };

  return (
    <View
      className="flex-1 bg-white dark:bg-black"
      style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}>
      <View className="px-5">
        <Pressable
          onPress={goBack}
          accessibilityLabel="Go back"
          hitSlop={12}
          className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10">
          <ArrowLeft size={18} color={dark ? '#fff' : '#0F0F0F'} strokeWidth={2.2} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 28,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}>
        <View className="items-center">
          <View
            className="mb-5 h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(255,46,146,0.12)' }}>
            <AlertTriangle size={28} color={PRIMARY} strokeWidth={2.2} />
          </View>
          <Text
            className="text-center text-[22px] text-black dark:text-white"
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
            Something went wrong
          </Text>
          <Text className="mt-2 text-center text-[14px] leading-[20px] text-gray-500 dark:text-gray-400">
            This screen ran into an unexpected error. You can try again or head
            back to a screen you know.
          </Text>

          {error?.message ? (
            <View className="mt-5 max-w-full rounded-xl bg-gray-100 px-4 py-3 dark:bg-white/5">
              <Text
                className="text-center text-[12px] text-gray-600 dark:text-gray-400"
                numberOfLines={4}>
                {error.message}
              </Text>
            </View>
          ) : null}

          <View className="mt-8 w-full gap-3">
            <Pressable
              onPress={retry}
              accessibilityLabel="Try again"
              className="h-12 flex-row items-center justify-center gap-2 rounded-full"
              style={{ backgroundColor: PRIMARY }}>
              <RotateCw size={16} color="#fff" strokeWidth={2.4} />
              <Text className="text-[14px] font-semibold text-white">
                Try again
              </Text>
            </Pressable>

            <Pressable
              onPress={goHome}
              accessibilityLabel="Go to home"
              className="h-12 flex-row items-center justify-center gap-2 rounded-full bg-gray-100 dark:bg-white/10">
              <Home size={16} color={dark ? '#fff' : '#0F0F0F'} strokeWidth={2.4} />
              <Text className="text-[14px] font-semibold text-black dark:text-white">
                Back to home
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
