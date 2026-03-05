import { View, Text } from "react-native";
import React, { useState } from "react";
import { supabase } from "@/utils/supabase/client";

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

// export type CreatePollInput = {
//   group_id: string;
//   title: string;
//   description: string;
//   type: PollType;
// };

// export type CreatePollOptionInput = {
//   poll_id: string;
//   label: string;
//   metadata?: object;
// };

// export type CreatePollVoteInput = {
//   poll_id: string;
//   option_id: string;
//   user_id: string;
//   rank?: number;
// };

const usePollActions = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);


  const createPoll = async (poll: Partial<Poll>): Promise<Poll> => {
    try {
    const { data, error } = await supabase
      .from('polls')
      .insert({
        ...poll,
      })
      .select()
      .single();
      if (error) throw error;
      return data as Poll;
    } catch (error) {
      console.error("Failed to create poll:", error);
      throw error;
    }
  }

  const addPollOption = async (pollOption: Partial<PollOption>): Promise<PollOption> => {
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
      console.error("Failed to add poll option:", error);
      throw error;
    }
  }

  const fetchPolls = async (groupId: string): Promise<Poll[]> => {
    
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('group_id', groupId);
      if (error) throw error;
      setPolls(data as Poll[]);
      return data as Poll[];
    } catch (error) {
      console.error("Failed to fetch polls:", error);
      throw error;
      }
    };

  return { createPoll, addPollOption, fetchPolls, polls };
};
export default usePollActions;