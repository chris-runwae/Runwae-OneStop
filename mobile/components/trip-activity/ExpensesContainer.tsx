import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Plus, Receipt } from 'lucide-react-native';
import React, { useCallback, useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Text from '@/components/ui/Text';
import Spacer from '@/components/utils/Spacer';
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
  const { expenses, fetchExpenses, deleteExpense, markPaid, confirmPayment } =
    useExpenseActions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    callFetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const callFetchExpenses = useCallback(async () => {
    await fetchExpenses(groupId);
  }, [groupId, fetchExpenses]);

  const renderHeader = () => {
    const count = expenses?.length ?? 0;
    const countText = count === 1 ? '1 expense' : `${count} expenses`;

    return (
      <>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{countText}</Text>
          {isMember && (
            <Pressable
              style={styles.headerButton}
              onPress={() =>
                router.push(`/(tabs)/(trips)/${groupId}/add-expense`)
              }>
              <Plus size={16} color={colors.primaryColors.default} />
              <Text style={{ color: colors.primaryColors.default }}>
                Add expense
              </Text>
            </Pressable>
          )}
        </View>
        <Spacer size={16} vertical />
      </>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Receipt size={40} color={colors.primaryColors.default} />
      <Text style={styles.emptyStateTitle}>No expenses yet</Text>
      <Text style={styles.emptyStateBody}>
        Track shared costs by adding your first expense
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
      <FlashList
        data={expenses}
        renderItem={({ item }) => (
          <ExpenseItem
            key={item.id}
            expense={item}
            groupId={groupId}
            onDeleteExpense={deleteExpense}
            onMarkPaid={markPaid}
            onConfirmPayment={confirmPayment}
            isMember={isMember}
          />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
      />
      <Spacer size={16} vertical />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    ...textStyles.textHeading16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingTop: 40,
  },
  emptyStateTitle: {
    ...textStyles.textHeading16,
  },
  emptyStateBody: {
    ...textStyles.textBody12,
    textAlign: 'center',
  },
});
