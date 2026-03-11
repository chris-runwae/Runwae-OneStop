import React from 'react';
import { View, Image } from 'react-native';

export const TripIllustration: React.FC = () => {
  return (
    <View className="mb-6 h-[120px] w-[120px] items-center justify-center overflow-hidden">
      <Image
        source={require('@/assets/images/trip-created.png')}
        className="h-[120px] w-[120px]"
        resizeMode="contain"
      />
    </View>
  );
};
