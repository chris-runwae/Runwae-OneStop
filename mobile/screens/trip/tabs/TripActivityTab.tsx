import { useTheme } from '@react-navigation/native';
import { Vote, Receipt, Image as ImageIcon, Plus } from 'lucide-react-native';
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
 
import { AppFonts, Colors } from '@/constants';
 
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_PADDING = 16;
const SEGMENT_BAR_PADDING = 4;
const SEGMENT_WIDTH = (SCREEN_WIDTH - (CONTAINER_PADDING * 2) - (SEGMENT_BAR_PADDING * 2)) / 3;
 
// ================================================================
// Types
// ================================================================
 
type Segment = 'polls' | 'expenses' | 'posts';
 
const SEGMENTS: { key: Segment; label: string; icon: any }[] = [
  { key: 'polls',    label: 'Polls',    icon: Vote },
  { key: 'expenses', label: 'Expenses', icon: Receipt },
  { key: 'posts',    label: 'Posts',    icon: ImageIcon },
];
 
const CONTENT: Record<Segment, { title: string; subtitle: string; buttonLabel: string }> = {
  polls: {
    title: 'No Polls Yet',
    subtitle: "Get the group's opinion on your next move. Deciding on dinner or the next stop?",
    buttonLabel: 'Create Poll',
  },
  expenses: {
    title: 'No Expenses Yet',
    subtitle: 'Keep the group spending in check and settle up easily later.',
    buttonLabel: 'Add Expense',
  },
  posts: {
    title: 'No Posts Yet',
    subtitle: 'Share moments, updates, or helpful links with the entire team.',
    buttonLabel: 'New Post',
  },
};
 
// ================================================================
// Components
// ================================================================
 
function ActivityEmptyState({ active, dark }: { active: Segment; dark: boolean }) {
  const config = CONTENT[active];
  const Icon = SEGMENTS.find((s) => s.key === active)?.icon || Vote;
 
  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.iconWrapper, { backgroundColor: dark ? '#1C1C1E' : '#F8F9FA' }]}>
        <View style={styles.iconCircle}>
          <Icon size={32} color="#FF1F8C" strokeWidth={1.5} />
        </View>
      </View>
      
      <Text style={[styles.emptyTitle, { color: dark ? '#fff' : '#111827' }]}>
        {config.title}
      </Text>
      <Text style={styles.emptySubtitle}>
        {config.subtitle}
      </Text>
 
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: '#FF1F8C' }]}
        activeOpacity={0.8}>
        <Plus size={16} color="#fff" strokeWidth={3} />
        <Text style={styles.createButtonText}>{config.buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}
 
// ================================================================
// TripActivityTab
// ================================================================
 
export default function TripActivityTab() {
  const { dark } = useTheme();
  const [active, setActive] = useState<Segment>('polls');
  const slideAnim = useRef(new Animated.Value(0)).current;
 
  useEffect(() => {
    const index = SEGMENTS.findIndex((s) => s.key === active);
    Animated.spring(slideAnim, {
      toValue: index * SEGMENT_WIDTH,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  }, [active]);
 
  return (
    <View style={styles.container}>
      {/* Animated Segmented control */}
      <View style={[styles.segmentBar, { backgroundColor: dark ? '#2c2c2e' : '#f1f3f5' }]}>
        <Animated.View
          style={[
            styles.segmentIndicator,
            {
              width: SEGMENT_WIDTH,
              transform: [{ translateX: slideAnim }],
              backgroundColor: '#fff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
            },
          ]}
        />
        {SEGMENTS.map(({ key, label }) => {
          const selected = active === key;
          return (
            <Pressable
              key={key}
              style={styles.segmentItem}
              onPress={() => setActive(key)}>
              <Text
                style={[
                  styles.segmentLabel,
                  {
                    color: selected ? '#111827' : '#8A8A8E',
                    fontFamily: selected ? AppFonts.inter.semiBold : AppFonts.inter.medium,
                  },
                ]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
 
      {/* Content Area */}
      <View style={styles.content}>
        <ActivityEmptyState active={active} dark={dark} />
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
    paddingHorizontal: CONTAINER_PADDING,
  },
  segmentBar: {
    flexDirection: 'row',
    marginTop: 16,
    borderRadius: 99,
    padding: SEGMENT_BAR_PADDING,
    position: 'relative',
    height: 44,
  },
  segmentIndicator: {
    position: 'absolute',
    top: SEGMENT_BAR_PADDING,
    bottom: SEGMENT_BAR_PADDING,
    left: SEGMENT_BAR_PADDING,
    borderRadius: 99,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  segmentLabel: {
    fontSize: 13,
  },
 
  content: {
    flex: 1,
    marginTop: 20,
  },
 
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: AppFonts.bricolage.bold,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: AppFonts.inter.regular,
    color: '#8A8A8E',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
    marginBottom: 32,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 99,
    gap: 8,
    shadowColor: '#FF1F8C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: AppFonts.inter.semiBold,
  },
});
