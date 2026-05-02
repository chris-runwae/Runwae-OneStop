import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical } from 'lucide-react-native';
import { router } from 'expo-router';

import PollOptionItem from './PollOptionItem';
import ProfileAvatar from '@/components/ui/ProfileAvatar';
import Spacer from '@/components/utils/Spacer';
import Text from '@/components/ui/Text';
import { Colors, textStyles } from '@/constants';
import type { Poll, PollOption, PollVote } from '@/hooks/usePollActions';
import { useAuth } from '@/hooks/useAuth';
import { useTrips } from '@/context/TripsContext';
import { useQuery } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';
import type { Id } from '@runwae/convex/convex/_generated/dataModel';

type PollItemProps = {
  poll: Poll;
  groupId: string;
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
  onDeletePoll: (pollId: string) => Promise<void>;
  isMember: boolean;
};

const PollItem = ({
  poll,
  groupId,
  onCastVote,
  onRemoveVote,
  onSwapVote,
  onDeletePoll,
  isMember,
}: PollItemProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const createdAt = formatDistanceToNow(new Date(poll.createdAt));

  const { user } = useAuth();
  const { activeTripMembers } = useTrips();
  const userId = user?.id ?? '';
  const pollId = poll._id as unknown as string;
  const isCreator =
    (poll.createdByUserId as unknown as string) === userId;

  // Fetch the viewer's votes alongside the poll detail. The reactive
  // poll.options entries already carry voteCount; we just need to know
  // which option the viewer picked. Phase 5 keeps this lightweight by
  // re-running the bag-of-votes query on the same trip.
  const allPolls = useQuery(api.polls.getByTrip, {
    tripId: poll.tripId as unknown as Id<'trips'>,
  });
  const enriched = allPolls?.find(
    (p: any) => (p._id as unknown as string) === pollId,
  );
  const myOptionId = (enriched as any)?.myOptionId as
    | Id<'poll_options'>
    | null
    | undefined;
  const currentVoteOptionId =
    poll.type === 'single_choice' && myOptionId
      ? (myOptionId as unknown as string)
      : undefined;

  const handleDelete = () => {
    Alert.alert('Delete poll', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDeletePoll(pollId),
      },
    ]);
  };

  const handleEdit = () => {
    router.push(`/(tabs)/(trips)/${groupId}/add-poll?pollId=${pollId}`);
  };

  const handleEllipsisPress = () => {
    if (!isMember) return;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit poll', 'Delete poll'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleEdit();
          if (buttonIndex === 2) handleDelete();
        }
      );
    } else {
      Alert.alert('Poll options', undefined, [
        { text: 'Edit poll', onPress: handleEdit },
        { text: 'Delete poll', style: 'destructive', onPress: handleDelete },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.backgroundColors.subtle,
      borderRadius: 24,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.borderColors.subtle,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
    creatorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    creatorNameText: {
      ...textStyles.textHeading14,
      color: colors.textColors.default,
    },
    createdAtText: {
      ...textStyles.textBody10,
      color: colors.textColors.subtle,
    },
    titleText: {
      ...textStyles.textHeading18,
      color: colors.textColors.default,
      lineHeight: 24,
    },
    metaText: {
      ...textStyles.textBody12,
      color: colors.textColors.subtle,
      fontWeight: '600',
    },
  });

  const selectionText =
    poll.type === 'single_choice'
      ? 'Select one'
      : poll.type === 'multi_choice'
        ? 'Select multiple'
        : 'Rank the options';

  const votesCount = poll.totalVotes ?? 0;

  return (
    <View style={styles.card}>
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View style={styles.creatorContainer}>
          <ProfileAvatar
            name={(poll as any).author?.name ?? 'User'}
            imageUrl={
              (poll as any).author?.avatarUrl ??
              (poll as any).author?.image
            }
            size={36}
          />
          <View>
            <Text style={styles.creatorNameText}>
              {(poll as any).author?.name ?? 'User'}
            </Text>
            <Text style={styles.createdAtText}>{createdAt} ago</Text>
          </View>
        </View>

        {isMember && isCreator && (
          <Pressable
            onPress={handleEllipsisPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              width: 32,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderRadius: 16,
            }}>
            <MoreVertical size={18} color={colors.textColors.subtle} />
          </Pressable>
        )}
      </View>

      <Spacer size={16} vertical />

      <Text style={styles.titleText}>{poll.title}</Text>
      <Spacer size={4} vertical />
      <Text
        style={
          styles.metaText
        }>{`${selectionText} · ${votesCount} votes`}</Text>

      <Spacer size={20} vertical />
      {(poll.options ?? []).map((option: PollOption) => {
        const optionId = option._id as unknown as string;
        return (
          <PollOptionItem
            key={optionId}
            optionId={optionId}
            label={option.label}
            voteCount={option.voteCount ?? 0}
            totalMembers={activeTripMembers.length}
            isSelected={currentVoteOptionId === optionId}
            pollType={
              poll.type === 'multi_choice'
                ? 'multiple_choice'
                : 'single_choice'
            }
            selectedOptionId={currentVoteOptionId}
            onVote={(id) => isMember && onCastVote(pollId, id, userId)}
            onUnvote={(id) => isMember && onRemoveVote(pollId, id, userId)}
            onSwapVote={(id) =>
              isMember &&
              onSwapVote(pollId, currentVoteOptionId ?? '', id, userId)
            }
          />
        );
      })}
      <Spacer size={32} vertical />
    </View>
  );
};

export default PollItem;
