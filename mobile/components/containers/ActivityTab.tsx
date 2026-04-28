import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripsContext';

import * as Haptics from 'expo-haptics';

// Feature modules
// import ExpensesList from './expenses/ExpensesList';
// import PollsList from './polls/PollsList';
// import ChecklistsList from './checklists/ChecklistsList';
// import AnnouncementsList from './announcements/AnnouncementsList';

import ExpensesContainer from '@/components/trip-activity/ExpensesContainer';
import MemberCard from '@/components/trip-activity/MemberCard';
import PollsContainer from '@/components/trip-activity/PollsContainer';
import PostsContainer from '@/components/trip-activity/PostsContainer';
import { ActivityMemberSkeleton } from '@/components/ui/CardSkeletons';
import Text from '@/components/ui/Text';
import Spacer from '@/components/utils/Spacer';
import { Colors, textStyles } from '@/constants';
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
  isMember: boolean;
}

export default function ActivityTab({
  tripId,
  trip,
  isMember,
}: ActivityTabProps) {
  const [activeSection, setActiveSection] = useState<ActivitySection>('polls');
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const dark = colorScheme === 'dark';

  const { user } = useAuth();
  const { removeMember } = useTrips();

  const members = trip?.group_members ?? [];
  const myMember = members.find((m) => m.user_id === user?.id);
  const myRole = myMember?.role;
  const canDelete = myRole === 'owner' || myRole === 'admin';

  const dynamicStyles = {
    segment: (isActive: boolean) => ({
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
      backgroundColor: isActive
        ? colors.primaryColors.default
        : colors.backgroundColors.subtle,
      borderWidth: 1,
      borderColor: isActive
        ? colors.primaryColors.default
        : colors.borderColors.subtle,
      shadowColor: isActive ? colors.primaryColors.default : 'transparent',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isActive ? 0.2 : 0,
      shadowRadius: 4,
      elevation: isActive ? 2 : 0,
    }),
    segmentLabel: (isActive: boolean) => ({
      color: isActive ? colors.white : colors.textColors.subtle,
      fontWeight: isActive ? '700' : ('600' as any),
      fontSize: 13,
    }),
  };

  const handleSegmentPress = (section: ActivitySection) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'polls':
        return <PollsContainer groupId={tripId} isMember={isMember} />;
      case 'expenses':
        return <ExpensesContainer groupId={tripId} isMember={isMember} />;
      case 'posts':
        return <PostsContainer groupId={tripId} isMember={isMember} />;
      case 'members':
        if (!trip || (members.length === 0 && !trip)) {
          return (
            <View style={styles.membersList}>
              {[1, 2, 3, 4, 5].map((i) => (
                <ActivityMemberSkeleton key={i} />
              ))}
            </View>
          );
        }

        return (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.membersList}>
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isMe={member.user_id === user?.id}
                canDelete={canDelete}
                dark={dark}
                onDelete={() => removeMember(tripId, member.user_id)}
              />
            ))}
            {members.length === 0 && (
              <Text
                style={{
                  color: dark ? '#9CA3AF' : '#6b7280',
                  textAlign: 'center',
                  marginTop: 24,
                }}>
                No members found.
              </Text>
            )}
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Segment Control */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                <Text style={dynamicStyles.segmentLabel(isActive)}>
                  {segment.icon} {segment.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Content Area */}
      <Spacer size={15} vertical />
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  segmentWrapper: {
    // paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
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
    alignSelf: 'stretch',
  },
  membersList: {
    paddingBottom: 24,
  },
});
