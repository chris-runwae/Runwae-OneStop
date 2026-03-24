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

  return { createPoll, addPollOption, fetchPolls, polls, isLoading };
};
export default usePollActions;
