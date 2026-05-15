import { Car } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Text } from '@/components';
import { AppFonts } from '@/constants';

type Props = {
  distanceKm?: number;
  durationMin?: number;
};

const TravelConnector = ({ distanceKm, durationMin }: Props) => {
  const dark = useColorScheme() === 'dark';
  if (distanceKm == null && durationMin == null) return null;

  const distanceLabel =
    distanceKm != null
      ? `${distanceKm < 10 ? distanceKm.toFixed(1) : Math.round(distanceKm)} km`
      : null;
  const durationLabel =
    durationMin != null ? `${Math.round(durationMin)} min` : null;
  const text = [distanceLabel, durationLabel].filter(Boolean).join(' · ');

  return (
    <View style={styles.row}>
      <View
        style={[styles.line, { backgroundColor: dark ? '#374151' : '#E9ECEF' }]}
      />
      <Animated.View
        entering={FadeIn.duration(160)}
        style={[
          styles.pill,
          {
            backgroundColor: dark ? '#1F1F1F' : '#FFF1F8',
            borderColor: dark ? '#374151' : '#FFD3E6',
          },
        ]}>
        <Car size={11} color={dark ? '#FF6FB1' : '#FF1F8C'} strokeWidth={2} />
        <Text style={[styles.text, { color: dark ? '#FF6FB1' : '#FF1F8C' }]}>
          {text}
        </Text>
      </Animated.View>
    </View>
  );
};

export default TravelConnector;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 84,
    gap: 8,
    marginVertical: 8,
  },
  line: {
    width: 1,
    height: 18,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 99,
  },
  text: {
    fontSize: 10,
    fontFamily: AppFonts.inter.medium,
  },
});
