// screens/activity/polls/PollsList.tsx
// =====================================================
// Polls List with Animated Vote Bars
// =====================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import CreatePollModal from './CreatePollModal';
import { useTripPolls, calculatePollResults, votePoll } from '../queries';
import type { Poll } from '../types';

interface PollsListProps {
  tripId: string;
  userId: string;
}

export default function PollsList({ tripId, userId }: PollsListProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [votingPollId, setVotingPollId] = useState<string | null>(null);
  const { polls, loading } = useTripPolls(tripId);

  const handleCreatePoll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setModalVisible(true);
  };

  const handleVote = async (pollId: string, optionId: string) => {
    try {
      setVotingPollId(pollId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await votePoll(pollId, optionId, userId);
    } catch (error) {
      console.error('Error voting:', error);
      Alert.alert('Error', 'Failed to submit vote. Please try again.');
    } finally {
      setVotingPollId(null);
    }
  };

  const renderPollItem = ({ item }: { item: Poll }) => {
    const results = calculatePollResults(item, userId);
    const hasVoted = results.user_voted;

    return (
      <View style={styles.pollCard}>
        {/* Poll Header */}
        <View style={styles.pollHeader}>
          <Text style={styles.pollQuestion}>{item.question}</Text>
          <Text style={styles.pollMeta}>
            by {item.creator?.full_name || 'Someone'} ·{' '}
            {new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Vote Count */}
        <View style={styles.voteCountBadge}>
          <Text style={styles.voteCountText}>
            {results.total_votes} {results.total_votes === 1 ? 'vote' : 'votes'}
          </Text>
        </View>

        {/* Poll Options */}
        <View style={styles.optionsContainer}>
          {results.options.map(option => {
            const isUserVote = option.option_id === results.user_vote_option_id;

            return (
              <PollOption
                key={option.option_id}
                option={option}
                hasVoted={hasVoted}
                isUserVote={isUserVote}
                onVote={() => handleVote(item.id, option.option_id)}
                isVoting={votingPollId === item.id}
              />
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={polls}
        keyExtractor={item => item.id}
        renderItem={renderPollItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No polls yet</Text>
            <Text style={styles.emptySubtext}>Create a poll to get group input</Text>
          </View>
        }
      />

      {/* Create Poll Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleCreatePoll}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          style={styles.addButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.addButtonText}>+ Create Poll</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Create Poll Modal */}
      <CreatePollModal
        visible={modalVisible}
        tripId={tripId}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

// =====================================================
// Poll Option Component with Animated Bar
// =====================================================
interface PollOptionProps {
  option: {
    option_id: string;
    option_text: string;
    vote_count: number;
    percentage: number;
  };
  hasVoted: boolean;
  isUserVote: boolean;
  onVote: () => void;
  isVoting: boolean;
}

function PollOption({
  option,
  hasVoted,
  isUserVote,
  onVote,
  isVoting,
}: PollOptionProps) {
  const barWidth = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    // Animate bar width
    barWidth.value = withSpring(option.percentage, {
      damping: 15,
      stiffness: 100,
    });
  }, [option.percentage]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
  }));

  const handlePress = () => {
    if (!hasVoted && !isVoting) {
      // Pulse animation
      scale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      onVote();
    }
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={containerStyle}>
      <TouchableOpacity
        style={[
          styles.optionCard,
          hasVoted && styles.optionCardVoted,
          isUserVote && styles.optionCardUserVote,
        ]}
        onPress={handlePress}
        disabled={hasVoted || isVoting}
        activeOpacity={0.7}
      >
        {/* Background Bar */}
        {hasVoted && (
          <Animated.View style={[styles.optionBar, barStyle]}>
            <LinearGradient
              colors={
                isUserVote
                  ? ['#3B82F6', '#2563EB']
                  : ['#E0E7FF', '#C7D2FE']
              }
              style={styles.optionBarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
        )}

        {/* Content */}
        <View style={styles.optionContent}>
          <Text
            style={[
              styles.optionText,
              isUserVote && styles.optionTextUserVote,
            ]}
          >
            {option.option_text}
          </Text>
          {hasVoted && (
            <View style={styles.optionStats}>
              <Text
                style={[
                  styles.optionPercentage,
                  isUserVote && styles.optionPercentageUserVote,
                ]}
              >
                {option.percentage.toFixed(0)}%
              </Text>
              <Text
                style={[
                  styles.optionVotes,
                  isUserVote && styles.optionVotesUserVote,
                ]}
              >
                {option.vote_count} {option.vote_count === 1 ? 'vote' : 'votes'}
              </Text>
            </View>
          )}
        </View>

        {/* Checkmark for user vote */}
        {isUserVote && (
          <View style={styles.checkmarkBadge}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  pollCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pollHeader: {
    marginBottom: 12,
  },
  pollQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  pollMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  voteCountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  voteCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    position: 'relative',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    overflow: 'hidden',
  },
  optionCardVoted: {
    backgroundColor: '#FFFFFF',
  },
  optionCardUserVote: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  optionBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
    borderRadius: 10,
  },
  optionBarGradient: {
    flex: 1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  optionTextUserVote: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  optionStats: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  optionPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
  },
  optionPercentageUserVote: {
    color: '#3B82F6',
  },
  optionVotes: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  optionVotesUserVote: {
    color: '#60A5FA',
  },
  checkmarkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});