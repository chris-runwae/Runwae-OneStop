import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';

interface SwitchProps {
  checked: boolean;
  onValueChange: (checked: boolean) => void;
}

const Switch = ({ checked, onValueChange }: SwitchProps) => {
  const marginLeftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(marginLeftAnim, {
      toValue: checked ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [checked, marginLeftAnim]);

  return (
    <Pressable
      onPress={() => onValueChange(!checked)}
      style={{
        backgroundColor: checked ? '#038F46' : '#ADB5BD',
      }}
      className="w-[45px] rounded-full p-[4px]">
      <Animated.View
        className="h-[20px] w-[20px] rounded-full"
        style={{
          backgroundColor: checked ? '#FFFFFF' : '#E9ECEF',
          marginLeft: marginLeftAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 17.3],
          }),
        }}
      />
    </Pressable>
  );
};

export default Switch;
