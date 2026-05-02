import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@runwae/convex/convex/_generated/api";
import type { Doc } from "@runwae/convex/convex/_generated/dataModel";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

export interface User {
  id: string;
  email: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  role?: "admin" | "user";
  email_verified?: boolean;
}

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
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  updateUser: (
    userData: Partial<User>,
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    email: string,
  ) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (
    newPassword: string,
  ) => Promise<{ success: boolean; error?: string }>;

  completeOnboarding: () => Promise<void>;
  completeBoarding: () => Promise<void>;
  setCurrentBoardingStep: (step: number) => Promise<void>;

  initialize: () => Promise<void>;
}

const BOARDING_STORAGE_KEY = "@boarding_completed";
const ONBOARDING_STORAGE_KEY = "@onboarding_completed";
const CURRENT_BOARDING_STEP_KEY = "@current_boarding_step";
const WELCOME_MODAL_TRIGGER_KEY = "@show_welcome_modal";

const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === "web") return localStorage.getItem(key);
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

function toAppUser(
  viewer: Doc<"users"> | null | undefined,
): User | null {
  if (!viewer) return null;
  return {
    id: viewer._id as unknown as string,
    email: viewer.email ?? "",
    full_name: viewer.name ?? "",
    username: viewer.username,
    avatar_url: viewer.avatarUrl ?? viewer.image,
    role: viewer.isAdmin ? "admin" : "user",
    email_verified: viewer.emailVerificationTime != null,
  };
}

function errorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === "object") {
    const anyErr = err as { message?: string; data?: unknown };
    if (anyErr.message) return anyErr.message;
    if (anyErr.data) return `${fallback}: ${JSON.stringify(anyErr.data)}`;
  }
  return fallback;
}

export function useAuth(): UseAuthReturn {
  const { isAuthenticated, isLoading: convexLoading } = useConvexAuth();
  const { signIn: convexSignIn, signOut: convexSignOut } = useAuthActions();

  const viewer = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip",
  );
  const updateProfile = useMutation(api.users.updateProfile);

  // Local-only mobile UX state. Source of truth for these moves to
  // users.onboardingComplete in Phase 2.
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [hasCompletedBoarding, setHasCompletedBoarding] = useState(false);
  const [showWelcomeModal, setShowWelcomeModalState] = useState(false);
  const [currentBoardingStep, setCurrentBoardingStepState] = useState(1);
  const [boardingHydrated, setBoardingHydrated] = useState(false);

  const user = toAppUser(viewer ?? null);
  const isProfileComplete = !!user?.full_name;
  // Treat "still loading viewer" as loading so consumers don't render
  // an authed UI before they have user data.
  const isLoading =
    convexLoading ||
    (isAuthenticated && viewer === undefined) ||
    !boardingHydrated;

  const initialize = useCallback(async () => {
    const [seen, completed, step, modal] = await Promise.all([
      storage.getItem(ONBOARDING_STORAGE_KEY),
      storage.getItem(BOARDING_STORAGE_KEY),
      storage.getItem(CURRENT_BOARDING_STEP_KEY),
      storage.getItem(WELCOME_MODAL_TRIGGER_KEY),
    ]);
    setHasSeenOnboarding(seen === "true");
    setHasCompletedBoarding(completed === "true");
    if (step) setCurrentBoardingStepState(parseInt(step, 10));
    setShowWelcomeModalState(modal === "true");
    setBoardingHydrated(true);
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // After successful auth we know the user has at minimum seen onboarding;
  // mirror that to local storage so route guards stop bouncing them back.
  useEffect(() => {
    if (isAuthenticated && !hasSeenOnboarding) {
      setHasSeenOnboarding(true);
      void storage.setItem(ONBOARDING_STORAGE_KEY, "true");
    }
  }, [isAuthenticated, hasSeenOnboarding]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        await convexSignIn("password", { email, password, flow: "signIn" });
        return { success: true };
      } catch (err) {
        return { success: false, error: errorMessage(err, "Sign in failed") };
      }
    },
    [convexSignIn],
  );

  const signInWithGoogle = useCallback(async () => {
    try {
      await convexSignIn("google");
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: errorMessage(err, "Google sign in failed"),
      };
    }
  }, [convexSignIn]);

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      try {
        await convexSignIn("password", {
          email,
          password,
          flow: "signUp",
          ...(fullName ? { name: fullName } : {}),
        });
        // New user: reset boarding flags so the 5-step flow runs.
        await Promise.all([
          storage.setItem(BOARDING_STORAGE_KEY, "false"),
          storage.setItem(CURRENT_BOARDING_STEP_KEY, "1"),
          storage.setItem(WELCOME_MODAL_TRIGGER_KEY, "false"),
        ]);
        setHasCompletedBoarding(false);
        setCurrentBoardingStepState(1);
        setShowWelcomeModalState(false);
        return { success: true };
      } catch (err) {
        return { success: false, error: errorMessage(err, "Sign up failed") };
      }
    },
    [convexSignIn],
  );

  const signOut = useCallback(async () => {
    try {
      await convexSignOut();
      // Clear local UX state so a different user signing in next gets a clean slate.
      await Promise.all([
        storage.setItem(BOARDING_STORAGE_KEY, "false"),
        storage.setItem(ONBOARDING_STORAGE_KEY, "false"),
        storage.setItem(CURRENT_BOARDING_STEP_KEY, "1"),
        storage.setItem(WELCOME_MODAL_TRIGGER_KEY, "false"),
      ]);
      setHasCompletedBoarding(false);
      setHasSeenOnboarding(false);
      setCurrentBoardingStepState(1);
      setShowWelcomeModalState(false);
      return { success: true };
    } catch (err) {
      return { success: false, error: errorMessage(err, "Sign out failed") };
    }
  }, [convexSignOut]);

  const updateUser = useCallback(
    async (userData: Partial<User>) => {
      try {
        await updateProfile({
          ...(userData.full_name !== undefined
            ? { name: userData.full_name }
            : {}),
          ...(userData.avatar_url !== undefined
            ? { avatarUrl: userData.avatar_url }
            : {}),
        });
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: errorMessage(err, "Failed to update profile"),
        };
      }
    },
    [updateProfile],
  );

  // Password reset / change flows aren't wired through @convex-dev/auth's
  // base Password provider yet — adding requires a `reset`/`verify` verifier
  // in packages/convex/convex/auth.ts plus a Resend integration.
  const resetPassword = useCallback(async (_email: string) => {
    return {
      success: false,
      error:
        "Password reset isn't available yet. Please contact support@runwae.io.",
    };
  }, []);

  const updatePassword = useCallback(async (_newPassword: string) => {
    return {
      success: false,
      error:
        "Password change isn't available yet. Please contact support@runwae.io.",
    };
  }, []);

  const completeOnboarding = useCallback(async () => {
    setHasSeenOnboarding(true);
    await storage.setItem(ONBOARDING_STORAGE_KEY, "true");
  }, []);

  const completeBoarding = useCallback(async () => {
    setHasCompletedBoarding(true);
    setShowWelcomeModalState(true);
    await Promise.all([
      storage.setItem(BOARDING_STORAGE_KEY, "true"),
      storage.setItem(WELCOME_MODAL_TRIGGER_KEY, "true"),
    ]);
  }, []);

  const setCurrentBoardingStep = useCallback(async (step: number) => {
    setCurrentBoardingStepState(step);
    await storage.setItem(CURRENT_BOARDING_STEP_KEY, step.toString());
  }, []);

  const setShowWelcomeModal = useCallback(async (show: boolean) => {
    setShowWelcomeModalState(show);
    await storage.setItem(WELCOME_MODAL_TRIGGER_KEY, show.toString());
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    isProfileComplete,
    hasSeenOnboarding,
    hasCompletedBoarding,
    showWelcomeModal,
    setShowWelcomeModal,
    currentBoardingStep,
    signIn,
    signInWithGoogle,
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
