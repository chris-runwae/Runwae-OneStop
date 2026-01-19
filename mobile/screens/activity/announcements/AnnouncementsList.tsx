// screens/activity/announcements/AnnouncementsList.tsx
// =====================================================
// Announcements List with Pinned Items & Read Status
// =====================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import CreateAnnouncementModal from './CreateAnnouncementModal';
import { useTripAnnouncements, markAnnouncementRead } from '../queries';
import type { Announcement } from '../types';

interface AnnouncementsListProps {
  tripId: string;
  userId: string;
  isAdmin: boolean;
}

export default function AnnouncementsList({
  tripId,
  userId,
  isAdmin,
}: AnnouncementsListProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { announcements, loading } = useTripAnnouncements(tripId, userId);

  // Auto-mark announcements as read when they're viewed
  useEffect(() => {
    const unreadAnnouncements = announcements.filter(a => !a.is_read);
    
    if (unreadAnnouncements.length > 0) {
      // Mark all as read after a short delay (user has seen them)
      const timer = setTimeout(() => {
        unreadAnnouncements.forEach(announcement => {
          markAnnouncementRead(announcement.id, userId).catch(console.error);
        });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [announcements, userId]);

  const handleCreateAnnouncement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setModalVisible(true);
  };

  const renderAnnouncementItem = ({ item }: { item: Announcement }) => {
    const isPinned = item.is_pinned;
    const isUnread = !item.is_read;

    return (
      <View
        style={[
          styles.announcementCard,
          isPinned && styles.announcementCardPinned,
          isUnread && styles.announcementCardUnread,
        ]}
      >
        {/* Pinned Badge */}
        {isPinned && (
          <View style={styles.pinnedBadge}>
            <Text style={styles.pinnedIcon}>📌</Text>
            <Text style={styles.pinnedText}>Pinned</Text>
          </View>
        )}

        {/* Unread Indicator */}
        {isUnread && !isPinned && <View style={styles.unreadDot} />}

        {/* Title */}
        <Text style={styles.announcementTitle}>{item.title}</Text>

        {/* Message */}
        <Text style={styles.announcementMessage}>{item.message}</Text>

        {/* Footer */}
        <View style={styles.announcementFooter}>
          <View style={styles.creatorInfo}>
            <View style={styles.creatorAvatar}>
              <Text style={styles.creatorAvatarText}>
                {item.creator?.full_name?.[0] || item.creator?.email[0] || '?'}
              </Text>
            </View>
            <View>
              <Text style={styles.creatorName}>
                {item.creator?.full_name || 'Trip Admin'}
              </Text>
              <Text style={styles.announcementDate}>
                {new Date(item.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Info Banner (if not admin) */}
      {!isAdmin && (
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerIcon}>ℹ️</Text>
          <Text style={styles.infoBannerText}>
            Only trip admins can post announcements
          </Text>
        </View>
      )}

      <FlatList
        data={announcements}
        keyExtractor={item => item.id}
        renderItem={renderAnnouncementItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📢</Text>
            <Text style={styles.emptyText}>No announcements yet</Text>
            <Text style={styles.emptySubtext}>
              {isAdmin
                ? 'Share important updates with your group'
                : 'Announcements from admins will appear here'}
            </Text>
          </View>
        }
      />

      {/* Create Button (Admin Only) */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateAnnouncement}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={styles.addButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.addButtonText}>+ New Announcement</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Create Announcement Modal */}
      {isAdmin && (
        <CreateAnnouncementModal
          visible={modalVisible}
          tripId={tripId}
          onClose={() => setModalVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  infoBannerIcon: {
    fontSize: 18,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  announcementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  announcementCardPinned: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
    borderWidth: 2,
  },
  announcementCardUnread: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pinnedIcon: {
    fontSize: 14,
  },
  pinnedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    paddingRight: 24, // Space for unread dot
  },
  announcementMessage: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 16,
  },
  announcementFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    textTransform: 'uppercase',
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  announcementDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});