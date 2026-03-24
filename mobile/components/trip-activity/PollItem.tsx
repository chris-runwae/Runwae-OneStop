import { StyleSheet, View, useColorScheme } from 'react-native';
import React from 'react';
import PollOptionItem from './PollOptionItem';
import { ProfileAvatar, Spacer, Text } from '@/components';

import { formatDistanceToNow } from 'date-fns';
import { Colors, textStyles } from '@/constants';
import { PollOption, Poll, PollVote } from '@/hooks/usePollActions';
import { useAuth } from '@/hooks/useAuth';
import { useTrips } from '@/context/TripsContext';

type PollItemProps = {
  poll: Poll;
  onCastVote: (
    pollId: string,
    optionId: string,
    userId: string
  ) => Promise<PollVote>;
  onRemoveVote: (
    pollId: string,
    optionId: string,
    userId: string
  ) => Promise<void>;
  onSwapVote: (
    pollId: string,
    oldOptionId: string,
    newOptionId: string,
    userId: string
  ) => Promise<void>;
};

const PollItem = ({
  poll,
  onCastVote,
  onRemoveVote,
  onSwapVote,
}: PollItemProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const createdAt = formatDistanceToNow(new Date(poll.created_at));

  const { user } = useAuth();
  const { activeTrip } = useTrips();
  const userId = user?.id ?? '';

  const userVotes = poll.poll_votes.filter(
    (vote: PollVote) => vote.user_id === userId && vote.poll_id === poll.id
  );

  const styles = StyleSheet.create({
    creatorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    creatorNameText: {
      ...textStyles.textHeading16,
    },
    createdAtText: {
      ...textStyles.textBody12,
      color: colors.textColors.subtle,
    },
    titleText: {
      ...textStyles.textHeading16,
    },
  });

  const selectionText =
    poll.type === 'single_choice'
      ? 'Select one'
      : poll.type === 'multiple_choice'
        ? 'Select multiple'
        : 'Rank the options';

  const votesCount = poll.poll_votes.length;

  // The user's current voted option for single_choice polls
  const currentVoteOptionId =
    poll.type === 'single_choice' ? userVotes[0]?.option_id : undefined;

  return (
    <View>
      <View style={styles.creatorContainer}>
        <ProfileAvatar
          name={poll.creator.full_name}
          imageUrl={poll.creator.avatar_url}
        />
        <View>
          <Text style={styles.creatorNameText}>{poll.creator.full_name}</Text>
          <Text style={styles.createdAtText}>{createdAt} ago</Text>
        </View>
      </View>

      <Spacer size={16} vertical />

      <Text style={styles.titleText}>{poll.title}</Text>
      <Text
        style={
          styles.createdAtText
        }>{`${selectionText} · ${votesCount} votes`}</Text>

      <Spacer size={12} vertical />
      {poll.poll_options.map((option: PollOption) => (
        <PollOptionItem
          key={option.id}
          optionId={option.id}
          label={option.label}
          voteCount={
            poll.poll_votes.filter(
              (vote: PollVote) => vote.option_id === option.id
            ).length
          }
          totalMembers={activeTrip?.group_members.length ?? 0}
          isSelected={userVotes.some(
            (vote: PollVote) => vote.option_id === option.id
          )}
          pollType={poll.type as 'single_choice' | 'multiple_choice'}
          selectedOptionId={currentVoteOptionId}
          onVote={(id) => onCastVote(poll.id, id, userId)}
          onUnvote={(id) => onRemoveVote(poll.id, id, userId)}
          onSwapVote={(id) =>
            onSwapVote(poll.id, currentVoteOptionId ?? '', id, userId)
          }
        />
      ))}
      <Spacer size={32} vertical />
    </View>
  );
};

export default PollItem;
