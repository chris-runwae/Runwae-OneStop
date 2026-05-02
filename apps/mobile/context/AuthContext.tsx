import { useAuth as useAuthHook } from "@/hooks/useAuth";
import { createContext, ReactNode, useContext } from "react";

export interface AuthContextType {
  user: any;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  hasCompletedBoarding: boolean;
  currentBoardingStep: number;
  isAuthenticated: boolean;
  showWelcomeModal: boolean;
  setShowWelcomeModal: (show: boolean) => Promise<void>;
  isProfileComplete: boolean;
  currentOnboardingStep: number;
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ success: boolean; error?: string }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  updateUser: (
    profile: Partial<any>,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    email: string,
  ) => Promise<{ success: boolean; error?: string }>;
  confirmPasswordReset: (
    email: string,
    code: string,
    newPassword: string,
  ) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (
    newPassword: string,
  ) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (
    email: string,
    code: string,
  ) => Promise<{ success: boolean; error?: string }>;
  initialize: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  completeBoarding: () => Promise<void>;
  setCurrentBoardingStep: (step: number) => Promise<void>;
  nextOnboardingStep: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authHook = useAuthHook();

  return (
    <AuthContext.Provider
      value={{
        ...authHook,
        currentOnboardingStep: authHook.currentBoardingStep,
        nextOnboardingStep: async () => {
          if (authHook.currentBoardingStep < 4) {
             await authHook.setCurrentBoardingStep(authHook.currentBoardingStep + 1);
          }
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
