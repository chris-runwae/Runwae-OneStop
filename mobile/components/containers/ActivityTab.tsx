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
// import ExpensesList from './expenses/ExpensesList';
// import PollsList from './polls/PollsList';
// import ChecklistsList from './checklists/ChecklistsList';
// import AnnouncementsList from './announcements/AnnouncementsList';

import { Colors, textStyles } from '@/constants';
import { PollsContainer, Spacer, Text } from '@/components';
import { TripWithEverything } from '@/hooks/useTripActions';

type ActivitySection = 'polls' | 'expenses' | 'posts' | 'members';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SEGMENTS: { key: ActivitySection; label: string; icon: string }[] = [
  { key: 'polls', label: 'Polls', icon: '🗳️' },
  { key: 'expenses', label: 'Expenses', icon: '💳' },
  { key: 'posts', label: 'Posts', icon: '📝' },
  { key: 'members', label: 'Members', icon: '👥' },
];

interface ActivityTabProps {
  tripId: string;
  trip?: TripWithEverything;
}

export default function ActivityTab({ tripId, trip }: ActivityTabProps) {
  const [activeSection, setActiveSection] = useState<ActivitySection>('polls');
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const dynamicStyles = {
    segment: (isActive: boolean) => ({
      borderRadius: 100,
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignItems: 'center',
      alignSelf: 'center',
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
      ...textStyles.textBody12,
    },
    segmentLabelActive: {
      color: colors.white,
    },
  };

  const handleSegmentPress = (section: ActivitySection) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'polls':
        return <PollsContainer groupId={tripId} />;
      case 'expenses':
        return <Text>Expenses</Text>; // <ExpensesList tripId={tripId} userId={userId} />;
      case 'posts':
        return <Text>Posts</Text>; // <ChecklistsList tripId={tripId} userId={userId} />;
      case 'members':
        return <Text>Members</Text>; // <AnnouncementsList tripId={tripId} userId={userId} isAdmin={isAdmin} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Segment Control */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.segmentControl}>
        <View style={styles.segmentWrapper}>
          {/* Segments */}
          {SEGMENTS.map((segment, index) => {
            const isActive = activeSection === segment.key;
            return (
              <TouchableOpacity
                key={segment.key}
                style={[
                  styles.segment,
                  dynamicStyles.segment(isActive) as ViewStyle,
                ]}
                onPress={() =>
                  handleSegmentPress(segment.key as ActivitySection)
                }
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.segmentLabel,
                    dynamicStyles.segmentLabel,
                    isActive && dynamicStyles.segmentLabelActive,
                  ]}>
                  {segment.icon} {segment.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Content Area */}
      <Spacer size={16} vertical />
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  segmentControl: {},
  segmentWrapper: {
    position: 'relative',
    borderRadius: 12,
    gap: 4,
    flexDirection: 'row',
    width: '100%',
  },
  segment: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    zIndex: 1,
  },
  segmentIcon: {
    fontSize: 12,
  },
  segmentLabel: {
    ...textStyles.textBody12,
  },
  segmentLabelActive: {},
  content: {
    flex: 1,
  },
});
