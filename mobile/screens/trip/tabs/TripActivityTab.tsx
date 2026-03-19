import { useTheme } from '@react-navigation/native';
import { BarChart2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ================================================================
// Types
// ================================================================

type Segment = 'polls' | 'expenses' | 'posts';

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: 'polls',    label: 'Polls'    },
  { key: 'expenses', label: 'Expenses' },
  { key: 'posts',    label: 'Posts'    },
];

const EMPTY_LABELS: Record<Segment, string> = {
  polls:    'No polls yet',
  expenses: 'No expenses yet',
  posts:    'No posts yet',
};

// ================================================================
// TripActivityTab
// ================================================================

export default function TripActivityTab() {
  const { dark } = useTheme();
  const [active, setActive] = useState<Segment>('polls');

  return (
    <View style={styles.container}>
      {/* Segmented control */}
      <View style={[styles.segmentBar, { backgroundColor: dark ? '#2c2c2e' : '#f3f4f6' }]}>
        {SEGMENTS.map(({ key, label }) => {
          const selected = active === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.segmentItem,
                selected && { backgroundColor: dark ? '#ffffff' : '#ffffff' },
              ]}
              onPress={() => setActive(key)}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  {
                    color: selected
                      ? '#111827'
                      : (dark ? '#9ca3af' : '#6b7280'),
                    fontWeight: selected ? '600' : '400',
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Empty state */}
      <View style={styles.emptyContainer}>
        <BarChart2 size={48} strokeWidth={1} color={dark ? '#4b5563' : '#d1d5db'} />
        <Text style={[styles.emptyText, { color: dark ? '#6b7280' : '#9ca3af' }]}>
          {EMPTY_LABELS[active]}
        </Text>
      </View>
    </View>
  );
}

// ================================================================
// Styles
// ================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  segmentBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 10,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentLabel: {
    fontSize: 14,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
