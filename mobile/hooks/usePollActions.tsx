import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';
// import * as Burnt from 'burnt';

export type PollType = 'single_choice' | 'multiple_choice' | 'ranked';

export type Poll = {
  id: string;
  group_id: string;
  created_by: string;
  title: string;
  description: string;
  type: PollType;
  created_at: string;
  updated_at: string;
  status?: 'active' | 'closed' | 'archived';
  allow_add_options?: boolean;
  anonymous_voting?: boolean;
  closes_at?: string;
  creator: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  poll_options: PollOption[];
  poll_votes: PollVote[];
};

export type PollOption = {
  id: string;
  poll_id: string;
  label: string;
  metadata?: object;
  created_at: string;
  created_by: string;
};

export type PollVote = {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  rank?: number;
  created_at: string;
};

export type CreatePollInput = {
  group_id: string;
  title: string;
  description?: string;
  type: PollType;
  allow_add_options?: boolean;
  anonymous_voting?: boolean;
  closes_at?: string;
  created_by: string;
};

export type CreatePollOptionInput = {
  label: string;
  metadata?: object;
  created_by: string;
  poll_id?: string;
};

// export type CreatePollVoteInput = {
//   poll_id: string;
//   option_id: string;
//   user_id: string;
//   rank?: number;
// };

const usePollActions = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  const createPoll = async (
    poll: CreatePollInput,
    options: CreatePollOptionInput[]
  ): Promise<Poll> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('polls')
        .insert({
          ...poll,
        })
        .select()
        .single();
      if (error) throw error;
      const createdPoll = data as Poll;

      // Insert all options in parallel, binding them to the new poll id
      await Promise.all(
        options.map((option) =>
          addPollOption({ ...option, poll_id: createdPoll.id })
        )
      );

      return createdPoll;
    } catch (error) {
      console.error('Failed to create poll:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addPollOption = async (
    pollOption: CreatePollOptionInput
  ): Promise<PollOption | undefined> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('poll_options')
        .insert({
          ...pollOption,
        })
        .select()
        .single();
      if (error) throw error;
      return data as PollOption;
    } catch (error) {
      console.error('Failed to add poll option:', error);
      // Burnt.toast({
      //   title: '😨 Oh no!',
      //   preset: 'error',
      //   message:
      //     'Something went wrong while updating your profile. Please try again.',
      //   duration: 3,
      //   from: 'bottom',
      //   haptic: 'error',
      //   shouldDismissByDrag: true,
      // });
    } finally {
      setIsLoading(false);
    }
  };

  const castVote = async (
    pollId: string,
    optionId: string,
    userId: string
  ): Promise<PollVote> => {
    const { data, error } = await supabase
      .from('poll_votes')
      .insert({ poll_id: pollId, option_id: optionId, user_id: userId })
      .select()
      .single();
    if (error) throw error;

    // Optimistic update
    setPolls((prev) =>
      prev.map((poll) =>
        poll.id === pollId
          ? { ...poll, poll_votes: [...poll.poll_votes, data as PollVote] }
          : poll
      )
    );

    return data as PollVote;
  };

  const removeVote = async (
    pollId: string,
    optionId: string,
    userId: string
  ): Promise<void> => {
    const { error } = await supabase
      .from('poll_votes')
      .delete()
      .eq('poll_id', pollId)
      .eq('option_id', optionId)
      .eq('user_id', userId);
    if (error) throw error;

    // Optimistic update
    setPolls((prev) =>
      prev.map((poll) =>
        poll.id === pollId
          ? {
              ...poll,
              poll_votes: poll.poll_votes.filter(
                (v) => !(v.option_id === optionId && v.user_id === userId)
              ),
            }
          : poll
      )
    );
  };

  const swapVote = async (
    pollId: string,
    oldOptionId: string,
    newOptionId: string,
    userId: string
  ): Promise<void> => {
    // Run as sequential ops — remove old then insert new
    const { error: deleteError } = await supabase
      .from('poll_votes')
      .delete()
      .eq('poll_id', pollId)
      .eq('option_id', oldOptionId)
      .eq('user_id', userId);
    if (deleteError) throw deleteError;

    const { data, error: insertError } = await supabase
      .from('poll_votes')
      .insert({ poll_id: pollId, option_id: newOptionId, user_id: userId })
      .select()
      .single();
    if (insertError) throw insertError;

    // Optimistic update
    setPolls((prev) =>
      prev.map((poll) =>
        poll.id === pollId
          ? {
              ...poll,
              poll_votes: [
                ...poll.poll_votes.filter(
                  (v) => !(v.option_id === oldOptionId && v.user_id === userId)
                ),
                data as PollVote,
              ],
            }
          : poll
      )
    );
  };

  const fetchPollById = async (pollId: string): Promise<Poll> => {
    const { data, error } = await supabase
      .from('polls')
      .select(
        '*, creator:profiles!created_by (id, full_name, avatar_url), poll_options(*), poll_votes(*)'
      )
      .eq('id', pollId)
      .single();
    if (error) throw error;
    return data as Poll;
  };

  const updatePoll = async (
    pollId: string,
    updates: Pick<
      CreatePollInput,
      'title' | 'type' | 'allow_add_options' | 'anonymous_voting'
    >,
    options: { id?: string; label: string; created_by: string }[],
    deletedOptionIds: string[]
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('polls')
        .update(updates)
        .eq('id', pollId);
      if (error) throw error;

      if (deletedOptionIds.length > 0) {
        const { error: delErr } = await supabase
          .from('poll_options')
          .delete()
          .in('id', deletedOptionIds);
        if (delErr) throw delErr;
      }

      await Promise.all(
        options
          .filter((o) => o.id)
          .map((o) =>
            supabase
              .from('poll_options')
              .update({ label: o.label })
              .eq('id', o.id!)
          )
      );

      await Promise.all(
        options
          .filter((o) => !o.id)
          .map((o) =>
            addPollOption({
              label: o.label,
              created_by: o.created_by,
              poll_id: pollId,
            })
          )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deletePoll = async (pollId: string): Promise<void> => {
    const { error } = await supabase.from('polls').delete().eq('id', pollId);
    if (error) throw error;
    setPolls((prev) => prev.filter((poll) => poll.id !== pollId));
  };

  const fetchPolls = async (groupId: string): Promise<Poll[]> => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select(
          '*, creator:profiles!created_by (id, full_name, avatar_url), poll_options(*), poll_votes(*)'
        )
        .eq('group_id', groupId);
      if (error) throw error;
      setPolls(data as Poll[]);
      return data as Poll[];
    } catch (error) {
      console.error('Failed to fetch polls:', error);
      throw error;
    }
  };

  return {
    createPoll,
    addPollOption,
    fetchPollById,
    fetchPolls,
    updatePoll,
    castVote,
    removeVote,
    swapVote,
    deletePoll,
    polls,
    isLoading,
  };
};
export default usePollActions;
