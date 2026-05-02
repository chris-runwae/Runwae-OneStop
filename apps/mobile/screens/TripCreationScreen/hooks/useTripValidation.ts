import { validateTripPersonalization } from '@/components/trip-creation/validation/tripValidation';

export const useTripValidation = (currentSlide: any, tripData: any) => {
  const isCurrentStepValid = () => {
    switch (currentSlide.type) {
      case 'destination':
        return tripData.destination && tripData.destination.trim().length > 0;
      case 'dates':
        return tripData.startDate && tripData.endDate;
      case 'personalization':
        const validation = validateTripPersonalization(tripData);
        return validation.success;
      default:
        return false;
    }
  };

  return { isCurrentStepValid };
};
