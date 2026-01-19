// screens/activity/expenses/ExpensesList.tsx
// =====================================================
// Expenses List with Summary Cards
// =====================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { FlashList } from '@shopify/flash-list';

import AddExpenseModal from './AddExpenseModal';
import { useTripExpenses, calculateExpenseSummary } from '../queries';
import type { Expense } from '../types';

interface ExpensesListProps {
  tripId: string;
  userId: string;
}

export default function ExpensesList({ tripId, userId }: ExpensesListProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { expenses, loading } = useTripExpenses(tripId);

  // Calculate summary
  const summary = useMemo(
    () => calculateExpenseSummary(expenses, userId),
    [expenses, userId]
  );

  const handleAddExpense = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setModalVisible(true);
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const isPaidByUser = item.created_by === userId;
    const categoryEmoji = {
      food: '🍽️',
      lodging: '🏨',
      transport: '🚗',
      misc: '🎯',
    }[item.category];

    return (
      <View style={styles.expenseCard}>
        <View style={styles.expenseHeader}>
          <View style={styles.expenseInfo}>
            <Text style={styles.categoryEmoji}>{categoryEmoji}</Text>
            <View style={styles.expenseDetails}>
              <Text style={styles.expenseDescription}>{item.description}</Text>
              <Text style={styles.expenseMeta}>
                {isPaidByUser ? 'You paid' : `${item.creator?.full_name || 'Someone'} paid`}
                {' · '}
                {new Date(item.expense_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
          <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
        </View>

        {/* Participants */}
        {item.participants && item.participants.length > 0 && (
          <View style={styles.participants}>
            <Text style={styles.participantsLabel}>Split between:</Text>
            <Text style={styles.participantsList}>
              {item.participants.map(p => p.user?.full_name || 'User').join(', ')}
            </Text>
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
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        {/* Total Spent */}
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          style={styles.summaryCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={styles.summaryAmount}>${summary.totalSpent.toFixed(2)}</Text>
        </LinearGradient>

        {/* You Owe */}
        <View style={[styles.summaryCard, styles.summaryCardOutline]}>
          <Text style={[styles.summaryLabel, styles.summaryLabelDark]}>You Owe</Text>
          <Text style={[styles.summaryAmount, styles.summaryAmountNegative]}>
            ${summary.youOwe.toFixed(2)}
          </Text>
        </View>

        {/* You're Owed */}
        <View style={[styles.summaryCard, styles.summaryCardOutline]}>
          <Text style={[styles.summaryLabel, styles.summaryLabelDark]}>You&apos;re Owed</Text>
          <Text style={[styles.summaryAmount, styles.summaryAmountPositive]}>
            ${summary.youAreOwed.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Expenses List */}
      <FlashList
        data={expenses}
        keyExtractor={item => item.id}
        renderItem={renderExpenseItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💸</Text>
            <Text style={styles.emptyText}>No expenses yet</Text>
            <Text style={styles.emptySubtext}>
              Start tracking your trip expenses
            </Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddExpense}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          style={styles.addButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.addButtonText}>+ Add Expense</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Expense Modal */}
      <AddExpenseModal
        visible={modalVisible}
        tripId={tripId}
        userId={userId}
        onClose={() => setModalVisible(false)}
      />
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
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    minHeight: 80,
  },
  summaryCardOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  summaryLabelDark: {
    color: '#6B7280',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryAmountNegative: {
    color: '#EF4444',
  },
  summaryAmountPositive: {
    color: '#10B981',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Space for add button
  },
  expenseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  expenseInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  expenseMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  expenseAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  participants: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  participantsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  participantsList: {
    fontSize: 13,
    color: '#374151',
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