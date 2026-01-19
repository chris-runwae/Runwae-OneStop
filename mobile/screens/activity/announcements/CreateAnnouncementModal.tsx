// screens/activity/announcements/CreateAnnouncementModal.tsx
// =====================================================
// Create Announcement Modal (Admin Only)
// =====================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { createAnnouncement } from '../queries';

interface CreateAnnouncementModalProps {
  visible: boolean;
  tripId: string;
  onClose: () => void;
}

export default function CreateAnnouncementModal({
  visible,
  tripId,
  onClose,
}: CreateAnnouncementModalProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter an announcement title');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Missing Message', 'Please enter a message');
      return;
    }

    try {
      setLoading(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await createAnnouncement({
        trip_id: tripId,
        title: title.trim(),
        message: message.trim(),
        is_pinned: isPinned,
      });

      // Reset form
      setTitle('');
      setMessage('');
      setIsPinned(false);

      onClose();
    } catch (error) {
      console.error('Error creating announcement:', error);
      Alert.alert('Error', 'Failed to create announcement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Announcement</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="e.g., Flight Details Updated"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>

          {/* Message */}
          <View style={styles.section}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Share important updates with the group..."
              value={message}
              onChangeText={setMessage}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Pin Toggle */}
          <View style={styles.section}>
            <View style={styles.pinToggleContainer}>
              <View style={styles.pinToggleInfo}>
                <Text style={styles.pinToggleLabel}>📌 Pin Announcement</Text>
                <Text style={styles.pinToggleDescription}>
                  Pinned announcements appear at the top
                </Text>
              </View>
              <Switch
                value={isPinned}
                onValueChange={value => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsPinned(value);
                }}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={isPinned ? '#3B82F6' : '#F3F4F6'}
              />
            </View>
          </View>

          {/* Helper Text */}
          <View style={styles.helperBox}>
            <Text style={styles.helperIcon}>ℹ️</Text>
            <Text style={styles.helperText}>
              All trip members will see this announcement. Use announcements for
              important updates only.
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.submitButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Post Announcement</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    color: '#3B82F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  messageInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    minHeight: 150,
    textAlignVertical: 'top',
  },
  pinToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  pinToggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  pinToggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  pinToggleDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  helperBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    marginBottom: 16,
  },
  helperIcon: {
    fontSize: 20,
  },
  helperText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});