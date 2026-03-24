import { useState, useCallback } from 'react';
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface TripData {
  destination: string;
  startDate: string | null;
  endDate: string | null;
  name: string;
  description: string;
  headerImage: string | null;
  place: any;
}

export const useTripCreationState = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tripData, setTripData] = useState<Partial<TripData>>({
    destination: '',
    startDate: null,
    endDate: null,
    name: '',
    description: '',
    headerImage: null,
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const slideAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);
  const buttonAnimation = useSharedValue(0);

  const handleUpdateData = useCallback((key: string, value: any) => {
    setTripData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetAnimations = useCallback(() => {
    slideAnimation.value = 0;
    buttonAnimation.value = 0;
  }, [slideAnimation, buttonAnimation]);

  const startAnimations = useCallback(() => {
    slideAnimation.value = withTiming(1, { duration: 300 });
    buttonAnimation.value = withTiming(1, { duration: 400 });
  }, [slideAnimation, buttonAnimation]);

  return {
    currentStep,
    setCurrentStep,
    tripData,
    handleUpdateData,
    showSuccessModal,
    setShowSuccessModal,
    isSaving,
    setIsSaving,
    slideAnimation,
    progressAnimation,
    buttonAnimation,
    resetAnimations,
    startAnimations,
  };
};
