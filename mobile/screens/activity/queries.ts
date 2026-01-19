// =====================================================
// ACTIVITY & COLLABORATION QUERIES
// =====================================================

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  Expense,
  CreateExpenseInput,
  ExpenseSummary,
  Poll,
  CreatePollInput,
  PollResults,
  Checklist,
  ChecklistItem,
  CreateChecklistInput,
  CreateChecklistItemInput,
  UpdateChecklistItemInput,
  Announcement,
  CreateAnnouncementInput,
  AnnouncementBadge,
} from './types';

// =====================================================
// EXPENSES
// =====================================================

/**
 * Fetch all expenses for a trip with participants
 */
export async function fetchTripExpenses(tripId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      creator:created_by(id, email, full_name, avatar_url),
      participants:expense_participants(
        id,
        user_id,
        share_amount,
        user:user_id(id, email, full_name, avatar_url)
      )
    `)
    .eq('trip_id', tripId)
    .order('expense_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Create expense with equal split among participants
 */
export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const { participant_ids, ...expenseData } = input;

  // Calculate equal split
  const shareAmount = Number((input.amount / participant_ids.length).toFixed(2));

  // Insert expense
  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .insert({
      ...expenseData,
      expense_date: expenseData.expense_date || new Date().toISOString(),
    })
    .select()
    .single();

  if (expenseError) throw expenseError;

  // Insert participants
  const participants = participant_ids.map(user_id => ({
    expense_id: expense.id,
    user_id,
    share_amount: shareAmount,
  }));

  const { error: participantsError } = await supabase
    .from('expense_participants')
    .insert(participants);

  if (participantsError) throw participantsError;

  return expense;
}

/**
 * Delete expense (cascade deletes participants)
 */
export async function deleteExpense(expenseId: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId);

  if (error) throw error;
}

/**
 * Calculate expense summary for current user
 */
export function calculateExpenseSummary(
  expenses: Expense[],
  currentUserId: string
): ExpenseSummary {
  let totalSpent = 0;
  let youOwe = 0;
  let youAreOwed = 0;

  expenses.forEach(expense => {
    const isPaidByUser = expense.created_by === currentUserId;
    const userParticipant = expense.participants?.find(
      p => p.user_id === currentUserId
    );

    if (isPaidByUser) {
      totalSpent += expense.amount;
    }

    if (userParticipant) {
      if (isPaidByUser) {
        // You paid, others owe you their shares
        const othersOwed = expense.amount - userParticipant.share_amount;
        youAreOwed += othersOwed;
      } else {
        // Someone else paid, you owe your share
        youOwe += userParticipant.share_amount;
      }
    }
  });

  return {
    totalSpent: Number(totalSpent.toFixed(2)),
    youOwe: Number(youOwe.toFixed(2)),
    youAreOwed: Number(youAreOwed.toFixed(2)),
    balances: new Map(), // Can be extended for per-person balances
  };
}

/**
 * Hook to fetch and subscribe to trip expenses
 */
export function useTripExpenses(tripId: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadExpenses() {
      try {
        const data = await fetchTripExpenses(tripId);
        if (!cancelled) {
          setExpenses(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setLoading(false);
        }
      }
    }

    loadExpenses();

    // Real-time subscription
    const subscription = supabase
      .channel(`expenses:${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          loadExpenses();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [tripId]);

  return { expenses, loading, error };
}

// =====================================================
// POLLS
// =====================================================

/**
 * Fetch all polls for a trip with options and votes
 */
export async function fetchTripPolls(tripId: string): Promise<Poll[]> {
  const { data, error } = await supabase
    .from('polls')
    .select(`
      *,
      creator:created_by(id, email, full_name, avatar_url),
      options:poll_options(*),
      votes:poll_votes(
        id,
        option_id,
        user_id,
        created_at,
        user:user_id(id, email, full_name, avatar_url)
      )
    `)
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Create a new poll with options
 */
export async function createPoll(input: CreatePollInput): Promise<Poll> {
  const { options, ...pollData } = input;

  // Insert poll
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert(pollData)
    .select()
    .single();

  if (pollError) throw pollError;

  // Insert options
  const pollOptions = options.map((text, index) => ({
    poll_id: poll.id,
    option_text: text,
    position: index,
  }));

  const { error: optionsError } = await supabase
    .from('poll_options')
    .insert(pollOptions);

  if (optionsError) throw optionsError;

  return poll;
}

/**
 * Vote on a poll (upsert to handle revotes)
 */
export async function votePoll(
  pollId: string,
  optionId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('poll_votes')
    .upsert(
      {
        poll_id: pollId,
        option_id: optionId,
        user_id: userId,
      },
      {
        onConflict: 'poll_id,user_id',
      }
    );

  if (error) throw error;
}

/**
 * Calculate poll results with percentages
 */
export function calculatePollResults(poll: Poll, currentUserId: string): PollResults {
  const totalVotes = poll.votes?.length || 0;
  const userVote = poll.votes?.find(v => v.user_id === currentUserId);

  const optionResults = (poll.options || []).map(option => {
    const optionVotes = poll.votes?.filter(v => v.option_id === option.id) || [];
    const voteCount = optionVotes.length;
    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

    return {
      option_id: option.id,
      option_text: option.option_text,
      vote_count: voteCount,
      percentage: Number(percentage.toFixed(1)),
      voters: optionVotes.map(v => ({
        id: v.user_id,
        full_name: v.user?.full_name,
        avatar_url: v.user?.avatar_url,
      })),
    };
  });

  return {
    poll_id: poll.id,
    total_votes: totalVotes,
    options: optionResults,
    user_voted: !!userVote,
    user_vote_option_id: userVote?.option_id,
  };
}

/**
 * Hook to fetch and subscribe to trip polls
 */
export function useTripPolls(tripId: string) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPolls() {
      try {
        const data = await fetchTripPolls(tripId);
        if (!cancelled) {
          setPolls(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setLoading(false);
        }
      }
    }

    loadPolls();

    // Real-time subscription
    const subscription = supabase
      .channel(`polls:${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'polls',
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          loadPolls();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poll_votes',
        },
        () => {
          loadPolls();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [tripId]);

  return { polls, loading, error };
}

// =====================================================
// CHECKLISTS
// =====================================================

/**
 * Fetch all checklists for a trip with items
 */
export async function fetchTripChecklists(tripId: string): Promise<Checklist[]> {
  const { data, error } = await supabase
    .from('checklists')
    .select(`
      *,
      creator:created_by(id, email, full_name, avatar_url),
      items:checklist_items(
        *,
        completer:completed_by(id, email, full_name, avatar_url)
      )
    `)
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Sort items by position
  return (data || []).map(checklist => ({
    ...checklist,
    items: checklist.items?.sort((a: ChecklistItem, b: ChecklistItem) => a.position - b.position) || [],
  }));
}

/**
 * Create a new checklist
 */
export async function createChecklist(input: CreateChecklistInput): Promise<Checklist> {
  const { data, error } = await supabase
    .from('checklists')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Add item to checklist
 */
export async function createChecklistItem(
  input: CreateChecklistItemInput
): Promise<ChecklistItem> {
  const { data, error } = await supabase
    .from('checklist_items')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Toggle checklist item completion
 */
export async function updateChecklistItem(
  input: UpdateChecklistItemInput,
  userId: string
): Promise<ChecklistItem> {
  const updateData = input.is_completed
    ? {
        is_completed: true,
        completed_by: userId,
        completed_at: new Date().toISOString(),
      }
    : {
        is_completed: false,
        completed_by: null,
        completed_at: null,
      };

  const { data, error } = await supabase
    .from('checklist_items')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete checklist item
 */
export async function deleteChecklistItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('checklist_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

/**
 * Hook to fetch and subscribe to trip checklists
 */
export function useTripChecklists(tripId: string) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadChecklists() {
      try {
        const data = await fetchTripChecklists(tripId);
        if (!cancelled) {
          setChecklists(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setLoading(false);
        }
      }
    }

    loadChecklists();

    // Real-time subscription
    const subscription = supabase
      .channel(`checklists:${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'checklists',
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          loadChecklists();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'checklist_items',
        },
        () => {
          loadChecklists();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [tripId]);

  return { checklists, loading, error };
}

// =====================================================
// ANNOUNCEMENTS
// =====================================================

/**
 * Fetch all announcements for a trip with read status
 */
export async function fetchTripAnnouncements(
  tripId: string,
  userId: string
): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select(`
      *,
      creator:created_by(id, email, full_name, avatar_url),
      reads:announcement_reads!announcement_reads_announcement_id_fkey(
        read_at
      )
    `)
    .eq('trip_id', tripId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Map read status for current user
  return (data || []).map(announcement => {
    const userRead = announcement.reads?.find((r: any) => r.user_id === userId);
    return {
      ...announcement,
      is_read: !!userRead,
      read_at: userRead?.read_at || null,
    };
  });
}

/**
 * Create announcement (admin only)
 */
export async function createAnnouncement(
  input: CreateAnnouncementInput
): Promise<Announcement> {
  const { data, error } = await supabase
    .from('announcements')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark announcement as read
 */
export async function markAnnouncementRead(
  announcementId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase.from('announcement_reads').upsert(
    {
      announcement_id: announcementId,
      user_id: userId,
    },
    {
      onConflict: 'announcement_id,user_id',
    }
  );

  if (error) throw error;
}

/**
 * Get unread announcement count
 */
export async function getUnreadAnnouncementCount(
  tripId: string,
  userId: string
): Promise<AnnouncementBadge> {
  const announcements = await fetchTripAnnouncements(tripId, userId);
  const unreadCount = announcements.filter(a => !a.is_read).length;
  const hasPinned = announcements.some(a => a.is_pinned);

  return {
    unread_count: unreadCount,
    has_pinned: hasPinned,
  };
}

/**
 * Hook to fetch and subscribe to trip announcements
 */
export function useTripAnnouncements(tripId: string, userId: string) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAnnouncements() {
      try {
        const data = await fetchTripAnnouncements(tripId, userId);
        if (!cancelled) {
          setAnnouncements(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setLoading(false);
        }
      }
    }

    loadAnnouncements();

    // Real-time subscription
    const subscription = supabase
      .channel(`announcements:${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements',
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          loadAnnouncements();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcement_reads',
        },
        () => {
          loadAnnouncements();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [tripId, userId]);

  return { announcements, loading, error };
}