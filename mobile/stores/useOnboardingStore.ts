import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  initialized: boolean;
  setHasCompletedOnboarding: (value: boolean) => Promise<void>;
  initialize: () => Promise<void>;
  completeOnboarding: (data: any) => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasCompletedOnboarding: false,
  initialized: false,
  setHasCompletedOnboarding: async (value) => {
    await AsyncStorage.setItem('hasCompletedOnboarding', JSON.stringify(value));
    set({ hasCompletedOnboarding: value });
  },
  initialize: async () => {
    const value = await AsyncStorage.getItem('hasCompletedOnboarding');
    set({
      hasCompletedOnboarding: value === 'true',
      initialized: true,
    });
  },
  completeOnboarding: async (data: any) => {
    await AsyncStorage.setItem('onboardingData', JSON.stringify(data));
    set({ hasCompletedOnboarding: true });
  },
}));
