// screens/activity/ActivityTab.tsx
// =====================================================
// Activity Tab Container
// Embedded in TripDetailScreen - NOT a routed screen
// =====================================================

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  UIManager,
  useColorScheme,
  ViewStyle,
} from 'react-native';

import * as Haptics from 'expo-haptics';

// Feature modules
import ExpensesList from './expenses/ExpensesList';
import PollsList from './polls/PollsList';
import ChecklistsList from './checklists/ChecklistsList';
import AnnouncementsList from './announcements/AnnouncementsList';

import type { ActivitySection } from './types';
import { Colors } from '@/constants';
import { Text } from '@/components';
import { textStyles } from '@/utils/styles';

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
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];


  const dynamicStyles = {
    segment: (isActive: boolean) => ({
      borderRadius: 100,
      paddingHorizontal: 16,
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 6,
      zIndex: 1,
      ...(!isActive && {
        backgroundColor: colors.backgroundColors.subtle,
        borderColor: colors.borderColors.subtle,
        borderWidth: 0.5,
      }),
      ...(isActive && {
        backgroundColor: colors.primaryColors.default,
      }),
    }),
    segmentLabel: {
      color: colors.textColors.subtle,
      ...textStyles.subtitle_Regular,
    },
    segmentLabelActive: {
      color: colors.white,
    },
  };

  const handleSegmentPress = (section: ActivitySection, ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.segmentControl}>
        <View style={styles.segmentWrapper}>
          {/* Segments */}
          {SEGMENTS.map((segment, index) => {
            const isActive = activeSection === segment.key;
            return (
              <TouchableOpacity
                key={segment.key}
                style={[styles.segment, dynamicStyles.segment(isActive) as ViewStyle]}
                onPress={() => handleSegmentPress(segment.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentLabel,
                    dynamicStyles.segmentLabel,
                    isActive && dynamicStyles.segmentLabelActive,
                  ]}
                >
                  {segment.icon} {segment.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Content Area */}
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentControl: {
    paddingTop: 16,
    paddingBottom: 12,
  },
  segmentWrapper: {
    position: 'relative',
    borderRadius: 12,
    gap: 4,
    flexDirection: 'row',
    width: '100%',
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
  },
  content: {
    flex: 1,
  },
});