import { User } from '@/stores/auth-store';
import { supabase } from '@/utils/supabase/client';
import { useCallback, useEffect, useState } from 'react';

// Simple storage abstraction that works on web and handles AsyncStorage gracefully
const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      console.log('storage.getItem called for key:', key);
      // Try AsyncStorage first (for native)
      if (typeof window !== 'undefined' && window.localStorage) {
        const value = localStorage.getItem(key);
        console.log('localStorage.getItem result:', value);
        return value;
      }
      // Fallback for AsyncStorage if available
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      const value = await AsyncStorage.getItem(key);
      console.log('AsyncStorage.getItem result:', value);
      return value;
    } catch (error) {
      console.log('storage.getItem error:', error);
      // Final fallback to localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        const value = localStorage.getItem(key);
        console.log('fallback localStorage.getItem result:', value);
        return value;
      }
      console.log('storage.getItem returning null');
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      console.log('storage.setItem called for key:', key, 'value:', value);
      // Try AsyncStorage first (for native)
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        console.log('localStorage.setItem completed');
        return;
      }
      // Fallback for AsyncStorage if available
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(key, value);
      console.log('AsyncStorage.setItem completed');
    } catch (error) {
      console.log('storage.setItem error:', error);
      // Final fallback to localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        console.log('fallback localStorage.setItem completed');
      }
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
  currentBoardingStep: number;

  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string
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

  completeOnboarding: () => void;
  completeBoarding: () => void;
  setCurrentBoardingStep: (step: number) => void;

  initialize: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

async function fetchUserProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    if (!data) {
      console.error('No profile data returned');
      return null;
    }

    const authUser = await supabase.auth.getUser();
    if (!authUser.data.user) {
      console.error('No auth user found');
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      username: data.username,
      email: authUser.data.user.email || '',
      profileImage: data.profile_image_url,
      onboardingCompleted: data.onboarding_completed,
      role: data.role || 'user',
    };
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
}

async function checkOnboardingStatus(): Promise<boolean> {
  // You can store this in AsyncStorage or Supabase
  // For now, return false (first time user)
  return false;
}

async function saveBoardingStatus(hasCompleted: boolean): Promise<void> {
  console.log('saveBoardingStatus called with:', hasCompleted);
  await storage.setItem('@boarding_completed', hasCompleted.toString());
  console.log('saveBoardingStatus completed');
}

async function loadBoardingStatus(): Promise<boolean> {
  console.log('loadBoardingStatus called');
  const value = await storage.getItem('@boarding_completed');
  const result = value === 'true';
  console.log('loadBoardingStatus result:', result, '(raw value:', value, ')');
  return result;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [hasCompletedBoarding, setHasCompletedBoarding] = useState(false);
  const [currentBoardingStep, setCurrentBoardingStepState] = useState(1);

  const isAuthenticated = !!user;
  const isProfileComplete = !!(user?.username && user?.name);

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
    } catch (error) {
      console.error('Error initializing auth:', error);
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

      return { success: false, error: 'No user data returned' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const profile = await fetchUserProfile(data.user.id);
          setUser(profile);

          setHasCompletedBoarding(false);
          await saveBoardingStatus(false);

          return { success: true };
        }

        return { success: false, error: 'No user data returned' };
      } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: 'An unexpected error occurred' };
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
      console.error('Sign out error:', error);
      return { success: false, error: 'Failed to sign out' };
    }
  }, []);

  const updateUser = useCallback(
    async (userData: Partial<User>) => {
      if (!user) {
        return { success: false, error: 'No authenticated user' };
      }

      try {
        const updateData: any = {};
        if (userData.name !== undefined) updateData.name = userData.name;
        if (userData.username !== undefined)
          updateData.username = userData.username;
        if (userData.profileImage !== undefined)
          updateData.profile_image_url = userData.profileImage;
        if (userData.onboardingCompleted !== undefined)
          updateData.onboarding_completed = userData.onboardingCompleted;
        if (userData.role !== undefined) updateData.role = userData.role;

        const { error, data } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id)
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

        return { success: false, error: 'Failed to update profile' };
      } catch (error) {
        console.error('Update user error:', error);
        return { success: false, error: 'An unexpected error occurred' };
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
      console.error('Reset password error:', error);
      return { success: false, error: 'An unexpected error occurred' };
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
      console.error('Update password error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    setHasSeenOnboarding(true);
  }, []);

  const completeBoarding = useCallback(async () => {
    setHasCompletedBoarding(true);
    await saveBoardingStatus(true);
  }, []);

  const setCurrentBoardingStep = useCallback((step: number) => {
    setCurrentBoardingStepState(step);
  }, []);

  const getToken = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }
      return data.session?.access_token || null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
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
    getToken,
  };
}
