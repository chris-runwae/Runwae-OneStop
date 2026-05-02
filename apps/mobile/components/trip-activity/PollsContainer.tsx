import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Plus, Vote } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PollItem from '@/components/trip-activity/PollItem';
import { ActivityPollSkeleton } from '@/components/ui/CardSkeletons';
import Text from '@/components/ui/Text';
import { Colors, textStyles } from '@/constants';
import usePollActions, { Poll } from '@/hooks/usePollActions';

export default function PollsContainer({
  groupId,
  isMember,
}: {
  groupId: string;
  isMember: boolean;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const {
    castVote,
    removeVote,
    swapVote,
    deletePoll,
    usePollsByTrip,
  } = usePollActions();
  const pollsRaw = usePollsByTrip(groupId);
  const polls = pollsRaw ?? [];
  const isLoading = pollsRaw === undefined;
  const insets = useSafeAreaInsets();

  const renderHeader = () => {
    const pollCount = polls?.length ?? 0;
    const pollCountText =
      pollCount === 0
        ? `No polls yet`
        : pollCount === 1
          ? '1 active poll'
          : `${pollCount} active polls`;

    return (
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headerTitle}>Trip Polls</Text>
          <Text style={styles.headerSubtitle}>{pollCountText}</Text>
        </View>

        {isMember && (
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => {
              router.push(`/(tabs)/(trips)/${groupId}/add-poll`);
            }}>
            <Plus size={18} color={colors.white} />
            <Text style={styles.headerButtonText}>Create</Text>
          </Pressable>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyIconContainer}>
        <Vote size={32} color={colors.primaryColors.default} />
      </View>
      <Text style={styles.emptyStateTitle}>No polls found</Text>
      <Text style={styles.emptyStateBody}>
        Start a poll to decide on activities, dining, or schedules with your
        group.
      </Text>
    </View>
  );

  if (isLoading && (!polls || polls.length === 0)) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View>
          {[1, 2, 3].map((i) => (
            <ActivityPollSkeleton key={i} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList<Poll>
        data={polls as Poll[]}
        renderItem={({ item }) => (
          <PollItem
            poll={item}
            groupId={groupId}
            onCastVote={castVote}
            onRemoveVote={removeVote}
            onSwapVote={swapVote}
            onDeletePoll={deletePoll}
            isMember={isMember}
          />
        )}
        keyExtractor={(item: Poll) => item._id as unknown as string}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    marginTop: 8,
  },
  headerTitle: {
    ...textStyles.textHeading20,
    fontSize: 22,
  },
  headerSubtitle: {
    ...textStyles.textBody12,
    color: '#6b7280',
    marginTop: 2,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF1F8C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#FF1F8C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  // Empty state
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 31, 140, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    ...textStyles.textHeading18,
    marginBottom: 8,
  },
  emptyStateBody: {
    ...textStyles.textBody14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
