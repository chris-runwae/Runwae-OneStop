import React from 'react';
import { Modal, View } from 'react-native';
import { TripIllustration } from './Illustration';
import { TripContent } from './Content';
import { TripActions } from './Actions';

interface TripCreatedModalProps {
  visible: boolean;
  destination: string;
  onClose: () => void;
  onViewItinerary: () => void;
  onShareDetails: () => void;
  isDarkMode: boolean;
}

export const TripCreatedModal: React.FC<TripCreatedModalProps> = ({
  visible,
  destination,
  onClose,
  onViewItinerary,
  onShareDetails,
  isDarkMode,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View
          className={`h-[90%] w-full flex-col items-center justify-center rounded-t-[16px] p-8 shadow-lg ${
            isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'
          }`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
          }}>
          <View className="mt-auto flex-col items-center justify-center">
            <TripIllustration />
            <TripContent destination={destination} isDarkMode={isDarkMode} />
          </View>
          
          <TripActions
            onViewItinerary={onViewItinerary}
            onShareDetails={onShareDetails}
            isDarkMode={isDarkMode}
          />
        </View>
      </View>
    </Modal>
  );
};
