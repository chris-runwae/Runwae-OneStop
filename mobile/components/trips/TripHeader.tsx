import React from 'react';
import { Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';

interface TripHeaderProps {
  onNewTripPress: () => void;
}

const TripHeader: React.FC<TripHeaderProps> = ({ onNewTripPress }) => {
  return (
    <Pressable onPress={onNewTripPress} className="p-2">
      <Plus size={24} color={'#db2777'} />
    </Pressable>
  );
};

export default TripHeader;
