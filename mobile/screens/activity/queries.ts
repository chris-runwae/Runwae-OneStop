// =====================================================
// ACTIVITY & COLLABORATION QUERIES
// All queries use useSupabase hook for authenticated access
// =====================================================

import { useEffect, useState, useCallback } from 'react';
import { useSupabase } from '@/lib/SupabaseProvider';
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
// EXPENSES HOOKS
// =====================================================

/**
 * Hook to fetch and subscribe to trip expenses
 */
export function useTripExpenses(tripId: string) {
  const { supabase, isReady } = useSupabase();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadExpenses = useCallback(async () => {
    if (!supabase || !isReady) return;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('expenses')
        .select(`
          *,
          participants:expense_participants(
            id,
            user_id,
            share_amount
          )
        `)
        .eq('trip_id', tripId)
        .order('expense_date', { ascending: false });

      if (fetchError) throw fetchError;
      
      setExpenses(data || []);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [supabase, isReady, tripId]);

  useEffect(() => {
    if (!supabase || !isReady) return;
    
    let cancelled = false;

    async function initialLoad() {
      try {
        const { data, error: fetchError } = await supabase
          .from('expenses')
          .select(`
            *,
            participants:expense_participants(
              id,
              user_id,
              share_amount
            )
          `)
          .eq('trip_id', tripId)
          .order('expense_date', { ascending: false });

        if (fetchError) throw fetchError;
        
        if (!cancelled) {
          setExpenses(data || []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setLoading(false);
        }
      }
    }

    initialLoad();

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
          if (!cancelled) loadExpenses();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase, isReady, tripId, loadExpenses]);

  return { expenses, loading, error, refetch: loadExpenses };
}

/**
 * Hook to create expense
 */
export function useCreateExpense() {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);

  const createExpense = useCallback(async (input: CreateExpenseInput) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    setLoading(true);
    try {
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
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return { createExpense, loading };
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
        const othersOwed = expense.amount - userParticipant.share_amount;
        youAreOwed += othersOwed;
      } else {
        youOwe += userParticipant.share_amount;
      }
    }
  });

  return {
    totalSpent: Number(totalSpent.toFixed(2)),
    youOwe: Number(youOwe.toFixed(2)),
    youAreOwed: Number(youAreOwed.toFixed(2)),
    balances: new Map(),
  };
}

// =====================================================
// POLLS HOOKS
// =====================================================

/**
 * Hook to fetch and subscribe to trip polls
 */
export function useTripPolls(tripId: string) {
  const { supabase, isReady } = useSupabase();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPolls = useCallback(async () => {
    if (!supabase || !isReady) return;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('polls')
        .select(`
          *,
          options:poll_options(*),
          votes:poll_votes(
            id,
            option_id,
            user_id,
            created_at
          )
        `)
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setPolls(data || []);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [supabase, isReady, tripId]);

  useEffect(() => {
    if (!supabase || !isReady) return;
    
    let cancelled = false;

    async function initialLoad() {
      try {
        const { data, error: fetchError } = await supabase
          .from('polls')
          .select(`
            *,
            options:poll_options(*),
            votes:poll_votes(
              id,
              option_id,
              user_id,
              created_at
            )
          `)
          .eq('trip_id', tripId)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        
        if (!cancelled) {
          setPolls(data || []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setLoading(false);
        }
      }
    }

    initialLoad();

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
          if (!cancelled) loadPolls();
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
          if (!cancelled) loadPolls();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase, isReady, tripId, loadPolls]);

  return { polls, loading, error, refetch: loadPolls };
}

/**
 * Hook to create poll
 */
export function useCreatePoll() {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);

  const createPoll = useCallback(async (input: CreatePollInput) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    setLoading(true);
    try {
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
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return { createPoll, loading };
}

/**
 * Hook to vote on poll
 */
export function useVotePoll() {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);

  const votePoll = useCallback(async (
    pollId: string,
    optionId: string,
    userId: string
  ) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    setLoading(true);
    try {
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
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return { votePoll, loading };
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
        full_name: undefined,
        avatar_url: undefined,
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

// =====================================================
// CHECKLISTS HOOKS
// =====================================================

/**
 * Hook to fetch and subscribe to trip checklists
 */
export function useTripChecklists(tripId: string) {
  const { supabase, isReady } = useSupabase();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadChecklists = useCallback(async () => {
    if (!supabase || !isReady) return;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('checklists')
        .select(`
          *,
          items:checklist_items(*)
        `)
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      // Sort items by position
      const sortedData = (data || []).map(checklist => ({
        ...checklist,
        items: checklist.items?.sort((a, b) => a.position - b.position) || [],
      }));
      
      setChecklists(sortedData);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [supabase, isReady, tripId]);

  useEffect(() => {
    if (!supabase || !isReady) return;
    
    let cancelled = false;

    async function initialLoad() {
      try {
        const { data, error: fetchError } = await supabase
          .from('checklists')
          .select(`
            *,
            items:checklist_items(*)
          `)
          .eq('trip_id', tripId)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        
        if (!cancelled) {
          const sortedData = (data || []).map(checklist => ({
            ...checklist,
            items: checklist.items?.sort((a, b) => a.position - b.position) || [],
          }));
          setChecklists(sortedData);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setLoading(false);
        }
      }
    }

    initialLoad();

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
          if (!cancelled) loadChecklists();
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
          if (!cancelled) loadChecklists();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase, isReady, tripId, loadChecklists]);

  return { checklists, loading, error, refetch: loadChecklists };
}

/**
 * Hook to create checklist with items
 */
export function useCreateChecklist() {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);

  const createChecklist = useCallback(async (
    input: CreateChecklistInput,
    items: string[]
  ) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    setLoading(true);
    try {
      // Create checklist
      const { data: checklist, error: checklistError } = await supabase
        .from('checklists')
        .insert(input)
        .select()
        .single();

      if (checklistError) throw checklistError;

      // Create items
      const checklistItems = items.map((text, index) => ({
        checklist_id: checklist.id,
        text,
        position: index,
      }));

      const { error: itemsError } = await supabase
        .from('checklist_items')
        .insert(checklistItems);

      if (itemsError) throw itemsError;

      return checklist;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return { createChecklist, loading };
}

/**
 * Hook to toggle checklist item
 */
export function useToggleChecklistItem() {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);

  const toggleItem = useCallback(async (
    itemId: string,
    isCompleted: boolean,
    userId: string
  ) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    setLoading(true);
    try {
      const updateData = isCompleted
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

      const { error } = await supabase
        .from('checklist_items')
        .update(updateData)
        .eq('id', itemId);

      if (error) throw error;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return { toggleItem, loading };
}

// =====================================================
// ANNOUNCEMENTS HOOKS
// =====================================================

/**
 * Hook to fetch and subscribe to trip announcements
 */
export function useTripAnnouncements(tripId: string, userId: string) {
  const { supabase, isReady } = useSupabase();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAnnouncements = useCallback(async () => {
    if (!supabase || !isReady) return;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('announcements')
        .select(`
          *,
          reads:announcement_reads!announcement_reads_announcement_id_fkey(read_at)
        `)
        .eq('trip_id', tripId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      // Map read status
      const mappedData = (data || []).map(announcement => ({
        ...announcement,
        is_read: announcement.reads?.some((r: any) => r.user_id === userId) || false,
        read_at: announcement.reads?.find((r: any) => r.user_id === userId)?.read_at || null,
      }));
      
      setAnnouncements(mappedData);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [supabase, isReady, tripId, userId]);

  useEffect(() => {
    if (!supabase || !isReady) return;
    
    let cancelled = false;

    async function initialLoad() {
      try {
        const { data, error: fetchError } = await supabase
          .from('announcements')
          .select(`
            *,
            reads:announcement_reads!announcement_reads_announcement_id_fkey(read_at)
          `)
          .eq('trip_id', tripId)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        
        if (!cancelled) {
          const mappedData = (data || []).map(announcement => ({
            ...announcement,
            is_read: announcement.reads?.some((r: any) => r.user_id === userId) || false,
            read_at: announcement.reads?.find((r: any) => r.user_id === userId)?.read_at || null,
          }));
          setAnnouncements(mappedData);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setLoading(false);
        }
      }
    }

    initialLoad();

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
          if (!cancelled) loadAnnouncements();
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
          if (!cancelled) loadAnnouncements();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase, isReady, tripId, userId, loadAnnouncements]);

  return { announcements, loading, error, refetch: loadAnnouncements };
}

/**
 * Hook to create announcement
 */
export function useCreateAnnouncement() {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);

  const createAnnouncement = useCallback(async (input: CreateAnnouncementInput) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return { createAnnouncement, loading };
}

/**
 * Hook to mark announcement as read
 */
export function useMarkAnnouncementRead() {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);

  const markAsRead = useCallback(async (
    announcementId: string,
    userId: string
  ) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('announcement_reads')
        .upsert(
          {
            announcement_id: announcementId,
            user_id: userId,
          },
          {
            onConflict: 'announcement_id,user_id',
          }
        );

      if (error) throw error;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return { markAsRead, loading };
}