// screens/activity/expenses/AddExpenseModal.tsx
// =====================================================
// Add Expense Modal with Category & Participant Selection
// =====================================================

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { createExpense } from '../queries';
import { supabase } from '@/lib/supabase';
import type { ExpenseCategory, TripMember } from '../types';

const CATEGORIES: { key: ExpenseCategory; label: string; emoji: string }[] = [
  { key: 'food', label: 'Food', emoji: '🍽️' },
  { key: 'lodging', label: 'Lodging', emoji: '🏨' },
  { key: 'transport', label: 'Transport', emoji: '🚗' },
  { key: 'misc', label: 'Misc', emoji: '🎯' },
];

interface AddExpenseModalProps {
  visible: boolean;
  tripId: string;
  userId: string;
  onClose: () => void;
}

export default function AddExpenseModal({
  visible,
  tripId,
  userId,
  onClose,
}: AddExpenseModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([userId]);
  const [tripMembers, setTripMembers] = useState<TripMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingMembers, setFetchingMembers] = useState(true);

  // Fetch trip members
  useEffect(() => {
    if (visible) {
      fetchTripMembers();
    }
  }, [visible, tripId]);

  const fetchTripMembers = async () => {
    try {
      setFetchingMembers(true);
      const { data, error } = await supabase
        .from('trip_attendees')
        .select(`
          id,
          user_id,
          trip_id,
          role,
          user:user_id(id, email, full_name, avatar_url)
        `)
        .eq('trip_id', tripId);

      if (error) throw error;
      // setTripMembers(data?.map(member => ({
      //   ...member,
      //   user: member.user[0],
      // })) || []);
      setTripMembers(data || []);


      // Auto-select current user
      setSelectedParticipants([userId]);
    } catch (error) {
      console.error('Error fetching trip members:', error);
      Alert.alert('Error', 'Failed to load trip members');
    } finally {
      setFetchingMembers(false);
    }
  };

  const toggleParticipant = (memberId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setSelectedParticipants(prev => {
      if (prev.includes(memberId)) {
        // Don't allow deselecting if it's the only participant
        if (prev.length === 1) {
          Alert.alert('Notice', 'At least one participant is required');
          return prev;
        }
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!description.trim()) {
      Alert.alert('Missing Info', 'Please enter a description');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (selectedParticipants.length === 0) {
      Alert.alert('Missing Info', 'Please select at least one participant');
      return;
    }

    try {
      setLoading(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await createExpense({
        trip_id: tripId,
        description: description.trim(),
        amount: amountNum,
        category,
        participant_ids: selectedParticipants,
      });

      // Reset form
      setDescription('');
      setAmount('');
      setCategory('food');
      setSelectedParticipants([userId]);

      onClose();
    } catch (error) {
      console.error('Error creating expense:', error);
      Alert.alert('Error', 'Failed to create expense. Please try again.');
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
          <Text style={styles.headerTitle}>Add Expense</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Dinner at Italian restaurant"
              value={description}
              onChangeText={setDescription}
              autoFocus
            />
          </View>

          {/* Amount */}
          <View style={styles.section}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.amountInputWrapper}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => {
                const isSelected = category === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryCard,
                      isSelected && styles.categoryCardSelected,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setCategory(cat.key);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                    <Text
                      style={[
                        styles.categoryLabel,
                        isSelected && styles.categoryLabelSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Participants */}
          <View style={styles.section}>
            <Text style={styles.label}>Split Between</Text>
            {fetchingMembers ? (
              <ActivityIndicator color="#3B82F6" style={{ marginTop: 12 }} />
            ) : (
              <View style={styles.participantsList}>
                {tripMembers.map(member => {
                  const isSelected = selectedParticipants.includes(member.user_id);
                  const isCurrentUser = member.user_id === userId;

                  return (
                    <TouchableOpacity
                      key={member.user_id}
                      style={[
                        styles.participantCard,
                        isSelected && styles.participantCardSelected,
                      ]}
                      onPress={() => toggleParticipant(member.user_id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.participantInfo}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {member.user?.full_name?.[0] || member.user?.email[0] || '?'}
                          </Text>
                        </View>
                        <View style={styles.participantDetails}>
                          <Text style={styles.participantName}>
                            {member.user?.full_name || 'User'}
                            {isCurrentUser && ' (You)'}
                          </Text>
                          <Text style={styles.participantEmail}>
                            {member.user?.email}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}
                      >
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Split Preview */}
          {selectedParticipants.length > 0 && amount && !isNaN(parseFloat(amount)) && (
            <View style={styles.splitPreview}>
              <Text style={styles.splitPreviewLabel}>Each person pays:</Text>
              <Text style={styles.splitPreviewAmount}>
                ${(parseFloat(amount) / selectedParticipants.length).toFixed(2)}
              </Text>
            </View>
          )}
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
                <Text style={styles.submitButtonText}>Add Expense</Text>
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
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    paddingVertical: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  categoryCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryLabelSelected: {
    color: '#3B82F6',
  },
  participantsList: {
    gap: 12,
  },
  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
  },
  participantCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    textTransform: 'uppercase',
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  participantEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  splitPreview: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  splitPreviewLabel: {
    fontSize: 14,
    color: '#166534',
    marginBottom: 4,
  },
  splitPreviewAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#15803D',
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