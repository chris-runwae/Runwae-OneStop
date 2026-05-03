import { api } from '@runwae/convex/convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type PollDoc = FunctionReturnType<typeof api.polls.getOpenForUser>[number];

const OpenPollCard = () => {
  const polls = useQuery(api.polls.getOpenForUser, { limit: 1 });
  const poll = polls?.[0];

  if (polls === undefined) return null;
  if (!poll) return <RailPollEmpty />;
  return <RailPoll poll={poll} />;
};

const RailPollEmpty = () => (
  <View className="mx-5 rounded-2xl border border-gray-200 bg-white px-5 py-5 dark:border-white/10 dark:bg-dark-seconndary/50">
    <Text
      className="mb-2 text-[15px] text-black dark:text-white"
      style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
      No open polls
    </Text>
    <Text className="text-[13px] leading-[18px] text-gray-500 dark:text-gray-400">
      When your trip group runs a poll, it shows up here.
    </Text>
  </View>
);

const RailPoll = ({ poll }: { poll: PollDoc }) => {
  const router = useRouter();
  const vote = useMutation(api.polls.vote);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const myOptionId = poll.myOptionId ?? pendingId;
  const showResults = myOptionId !== null;

  const total = Math.max(1, poll.totalVotes);
  const closesIn =
    poll.closesAt != null
      ? Math.max(0, Math.ceil((poll.closesAt - Date.now()) / 86_400_000))
      : null;

  const handleVote = (optionId: string) => {
    setPendingId(optionId);
    vote({ pollId: poll._id, optionId: optionId as any }).catch(() => {
      setPendingId(null);
    });
  };

  return (
    <View className="mx-5 rounded-2xl border border-gray-200 bg-white px-5 py-5 dark:border-white/10 dark:bg-dark-seconndary/50">
      <View className="mb-3 flex-row items-center justify-between">
        <Text
          className="text-[15px] text-black dark:text-white"
          style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
          Open poll
        </Text>
        {closesIn !== null && (
          <View
            className="rounded-full px-2.5 py-1"
            style={{ backgroundColor: 'rgba(123,104,238,0.12)' }}>
            <Text
              className="text-[10.5px] font-semibold"
              style={{ color: '#7B68EE' }}>
              {closesIn === 0 ? 'closing' : `${closesIn}d left`}
            </Text>
          </View>
        )}
      </View>

      <Text
        className="mb-1 text-[14px] font-semibold text-black dark:text-white"
        numberOfLines={2}>
        {poll.title}
      </Text>
      <Text className="mb-4 text-[11.5px] text-gray-500 dark:text-gray-400">
        {poll.tripTitle} · {poll.totalVotes} voted
      </Text>

      {poll.options.map((o, index) => {
        const isPicked = myOptionId === o._id;
        const pct = showResults ? Math.round((o.voteCount / total) * 100) : 0;
        return (
          <PollOptionRow
            key={o._id}
            label={o.label}
            pct={pct}
            isPicked={isPicked}
            showResults={showResults}
            staggerIndex={index}
            onPress={() => handleVote(o._id as unknown as string)}
          />
        );
      })}

      {(poll.tripSlug || poll.tripId) && (
        <Pressable
          onPress={() =>
            router.push(
              `/(tabs)/(trips)/${poll.tripSlug ?? poll.tripId}?tab=activity` as any,
            )
          }
          hitSlop={8}
          className="mt-3 py-1">
          <Text className="text-[12.5px] font-semibold text-pink-600 dark:text-pink-400">
            See all polls →
          </Text>
        </Pressable>
      )}
    </View>
  );
};

// Animated row: bar fills smoothly when results reveal, the picked option
// gets a tiny scale pop, and rows stagger in on first mount.
const PollOptionRow = ({
  label,
  pct,
  isPicked,
  showResults,
  staggerIndex,
  onPress,
}: {
  label: string;
  pct: number;
  isPicked: boolean;
  showResults: boolean;
  staggerIndex: number;
  onPress: () => void;
}) => {
  const fill = useSharedValue(0);
  const press = useSharedValue(1);
  const enter = useSharedValue(0);

  useEffect(() => {
    fill.value = withTiming(showResults ? pct / 100 : 0, {
      duration: 520,
      easing: Easing.out(Easing.cubic),
    });
  }, [showResults, pct, fill]);

  useEffect(() => {
    enter.value = withTiming(1, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [enter]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
  }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
    opacity: 0.4 + 0.6 * enter.value,
  }));

  const handlePressIn = () => {
    press.value = withSpring(0.97, { damping: 18, stiffness: 320 });
  };
  const handlePressOut = () => {
    press.value = withSpring(1, { damping: 14, stiffness: 220 });
  };

  return (
    <Animated.View
      style={[
        { marginBottom: 10 },
        { marginTop: staggerIndex === 0 ? 0 : 0 },
        pressStyle,
      ]}>
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          hitSlop={8}
          className="relative h-12 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                backgroundColor: isPicked
                  ? '#FF2E92'
                  : 'rgba(255,46,146,0.15)',
                borderRadius: 999,
              },
              fillStyle,
            ]}
          />
          <View className="absolute inset-0 justify-center px-4">
            <Text
              numberOfLines={1}
              className={`text-[13px] font-semibold ${
                isPicked ? 'text-white' : 'text-black dark:text-white'
              }`}>
              {label}
            </Text>
          </View>
        </Pressable>
        <AnimatedPercent showResults={showResults} pct={pct} />
      </View>
    </Animated.View>
  );
};

const AnimatedPercent = ({
  showResults,
  pct,
}: {
  showResults: boolean;
  pct: number;
}) => {
  const v = useSharedValue(0);
  const [display, setDisplay] = useState('—');
  useEffect(() => {
    if (!showResults) {
      v.value = 0;
      setDisplay('—');
      return;
    }
    v.value = 0;
    v.value = withTiming(pct, {
      duration: 520,
      easing: Easing.out(Easing.cubic),
    });
    let raf = 0;
    const start = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / 520);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(`${Math.round(pct * eased)}%`);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [showResults, pct, v]);
  return (
    <Text className="min-w-[34px] text-right text-[12px] font-bold text-gray-500 dark:text-gray-400">
      {display}
    </Text>
  );
};

export default OpenPollCard;
