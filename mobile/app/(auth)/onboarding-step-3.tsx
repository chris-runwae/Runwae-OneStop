import OnboardingHeader from '@/components/onboarding copy/OnboardingHeader';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OnboardingStep3 = () => {
  const router = useRouter();
  const { completeOnboarding } = useAuth();

  const handleGetStarted = () => {
    completeOnboarding();
    router.push('/(auth)/signup');
  };

  const handleBack = () => {
    router.replace('/(auth)/onboarding-step-2');
  };

  const handleSkip = () => {
    router.push('/(auth)/signup');
  };

  return (
    <SafeAreaView className="h-screen flex-1 items-center justify-between bg-white px-[20px]">
      <OnboardingHeader currentStep={3} totalSteps={3} onSkip={handleSkip} />

      <View className="w-full flex-1 gap-y-5">
        <View className="mb-2">
          <Image
            source={require('@/assets/images/onboarding-main-3.png')}
            style={{ width: 'auto', height: 332, resizeMode: 'contain' }}
          />
        </View>
        <View className="gap-y-2">
          <Text
            className="text-3xl text-black"
            style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
            One app, your {'\n'}while trip.
          </Text>

          <Text className="text-sm text-gray-400">
            All your tickets, bookings, activities, and {'\n'}itinerary; all in
            one place.
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-x-2">
        <TouchableOpacity
          className="bg-primary/10 border-primary/20 h-[45px] items-center justify-center rounded-full border px-[40px]"
          onPress={handleBack}>
          <Text className="text-primary text-base font-medium">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-primary h-[45px] w-full flex-1 items-center justify-center rounded-full"
          onPress={handleGetStarted}>
          <Text className="text-base font-medium text-white">Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingStep3;
