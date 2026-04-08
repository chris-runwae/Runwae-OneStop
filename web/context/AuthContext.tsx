"use client";

import { supabase } from "@/lib/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface SignUpResult {
  error: string | null;
  needsVerification: boolean;
}

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organisation?: string;
  phone?: string;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isSigningOut: boolean;
  signUp: (
    data: SignUpData,
  ) => Promise<{ error: string | null; needsVerification: boolean }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => void;
  verifyEmail: (
    email: string,
    otp: string,
  ) => Promise<{ error: string | null }>;
  resendVerification: (email: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  updateProfile: (
    data: Partial<Omit<Profile, "id">>,
  ) => Promise<{ error: string | null }>;
  uploadProfileImage: (
    file: File,
  ) => Promise<{ url: string | null; error: string | null }>;
  updateUserMeta: (
    data: Record<string, string>,
  ) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data as Profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setProfile(session?.user ? await fetchProfile(session.user.id) : null);
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async ({
    email,
    password,
    firstName,
    lastName,
    organisation,
    phone,
  }: SignUpData): Promise<SignUpResult> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          organisation,
          phone,
        },
      },
    });

    if (error) return { error: error.message, needsVerification: false };

    // Supabase returns an identities array — empty means the email
    // is already registered (and unconfirmed duplicates are silenced)
    const needsVerification =
      data.user?.identities?.length === 0
        ? false // duplicate — surface as an error if you prefer
        : !data.session; // session is null when email confirmation is required

    return { error: null, needsVerification };
  };

  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = () => {
    // Clear local state immediately so UI reacts at once
    setUser(null);
    setSession(null);
    setProfile(null);
    // Fire API call in the background
    supabase.auth.signOut();
  };

  const verifyEmail = async (
    email: string,
    otp: string,
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const resendVerification = async (
    email: string,
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.resend({
      email,
      type: "signup",
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const resetPassword = async (
    email: string,
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const updatePassword = async (
    newPassword: string,
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return { error: null };
  };

  const updateProfile = async (
    data: Partial<Omit<Profile, "id">>,
  ): Promise<{ error: string | null }> => {
    if (!user) return { error: "Not authenticated" };

    const { data: updated, error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", user.id)
      .select()
      .single();

    if (error) return { error: error.message };
    setProfile(updated as Profile);
    return { error: null };
  };

  const uploadProfileImage = async (
    file: File,
  ): Promise<{ url: string | null; error: string | null }> => {
    if (!user) return { url: null, error: "Not authenticated" };

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/profile.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(path, file, { contentType: file.type, upsert: true });

    if (uploadError) return { url: null, error: uploadError.message };

    const { data: urlData } = supabase.storage
      .from("profiles")
      .getPublicUrl(path);
    const url = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: profileError } = await updateProfile({ avatar_url: url });
    if (profileError) return { url: null, error: profileError };

    return { url, error: null };
  };

  const updateUserMeta = async (
    data: Record<string, string>,
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.updateUser({ data });
    if (error) return { error: error.message };
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isSigningOut,
        signUp,
        signIn,
        signOut,
        verifyEmail,
        resendVerification,
        resetPassword,
        updatePassword,
        updateProfile,
        uploadProfileImage,
        updateUserMeta,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
