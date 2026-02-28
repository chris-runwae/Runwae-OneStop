import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { COLORS } from '@/constants';

interface ActionButtonProps {
  onPress: () => void;
  disabled: boolean;
  isSaving: boolean;
  isLastStep: boolean;
  buttonAnimation: any;
  isValid: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onPress,
  disabled,
  isSaving,
  isLastStep,
  buttonAnimation,
  isValid,
}) => {
  const getButtonText = () => {
    if (isLastStep) {
      return isSaving ? 'Creating Trip...' : 'Create Trip 🥳';
    }
    return 'Next';
  };

  const buttonAnimStyle = useAnimatedStyle(() => ({
    opacity: buttonAnimation.value,
    transform: [
      {
        translateY: interpolate(buttonAnimation.value, [0, 1], [10, 0]),
      },
    ],
  }));

  return (
    <Animated.View style={[buttonAnimStyle, { width: '100%' }]}>
      <TouchableOpacity
        onPress={onPress}
        className="h-[50px] w-full flex-row items-center justify-center rounded-full bg-pink-600 disabled:opacity-30"
        style={{
          opacity: isValid ? 1 : 0.7,
        }}
        disabled={disabled}>
        {isSaving && isLastStep ? (
          <Text
            className="mr-2 text-base font-medium text-white"
            style={{ color: COLORS.white.base }}>
            ⏳
          </Text>
        ) : null}
        <Text
          className="text-base font-medium text-white"
          style={{ color: COLORS.white.base }}>
          {getButtonText()}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
