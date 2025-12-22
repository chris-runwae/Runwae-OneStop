import { StyleSheet, View } from 'react-native';
import React from 'react';

import { ScreenContainer, Text } from '@/components';

const HotelReviewsScreen = () => {
  return (
    <ScreenContainer header={{ title: 'Hotel Reviews' }} leftComponent>
      <Text>Hotel Reviews</Text>
    </ScreenContainer>
  );
};

export default HotelReviewsScreen;

const styles = StyleSheet.create({});
