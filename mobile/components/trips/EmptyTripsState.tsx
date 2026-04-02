import { Colors, textStyles } from '@/constants';
import React from 'react';
import { Image, StyleSheet, useColorScheme, View } from 'react-native';
import Text from '../ui/Text';

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
    <View style={[styles.container]}>
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
    flex: 1,
  },
  image: {
    width: 50,
    height: 50,
    marginBottom: 24,
  },
  title: {
    ...textStyles.textHeading20,
    textAlign: 'center',
    fontSize: 16,
  },
  description: {
    ...textStyles.textBody14,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 12,
  },
});

export default EmptyTripsState;
