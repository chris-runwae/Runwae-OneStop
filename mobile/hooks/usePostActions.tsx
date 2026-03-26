import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';

export type Post = {
  id: string;
  group_id: string;
  created_by: string;
  content: string;
  created_at: string;
  updated_at: string;
  creator: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
};

const usePostActions = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosts = async (groupId: string): Promise<Post[]> => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, creator:profiles!created_by (id, full_name, avatar_url)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setPosts(data as Post[]);
    return data as Post[];
  };

  const fetchPostById = async (postId: string): Promise<Post> => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, creator:profiles!created_by (id, full_name, avatar_url)')
      .eq('id', postId)
      .single();
    if (error) throw error;
    return data as Post;
  };

  const createPost = async (
    groupId: string,
    content: string,
    userId: string
  ): Promise<Post> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({ group_id: groupId, content, created_by: userId })
        .select('*, creator:profiles!created_by (id, full_name, avatar_url)')
        .single();
      if (error) throw error;
      setPosts((prev) => [data as Post, ...prev]);
      return data as Post;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePost = async (postId: string, content: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', postId);
      if (error) throw error;
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, content } : p))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (postId: string): Promise<void> => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) throw error;
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return {
    posts,
    isLoading,
    fetchPosts,
    fetchPostById,
    createPost,
    updatePost,
    deletePost,
  };
};

export default usePostActions;
