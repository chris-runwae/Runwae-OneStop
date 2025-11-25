import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';

import { useHotels, useColorScheme } from '@/hooks';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';

const TripDiscoverySection = () => {
  const { hotels, loading, error, fetchHotels } = useHotels();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const dynamicStyles = StyleSheet.create({
    emptyText: {
      color: colors.textColors.subtle,
    },
  });

  useEffect(() => {
    fetchHotels();
  }, []);

  console.log(JSON.stringify(hotels?.data?.slice(0, 10)));

  if (loading) {
    return (
      <ActivityIndicator size="large" color={colors.primaryColors.default} />
    );
  }
  return (
    <View>
      <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
        Discover content coming soon
      </Text>
    </View>
  );
};

export default TripDiscoverySection;

const styles = StyleSheet.create({
  emptyText: {
    ...textStyles.subtitle_Regular,
    fontSize: 14,
    lineHeight: 19.5,
  },
});
