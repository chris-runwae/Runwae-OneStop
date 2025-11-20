import React from 'react';
import { View, StatusBar } from 'react-native';

import OnboardingScreen from '@/screens/OnboardingScreen';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

export default function Onboarding() {
  const { hasCompletedOnboarding } = useOnboardingStore();

  console.log('hasCompletedOnboarding: ', hasCompletedOnboarding);
  return (
    <View className="flex-1">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <OnboardingScreen />
    </View>
  );
}
