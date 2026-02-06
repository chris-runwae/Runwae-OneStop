import React from 'react';
import { View } from 'react-native';
import { PrimaryButton, Text } from '@/components';
import NoDataIcon from '@/components/icons/NoDataIcon';

interface TripEmptyStateProps {
  onNewTripPress: () => void;
}

const TripEmptyState: React.FC<TripEmptyStateProps> = ({ onNewTripPress }) => {
  return (
    <View className="items-center gap-2 pt-24">
      <NoDataIcon size={275} />
      <View className="items-center gap-2 px-8">
        <Text className="text-center text-xl font-bold">
          No Planned Trips 😔
        </Text>
        <Text className="text-center text-sm leading-relaxed text-gray-600">
          It looks like you have no active trips planned yet. Click on the
          button below to plan one.
        </Text>
      </View>
      <PrimaryButton onPress={onNewTripPress} title="Plan Trip" rounded />
    </View>
  );
};

export default TripEmptyState;
