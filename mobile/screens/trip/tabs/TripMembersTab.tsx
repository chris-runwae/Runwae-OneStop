import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripsContext';
import { GroupMember, GroupMemberRole, TripWithEverything } from '@/hooks/useTripActions';
import { useTheme } from '@react-navigation/native';
import { Image } from 'expo-image';
import { UserPlus } from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ================================================================
// Helpers
// ================================================================

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#DDA0DD', '#F4A261', '#2A9D8F', '#E76F51',
];

function avatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(member: GroupMember): string {
  const name = member.profiles?.full_name;
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase();
}

const ROLE_LABELS: Record<GroupMemberRole, string> = {
  owner:  'Owner',
  admin:  'Admin',
  member: 'Member',
};

// ================================================================
// MemberRow
// ================================================================

interface MemberRowProps {
  member:       GroupMember;
  isMe:         boolean;
  canManage:    boolean;
  dark:         boolean;
  onLongPress?: () => void;
}

function MemberRow({ member, isMe, canManage, dark, onLongPress }: MemberRowProps) {
  const isOwner = member.role === 'owner';

  return (
    <TouchableOpacity
      style={[styles.memberRow, { borderBottomColor: dark ? '#2c2c2e' : '#f3f4f6' }]}
      onLongPress={canManage && !isOwner && !isMe ? onLongPress : undefined}
      delayLongPress={350}
      activeOpacity={canManage && !isOwner && !isMe ? 0.7 : 1}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: avatarColor(member.user_id) }]}>
        {member.profiles?.avatar_url ? (
          <Image
            source={{ uri: member.profiles.avatar_url }}
            style={styles.avatarImage}
            contentFit="cover"
          />
        ) : (
          <Text style={styles.avatarText}>{initials(member)}</Text>
        )}
      </View>

      {/* Name + email */}
      <View style={styles.memberInfo}>
        <View style={styles.nameRow}>
          <Text style={[styles.memberName, { color: dark ? '#ffffff' : '#111827' }]} numberOfLines={1}>
            {member.profiles?.full_name ?? 'Unknown user'}
          </Text>
          {isMe && (
            <View style={[styles.youBadge, { backgroundColor: dark ? '#374151' : '#f3f4f6' }]}>
              <Text style={[styles.youBadgeText, { color: dark ? '#9ca3af' : '#6b7280' }]}>You</Text>
            </View>
          )}
        </View>
      </View>

      {/* Role badge */}
      <View style={[
        styles.roleBadge,
        {
          backgroundColor: isOwner
            ? 'rgba(255,31,140,0.12)'
            : (dark ? '#2c2c2e' : '#f3f4f6'),
        },
      ]}>
        <Text style={[
          styles.roleText,
          { color: isOwner ? '#FF1F8C' : (dark ? '#9ca3af' : '#6b7280') },
        ]}>
          {ROLE_LABELS[member.role]}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ================================================================
// TripMembersTab
// ================================================================

interface Props {
  trip: TripWithEverything;
}

export default function TripMembersTab({ trip }: Props) {
  const { dark } = useTheme();
  const { user } = useAuth();
  const { updateMemberRole, removeMember } = useTrips();

  const myRole = trip.group_members.find((m) => m.user_id === user?.id)?.role;
  const canManage = myRole === 'owner' || myRole === 'admin';

  const handleLongPress = (member: GroupMember) => {
    const newRole: GroupMemberRole = member.role === 'admin' ? 'member' : 'admin';
    const roleLabel = newRole === 'admin' ? 'Make Admin' : 'Remove Admin';

    Alert.alert(
      member.profiles?.full_name ?? 'Member',
      'Manage this member',
      [
        {
          text: roleLabel,
          onPress: () => updateMemberRole(trip.id, member.user_id, newRole),
        },
        {
          text: 'Remove from trip',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Remove member',
              `Remove ${member.profiles?.full_name ?? 'this member'} from the trip?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Remove',
                  style: 'destructive',
                  onPress: () => removeMember(trip.id, member.user_id),
                },
              ],
            ),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={trip.group_members}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <MemberRow
            member={item}
            isMe={item.user_id === user?.id}
            canManage={canManage}
            dark={dark}
            onLongPress={() => handleLongPress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Invite button */}
      <View style={[styles.footer, { borderTopColor: dark ? '#2c2c2e' : '#f3f4f6' }]}>
        <TouchableOpacity
          style={[styles.inviteButton, { backgroundColor: dark ? '#1c1c1e' : '#f9fafb', borderColor: dark ? '#2c2c2e' : '#e5e7eb' }]}
          onPress={() => Alert.alert('Coming soon', 'Invite links are coming in a future update.')}
        >
          <UserPlus size={18} strokeWidth={1.5} color="#FF1F8C" />
          <Text style={styles.inviteText}>Invite people</Text>
        </TouchableOpacity>
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
  listContent: {
    paddingBottom: 8,
  },

  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  memberInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '500',
    flexShrink: 1,
  },
  youBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  youBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 0,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },

  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
  },
  inviteText: {
    color: '#FF1F8C',
    fontSize: 15,
    fontWeight: '600',
  },
});
