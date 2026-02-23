import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components';
import { Image } from 'react-native';

const TripEmptyState: React.FC = () => {
  return (
    <View className="flex-1 flex-col items-center justify-center gap-2">
      <Image
        source={require('@/assets/images/no-trip-data.png')}
        className="h-52 w-52"
      />
      <View className="items-center gap-2 px-8">
        <Text className="text-center text-xl font-bold">
          No Planned Trips 😔
        </Text>
        <Text className="text-center text-sm leading-relaxed text-gray-600">
          It looks like you have no active trips planned yet. Click on the
          button below to plan one.
        </Text>
      </View>
    </View>
  );
};

export default TripEmptyState;
