import OnboardingHeader from '@/components/onboarding copy/OnboardingHeader';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OnboardingStep1 = () => {
  const router = useRouter();

  const handleNext = () => {
    router.replace('/(auth)/onboarding-step-2');
  };

  const handleSkip = () => {
    router.replace('/(auth)/signup');
  };

  return (
    <SafeAreaView className="h-screen flex-1 items-center justify-between bg-white px-[20px]">
      <OnboardingHeader currentStep={1} totalSteps={3} onSkip={handleSkip} />

      <View className="w-full flex-1 gap-y-5">
        <View className="mb-2">
          <Image
            source={require('@/assets/images/onboarding-main-1.png')}
            style={{ width: 'auto', height: 332, resizeMode: 'contain' }}
          />
        </View>
        <View className="gap-y-2">
          <Text
            className="text-3xl text-black"
            style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
            Find events worth {'\n'}the trip.
          </Text>

          <Text className="text-sm text-gray-400">
            Concerts, sports, festivals, and more; see what’s {'\n'}happening
            around the world and near you.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        className="bg-primary flex h-[45px] w-full items-center justify-center rounded-full"
        onPress={handleNext}>
        <Text className="text-base font-medium text-white">Next</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default OnboardingStep1;
