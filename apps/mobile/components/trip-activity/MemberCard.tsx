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

function initials(member: { user: { name?: string } | null }): string {
  const name = member.user?.name;
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase();
}

const ROLE_LABELS: Record<string, string> = { owner: 'Owner', editor: 'Editor', viewer: 'Viewer' };

import type { TripMember } from '@/hooks/useTripActions';

interface MemberCardProps {
  member: TripMember;
  isMe: boolean;
  canDelete: boolean;
  dark: boolean;
  onDelete?: () => void;
}

const MemberCard = ({ member, isMe, canDelete, dark, onDelete }: MemberCardProps) => {
  const isOwner = member.role === 'owner';
  const name = member.user?.name ?? 'Unknown';
  const avatarUrl = member.user?.avatarUrl ?? member.user?.image;
  const userIdStr = (member.user?._id as unknown as string) ?? member._id;

  const confirmDelete = () =>
    Alert.alert(
      'Remove member',
      `Remove ${name} from the trip?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: onDelete },
      ]
    );

  return (
    <View style={[styles.card, { backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: dark ? '#2c2c2e' : '#E5E7EB' }]}>
      <View style={[styles.avatar, { backgroundColor: avatarColor(userIdStr) }]}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImg} contentFit="cover" />
        ) : (
          <Text style={styles.avatarText}>{initials(member)}</Text>
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: dark ? '#fff' : '#111827' }]} numberOfLines={1}>
            {name}
          </Text>
          {isMe && (
            <View style={[styles.youBadge, { backgroundColor: '#FF1F8C' }]}>
              <Text style={[styles.youText, { color: '#fff' }]}>You</Text>
            </View>
          )}
        </View>
        <View style={[styles.rolePill, { backgroundColor: isOwner ? 'rgba(255,31,140,0.12)' : (dark ? 'rgba(255,255,255,0.08)' : '#F3F4F6') }]}>
          <Text style={[styles.roleText, { color: isOwner ? '#FF1F8C' : (dark ? '#9CA3AF' : '#6b7280') }]}>
            {ROLE_LABELS[member.role] ?? member.role}
          </Text>
        </View>
      </View>
      {canDelete && !isOwner && !isMe && (
        <TouchableOpacity 
          onPress={confirmDelete} 
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.deleteButton}>
          <Trash2 size={16} color="#EF4444" strokeWidth={2} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    borderWidth: 1, 
    borderRadius: 16, 
    padding: 12, 
    marginBottom: 10 
  },
  avatar: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    alignItems: 'center', 
    justifyContent: 'center', 
    overflow: 'hidden', 
    flexShrink: 0 
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  info: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 15, fontWeight: '600', flexShrink: 1 },
  youBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  youText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  rolePill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  roleText: { fontSize: 11, fontWeight: '700' },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
  }
});

export default MemberCard;
