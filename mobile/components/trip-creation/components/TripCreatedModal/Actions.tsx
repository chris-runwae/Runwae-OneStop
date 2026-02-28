import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { textStyles } from '@/utils/styles';

interface TripActionsProps {
  onViewItinerary: () => void;
  onShareDetails: () => void;
  isDarkMode: boolean;
}

export const TripActions: React.FC<TripActionsProps> = ({
  onViewItinerary,
  onShareDetails,
  isDarkMode,
}) => {
  return (
    <View className="mt-auto w-full gap-3">
      <TouchableOpacity
        className="h-[50px] w-full items-center justify-center rounded-full bg-pink-600"
        onPress={onViewItinerary}>
        <Text className={`${textStyles.medium_16} text-white`}>
          View Itinerary
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`h-[50px] w-full items-center justify-center rounded-full border ${
          isDarkMode 
            ? 'border-gray-600 bg-transparent' 
            : 'border-gray-300 bg-transparent'
        }`}
        onPress={onShareDetails}>
        <Text
          className={`${textStyles.medium_16} ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
          Share Details
        </Text>
      </TouchableOpacity>
    </View>
  );
};
