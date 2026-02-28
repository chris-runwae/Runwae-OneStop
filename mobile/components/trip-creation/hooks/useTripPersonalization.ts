import { useState, useCallback } from 'react';
import {
  validateTripPersonalization,
  TripPersonalizationData,
} from '../validation/tripValidation';

interface UseTripPersonalizationProps {
  initialData: Partial<TripPersonalizationData>;
  onUpdateData: (key: string, value: any) => void;
}

export const useTripPersonalization = ({
  initialData,
  onUpdateData,
}: UseTripPersonalizationProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback(
    (field: keyof TripPersonalizationData, value: any) => {
      const result = validateTripPersonalization({
        ...initialData,
        [field]: value,
      });

      if (!result.success) {
        const fieldError = result.error.issues.find(
          (err) => err.path[0] === field
        );
        return fieldError?.message;
      }

      return undefined;
    },
    [initialData]
  );

  const updateField = useCallback(
    (field: keyof TripPersonalizationData, value: any) => {
      const error = validateField(field, value);

      setErrors((prev) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[field] = error;
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });

      onUpdateData(field, value);
    },
    [validateField, onUpdateData]
  );

  const validateAll = useCallback(() => {
    const result = validateTripPersonalization(initialData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const pathKey = err.path[0];
        if (typeof pathKey === 'string') {
          newErrors[pathKey] = err.message;
        }
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [initialData]);

  return {
    errors,
    updateField,
    validateAll,
    isValid: Object.keys(errors).length === 0,
  };
};
