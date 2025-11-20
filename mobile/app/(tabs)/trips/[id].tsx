import { StyleSheet } from 'react-native';
import React from 'react';
import { ScreenContainer, Text } from '@/components';
import { useLocalSearchParams } from 'expo-router';

const TripsDetailsScreen = () => {
  const { id } = useLocalSearchParams();

  return (
    <ScreenContainer leftComponent>
      <Text>{id}</Text>
    </ScreenContainer>
  );
};

export default TripsDetailsScreen;

const styles = StyleSheet.create({});
