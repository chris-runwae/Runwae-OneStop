"use client";

import { updateUserMeta } from "@/api/onboarding";
import { supabase } from "@/lib/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => void;
  uploadProfileImage: (
    file: File,
  ) => Promise<{ url: string | null; error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleSession = async (session: Session | null) => {
    setSession(session);
    setUser(session?.user ?? null);
    setIsLoading(false);
  };

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => handleSession(session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      handleSession(session),
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = () => {
    setUser(null);
    setSession(null);
    supabase.auth.signOut();
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

    const { error: metaError } = await updateUserMeta({ avatar_url: url });
    if (metaError) return { url: null, error: metaError };

    return { url, error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signOut,
        uploadProfileImage,
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
