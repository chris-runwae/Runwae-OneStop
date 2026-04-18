import { supabase } from "../client";

export type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
};

/**
 * Fetches all auth users via the public profiles table.
 * Requires a `profiles` table that mirrors auth.users with public columns.
 * Falls back to auth.users metadata if profiles table isn't available.
 */
export const adminGetAllUsers = async (): Promise<AdminUser[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, created_at, last_sign_in_at, full_name, avatar_url, role")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as AdminUser[];
};

export const adminGetUserById = async (id: string): Promise<AdminUser | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, created_at, last_sign_in_at, full_name, avatar_url, role")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as AdminUser | null;
};

/** Get all users who have created at least one event (hosts). */
export const adminGetAllHosts = async () => {
  const { data, error } = await supabase
    .from("events")
    .select("user_id")
    .not("user_id", "is", null);

  if (error) throw new Error(error.message);

  const uniqueIds = [...new Set((data ?? []).map((r) => r.user_id as string))];

  if (uniqueIds.length === 0) return [];

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, email, created_at, last_sign_in_at, full_name, avatar_url, role")
    .in("id", uniqueIds);

  if (profilesError) throw new Error(profilesError.message);
  return (profiles ?? []) as AdminUser[];
};
