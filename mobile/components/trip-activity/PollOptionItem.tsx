import { CheckCircle2, Circle } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Text from '@/components/ui/Text';
import { Colors } from '@/constants';

type PollOptionItemProps = {
  optionId: string;
  label: string;
  voteCount: number;
  totalMembers: number;
  isSelected: boolean;
  pollType: 'single_choice' | 'multiple_choice';
  onVote: (optionId: string) => void;
  onUnvote: (optionId: string) => void;
  onSwapVote?: (newOptionId: string) => void; // single choice only
  selectedOptionId?: string; // current user's voted option (single choice)
};

const PILL_HEIGHT = 56;

const PollOptionItem = ({
  optionId,
  label,
  voteCount,
  totalMembers,
  isSelected,
  pollType,
  onVote,
  onUnvote,
  onSwapVote,
  selectedOptionId,
}: PollOptionItemProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const percentage =
    totalMembers > 0 ? Math.round((voteCount / totalMembers) * 100) : 0;

  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: percentage,
      useNativeDriver: false,
      tension: 40,
      friction: 8,
    }).start();
  }, [percentage, animatedWidth]);

  const handlePress = () => {
    if (isSelected) {
      onUnvote(optionId);
    } else if (pollType === 'single_choice' && selectedOptionId) {
      onSwapVote?.(optionId);
    } else {
      onVote(optionId);
    }
  };

  const primaryColor = '#FF1F8C';

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[
        styles.pill,
        {
          borderColor: isSelected ? primaryColor : colors.borderColors.subtle,
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        },
      ]}>
      {/* Animated fill */}
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: isSelected ? primaryColor : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
            opacity: isSelected ? 0.12 : 1,
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
              extrapolate: 'clamp',
            }),
          },
        ]}
      />

      {/* Content row */}
      <View style={styles.content}>
        <View style={styles.leftContent}>
          {isSelected ? (
            <CheckCircle2 size={20} color={primaryColor} strokeWidth={2.5} />
          ) : (
            <Circle size={20} color={isDark ? '#4b5563' : '#d1d5db'} strokeWidth={2} />
          )}
          <Text
            style={[
              styles.label,
              { color: isDark ? '#ffffff' : '#111827' },
            ]}
            numberOfLines={1}>
            {label}
          </Text>
        </View>
        <View style={styles.rightContent}>
          <Text
            style={[
              styles.percentage,
              { color: isSelected ? primaryColor : (isDark ? '#9ca3af' : '#6b7280') },
            ]}>
            {percentage}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PollOptionItem;

const styles = StyleSheet.create({
  pill: {
    height: PILL_HEIGHT,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginVertical: 6,
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 1,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rightContent: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  percentage: {
    fontSize: 13,
    fontWeight: '700',
  },
});
