import { format, formatDistanceToNow } from 'date-fns';
import { router } from 'expo-router';
import {
  BedDouble,
  Check,
  CheckCheck,
  MoreVertical,
  Plane,
  Tag,
  Utensils,
  Wine,
  Zap,
} from 'lucide-react-native';
import React from 'react';
import {
  ActionSheetIOS,
  Alert,
  Animated,
  Platform,
  Pressable,
  View,
  useColorScheme,
} from 'react-native';

import ProfileAvatar from '@/components/ui/ProfileAvatar';
import Text from '@/components/ui/Text';
import Spacer from '@/components/utils/Spacer';
import { Colors, textStyles } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { Expense, ExpenseParticipant } from '@/hooks/useExpenseActions';

type ExpenseItemProps = {
  expense: Expense;
  groupId: string;
  onDeleteExpense: (expenseId: string) => Promise<void>;
  onMarkPaid: (participantId: string) => Promise<void>;
  onConfirmPayment: (participantId: string) => Promise<void>;
  isMember: boolean;
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  flight: <Plane size={12} color="#fff" />,
  food: <Utensils size={12} color="#fff" />,
  drinks: <Wine size={12} color="#fff" />,
  stays: <BedDouble size={12} color="#fff" />,
  activity: <Zap size={12} color="#fff" />,
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function SettlementPill({
  settledCount,
  total,
}: {
  settledCount: number;
  total: number;
}) {
  const percentage = total > 0 ? (settledCount / total) * 100 : 0;
  const isFullySettled = settledCount === total && total > 0;
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: percentage,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  }, [percentage]);

  const fillColor = isFullySettled ? '#22c55e' : '#FF1F8C';

  return (
    <View
      style={{
        height: 36,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: isFullySettled ? '#22c55e' : '#e5e7eb',
        overflow: 'hidden',
        position: 'relative',
      }}>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          backgroundColor: fillColor,
          opacity: 0.15,
          borderRadius: 18,
          width: animatedWidth.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
            extrapolate: 'clamp',
          }),
        }}
      />
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 14,
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}>
        <Text style={{ fontSize: 13, fontWeight: '500', color: fillColor }}>
          {isFullySettled ? 'Fully settled' : 'Settlement progress'}
        </Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: fillColor }}>
          {settledCount}/{total}
        </Text>
      </View>
    </View>
  );
}

function ParticipantRow({
  participant,
  isCurrentUser,
  isOwner,
  currency,
  onMarkPaid,
  onConfirmPayment,
  isMember,
}: {
  participant: ExpenseParticipant;
  isCurrentUser: boolean;
  isOwner: boolean;
  currency: string;
  onMarkPaid: () => void;
  onConfirmPayment: () => void;
  isMember: boolean;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const name = participant.user?.name ?? 'Unknown';
  const avatarUrl =
    participant.user?.avatarUrl ?? participant.user?.image ?? '';

  // The new schema collapses paid/settled into a single isSettled
  // boolean. The old "Pay" → "Confirm" handshake (markPaid first, then
  // owner confirms) is replaced with "Mark settled" — fitting the
  // peer-to-peer model where users paid out-of-band.
  const renderAction = () => {
    if (!isMember) return null;
    if (participant.isSettled) {
      return <CheckCheck size={18} color="#22c55e" />;
    }
    if (isCurrentUser || isOwner) {
      return (
        <Pressable
          onPress={onMarkPaid}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#FF1F8C',
          }}>
          <Text style={{ fontSize: 12, color: '#FF1F8C', fontWeight: '600' }}>
            Mark settled
          </Text>
        </Pressable>
      );
    }
    return null;
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 10,
      }}>
      <ProfileAvatar name={name} imageUrl={avatarUrl} />
      <Text
        style={{
          flex: 1,
          ...textStyles.textBody12,
          color: colors.textColors.default,
        }}>
        {name}
      </Text>
      <Text
        style={{
          ...textStyles.textBody12,
          color: colors.textColors.subtle,
          marginRight: 8,
        }}>
        {formatCurrency(participant.amountOwed, currency)}
      </Text>
      {renderAction()}
    </View>
  );
}

const ExpenseItem = ({
  expense,
  groupId,
  onDeleteExpense,
  onMarkPaid,
  onConfirmPayment,
  isMember,
}: ExpenseItemProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const isCreator =
    (expense.paidByUserId as unknown as string) === userId;
  const expenseId = expense._id as unknown as string;

  const createdAt = formatDistanceToNow(new Date(expense.createdAt));
  const formattedDate = format(new Date(expense.date), 'MMM d');

  const settledCount = expense.splits.filter((p) => p.isSettled).length;
  const totalParticipants = expense.splits.length;

  const handleDelete = () => {
    Alert.alert('Delete expense', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDeleteExpense(expenseId),
      },
    ]);
  };

  const handleEdit = () => {
    router.push(
      `/(tabs)/(trips)/${groupId}/add-expense?expenseId=${expenseId}`,
    );
  };

  const handleEllipsisPress = () => {
    if (!isMember) return;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit expense', 'Delete expense'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (i) => {
          if (i === 1) handleEdit();
          if (i === 2) handleDelete();
        }
      );
    } else {
      Alert.alert('Expense options', undefined, [
        { text: 'Edit expense', onPress: handleEdit },
        {
          text: 'Delete expense',
          style: 'destructive',
          onPress: handleDelete,
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const categoryIcon = CATEGORY_ICONS[expense.category] ?? (
    <Tag size={12} color="#fff" />
  );

  return (
    <View
      style={{
        backgroundColor: colors.backgroundColors.subtle,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.borderColors.subtle,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
      }}>
      {/* Top row: category + amount */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: 'rgba(255, 31, 140, 0.1)',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 12,
          }}>
          <View style={{ backgroundColor: '#FF1F8C', borderRadius: 6, padding: 3 }}>
            {categoryIcon}
          </View>
          <Text style={{ fontSize: 12, color: '#FF1F8C', fontWeight: '700', textTransform: 'capitalize' }}>
            {expense.category}
          </Text>
        </View>

        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textColors.default }}>
          {formatCurrency(expense.amount, expense.currency)}
        </Text>
      </View>

      {/* Title + Ellipsis */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ ...textStyles.textHeading18, color: colors.textColors.default }}>{expense.description ?? 'Expense'}</Text>
          {expense.description ? (
            <Text
              style={{
                ...textStyles.textBody14,
                color: colors.textColors.subtle,
                marginTop: 4,
              }}
              numberOfLines={2}>
              {expense.description}
            </Text>
          ) : null}
        </View>

        {isMember && isCreator && (
          <Pressable
            onPress={handleEllipsisPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              width: 32,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderRadius: 16,
              marginLeft: 8,
            }}>
            <MoreVertical size={18} color={colors.textColors.subtle} />
          </Pressable>
        )}
      </View>

      <Spacer size={16} vertical />

      {/* Settlement Pill */}
      {totalParticipants > 0 && (
        <View style={{ marginBottom: 16 }}>
          <SettlementPill
            settledCount={settledCount}
            total={totalParticipants}
          />
          <View style={{ marginTop: 12, gap: 4 }}>
            {expense.splits.map((participant) => {
              const splitId = participant._id as unknown as string;
              return (
                <ParticipantRow
                  key={splitId}
                  participant={participant}
                  isCurrentUser={
                    (participant.userId as unknown as string) === userId
                  }
                  isOwner={isCreator}
                  currency={expense.currency}
                  onMarkPaid={() => onMarkPaid(splitId)}
                  onConfirmPayment={() => onConfirmPayment(splitId)}
                  isMember={isMember}
                />
              );
            })}
          </View>
        </View>
      )}

      {/* Footer: Creator + Date */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopWidth: 1,
          borderTopColor: colors.borderColors.subtle,
          paddingTop: 16,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ProfileAvatar
            name={expense.paidBy?.name ?? 'User'}
            imageUrl={expense.paidBy?.avatarUrl ?? expense.paidBy?.image}
            size={24}
          />
          <Text
            style={{ ...textStyles.textBody12, color: colors.textColors.subtle, fontWeight: '600' }}>
            {expense.paidBy?.name ?? 'User'}
          </Text>
        </View>
        <Text
          style={{
            ...textStyles.textBody12,
            color: colors.textColors.subtle,
          }}>
          {formattedDate} · {createdAt} ago
        </Text>
      </View>
    </View>
  );
};

export default ExpenseItem;
