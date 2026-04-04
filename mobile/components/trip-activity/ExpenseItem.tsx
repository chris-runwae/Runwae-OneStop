import {
  ActionSheetIOS,
  Alert,
  Animated,
  Platform,
  Pressable,
  View,
  useColorScheme,
  useRef,
  useEffect,
} from 'react-native';
import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  MoreVertical,
  Plane,
  Utensils,
  Wine,
  BedDouble,
  Zap,
  Tag,
  Check,
  CheckCheck,
} from 'lucide-react-native';
import { router } from 'expo-router';

import ProfileAvatar from '@/components/ui/ProfileAvatar';
import Spacer from '@/components/utils/Spacer';
import Text from '@/components/ui/Text';
import { Colors, textStyles } from '@/constants';
import { Expense, ExpenseParticipant } from '@/hooks/useExpenseActions';
import { useAuth } from '@/hooks/useAuth';

type ExpenseItemProps = {
  expense: Expense;
  groupId: string;
  onDeleteExpense: (expenseId: string) => Promise<void>;
  onMarkPaid: (participantId: string) => Promise<void>;
  onConfirmPayment: (participantId: string) => Promise<void>;
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
}: {
  participant: ExpenseParticipant;
  isCurrentUser: boolean;
  isOwner: boolean;
  currency: string;
  onMarkPaid: () => void;
  onConfirmPayment: () => void;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const name = participant.profiles?.full_name ?? 'Unknown';
  const avatarUrl = participant.profiles?.avatar_url ?? '';

  const renderAction = () => {
    if (participant.is_settled) {
      return <CheckCheck size={18} color="#22c55e" />;
    }
    if (isOwner && !isCurrentUser && participant.paid_at) {
      return (
        <Pressable
          onPress={onConfirmPayment}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#22c55e',
          }}>
          <Text style={{ fontSize: 12, color: '#22c55e', fontWeight: '600' }}>
            Confirm
          </Text>
        </Pressable>
      );
    }
    if (isCurrentUser && participant.paid_at) {
      return <Check size={18} color="#f59e0b" />;
    }
    if (isCurrentUser && !participant.paid_at) {
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
            Pay
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
        {formatCurrency(participant.amount_owed, currency)}
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
}: ExpenseItemProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const isCreator = expense.created_by === userId;

  const createdAt = formatDistanceToNow(new Date(expense.created_at));
  const formattedDate = format(new Date(expense.date), 'MMM d');

  const settledCount = expense.expense_participants.filter(
    (p) => p.is_settled
  ).length;
  const totalParticipants = expense.expense_participants.length;

  const handleDelete = () => {
    Alert.alert(
      'Delete expense',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteExpense(expense.id),
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push(
      `/(tabs)/(trips)/${groupId}/add-expense?expenseId=${expense.id}`
    );
  };

  const handleEllipsisPress = () => {
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
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
      }}>
      {/* Top row: category + title + amount + ellipsis */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 10,
        }}>
        {/* Category pill */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: '#FF1F8C',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 20,
            alignSelf: 'flex-start',
          }}>
          {categoryIcon}
          <Text style={{ fontSize: 11, color: '#fff', fontWeight: '600' }}>
            {expense.category}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={textStyles.textHeading16}>{expense.title}</Text>
          {expense.description ? (
            <Text
              style={{
                ...textStyles.textBody12,
                color: colors.textColors.subtle,
                marginTop: 2,
              }}
              numberOfLines={2}>
              {expense.description}
            </Text>
          ) : null}
        </View>

        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#FF1F8C' }}>
            {formatCurrency(expense.amount, expense.currency)}
          </Text>
          <Text
            style={{ ...textStyles.textBody12, color: colors.textColors.subtle }}>
            {formattedDate}
          </Text>
        </View>

        {isCreator && (
          <Pressable
            onPress={handleEllipsisPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              width: 24,
              height: 24,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MoreVertical size={18} color={colors.textColors.subtle} />
          </Pressable>
        )}
      </View>

      {/* Creator row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginTop: 10,
        }}>
        <ProfileAvatar
          name={expense.creator.full_name}
          imageUrl={expense.creator.avatar_url}
        />
        <Text
          style={{ ...textStyles.textBody12, color: colors.textColors.subtle }}>
          {expense.creator.full_name} · {createdAt} ago
        </Text>
      </View>

      {totalParticipants > 0 && (
        <>
          <Spacer size={12} vertical />
          <SettlementPill
            settledCount={settledCount}
            total={totalParticipants}
          />
          <Spacer size={4} vertical />
          {expense.expense_participants.map((participant) => (
            <ParticipantRow
              key={participant.id}
              participant={participant}
              isCurrentUser={participant.user_id === userId}
              isOwner={isCreator}
              currency={expense.currency}
              onMarkPaid={() => onMarkPaid(participant.id)}
              onConfirmPayment={() => onConfirmPayment(participant.id)}
            />
          ))}
        </>
      )}
    </View>
  );
};

export default ExpenseItem;
