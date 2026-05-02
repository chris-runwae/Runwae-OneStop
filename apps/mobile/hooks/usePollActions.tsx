import { useMutation, useQuery } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';
import type { Id } from '@runwae/convex/convex/_generated/dataModel';

// The Convex polls module supports `single_choice`, `multi_choice`, and
// `ranked`. The legacy mobile `multiple_choice` literal maps to
// `multi_choice` server-side.
export type PollType = 'single_choice' | 'multi_choice' | 'ranked';

export type PollOption = {
  _id: Id<'poll_options'>;
  poll_id?: Id<'trip_polls'>;
  label: string;
  voteCount?: number;
  // Legacy compatibility
  id?: string;
};

export type PollVote = {
  _id: Id<'poll_votes'>;
  pollId: Id<'trip_polls'>;
  optionId: Id<'poll_options'>;
  userId: Id<'users'>;
  createdAt: number;
  // Legacy compatibility
  id?: string;
  poll_id?: Id<'trip_polls'>;
  option_id?: Id<'poll_options'>;
  user_id?: Id<'users'>;
  created_at?: string;
};

export type Poll = {
  _id: Id<'trip_polls'>;
  tripId: Id<'trips'>;
  createdByUserId: Id<'users'>;
  title: string;
  description?: string;
  type: PollType;
  status: 'open' | 'closed' | 'archived';
  closesAt?: number;
  allowAddOptions: boolean;
  isAnonymous: boolean;
  createdAt: number;
  totalVotes: number;
  options: PollOption[];
  // Legacy aliases — kept for the UI's read paths until the next sweep.
  id?: string;
  group_id?: Id<'trips'>;
  created_by?: Id<'users'>;
  created_at?: string;
  poll_options?: PollOption[];
  poll_votes?: PollVote[];
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

const usePollActions = () => {
  const createMut = useMutation(api.polls.create);
  const voteMut = useMutation(api.polls.vote);
  const unvoteMut = useMutation(api.polls.unvote);

  const usePollsByTrip = (
    tripId: Id<'trips'> | string | undefined,
  ): Poll[] | undefined =>
    useQuery(
      api.polls.getByTrip,
      tripId ? { tripId: tripId as Id<'trips'> } : 'skip',
    ) as unknown as Poll[] | undefined;

  const createPoll = async (
    poll: CreatePollInput,
    options: CreatePollOptionInput[],
  ) => {
    const id = await createMut({
      tripId: poll.group_id as unknown as Id<'trips'>,
      title: poll.title,
      description: poll.description,
      type: poll.type,
      options: options.map((o) => o.label),
      allowAddOptions: poll.allow_add_options,
      isAnonymous: poll.anonymous_voting,
      closesAt: poll.closes_at ? Date.parse(poll.closes_at) : undefined,
    });
    return { _id: id } as unknown as Poll;
  };

  const castVote = async (
    pollId: string,
    optionId: string,
    _userId: string,
  ) => {
    await voteMut({
      pollId: pollId as unknown as Id<'trip_polls'>,
      optionId: optionId as unknown as Id<'poll_options'>,
    });
    return {} as PollVote;
  };

  const removeVote = async (
    pollId: string,
    optionId: string,
    _userId: string,
  ) => {
    await unvoteMut({
      pollId: pollId as unknown as Id<'trip_polls'>,
      optionId: optionId as unknown as Id<'poll_options'>,
    });
  };

  const swapVote = async (
    pollId: string,
    _oldOptionId: string,
    newOptionId: string,
    _userId: string,
  ) => {
    // Convex's `vote` mutation already handles swap-on-single-choice.
    await voteMut({
      pollId: pollId as unknown as Id<'trip_polls'>,
      optionId: newOptionId as unknown as Id<'poll_options'>,
    });
  };

  // Phase 5 leaves edit/delete unwired — the UI offered these via the
  // ellipsis menu but the backend doesn't expose them. Surfacing a
  // clear error keeps callsites honest.
  const updatePoll = async () => {
    throw new Error('Editing polls is not yet supported.');
  };
  const deletePoll = async () => {
    throw new Error('Deleting polls is not yet supported.');
  };
  const addPollOption = async (
    _input: CreatePollOptionInput,
  ): Promise<PollOption | undefined> => {
    throw new Error('Adding options after creation is not yet supported.');
  };
  const fetchPollById = async (_pollId: string): Promise<Poll> => {
    throw new Error('Use the reactive trip-level polls query instead.');
  };
  const fetchPolls = async (_tripId: string): Promise<Poll[]> => [];

  return {
    polls: [] as Poll[],
    isLoading: false,
    createPoll,
    addPollOption,
    fetchPollById,
    fetchPolls,
    updatePoll,
    castVote,
    removeVote,
    swapVote,
    deletePoll,
    usePollsByTrip,
  };
};

export default usePollActions;
