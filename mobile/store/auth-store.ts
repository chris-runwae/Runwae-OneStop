import { supabase } from "@/utils/supabase/client";
import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  role?: "vendor" | "user";
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  currentOnboardingStep: number;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  setCurrentOnboardingStep: (step: number) => void;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (profile: Partial<User>) => Promise<void>;
  initialize: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  nextOnboardingStep: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,
  hasSeenOnboarding: false,
  isAuthenticated: false,
  isProfileComplete: false,
  currentOnboardingStep: 1,

  setUser: (user) => {
    const isAuthenticated = !!user;
    const isProfileComplete = !!(user?.username && user?.full_name);
    set({ user, isAuthenticated, isProfileComplete });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),

  setCurrentOnboardingStep: (currentOnboardingStep) =>
    set({ currentOnboardingStep }),

  completeOnboarding: async () => {
    set({ hasSeenOnboarding: true });
    await setLocalOnboardingStatus(true);
  },

  nextOnboardingStep: () => {
    const { currentOnboardingStep } = get();
    if (currentOnboardingStep < 3) {
      set({ currentOnboardingStep: currentOnboardingStep + 1 });
    }
  },

  initialize: async () => {
    const { setLoading, setUser, setHasSeenOnboarding } = get();

    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
      
      const hasSeen = await checkOnboardingStatus();
      setHasSeenOnboarding(hasSeen);
    } catch (error) {
      console.error("Error initializing auth:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  },

  signIn: async (email, password) => {
    const { setUser } = get();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const profile = await fetchUserProfile(data.user.id);
      setUser(profile);
    }
  },

  signUp: async (email, password, fullName) => {
    const { setUser } = get();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: fullName
        ? {
            data: {
              full_name: fullName,
              name: fullName,
            },
          }
        : undefined,
    });

    if (error) throw error;

    if (data.user) {
      const profile = await fetchUserProfile(data.user.id);
      setUser(profile);
      set({ hasSeenOnboarding: false });
      await setLocalOnboardingStatus(false);
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, isProfileComplete: false });
  },

  updateUser: async (userData) => {
    const { user, setUser } = get();
    if (!user) return;

    try {
      const updateData: any = {};
      if (userData.full_name !== undefined)
        updateData.name = userData.full_name;
      if (userData.username !== undefined)
        updateData.username = userData.username;
      if (userData.avatar_url !== undefined)
        updateData.profile_image_url = userData.avatar_url;

      const { error, data } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const profile = await fetchUserProfile(data.id);
        setUser(profile);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },
}));

async function fetchUserProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    if (!data) {
      console.error("No profile data returned");
      return null;
    }

    const authUser = await supabase.auth.getUser();
    if (!authUser.data.user) {
      console.error("No auth user found");
      return null;
    }

    return {
      id: data.id,
      full_name: data.full_name,
      email: authUser.data.user.email || "",
      avatar_url: data.avatar_url,
    };
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    return null;
  }
}

const ONBOARDING_STORAGE_KEY = "@onboarding_completed";

async function setLocalOnboardingStatus(status: boolean): Promise<void> {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, status.toString());
    } else {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, status.toString());
    }
  } catch (error) {
    console.error("Error setting onboarding status:", error);
  }
}

async function checkOnboardingStatus(): Promise<boolean> {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true";
    } else {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      const value = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      return value === "true";
    }
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return false;
  }
}
