import React from 'react';
import { Image, StyleSheet, useColorScheme, View } from 'react-native';
import Text from '../ui/Text';
import Spacer from '../utils/Spacer';
import { Colors, textStyles } from '@/constants';

interface EmptyTripsStateProps {
  title?: string;
  description?: string;
}

const EmptyTripsState = ({
  title = 'No Trips Booked Yet',
  description = 'Tap the + below to start planning your\nnext adventure!',
}: EmptyTripsStateProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.backgroundColors.default },
      ]}>
      <Spacer size={40} vertical />
      <Image
        source={require('@/assets/images/trip-empty-state-2.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={[styles.title]}>{title}</Text>
      <Text style={[styles.description]}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  title: {
    ...textStyles.textHeading20,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    ...textStyles.textBody14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EmptyTripsState;
