import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';

export const DEFAULT_CATEGORIES = [
  'flight',
  'food',
  'drinks',
  'stays',
  'activity',
  'other',
] as const;

export type SplitType = 'equal' | 'custom';

export type ExpenseParticipant = {
  id: string;
  expense_id: string;
  user_id: string;
  amount_owed: number;
  paid_at: string | null;
  is_settled: boolean;
  settled_at: string | null;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string;
  } | null;
};

export type Expense = {
  id: string;
  group_id: string;
  created_by: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  description: string | null;
  split_type: SplitType;
  created_at: string;
  updated_at: string;
  creator: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  expense_participants: ExpenseParticipant[];
};

export type ExpenseMember = {
  user_id: string;
  role: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string;
  } | null;
};

export type CreateExpenseInput = {
  group_id: string;
  created_by: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  description?: string;
  split_type: SplitType;
};

const EXPENSE_SELECT =
  '*, creator:profiles!created_by(id, full_name, avatar_url), expense_participants(*, profiles!user_id(id, full_name, avatar_url))';

const useExpenseActions = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExpenses = async (groupId: string): Promise<Expense[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(EXPENSE_SELECT)
        .eq('group_id', groupId)
        .order('date', { ascending: false });
      if (error) throw error;
      setExpenses(data as Expense[]);
      return data as Expense[];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExpenseById = async (expenseId: string): Promise<Expense> => {
    const { data, error } = await supabase
      .from('expenses')
      .select(EXPENSE_SELECT)
      .eq('id', expenseId)
      .single();
    if (error) throw error;
    return data as Expense;
  };

  const fetchGroupMembers = async (
    groupId: string
  ): Promise<ExpenseMember[]> => {
    const { data, error } = await supabase
      .from('group_members')
      .select('user_id, role, profiles!user_id(id, full_name, avatar_url)')
      .eq('group_id', groupId);
    if (error) throw error;
    return (data as any[]).map((m) => ({
      ...m,
      profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
    })) as ExpenseMember[];
  };

  const createExpense = async (
    input: CreateExpenseInput,
    participants: { userId: string; amountOwed: number }[]
  ): Promise<Expense> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert(input)
        .select('id')
        .single();
      if (error) throw error;

      const expenseId = data.id;

      if (participants.length > 0) {
        const { error: partErr } = await supabase
          .from('expense_participants')
          .insert(
            participants.map((p) => ({
              expense_id: expenseId,
              user_id: p.userId,
              amount_owed: p.amountOwed,
            }))
          );
        if (partErr) throw partErr;
      }

      const { data: full, error: fetchErr } = await supabase
        .from('expenses')
        .select(EXPENSE_SELECT)
        .eq('id', expenseId)
        .single();
      if (fetchErr) throw fetchErr;

      const expense = full as Expense;
      setExpenses((prev) => [expense, ...prev]);
      return expense;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExpense = async (
    expenseId: string,
    input: Partial<CreateExpenseInput>,
    participants: { userId: string; amountOwed: number }[]
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('expenses')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', expenseId);
      if (error) throw error;

      const { data: existing, error: existErr } = await supabase
        .from('expense_participants')
        .select('id, user_id')
        .eq('expense_id', expenseId);
      if (existErr) throw existErr;

      const newUserIds = new Set(participants.map((p) => p.userId));
      const existingMap = new Map(
        (existing ?? []).map((e) => [e.user_id, e.id])
      );

      const toDelete = (existing ?? [])
        .filter((e) => !newUserIds.has(e.user_id))
        .map((e) => e.id);
      if (toDelete.length > 0) {
        await supabase
          .from('expense_participants')
          .delete()
          .in('id', toDelete);
      }

      await Promise.all(
        participants.map((p) => {
          const existingId = existingMap.get(p.userId);
          if (existingId) {
            return supabase
              .from('expense_participants')
              .update({ amount_owed: p.amountOwed })
              .eq('id', existingId);
          }
          return supabase.from('expense_participants').insert({
            expense_id: expenseId,
            user_id: p.userId,
            amount_owed: p.amountOwed,
          });
        })
      );

      setExpenses((prev) =>
        prev.map((e) =>
          e.id === expenseId
            ? {
                ...e,
                ...input,
                expense_participants: participants.map((p) => {
                  const existing = e.expense_participants.find(
                    (ep) => ep.user_id === p.userId
                  );
                  return existing
                    ? { ...existing, amount_owed: p.amountOwed }
                    : ({
                        id: '',
                        expense_id: expenseId,
                        user_id: p.userId,
                        amount_owed: p.amountOwed,
                        paid_at: null,
                        is_settled: false,
                        settled_at: null,
                        profiles: null,
                      } as ExpenseParticipant);
                }),
              }
            : e
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExpense = async (expenseId: string): Promise<void> => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);
    if (error) throw error;
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  };

  const markPaid = async (participantId: string): Promise<void> => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('expense_participants')
      .update({ paid_at: now })
      .eq('id', participantId);
    if (error) throw error;
    setExpenses((prev) =>
      prev.map((e) => ({
        ...e,
        expense_participants: e.expense_participants.map((p) =>
          p.id === participantId ? { ...p, paid_at: now } : p
        ),
      }))
    );
  };

  const confirmPayment = async (participantId: string): Promise<void> => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('expense_participants')
      .update({ is_settled: true, settled_at: now })
      .eq('id', participantId);
    if (error) throw error;
    setExpenses((prev) =>
      prev.map((e) => ({
        ...e,
        expense_participants: e.expense_participants.map((p) =>
          p.id === participantId
            ? { ...p, is_settled: true, settled_at: now }
            : p
        ),
      }))
    );
  };

  return {
    expenses,
    isLoading,
    fetchExpenses,
    fetchExpenseById,
    fetchGroupMembers,
    createExpense,
    updateExpense,
    deleteExpense,
    markPaid,
    confirmPayment,
  };
};

export default useExpenseActions;
