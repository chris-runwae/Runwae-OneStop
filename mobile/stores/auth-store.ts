import { supabase } from "@/utils/supabase/client";
import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  profileImage?: string;
  onboardingCompleted?: boolean;
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
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (profile: Partial<User>) => Promise<void>;
  initialize: () => Promise<void>;
  completeOnboarding: () => void;
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
    const isProfileComplete = !!(user?.username && user?.name);
    set({ user, isAuthenticated, isProfileComplete });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),

  setCurrentOnboardingStep: (currentOnboardingStep) =>
    set({ currentOnboardingStep }),

  completeOnboarding: () => set({ hasSeenOnboarding: true }),

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
        if (profile?.onboardingCompleted) {
          setHasSeenOnboarding(true);
        }
      } else {
        setUser(null);
        const hasSeen = await checkOnboardingStatus();
        setHasSeenOnboarding(hasSeen);
      }
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

  signUp: async (email, password) => {
    const { setUser } = get();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) throw error;

    if (data.user) {
      const profile = await fetchUserProfile(data.user.id);
      setUser(profile);
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
      if (userData.name !== undefined) updateData.name = userData.name;
      if (userData.username !== undefined)
        updateData.username = userData.username;
      if (userData.profileImage !== undefined)
        updateData.profile_image_url = userData.profileImage;
      if (userData.onboardingCompleted !== undefined)
        updateData.onboarding_completed = userData.onboardingCompleted;

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
      name: data.name,
      username: data.username,
      email: authUser.data.user.email || "",
      profileImage: data.profile_image_url,
      onboardingCompleted: data.onboarding_completed,
    };
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    return null;
  }
}

async function checkOnboardingStatus(): Promise<boolean> {
  // You can store this in AsyncStorage or Supabase
  // For now, return false (first time user)
  return false;
}
