import { Image } from 'expo-image';
import { Trash2 } from 'lucide-react-native';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AVATAR_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#DDA0DD', '#F4A261', '#2A9D8F', '#E76F51'];

function avatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(member: MemberCardProps['member']): string {
  const name = member.profiles?.full_name;
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase();
}

const ROLE_LABELS: Record<string, string> = { owner: 'Owner', admin: 'Admin', member: 'Member' };

interface MemberCardProps {
  member: {
    id: string;
    user_id: string;
    role: string;
    profiles?: {
      full_name?: string | null;
      avatar_url?: string | null;
    } | null;
  };
  isMe: boolean;
  canDelete: boolean;
  dark: boolean;
  onDelete?: () => void;
}

const MemberCard = ({ member, isMe, canDelete, dark, onDelete }: MemberCardProps) => {
  const isOwner = member.role === 'owner';

  const confirmDelete = () =>
    Alert.alert(
      'Remove member',
      `Remove ${member.profiles?.full_name ?? 'this member'} from the trip?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: onDelete },
      ]
    );

  return (
    <View style={[styles.card, { backgroundColor: dark ? '#1c1c1e' : '#F9FAFB', borderColor: dark ? '#2c2c2e' : '#E5E7EB' }]}>
      <View style={[styles.avatar, { backgroundColor: avatarColor(member.user_id) }]}>
        {member.profiles?.avatar_url ? (
          <Image source={{ uri: member.profiles.avatar_url }} style={styles.avatarImg} contentFit="cover" />
        ) : (
          <Text style={styles.avatarText}>{initials(member)}</Text>
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: dark ? '#fff' : '#111827' }]} numberOfLines={1}>
            {member.profiles?.full_name ?? 'Unknown'}
          </Text>
          {isMe && (
            <View style={[styles.youBadge, { backgroundColor: dark ? '#374151' : '#F3F4F6' }]}>
              <Text style={[styles.youText, { color: dark ? '#9CA3AF' : '#6b7280' }]}>You</Text>
            </View>
          )}
        </View>
        <View style={[styles.rolePill, { backgroundColor: isOwner ? 'rgba(255,31,140,0.12)' : (dark ? '#2c2c2e' : '#F3F4F6') }]}>
          <Text style={[styles.roleText, { color: isOwner ? '#FF1F8C' : (dark ? '#9CA3AF' : '#6b7280') }]}>
            {ROLE_LABELS[member.role] ?? member.role}
          </Text>
        </View>
      </View>
      {canDelete && !isOwner && !isMe && (
        <TouchableOpacity onPress={confirmDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Trash2 size={16} color="#EF4444" strokeWidth={1.5} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, padding: 10, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  info: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 14, fontWeight: '500', flexShrink: 1 },
  youBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  youText: { fontSize: 11, fontWeight: '600' },
  rolePill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  roleText: { fontSize: 11, fontWeight: '600' },
});

export default MemberCard;
