import { useTheme } from '@react-navigation/native';
import { CalendarDays } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function TripItineraryTab() {
  const { dark } = useTheme();
  return (
    <View style={styles.container}>
      <CalendarDays size={48} strokeWidth={1} color={dark ? '#4b5563' : '#d1d5db'} />
      <Text style={[styles.heading, { color: dark ? '#ffffff' : '#111827' }]}>
        Your itinerary is empty
      </Text>
      <Text style={[styles.subtext, { color: dark ? '#6b7280' : '#9ca3af' }]}>
        Start adding activities to plan your trip
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  heading: {
    fontSize: 17,
    fontFamily: 'BricolageGrotesque-SemiBold',
    textAlign: 'center',
    marginTop: 8,
  },
  subtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
