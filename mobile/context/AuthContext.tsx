import { useAuth as useAuthHook } from "@/hooks/useAuth";
import { createContext, ReactNode, useContext } from "react";

export interface AuthContextType {
  user: any;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  hasCompletedBoarding: boolean;
  currentBoardingStep: number;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  currentOnboardingStep: number;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  updateUser: (
    profile: Partial<any>,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    email: string,
  ) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (
    newPassword: string,
  ) => Promise<{ success: boolean; error?: string }>;
  initialize: () => Promise<void>;
  completeOnboarding: () => void;
  completeBoarding: () => void;
  setCurrentBoardingStep: (step: number) => void;
  nextOnboardingStep: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authHook = useAuthHook();

  return (
    <AuthContext.Provider
      value={{
        ...authHook,
        currentOnboardingStep: 1, // Default value since useAuth hook doesn't have this
        nextOnboardingStep: () => {}, // Empty implementation since useAuth hook doesn't have this
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
