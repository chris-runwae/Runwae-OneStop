import { api } from '@runwae/convex/convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

type PollDoc = FunctionReturnType<typeof api.polls.getOpenForUser>[number];

const OpenPollCard = () => {
  const polls = useQuery(api.polls.getOpenForUser, { limit: 1 });
  const poll = polls?.[0];

  if (polls === undefined) return null;
  if (!poll) return <RailPollEmpty />;
  return <RailPoll poll={poll} />;
};

const RailPollEmpty = () => (
  <View className="mx-5 mt-5 rounded-2xl border border-gray-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-dark-seconndary/50">
    <Text
      className="mb-1.5 text-[14.5px] text-black dark:text-white"
      style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
      No open polls
    </Text>
    <Text className="text-[12.5px] text-gray-500 dark:text-gray-400">
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
    <View className="mx-5 mt-5 rounded-2xl border border-gray-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-dark-seconndary/50">
      <View className="mb-2 flex-row items-center justify-between">
        <Text
          className="text-[14.5px] text-black dark:text-white"
          style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
          Open poll
        </Text>
        {closesIn !== null && (
          <View
            className="rounded-full px-2 py-0.5"
            style={{ backgroundColor: 'rgba(123,104,238,0.12)' }}>
            <Text
              className="text-[10px] font-semibold"
              style={{ color: '#7B68EE' }}>
              {closesIn === 0 ? 'closing' : `${closesIn}d left`}
            </Text>
          </View>
        )}
      </View>

      <Text
        className="mb-1 text-[13px] font-semibold text-black dark:text-white"
        numberOfLines={2}>
        {poll.title}
      </Text>
      <Text className="mb-2.5 text-[11px] text-gray-500 dark:text-gray-400">
        {poll.tripTitle} · {poll.totalVotes} voted
      </Text>

      {poll.options.map((o) => {
        const isPicked = myOptionId === o._id;
        const pct = showResults ? Math.round((o.voteCount / total) * 100) : 0;
        return (
          <View key={o._id} className="mb-1.5 flex-row items-center gap-2">
            <Pressable
              onPress={() => handleVote(o._id as unknown as string)}
              className="relative h-8 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: showResults ? `${pct}%` : '0%',
                  backgroundColor: isPicked
                    ? '#FF2E92'
                    : 'rgba(255,46,146,0.15)',
                  borderRadius: 999,
                }}
              />
              <View className="absolute inset-0 justify-center px-3">
                <Text
                  numberOfLines={1}
                  className={`text-[11.5px] font-semibold ${
                    isPicked ? 'text-white' : 'text-black dark:text-white'
                  }`}>
                  {o.label}
                </Text>
              </View>
            </Pressable>
            <Text
              className="min-w-[30px] text-right text-[11px] font-bold text-gray-500 dark:text-gray-400">
              {showResults ? `${pct}%` : '—'}
            </Text>
          </View>
        );
      })}

      {poll.tripSlug && (
        <Pressable
          onPress={() =>
            router.push(
              `/(tabs)/(trips)/${poll.tripSlug}?tab=activity` as any,
            )
          }
          className="mt-2">
          <Text className="text-[11.5px] font-semibold text-pink-600 dark:text-pink-400">
            See all polls →
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default OpenPollCard;
