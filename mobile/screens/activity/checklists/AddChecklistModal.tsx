// screens/activity/checklists/AddChecklistModal.tsx
// =====================================================
// Add Checklist Modal with Dynamic Items
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
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { createChecklist, createChecklistItem } from '../queries';

interface AddChecklistModalProps {
  visible: boolean;
  tripId: string;
  onClose: () => void;
}

export default function AddChecklistModal({
  visible,
  tripId,
  onClose,
}: AddChecklistModalProps) {
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<string[]>(['', '', '']);
  const [loading, setLoading] = useState(false);

  const handleAddItem = () => {
    if (items.length >= 20) {
      Alert.alert('Limit Reached', 'Maximum 20 items allowed');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setItems([...items, '']);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      Alert.alert('Minimum Required', 'At least 1 item is required');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, text: string) => {
    const newItems = [...items];
    newItems[index] = text;
    setItems(newItems);
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a checklist title');
      return;
    }

    const filledItems = items.filter(item => item.trim().length > 0);
    if (filledItems.length === 0) {
      Alert.alert('Missing Items', 'Please add at least 1 item');
      return;
    }

    try {
      setLoading(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Create checklist
      const checklist = await createChecklist({
        trip_id: tripId,
        title: title.trim(),
      });

      // Create items
      await Promise.all(
        filledItems.map((text, index) =>
          createChecklistItem({
            checklist_id: checklist.id,
            text: text.trim(),
            position: index,
          })
        )
      );

      // Reset form
      setTitle('');
      setItems(['', '', '']);

      onClose();
    } catch (error) {
      console.error('Error creating checklist:', error);
      Alert.alert('Error', 'Failed to create checklist. Please try again.');
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
          <Text style={styles.headerTitle}>New Checklist</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Checklist Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="e.g., Packing List"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>

          {/* Items */}
          <View style={styles.section}>
            <View style={styles.itemsHeader}>
              <Text style={styles.label}>Items</Text>
              <Text style={styles.itemsCount}>{items.length}/20</Text>
            </View>

            <View style={styles.itemsList}>
              {items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemCheckbox}>
                    <View style={styles.itemCheckboxInner} />
                  </View>
                  <TextInput
                    style={styles.itemInput}
                    placeholder={`Item ${index + 1}`}
                    value={item}
                    onChangeText={text => handleUpdateItem(index, text)}
                  />
                  {items.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveItem(index)}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {items.length < 20 && (
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={handleAddItem}
              >
                <Text style={styles.addItemText}>+ Add Item</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Helper Text */}
          <View style={styles.helperBox}>
            <Text style={styles.helperIcon}>💡</Text>
            <Text style={styles.helperText}>
              All trip members can check off items. The person who completes each
              item will be shown.
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
                <Text style={styles.submitButtonText}>Create Checklist</Text>
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
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemsCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  itemsList: {
    gap: 12,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCheckboxInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  itemInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#111827',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  addItemButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
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