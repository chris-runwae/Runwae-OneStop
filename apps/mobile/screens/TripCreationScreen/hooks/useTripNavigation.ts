import { useCallback } from 'react';
import { Dimensions } from 'react-native';
import { router } from 'expo-router';
import Animated, { SharedValue } from 'react-native-reanimated';
import { useTrips } from '@/hooks';
import { useUser } from '@clerk/clerk-expo';

const { width } = Dimensions.get('window');

interface UseTripNavigationProps {
  currentStep: number;
  totalSteps: number;
  tripData: any;
  slideAnimation: SharedValue<number>;
  setCurrentStep: (step: number) => void;
  setShowSuccessModal: (show: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  scrollRef: any;
  isCurrentStepValid: () => boolean;
}

export const useTripNavigation = ({
  currentStep,
  totalSteps,
  tripData,
  slideAnimation,
  setCurrentStep,
  setShowSuccessModal,
  setIsSaving,
  scrollRef,
  isCurrentStepValid,
}: UseTripNavigationProps) => {
  const { createTrip } = useTrips();
  const { user } = useUser();

  const defaultCoverImages = [
    'https://plus.unsplash.com/premium_photo-1719843013722-c2f4d69db940?q=80&w=3024&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1476900543704-4312b78632f8?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1711195662184-167579f85e82?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  ];

  const handleSaveTrip = useCallback(async () => {
    try {
      setIsSaving(true);

      await createTrip({
        user_id: user?.id,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        description: tripData.description,
        title: tripData.name,
        cover_image_url:
          tripData.headerImage ??
          defaultCoverImages[
            Math.floor(Math.random() * defaultCoverImages.length)
          ],
        destination: tripData.destination,
        place: tripData.place,
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating trip:', error);
    } finally {
      setIsSaving(false);
    }
  }, [createTrip, user?.id, tripData, setShowSuccessModal, setIsSaving]);

  const handleNext = useCallback(() => {
    if (!isCurrentStepValid()) return;

    slideAnimation.value = 0;

    if (currentStep === totalSteps - 1) {
      handleSaveTrip();
      return;
    }

    setCurrentStep(currentStep + 1);
    scrollRef.current?.scrollTo({
      x: width * (currentStep + 1),
      animated: true,
    });
  }, [
    currentStep,
    totalSteps,
    isCurrentStepValid,
    slideAnimation,
    setCurrentStep,
    scrollRef,
    handleSaveTrip,
  ]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      slideAnimation.value = 0;
      setCurrentStep(currentStep - 1);
      scrollRef.current?.scrollTo({
        x: width * (currentStep - 1),
        animated: true,
      });
    } else {
      router.back();
    }
  }, [currentStep, slideAnimation, setCurrentStep, scrollRef]);

  const handleViewItinerary = useCallback(() => {
    setShowSuccessModal(false);
    router.replace('/(tabs)/trips/index' as any);
  }, [setShowSuccessModal]);

  const handleShareDetails = useCallback(() => {
    setShowSuccessModal(false);
    console.log('Share trip details');
  }, [setShowSuccessModal]);

  const handleCloseModal = useCallback(() => {
    setShowSuccessModal(false);
    router.replace('/(tabs)/trips/index' as any);
  }, [setShowSuccessModal]);

  return {
    handleNext,
    handleBack,
    handleViewItinerary,
    handleShareDetails,
    handleCloseModal,
  };
};
