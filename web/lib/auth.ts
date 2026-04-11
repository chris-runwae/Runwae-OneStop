import { User } from "@supabase/supabase-js";

interface UserDisplayInfo {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
}

// auth.utils.ts
export const getUserDisplayInfo = (user: User | null): UserDisplayInfo => {
  const firstName = user?.user_metadata?.first_name ?? "";
  const lastName = user?.user_metadata?.last_name ?? "";

  const userDisplayInfo: UserDisplayInfo = {
    firstName,
    lastName,
    fullName: [firstName, lastName].filter(Boolean).join(" ") || "Admin",
    email: user?.email ?? "",
    avatarUrl: user?.user_metadata?.avatar_url ?? null,
    initials:
      [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase() || "A",
  };

  return userDisplayInfo;
};
