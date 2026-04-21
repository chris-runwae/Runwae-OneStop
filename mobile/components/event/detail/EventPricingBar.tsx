import { BlurView } from 'expo-blur';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface EventPricingBarProps {
  formattedPrice: string | null;
  isSoldOut: boolean;
  isRegistered: boolean;
  isLoading: boolean;
  onPress: () => void;
}

const EventPricingBar = ({ formattedPrice, isSoldOut, isRegistered, isLoading, onPress }: EventPricingBarProps) => {
  const insets = useSafeAreaInsets();
  const { dark } = useTheme();

  const label = isRegistered ? 'Registered ✓' : isSoldOut ? 'Sold Out' : formattedPrice ? 'Book Now' : 'Sign Up Free';
  const disabled = isSoldOut || isRegistered || isLoading;

  return (
    <BlurView intensity={90} tint={dark ? 'dark' : 'light'} className="absolute bottom-0 left-0 right-0" style={{ paddingBottom: insets.bottom }}>
      <View className="flex-row items-center justify-between px-5 py-4">
        {formattedPrice && !isRegistered && (
          <View>
            <Text className="text-[11px] text-gray-400">Price per person</Text>
            <Text className="text-xl font-bold text-primary" style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
              {formattedPrice}
            </Text>
          </View>
        )}
        <TouchableOpacity
          className="rounded-2xl bg-primary px-8 py-4"
          style={[
            { flex: !formattedPrice || isRegistered ? 1 : 0, alignItems: 'center' },
            disabled && { opacity: 0.6 },
          ]}
          activeOpacity={0.85}
          onPress={onPress}
          disabled={disabled}>
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-base font-bold text-white" style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
              {label}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </BlurView>
  );
};

export default EventPricingBar;
