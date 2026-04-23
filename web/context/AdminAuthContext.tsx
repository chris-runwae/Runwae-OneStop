"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { AdminUser } from "@/lib/supabase/admin/auth";
import { adminSignIn } from "@/lib/supabase/admin/auth";

const STORAGE_KEY = "admin_session";

interface AdminAuthContextValue {
  admin: AdminUser | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<string | null>;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setAdmin(JSON.parse(stored));
    } catch {
      // ignore
    }
    setIsLoading(false);
  }, []);

  const signIn = async (username: string, password: string): Promise<string | null> => {
    const { admin: result, error } = await adminSignIn(username, password);
    if (error || !result) return error ?? "Sign in failed.";
    setAdmin(result);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    return null;
  };

  const signOut = () => {
    setAdmin(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, isLoading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
