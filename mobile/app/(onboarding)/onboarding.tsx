import React from 'react';
import { View, StatusBar } from 'react-native';

import OnboardingScreen from '@/screens/OnboardingScreen';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { Redirect, RelativePathString } from 'expo-router';

export default function Onboarding() {
  const { hasCompletedOnboarding } = useOnboardingStore();
  if (!hasCompletedOnboarding) {
    return <Redirect href={'(tabs)' as RelativePathString} />;
  }

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
