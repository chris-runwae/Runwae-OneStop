import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';

import SplashScreen from '@/screens/SplashScreen';

export default function OnboardingScreen() {
  useEffect(() => {
    const checkAndNavigate = async () => {
      // Show splash screen for at least 2 seconds
      setTimeout(() => {
        router.replace('/(onboarding)/onboarding');
      }, 2000);
    };
    checkAndNavigate();
  }, []);

  return (
    <View className="flex-1">
      <SplashScreen />
    </View>
  );
}
