import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TextInput,
  ScrollView,
  ActionSheetIOS,
  Alert,
  Platform,
  useColorScheme,
  Switch,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Plane,
  Utensils,
  Wine,
  BedDouble,
  Zap,
  Tag,
  Plus,
  Minus,
  Check,
  Users,
  CalendarDays,
} from 'lucide-react-native';

import { Text, Spacer, ProfileAvatar } from '@/components';
import { Colors, textStyles } from '@/constants';
import useExpenseActions, {
  DEFAULT_CATEGORIES,
  SplitType,
  ExpenseMember,
} from '@/hooks/useExpenseActions';
import { useAuth } from '@/context/AuthContext';

const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD',
  'CHF', 'CNY', 'INR', 'MXN', 'BRL', 'SGD',
  'HKD', 'NOK', 'SEK', 'DKK', 'KRW', 'TRY',
  'ZAR', 'AED', 'NZD',
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  flight: <Plane size={14} />,
  food: <Utensils size={14} />,
  drinks: <Wine size={14} />,
  stays: <BedDouble size={14} />,
  activity: <Zap size={14} />,
  other: <Tag size={14} />,
};

export default function AddExpenseScreen() {
  const { tripId, expenseId } = useLocalSearchParams<{
    tripId: string;
    expenseId?: string;
  }>();
  const isEditMode = !!expenseId;
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const { user } = useAuth();
  const {
    createExpense,
    updateExpense,
    fetchExpenseById,
    fetchGroupMembers,
    isLoading,
  } = useExpenseActions();

  // ── Form state ─────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState<string>('other');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [description, setDescription] = useState('');

  // ── Split state ────────────────────────────────────────────────
  const [members, setMembers] = useState<ExpenseMember[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(
    new Set()
  );
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>(
    {}
  );

  // ── Load members + prefill for edit ───────────────────────────
  useEffect(() => {
    fetchGroupMembers(tripId).then((m) => setMembers(m));
  }, [tripId]);

  useEffect(() => {
    if (!expenseId) return;
    fetchExpenseById(expenseId).then((expense) => {
      setTitle(expense.title);
      setAmount(String(expense.amount));
      setCurrency(expense.currency);
      const isDefault = (DEFAULT_CATEGORIES as readonly string[]).includes(
        expense.category
      );
      if (isDefault) {
        setCategory(expense.category);
      } else {
        setCategory('custom');
        setCustomCategory(expense.category);
        setShowCustomCategory(true);
      }
      setDate(new Date(expense.date));
      setDescription(expense.description ?? '');
      setSplitType(expense.split_type);

      const ids = new Set(expense.expense_participants.map((p) => p.user_id));
      setSelectedMemberIds(ids);

      if (expense.split_type === 'custom') {
        const amounts: Record<string, string> = {};
        expense.expense_participants.forEach((p) => {
          amounts[p.user_id] = String(p.amount_owed);
        });
        setCustomAmounts(amounts);
      }
    });
  }, [expenseId]);

  // ── Helpers ────────────────────────────────────────────────────
  const toggleMember = (userId: string) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
        setCustomAmounts((ca) => {
          const { [userId]: _, ...rest } = ca;
          return rest;
        });
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const selectAll = () =>
    setSelectedMemberIds(new Set(members.map((m) => m.user_id)));
  const deselectAll = () => {
    setSelectedMemberIds(new Set());
    setCustomAmounts({});
  };

  const handleCurrencyPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', ...CURRENCIES], cancelButtonIndex: 0 },
        (i) => {
          if (i > 0) setCurrency(CURRENCIES[i - 1]);
        }
      );
    } else {
      Alert.alert(
        'Select currency',
        undefined,
        CURRENCIES.map((c) => ({ text: c, onPress: () => setCurrency(c) })).concat([
          { text: 'Cancel', style: 'cancel' } as any,
        ])
      );
    }
  };

  const handleCategoryPress = (cat: string) => {
    if (cat === 'custom') {
      setShowCustomCategory(true);
      setCategory('custom');
    } else {
      setShowCustomCategory(false);
      setCategory(cat);
      setCustomCategory('');
    }
  };

  // ── Validation ─────────────────────────────────────────────────
  const getValidationError = (): string | null => {
    if (!title.trim()) return 'Please enter a title.';
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0)
      return 'Please enter a valid amount.';
    if (selectedMemberIds.size === 0)
      return 'Select at least one member to split with.';
    if (splitType === 'custom') {
      const selectedIds = Array.from(selectedMemberIds);
      const missingAmount = selectedIds.some(
        (id) => !customAmounts[id] || parseFloat(customAmounts[id]) <= 0
      );
      if (missingAmount) return 'All participants must have an amount assigned.';
      const total = selectedIds.reduce(
        (sum, id) => sum + (parseFloat(customAmounts[id]) || 0),
        0
      );
      if (Math.abs(total - parsedAmount) > 0.01)
        return `Custom split total (${total.toFixed(2)}) must equal the expense amount (${parsedAmount.toFixed(2)}).`;
    }
    return null;
  };

  const buildParticipants = () => {
    const parsedAmount = parseFloat(amount);
    const ids = Array.from(selectedMemberIds);
    if (splitType === 'equal') {
      const perPerson = Math.floor((parsedAmount / ids.length) * 100) / 100;
      const remainder =
        Math.round((parsedAmount - perPerson * ids.length) * 100) / 100;
      return ids.map((userId, i) => ({
        userId,
        amountOwed: i === ids.length - 1 ? perPerson + remainder : perPerson,
      }));
    }
    return ids.map((userId) => ({
      userId,
      amountOwed: parseFloat(customAmounts[userId] || '0'),
    }));
  };

  const handleSubmit = async () => {
    const error = getValidationError();
    if (error) {
      Alert.alert('Cannot save', error);
      return;
    }

    const finalCategory =
      category === 'custom' ? customCategory.trim() || 'other' : category;

    const expenseData = {
      group_id: tripId,
      created_by: user?.id as string,
      title: title.trim(),
      amount: parseFloat(amount),
      currency,
      category: finalCategory,
      date: date.toISOString().split('T')[0],
      description: description.trim() || undefined,
      split_type: splitType,
    };

    try {
      if (isEditMode) {
        await updateExpense(expenseId, expenseData, buildParticipants());
      } else {
        await createExpense(expenseData, buildParticipants());
      }
      router.dismiss();
    } catch (err) {
      console.error(err);
      alert(
        `Failed to ${isEditMode ? 'update' : 'create'} expense. Please try again.`
      );
    }
  };

  // ── Custom split totals ────────────────────────────────────────
  const parsedAmount = parseFloat(amount) || 0;
  const customTotal = Array.from(selectedMemberIds).reduce(
    (sum, id) => sum + (parseFloat(customAmounts[id]) || 0),
    0
  );
  const customTotalMatch =
    splitType === 'custom' && Math.abs(customTotal - parsedAmount) <= 0.01;

  // ── Styles ─────────────────────────────────────────────────────
  const s = StyleSheet.create({
    input: {
      fontSize: 14,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.borderColors.subtle,
      backgroundColor: colors.backgroundColors.subtle,
      borderRadius: 8,
      color: colors.textColors.default,
    },
    label: {
      ...textStyles.textHeading16,
      fontSize: 14,
      color: colors.textColors.default,
      marginBottom: 6,
    },
    sectionHeading: {
      ...textStyles.textHeading16,
      color: colors.textColors.default,
      marginBottom: 10,
    },
    categoryPill: (active: boolean) => ({
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: active ? '#FF1F8C' : colors.borderColors.subtle,
      backgroundColor: active
        ? 'rgba(255,31,140,0.08)'
        : colors.backgroundColors.subtle,
    }),
    splitTab: (active: boolean) => ({
      flex: 1,
      paddingVertical: 9,
      alignItems: 'center' as const,
      borderRadius: 8,
      backgroundColor: active ? '#FF1F8C' : 'transparent',
    }),
    memberRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingVertical: 10,
      gap: 10,
    },
    submitButton: {
      backgroundColor: '#ffdde6',
      borderColor: '#ffdde6',
      borderWidth: 1,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 8,
    },
    submitText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: '#ff2e92',
    },
  });

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.backgroundColors.default,
        paddingHorizontal: 16,
      }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 24,
          paddingBottom: 8,
          borderBottomWidth: 2,
          borderBottomColor: colors.borderColors.subtle,
        }}>
        <Pressable
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => router.dismiss()}
          style={{ width: 60 }}>
          <Text style={{ fontSize: 14 }}>Close</Text>
        </Pressable>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            textAlign: 'center',
            flex: 1,
          }}>
          {isEditMode ? 'Edit Expense' : 'Add Expense'}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <Spacer size={24} vertical />

      {/* Title */}
      <Text style={s.label}>Title</Text>
      <TextInput
        style={s.input}
        placeholder="e.g. Dinner at La Piazza"
        placeholderTextColor={colors.textColors.subtle}
        value={title}
        onChangeText={setTitle}
      />

      <Spacer size={16} vertical />

      {/* Amount + Currency */}
      <Text style={s.label}>Amount</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          style={[s.input, { flex: 1 }]}
          placeholder="0.00"
          placeholderTextColor={colors.textColors.subtle}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
        <Pressable
          onPress={handleCurrencyPress}
          style={[
            s.input,
            {
              minWidth: 70,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.textColors.default,
            }}>
            {currency}
          </Text>
        </Pressable>
      </View>

      <Spacer size={16} vertical />

      {/* Category */}
      <Text style={s.label}>Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}>
        {([...DEFAULT_CATEGORIES, 'custom'] as string[]).map((cat) => {
          const isActive =
            cat === 'custom' ? showCustomCategory : category === cat && !showCustomCategory;
          return (
            <Pressable
              key={cat}
              onPress={() => handleCategoryPress(cat)}
              style={s.categoryPill(isActive)}>
              <View style={{ opacity: isActive ? 1 : 0.5 }}>
                {cat === 'custom' ? (
                  <Plus size={14} color={isActive ? '#FF1F8C' : colors.textColors.default} />
                ) : (
                  CATEGORY_ICONS[cat] ?? <Tag size={14} />
                )}
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: isActive ? '#FF1F8C' : colors.textColors.default,
                }}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {showCustomCategory && (
        <>
          <Spacer size={8} vertical />
          <TextInput
            style={s.input}
            placeholder="Custom category name"
            placeholderTextColor={colors.textColors.subtle}
            value={customCategory}
            onChangeText={setCustomCategory}
            autoFocus
          />
        </>
      )}

      <Spacer size={16} vertical />

      {/* Date */}
      <Text style={s.label}>Date</Text>
      <Pressable
        onPress={() => setShowDatePicker(true)}
        style={[
          s.input,
          { flexDirection: 'row', alignItems: 'center', gap: 8 },
        ]}>
        <CalendarDays size={16} color={colors.textColors.subtle} />
        <Text style={{ fontSize: 14, color: colors.textColors.default }}>
          {date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(_event, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios' ? false : false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Spacer size={16} vertical />

      {/* Description */}
      <Text style={s.label}>Description (optional)</Text>
      <TextInput
        style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]}
        placeholder="Add any notes..."
        placeholderTextColor={colors.textColors.subtle}
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <Spacer size={24} vertical />

      {/* Split With */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}>
        <Text style={s.sectionHeading}>Split with</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable onPress={selectAll}>
            <Text style={{ fontSize: 13, color: '#FF1F8C' }}>All</Text>
          </Pressable>
          <Pressable onPress={deselectAll}>
            <Text
              style={{ fontSize: 13, color: colors.textColors.subtle }}>
              None
            </Text>
          </Pressable>
        </View>
      </View>

      {members.map((member) => {
        const isSelected = selectedMemberIds.has(member.user_id);
        const name = member.profiles?.full_name ?? 'Unknown';
        const avatarUrl = member.profiles?.avatar_url ?? '';
        return (
          <Pressable
            key={member.user_id}
            onPress={() => toggleMember(member.user_id)}
            style={s.memberRow}>
            <ProfileAvatar name={name} imageUrl={avatarUrl} />
            <Text
              style={{
                flex: 1,
                ...textStyles.textBody12,
                color: colors.textColors.default,
              }}>
              {name}
              {member.user_id === user?.id ? ' (you)' : ''}
            </Text>
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor: isSelected ? '#FF1F8C' : colors.borderColors.subtle,
                backgroundColor: isSelected
                  ? '#FF1F8C'
                  : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {isSelected && <Check size={12} color="#fff" />}
            </View>
          </Pressable>
        );
      })}

      <Spacer size={24} vertical />

      {/* Split Type */}
      {selectedMemberIds.size > 0 && (
        <>
          <Text style={s.sectionHeading}>Split type</Text>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: colors.backgroundColors.subtle,
              borderRadius: 10,
              padding: 3,
              marginBottom: 16,
            }}>
            {(['equal', 'custom'] as SplitType[]).map((type) => (
              <Pressable
                key={type}
                onPress={() => setSplitType(type)}
                style={s.splitTab(splitType === type)}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color:
                      splitType === type
                        ? '#fff'
                        : colors.textColors.subtle,
                  }}>
                  {type.charAt(0).toUpperCase() + type.slice(1)} split
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Equal split preview */}
          {splitType === 'equal' && parsedAmount > 0 && (
            <Text
              style={{
                fontSize: 13,
                color: colors.textColors.subtle,
                marginBottom: 16,
              }}>
              Each person pays{' '}
              {(parsedAmount / selectedMemberIds.size).toFixed(2)} {currency}
            </Text>
          )}

          {/* Custom split inputs */}
          {splitType === 'custom' && (
            <>
              {Array.from(selectedMemberIds).map((userId) => {
                const member = members.find((m) => m.user_id === userId);
                const name = member?.profiles?.full_name ?? 'Unknown';
                const val = customAmounts[userId] ?? '';
                return (
                  <View
                    key={userId}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 10,
                    }}>
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 13,
                        color: colors.textColors.default,
                      }}>
                      {name}
                    </Text>
                    <Pressable
                      onPress={() => {
                        const current = parseFloat(val) || 0;
                        if (current > 0)
                          setCustomAmounts((prev) => ({
                            ...prev,
                            [userId]: String(
                              Math.round((current - 1) * 100) / 100
                            ),
                          }));
                      }}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        borderWidth: 1,
                        borderColor: colors.borderColors.subtle,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Minus size={14} color={colors.textColors.default} />
                    </Pressable>
                    <TextInput
                      style={[
                        s.input,
                        { width: 80, textAlign: 'center', paddingVertical: 8 },
                      ]}
                      keyboardType="decimal-pad"
                      value={val}
                      onChangeText={(v) =>
                        setCustomAmounts((prev) => ({
                          ...prev,
                          [userId]: v,
                        }))
                      }
                      placeholder="0.00"
                      placeholderTextColor={colors.textColors.subtle}
                    />
                    <Pressable
                      onPress={() => {
                        const current = parseFloat(val) || 0;
                        setCustomAmounts((prev) => ({
                          ...prev,
                          [userId]: String(
                            Math.round((current + 1) * 100) / 100
                          ),
                        }));
                      }}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        borderWidth: 1,
                        borderColor: colors.borderColors.subtle,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Plus size={14} color={colors.textColors.default} />
                    </Pressable>
                  </View>
                );
              })}

              {/* Running total */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                  borderTopWidth: 1,
                  borderTopColor: colors.borderColors.subtle,
                  marginTop: 4,
                  marginBottom: 4,
                }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: colors.textColors.default,
                  }}>
                  Total assigned
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: customTotalMatch
                      ? '#22c55e'
                      : customTotal > parsedAmount
                      ? '#ef4444'
                      : '#f59e0b',
                  }}>
                  {customTotal.toFixed(2)} / {parsedAmount.toFixed(2)}{' '}
                  {currency}
                </Text>
              </View>
            </>
          )}
        </>
      )}

      <Spacer size={24} vertical />

      {/* Submit */}
      <Pressable
        onPress={handleSubmit}
        disabled={isLoading}
        style={s.submitButton}>
        {isLoading ? (
          <ActivityIndicator size={24} color={colors.textColors.default} />
        ) : (
          <Text style={s.submitText}>
            {isEditMode ? 'Update Expense' : 'Add Expense'}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
