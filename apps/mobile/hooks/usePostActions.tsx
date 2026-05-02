import { useMutation, useQuery } from 'convex/react';
import { ConvexReactClient } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';
import type { Doc, Id } from '@runwae/convex/convex/_generated/dataModel';
import { convex } from '@/lib/convex';

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
  const updatePostMut = useMutation(api.posts.update);
  const removePostMut = useMutation(api.posts.remove);

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

  const updatePost = async (postId: string, content: string) => {
    await updatePostMut({
      postId: postId as Id<'trip_posts'>,
      content,
    });
  };
  const deletePost = async (postId: string) => {
    await removePostMut({ postId: postId as Id<'trip_posts'> });
  };
  const fetchPostById = async (postId: string): Promise<Post> => {
    const row = await convex.query(api.posts.getById, {
      postId: postId as Id<'trip_posts'>,
    });
    if (!row) throw new Error('Post not found');
    return row as Post;
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
