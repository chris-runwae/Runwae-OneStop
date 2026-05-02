import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Plus, Receipt } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityExpenseSkeleton } from '@/components/ui/CardSkeletons';
import Text from '@/components/ui/Text';
import { Colors, textStyles } from '@/constants';
import useExpenseActions from '@/hooks/useExpenseActions';
import ExpenseItem from './ExpenseItem';

export default function ExpensesContainer({
  groupId,
  isMember,
}: {
  groupId: string;
  isMember: boolean;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const {
    deleteExpense,
    markPaid,
    confirmPayment,
    useExpensesByTrip,
  } = useExpenseActions();
  const expensesRaw = useExpensesByTrip(groupId);
  const expenses = expensesRaw ?? [];
  const isLoading = expensesRaw === undefined;
  const insets = useSafeAreaInsets();

  const renderHeader = () => {
    const count = expenses?.length ?? 0;
    const countText =
      count === 0
        ? 'No expenses yet'
        : count === 1
          ? '1 tracked expense'
          : `${count} tracked expenses`;

    return (
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headerTitle}>Trip Expenses</Text>
          <Text style={styles.headerSubtitle}>{countText}</Text>
        </View>

        {isMember && (
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() =>
              router.push(`/(tabs)/(trips)/${groupId}/add-expense`)
            }>
            <Plus size={18} color={colors.white} />
            <Text style={styles.headerButtonText}>Add</Text>
          </Pressable>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyIconContainer}>
        <Receipt size={32} color={colors.primaryColors.default} />
      </View>
      <Text style={styles.emptyStateTitle}>No expenses yet</Text>
      <Text style={styles.emptyStateBody}>
        Split costs, track payments, and settle up with your group effortlessly.
      </Text>
    </View>
  );

  if (isLoading && (!expenses || expenses.length === 0)) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View>
          {[1, 2].map((i) => (
            <ActivityExpenseSkeleton key={i} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={expenses}
        // estimatedItemSize={200}
        renderItem={({ item }) => (
          <ExpenseItem
            expense={item}
            groupId={groupId}
            onDeleteExpense={deleteExpense}
            onMarkPaid={markPaid}
            onConfirmPayment={confirmPayment}
            isMember={isMember}
          />
        )}
        keyExtractor={(item) => item._id as unknown as string}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    marginTop: 8,
  },
  headerTitle: {
    ...textStyles.textHeading20,
    fontSize: 22,
  },
  headerSubtitle: {
    ...textStyles.textBody12,
    color: '#6b7280',
    marginTop: 2,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF1F8C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#FF1F8C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 31, 140, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    ...textStyles.textHeading18,
    marginBottom: 8,
  },
  emptyStateBody: {
    ...textStyles.textBody14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
