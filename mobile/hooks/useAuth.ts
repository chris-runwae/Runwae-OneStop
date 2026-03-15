import { User } from "@/store/auth-store";
import { supabase } from "@/utils/supabase/client";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

// Simple storage abstraction that works on web and handles AsyncStorage gracefully
const BOARDING_STORAGE_KEY = "@boarding_completed";
const ONBOARDING_STORAGE_KEY = "@onboarding_completed";
const CURRENT_BOARDING_STEP_KEY = "@current_boarding_step";
const WELCOME_MODAL_TRIGGER_KEY = "@show_welcome_modal";

const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        return localStorage.getItem(key);
      }
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`storage.getItem error for ${key}:`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        localStorage.setItem(key, value);
        return;
      }
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`storage.setItem error for ${key}:`, error);
    }
  },
};

export interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  hasSeenOnboarding: boolean;
  hasCompletedBoarding: boolean;
  showWelcomeModal: boolean;
  setShowWelcomeModal: (show: boolean) => Promise<void>;
  currentBoardingStep: number;

  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  updateUser: (
    userData: Partial<User>
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;

  completeOnboarding: () => Promise<void>;
  completeBoarding: () => Promise<void>;
  setCurrentBoardingStep: (step: number) => Promise<void>;

  initialize: () => Promise<void>;
}

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
      role: data.role || "user",
    };
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    return null;
  }
}

async function saveBoardingStatus(hasCompleted: boolean): Promise<void> {
  await storage.setItem(BOARDING_STORAGE_KEY, hasCompleted.toString());
}

async function loadBoardingStatus(): Promise<boolean> {
  const value = await storage.getItem(BOARDING_STORAGE_KEY);
  return value === "true";
}

async function checkOnboardingStatus(): Promise<boolean> {
  const value = await storage.getItem(ONBOARDING_STORAGE_KEY);
  return value === "true";
}

async function saveOnboardingStatus(hasSeen: boolean): Promise<void> {
  await storage.setItem(ONBOARDING_STORAGE_KEY, hasSeen.toString());
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [hasCompletedBoarding, setHasCompletedBoarding] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [currentBoardingStep, setCurrentBoardingStepState] = useState(1);

  const isAuthenticated = !!user;
  const isProfileComplete = !!user?.full_name;

  const initialize = useCallback(async () => {
    setIsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile);
        // Authenticated users should always be considered as having seen onboarding
        setHasSeenOnboarding(true);
      } else {
        setUser(null);
        const hasSeen = await checkOnboardingStatus();
        setHasSeenOnboarding(hasSeen);
      }

      // Load boarding completion status
      const boardingCompleted = await loadBoardingStatus();
      setHasCompletedBoarding(boardingCompleted);

      // Load current boarding step
      const storedStep = await storage.getItem(CURRENT_BOARDING_STEP_KEY);
      if (storedStep) {
        setCurrentBoardingStepState(parseInt(storedStep, 10));
      }

      // Load welcome modal trigger status
      const showModal = await storage.getItem(WELCOME_MODAL_TRIGGER_KEY);
      setShowWelcomeModal(showModal === "true");
    } catch (error) {
      console.error("Error initializing auth:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        setUser(profile);
        return { success: true };
      }

      return { success: false, error: "No user data returned" };
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      try {
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

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const profile = await fetchUserProfile(data.user.id);
          setUser(profile);

          // Reset all onboarding/boarding status for new user
          setHasCompletedBoarding(false);
          setHasSeenOnboarding(true);
          setShowWelcomeModal(false);
          setCurrentBoardingStepState(1);

          await saveBoardingStatus(false);
          await saveOnboardingStatus(true);
          await storage.setItem(CURRENT_BOARDING_STEP_KEY, "1");
          await storage.setItem(WELCOME_MODAL_TRIGGER_KEY, "false");

          return { success: true };
        }

        return { success: false, error: "No user data returned" };
      } catch (error) {
        console.error("Sign up error:", error);
        return { success: false, error: "An unexpected error occurred" };
      }
    },
    [saveBoardingStatus]
  );

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setHasSeenOnboarding(false); // Reset onboarding state after sign out
      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      return { success: false, error: "Failed to sign out" };
    }
  }, []);

  const updateUser = useCallback(
    async (userData: Partial<User>) => {
      if (!user) {
        return { success: false, error: "No authenticated user" };
      }

      try {
        const updateData: any = {};
        if (userData.full_name !== undefined)
          updateData.full_name = userData.full_name;
        if (userData.avatar_url !== undefined)
          updateData.avatar_url = userData.avatar_url;
        if (userData.role !== undefined) updateData.role = userData.role;

        const { error, data } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", user.id)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        if (data) {
          const profile = await fetchUserProfile(data.id);
          setUser(profile);
          return { success: true };
        }

        return { success: false, error: "Failed to update profile" };
      } catch (error) {
        console.error("Update user error:", error);
        return { success: false, error: "An unexpected error occurred" };
      }
    },
    [user]
  );

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Reset password error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Update password error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    setHasSeenOnboarding(true);
    await saveOnboardingStatus(true);
  }, []);

  const completeBoarding = useCallback(async () => {
    setHasCompletedBoarding(true);
    setShowWelcomeModal(true);
    await saveBoardingStatus(true);
    await storage.setItem(WELCOME_MODAL_TRIGGER_KEY, "true");
  }, []);

  const setCurrentBoardingStep = useCallback(async (step: number) => {
    setCurrentBoardingStepState(step);
    await storage.setItem(CURRENT_BOARDING_STEP_KEY, step.toString());
  }, []);

  const setShowWelcomeModalWrapped = useCallback(async (show: boolean) => {
    setShowWelcomeModal(show);
    await storage.setItem(WELCOME_MODAL_TRIGGER_KEY, show.toString());
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    user,
    isLoading,
    isAuthenticated,
    isProfileComplete,
    hasSeenOnboarding,
    hasCompletedBoarding,
    showWelcomeModal,
    setShowWelcomeModal: setShowWelcomeModalWrapped,
    currentBoardingStep,
    signIn,
    signUp,
    signOut,
    updateUser,
    resetPassword,
    updatePassword,
    completeOnboarding,
    completeBoarding,
    setCurrentBoardingStep,
    initialize,
  };
}
