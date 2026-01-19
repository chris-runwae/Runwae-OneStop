// screens/activity/checklists/ChecklistsList.tsx
// =====================================================
// Checklists with Animated Toggle & Progress
// =====================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import AddChecklistModal from './AddChecklistModal';
import { useTripChecklists, updateChecklistItem } from '../queries';
import type { Checklist, ChecklistItem } from '../types';

interface ChecklistsListProps {
  tripId: string;
  userId: string;
}

export default function ChecklistsList({ tripId, userId }: ChecklistsListProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [expandedChecklistIds, setExpandedChecklistIds] = useState<Set<string>>(
    new Set()
  );
  const { checklists, loading } = useTripChecklists(tripId);

  const handleCreateChecklist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setModalVisible(true);
  };

  const toggleChecklist = (checklistId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setExpandedChecklistIds(prev => {
      const next = new Set(prev);
      if (next.has(checklistId)) {
        next.delete(checklistId);
      } else {
        next.add(checklistId);
      }
      return next;
    });
  };

  const handleToggleItem = async (item: ChecklistItem) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await updateChecklistItem(
        {
          id: item.id,
          is_completed: !item.is_completed,
        },
        userId
      );
    } catch (error) {
      console.error('Error toggling item:', error);
      Alert.alert('Error', 'Failed to update item. Please try again.');
    }
  };

  const renderChecklistItem = ({ item }: { item: Checklist }) => {
    const isExpanded = expandedChecklistIds.has(item.id);
    const completedCount = item.items?.filter(i => i.is_completed).length || 0;
    const totalCount = item.items?.length || 0;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
      <View style={styles.checklistCard}>
        {/* Checklist Header */}
        <TouchableOpacity
          style={styles.checklistHeader}
          onPress={() => toggleChecklist(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.checklistInfo}>
            <Text style={styles.checklistTitle}>{item.title}</Text>
            <Text style={styles.checklistMeta}>
              {completedCount} / {totalCount} completed
            </Text>
          </View>

          {/* Progress Circle */}
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>

          {/* Expand Icon */}
          <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress}%`,
                },
              ]}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.progressBarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>
        </View>

        {/* Checklist Items */}
        {isExpanded && item.items && item.items.length > 0 && (
          <View style={styles.itemsContainer}>
            {item.items.map(checklistItem => (
              <ChecklistItemRow
                key={checklistItem.id}
                item={checklistItem}
                onToggle={() => handleToggleItem(checklistItem)}
              />
            ))}
          </View>
        )}
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
      <FlatList
        data={checklists}
        keyExtractor={item => item.id}
        renderItem={renderChecklistItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyText}>No checklists yet</Text>
            <Text style={styles.emptySubtext}>
              Create a checklist to track tasks
            </Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleCreateChecklist}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          style={styles.addButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.addButtonText}>+ New Checklist</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Checklist Modal */}
      <AddChecklistModal
        visible={modalVisible}
        tripId={tripId}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

// =====================================================
// Checklist Item Row with Animated Checkbox
// =====================================================
interface ChecklistItemRowProps {
  item: ChecklistItem;
  onToggle: () => void;
}

function ChecklistItemRow({ item, onToggle }: ChecklistItemRowProps) {
  const scale = useSharedValue(1);
  const checkOpacity = useSharedValue(item.is_completed ? 1 : 0);

  React.useEffect(() => {
    checkOpacity.value = withSpring(item.is_completed ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [item.is_completed]);

  const handlePress = () => {
    // Bounce animation
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    onToggle();
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkOpacity.value }],
  }));

  return (
    <Animated.View style={containerStyle}>
      <TouchableOpacity
        style={styles.itemRow}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Checkbox */}
        <View
          style={[
            styles.checkbox,
            item.is_completed && styles.checkboxCompleted,
          ]}
        >
          <Animated.Text style={[styles.checkmark, checkStyle]}>
            ✓
          </Animated.Text>
        </View>

        {/* Item Text */}
        <Text
          style={[
            styles.itemText,
            item.is_completed && styles.itemTextCompleted,
          ]}
        >
          {item.text}
        </Text>

        {/* Completer Info */}
        {item.is_completed && item.completer && (
          <Text style={styles.completerText}>
            {item.completer.full_name?.split(' ')[0] || 'User'}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  checklistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checklistInfo: {
    flex: 1,
  },
  checklistTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  checklistMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B82F6',
  },
  expandIcon: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  progressBarContainer: {
    marginTop: 12,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressBarGradient: {
    flex: 1,
  },
  itemsContainer: {
    marginTop: 16,
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  completerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
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