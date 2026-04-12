import { BlurView } from 'expo-blur';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface EventPricingBarProps {
  formattedPrice: string;
  isSoldOut: boolean;
}

const EventPricingBar = ({ formattedPrice, isSoldOut }: EventPricingBarProps) => {
  const insets = useSafeAreaInsets();
  const { dark } = useTheme();

  return (
    <BlurView
      intensity={90}
      tint={dark ? 'dark' : 'light'}
      className="absolute bottom-0 left-0 right-0"
      style={{ paddingBottom: insets.bottom }}>
      <View className="flex-row items-center justify-between px-5 py-4">
        <View>
          <Text className="text-[11px] text-gray-400">Price per person</Text>
          <Text
            className="text-xl font-bold text-primary"
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
            {formattedPrice}
          </Text>
        </View>
        <TouchableOpacity
          className="rounded-2xl bg-primary px-8 py-4"
          activeOpacity={0.85}
          disabled={isSoldOut}>
          <Text
            className="text-base font-bold text-white"
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
            {isSoldOut ? 'Sold Out' : 'Book Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
};

export default EventPricingBar;
