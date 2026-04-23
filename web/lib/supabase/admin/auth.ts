import { supabase } from "../client";

export type AdminUser = {
  id: string;
  username: string;
  name: string;
  email: string;
};

/**
 * Verify admin credentials against the admin_users table.
 * Table schema: id (uuid), username (text), password (text), name (text), email (text)
 */
export const adminSignIn = async (
  username: string,
  password: string,
): Promise<{ admin: AdminUser | null; error: string | null }> => {
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, username, name, email, password")
    .eq("username", username)
    .maybeSingle();

  if (error) return { admin: null, error: error.message };
  if (!data) return { admin: null, error: "Invalid username or password." };
  if (data.password !== password)
    return { admin: null, error: "Invalid username or password." };

  return {
    admin: {
      id: data.id,
      username: data.username,
      name: data.name,
      email: data.email,
    },
    error: null,
  };
};
