// components/PollOptionItem.tsx
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

const PILL_HEIGHT = 52;

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
      tension: 60,
      friction: 10,
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

  const fillColor = isSelected ? '#FF1F8C' : isDark ? '#2c2c2e' : '#f0f0f0';

  const fillOpacity = isSelected ? 0.18 : 1;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[
        styles.pill,
        {
          borderColor: colors.borderColors.subtle,
          backgroundColor: colors.backgroundColors.subtle,
        },
      ]}>
      {/* Animated fill */}
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: fillColor,
            opacity: fillOpacity,
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
        <Text
          style={[
            styles.label,
            { color: isSelected ? '#FF1F8C' : isDark ? '#ffffff' : '#111827' },
          ]}
          numberOfLines={1}>
          {label}
        </Text>
        <Text
          style={[
            styles.percentage,
            { color: isSelected ? '#FF1F8C' : isDark ? '#9ca3af' : '#6b7280' },
          ]}>
          {percentage}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default PollOptionItem;

const styles = StyleSheet.create({
  pill: {
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
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
    borderRadius: PILL_HEIGHT / 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  percentage: {
    fontSize: 13,
    fontWeight: '600',
  },
});
