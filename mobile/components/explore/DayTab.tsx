import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components';

interface DayTabProps {
  day: number;
  isActive: boolean;
  onPress: () => void;
  colors: any;
}

export function DayTab({ day, isActive, onPress, colors }: DayTabProps) {
  return (
    <Pressable
      style={[
        styles.dayTab,
        isActive ? styles.dayTabActive : styles.dayTabInactive,
        {
          backgroundColor: isActive ? colors.primaryColors.default : 'transparent',
          borderColor: isActive ? colors.primaryColors.default : colors.borderColors.subtle,
        },
      ]}
      onPress={onPress}>
      <Text
        style={[
          styles.dayTabText,
          {
            color: isActive ? colors.white : colors.textColors.default,
          },
        ]}>
        Day {day}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dayTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  dayTabActive: {},
  dayTabInactive: {},
  dayTabText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
