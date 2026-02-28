import { ArrowLeft } from 'lucide-react-native';
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

import { tripCreationData } from '@/components/trip-creation/tripCreationData';
import { Colors } from '@/constants';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ScreenContainer } from '@/components';
import { useKeyboardVisibility } from '@/hooks/useKeyboardVisibility';
import { useTripValidation } from './TripCreationScreen/hooks/useTripValidation';
import { useTripNavigation } from './TripCreationScreen/hooks/useTripNavigation';
import { useTripCreationState } from './TripCreationScreen/hooks/useTripCreationState';
import { TripCreatedModal } from '@/components/trip-creation/components/TripCreatedModal';
import { ActionButton } from './TripCreationScreen/components/ActionButton';
import { SlideRenderer } from './TripCreationScreen/components/SlideRenderer';

const { width } = Dimensions.get('window');

export default function TripCreationScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const isDarkMode = colorScheme === 'dark';
  const scrollRef = useRef<ScrollView>(null);

  const {
    currentStep,
    setCurrentStep,
    tripData,
    handleUpdateData,
    showSuccessModal,
    setShowSuccessModal,
    isSaving,
    slideAnimation,
    progressAnimation,
    buttonAnimation,
    resetAnimations,
    startAnimations,
  } = useTripCreationState();

  const totalSteps = tripCreationData.length;
  const currentSlide = tripCreationData[currentStep];
  const { isCurrentStepValid } = useTripValidation(currentSlide, tripData);

  const {
    handleNext,
    handleBack,
    handleViewItinerary,
    handleShareDetails,
    handleCloseModal,
  } = useTripNavigation({
    currentStep,
    totalSteps,
    tripData,
    slideAnimation,
    setCurrentStep,
    setShowSuccessModal,
    setIsSaving: () => {},
    scrollRef,
    isCurrentStepValid,
  });

  useEffect(() => {
    progressAnimation.value = withSpring(currentStep / (totalSteps - 1));
    startAnimations();

    return resetAnimations;
  }, [
    currentStep,
    totalSteps,
    progressAnimation,
    startAnimations,
    resetAnimations,
  ]);

  const progressStyle = useAnimatedStyle(() => {
    const progressPercentage = Math.max(10, progressAnimation.value * 100);
    return { width: `${progressPercentage}%` };
  });

  const iskeyboardVisible = useKeyboardVisibility();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <ScreenContainer
        header={{
          leftComponent: (
            <TouchableOpacity onPress={handleBack}>
              <ArrowLeft size={24} color={colors.textColors.default} />
            </TouchableOpacity>
          ),
        }}
        className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 40,
          }}>
          <View style={{ flex: 1 }}>
            <SlideRenderer
              currentStep={currentStep}
              currentSlide={currentSlide}
              slideAnimation={slideAnimation}
              tripData={tripData}
              onUpdateData={handleUpdateData}
              colors={colors}
              isDarkMode={isDarkMode}
              scrollRef={scrollRef}
            />
          </View>

          <View className="items-center gap-y-4 px-6">
            <ActionButton
              onPress={handleNext}
              disabled={!isCurrentStepValid() || isSaving}
              isSaving={isSaving}
              isLastStep={currentStep === totalSteps - 1}
              buttonAnimation={buttonAnimation}
              isValid={isCurrentStepValid()}
            />
          </View>
        </ScrollView>
      </ScreenContainer>

      <TripCreatedModal
        visible={showSuccessModal}
        destination={tripData.destination || 'your destination'}
        onClose={handleCloseModal}
        onViewItinerary={handleViewItinerary}
        onShareDetails={handleShareDetails}
        isDarkMode={isDarkMode}
      />
    </KeyboardAvoidingView>
  );
}
