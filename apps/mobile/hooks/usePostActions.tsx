import { useMutation, useQuery } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';
import type { Doc, Id } from '@runwae/convex/convex/_generated/dataModel';

// Convex's posts module returns hydrated rows {...doc, author}. Types
// stay loose so the existing UI keeps working — author shape is the
// public user sanitiser output.
export type Post = Doc<'trip_posts'> & {
  author: {
    _id: Id<'users'>;
    name?: string;
    username?: string;
    avatarUrl?: string;
    image?: string;
  } | null;
};

const usePostActions = () => {
  const createPostMut = useMutation(api.posts.create);

  // Reactive list selector — pass `null/undefined` to skip.
  const usePostsByTrip = (
    tripId: Id<'trips'> | string | undefined,
  ): Post[] | undefined =>
    useQuery(
      api.posts.getByTrip,
      tripId ? { tripId: tripId as Id<'trips'> } : 'skip',
    ) as Post[] | undefined;

  // Legacy adapters kept for the existing PostsContainer/AddPostScreen
  // call sites that expect imperative methods. They proxy to mutations
  // and rely on the live useQuery cache for state updates.
  const createPost = async (
    tripId: string,
    content: string,
    _userId: string,
    imageUrls?: string[],
  ) => {
    const id = await createPostMut({
      tripId: tripId as Id<'trips'>,
      content,
      imageUrls,
    });
    return id;
  };

  // The Convex backend doesn't yet expose update/delete for posts;
  // those land alongside the rest of Phase 5's social UI in a later
  // ramp. Surfaces a clear error so callers can disable the buttons.
  const updatePost = async (_postId: string, _content: string) => {
    throw new Error(
      'Editing posts is not yet supported. Delete and re-post for now.',
    );
  };
  const deletePost = async (_postId: string) => {
    throw new Error('Deleting posts is not yet supported.');
  };
  const fetchPostById = async (_postId: string): Promise<Post> => {
    throw new Error('Use the reactive trip-level posts query instead.');
  };

  // Legacy fetchPosts was imperative — return a no-op promise so old
  // callsites compile. Real reactive listings come via usePostsByTrip.
  const fetchPosts = async (_tripId: string): Promise<Post[]> => [];

  return {
    posts: [] as Post[],
    isLoading: false,
    fetchPosts,
    fetchPostById,
    createPost,
    updatePost,
    deletePost,
    usePostsByTrip,
  };
};

export default usePostActions;
