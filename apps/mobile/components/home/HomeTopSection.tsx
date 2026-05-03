import { api } from '@runwae/convex/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

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
        <StreamingText
          text={greetingText}
          className="text-2xl font-bold leading-tight text-black dark:text-white"
          fontFamily="BricolageGrotesque-ExtraBold"
        />
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

// Character-by-character reveal pegged to display frames via
// requestAnimationFrame, so it doesn't fall behind when the JS thread is
// busy mounting the rest of the home screen. Memoized so parent re-renders
// (Convex viewer updates, theme flips) don't restart the typewriter.
const TYPE_MS_PER_CHAR = 35;

const StreamingText = memo(
  ({
    text,
    className,
    fontFamily,
  }: {
    text: string;
    className?: string;
    fontFamily?: string;
  }) => {
    const [shown, setShown] = useState(text.length > 0 ? 0 : 0);
    const startedAtRef = useRef<number | null>(null);
    const lastTextRef = useRef(text);
    const totalChars = text.length;

    // Restart only when the actual text content changes.
    useEffect(() => {
      if (lastTextRef.current === text) return;
      lastTextRef.current = text;
      setShown(0);
      startedAtRef.current = null;
    }, [text]);

    useEffect(() => {
      if (totalChars === 0) return;
      let raf = 0;
      const tick = (now: number) => {
        if (startedAtRef.current == null) startedAtRef.current = now;
        const elapsed = now - startedAtRef.current;
        const next = Math.min(
          totalChars,
          Math.floor(elapsed / TYPE_MS_PER_CHAR),
        );
        setShown((prev) => (prev !== next ? next : prev));
        if (next < totalChars) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [totalChars, text]);

    const visible = text.slice(0, shown);
    const isStreaming = shown < totalChars;

    return (
      <View className="flex-row items-center" style={{ minHeight: 30 }}>
        <Text
          className={className}
          style={fontFamily ? { fontFamily } : undefined}
          numberOfLines={2}>
          {visible || ' '}
        </Text>
        {isStreaming && <BlinkingCaret />}
      </View>
    );
  },
);
StreamingText.displayName = 'StreamingText';

const BlinkingCaret = memo(() => {
  const v = useSharedValue(1);
  useEffect(() => {
    v.value = withRepeat(
      withTiming(0, { duration: 460, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => cancelAnimation(v);
  }, [v]);
  const style = useAnimatedStyle(() => ({ opacity: v.value }));
  return (
    <Animated.View
      style={[
        {
          marginLeft: 3,
          width: 2,
          height: 22,
          borderRadius: 1,
          backgroundColor: '#FF2E92',
        },
        style,
      ]}
    />
  );
});
BlinkingCaret.displayName = 'BlinkingCaret';
