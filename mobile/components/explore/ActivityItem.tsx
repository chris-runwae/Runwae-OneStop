import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components';
import type { ItineraryItem } from '@/types/explore';

interface ActivityItemProps {
  item: ItineraryItem;
  colors: any;
}

export function ActivityItem({ item, colors }: ActivityItemProps) {
  return (
    <View style={styles.activityItem}>
      <Text style={[styles.activityTitle, { color: colors.textColors.default }]}>
        {item.title}
      </Text>
      <Text style={[styles.activityDescription, { color: colors.textColors.subtle }]}>
        {item.description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  activityItem: {
    marginBottom: 24,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
});
