import React from 'react';
import { Text } from 'react-native';
import { textStyles } from '@/utils/styles';

interface TripContentProps {
  destination: string;
  isDarkMode: boolean;
}

export const TripContent: React.FC<TripContentProps> = ({ destination, isDarkMode }) => {
  return (
    <>
      <Text
        style={{ fontFamily: 'BricolageGrotesque_700Bold' }}
        className={`mb-3 text-center text-3xl ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
        Pack your bags!
      </Text>

      <Text
        className={`mb-8 text-center leading-6 ${textStyles.regular_16} ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
        You're off to {destination}! A confirmation {'\n'}email is on its
        way so be on the lookout {'\n'}for it.
      </Text>
    </>
  );
};
