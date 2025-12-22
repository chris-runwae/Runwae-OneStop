import { StyleSheet, View } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';

import { ScreenWithImageGallery, Text } from '@/components';

const BookingScreen = () => {
  const { images } = useLocalSearchParams<{ images: string[] | string }>();
  console.log('images: ', JSON.parse(images as string));

  return (
    <ScreenWithImageGallery images={images}>
      <Text>Booking</Text>
    </ScreenWithImageGallery>
  );
};

export default BookingScreen;
