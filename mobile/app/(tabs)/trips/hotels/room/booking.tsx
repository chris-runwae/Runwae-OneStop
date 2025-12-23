import { StyleSheet, View } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';

import { ScreenContainer, Text } from '@/components';

const BookingScreen = () => {
  const { roomId } = useLocalSearchParams<{
    roomId: string;
    hotelId?: string;
    offerId?: string;
    checkin?: string;
    checkout?: string;
    adults?: string;
  }>();
  console.log('roomId: ', roomId);

  return (
    <ScreenContainer
      leftComponent
      contentContainerStyle={{ paddingHorizontal: 16 }}>
      <Text>Booking</Text>
    </ScreenContainer>
  );
};

export default BookingScreen;
