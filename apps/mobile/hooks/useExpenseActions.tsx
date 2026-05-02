import { useMutation, useQuery } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';
import type { Id } from '@runwae/convex/convex/_generated/dataModel';
import { convex } from '@/lib/convex';

export const DEFAULT_CATEGORIES = [
  'accommodation',
  'transport',
  'food',
  'activity',
  'shopping',
  'other',
] as const;

export type SplitType = 'equal' | 'custom';

export type ExpenseParticipant = {
  _id: Id<'expense_splits'>;
  expenseId: Id<'expenses'>;
  userId: Id<'users'>;
  amountOwed: number;
  isSettled: boolean;
  settledAt?: number;
  user: {
    _id: Id<'users'>;
    name?: string;
    avatarUrl?: string;
    image?: string;
  } | null;
};

export type Expense = {
  _id: Id<'expenses'>;
  tripId: Id<'trips'>;
  paidByUserId: Id<'users'>;
  amount: number;
  currency: string;
  category: typeof DEFAULT_CATEGORIES[number];
  date: string;
  description?: string;
  splitType: SplitType;
  receiptImageUrl?: string;
  createdAt: number;
  updatedAt: number;
  paidBy: {
    _id: Id<'users'>;
    name?: string;
    avatarUrl?: string;
    image?: string;
  } | null;
  splits: ExpenseParticipant[];
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

const useExpenseActions = () => {
  const createMut = useMutation(api.expenses.create);
  const updateMut = useMutation(api.expenses.update);
  const removeMut = useMutation(api.expenses.remove);
  const settleSplitMut = useMutation(api.expenses.settleSplit);

  const useExpensesByTrip = (
    tripId: Id<'trips'> | string | undefined,
  ): Expense[] | undefined =>
    useQuery(
      api.expenses.getByTrip,
      tripId ? { tripId: tripId as Id<'trips'> } : 'skip',
    ) as unknown as Expense[] | undefined;

  // Phase 5 wires create + delete + settle. The legacy mobile flow
  // also exposed `markPaid` (a soft "I paid" marker independent of the
  // settled flag); the new schema collapses to a single isSettled
  // boolean, so markPaid simply settles for now.
  const createExpense = async (
    input: CreateExpenseInput,
    participants: { userId: string; amountOwed: number }[],
  ): Promise<Expense> => {
    const splitType = input.split_type;
    const id = await createMut({
      tripId: input.group_id as unknown as Id<'trips'>,
      amount: input.amount,
      currency: input.currency,
      category: input.category as Expense['category'],
      date: input.date,
      description: input.description,
      splitType,
      ...(splitType === 'custom'
        ? {
            customSplits: participants.map((p) => ({
              userId: p.userId as unknown as Id<'users'>,
              amountOwed: p.amountOwed,
            })),
          }
        : {
            participantIds: participants.map(
              (p) => p.userId as unknown as Id<'users'>,
            ),
          }),
    });
    return { _id: id } as unknown as Expense;
  };

  const deleteExpense = async (expenseId: string) => {
    await removeMut({ expenseId: expenseId as unknown as Id<'expenses'> });
  };

  const markPaid = async (participantId: string) => {
    await settleSplitMut({
      splitId: participantId as unknown as Id<'expense_splits'>,
      isSettled: true,
    });
  };

  const confirmPayment = async (participantId: string) => {
    await settleSplitMut({
      splitId: participantId as unknown as Id<'expense_splits'>,
      isSettled: true,
    });
  };

  const updateExpense = async (
    expenseId: string,
    input: Partial<CreateExpenseInput>,
    participants: { userId: string; amountOwed: number }[],
  ) => {
    const splitType = input.split_type;
    await updateMut({
      expenseId: expenseId as Id<'expenses'>,
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.currency !== undefined ? { currency: input.currency } : {}),
      ...(input.category !== undefined
        ? { category: input.category as Expense['category'] }
        : {}),
      ...(input.date !== undefined ? { date: input.date } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(splitType !== undefined ? { splitType } : {}),
      ...(splitType === 'custom'
        ? {
            customSplits: participants.map((p) => ({
              userId: p.userId as unknown as Id<'users'>,
              amountOwed: p.amountOwed,
            })),
          }
        : participants.length > 0
          ? {
              participantIds: participants.map(
                (p) => p.userId as unknown as Id<'users'>,
              ),
            }
          : {}),
    });
  };
  const fetchExpenseById = async (expenseId: string): Promise<Expense> => {
    const row = await convex.query(api.expenses.getById, {
      expenseId: expenseId as Id<'expenses'>,
    });
    if (!row) throw new Error('Expense not found');
    return row as unknown as Expense;
  };
  const fetchExpenses = async (_tripId: string): Promise<Expense[]> => [];
  const fetchGroupMembers = async (
    _tripId: string,
  ): Promise<ExpenseMember[]> => [];

  return {
    expenses: [] as Expense[],
    isLoading: false,
    fetchExpenses,
    fetchExpenseById,
    fetchGroupMembers,
    createExpense,
    updateExpense,
    deleteExpense,
    markPaid,
    confirmPayment,
    useExpensesByTrip,
  };
};

export default useExpenseActions;
