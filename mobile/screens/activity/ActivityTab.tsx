// screens/activity/ActivityTab.tsx
// =====================================================
// Activity Tab Container
// Embedded in TripDetailScreen - NOT a routed screen
// =====================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// Feature modules
import ExpensesList from './expenses/ExpensesList';
import PollsList from './polls/PollsList';
import ChecklistsList from './checklists/ChecklistsList';
import AnnouncementsList from './announcements/AnnouncementsList';

import type { ActivitySection } from './types';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SEGMENTS: { key: ActivitySection; label: string; icon: string }[] = [
  { key: 'expenses', label: 'Expenses', icon: '💰' },
  { key: 'polls', label: 'Polls', icon: '📊' },
  { key: 'checklists', label: 'Checklist', icon: '✓' },
  { key: 'announcements', label: 'News', icon: '📢' },
];

interface ActivityTabProps {
  tripId: string;
  userId: string;
  isAdmin: boolean; // Whether user can create announcements
}

export default function ActivityTab({ tripId, userId, isAdmin }: ActivityTabProps) {
  const [activeSection, setActiveSection] = useState<ActivitySection>('expenses');
  const { width } = Dimensions.get('window');

  // Animated indicator
  const indicatorX = useSharedValue(0);
  const segmentWidth = (width - 32) / SEGMENTS.length; // 16px padding each side

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const handleSegmentPress = (section: ActivitySection, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate indicator
    indicatorX.value = withSpring(index * segmentWidth, {
      damping: 20,
      stiffness: 200,
    });

    // Animate content change
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'expenses':
        return <ExpensesList tripId={tripId} userId={userId} />;
      case 'polls':
        return <PollsList tripId={tripId} userId={userId} />;
      case 'checklists':
        return <ChecklistsList tripId={tripId} userId={userId} />;
      case 'announcements':
        return <AnnouncementsList tripId={tripId} userId={userId} isAdmin={isAdmin} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Segment Control */}
      <View style={styles.segmentControl}>
        <View style={styles.segmentWrapper}>
          {/* Animated indicator background */}
          <Animated.View
            style={[
              styles.activeIndicator,
              { width: segmentWidth },
              indicatorStyle,
            ]}
          />

          {/* Segments */}
          {SEGMENTS.map((segment, index) => {
            const isActive = activeSection === segment.key;
            return (
              <TouchableOpacity
                key={segment.key}
                style={[styles.segment, { width: segmentWidth }]}
                onPress={() => handleSegmentPress(segment.key, index)}
                activeOpacity={0.7}
              >
                <Text style={styles.segmentIcon}>{segment.icon}</Text>
                <Text
                  style={[
                    styles.segmentLabel,
                    isActive && styles.segmentLabelActive,
                  ]}
                >
                  {segment.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  segmentControl: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  segmentWrapper: {
    position: 'relative',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    flexDirection: 'row',
  },
  activeIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  segment: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    zIndex: 1,
  },
  segmentIcon: {
    fontSize: 16,
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  segmentLabelActive: {
    color: '#111827',
  },
  content: {
    flex: 1,
  },
});