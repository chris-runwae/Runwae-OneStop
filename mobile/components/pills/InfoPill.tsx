import { StyleSheet, View, useColorScheme } from 'react-native';
import React from 'react';

import { Text } from '@/components';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';

const InfoPill = ({
  type,
  value,
}: {
  type: 'destination' | 'rating';
  value: string | number;
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const dynamicStyles = StyleSheet.create({
    infoContainer: {
      borderColor: colors.borderColors.default,
      maxWidth: 200,
    },
  });

  const InfoText = () => {
    if (type === 'destination') {
      return (
        <Text style={styles.infoText} numberOfLines={1}>
          📍 {value}
        </Text>
      );
    }
    if (type === 'rating') {
      return (
        <Text style={styles.infoText} numberOfLines={1}>
          ⭐️ {value}
        </Text>
      );
    }
  };
  return (
    <View style={[styles.infoContainer, dynamicStyles.infoContainer]}>
      <InfoText />
    </View>
  );
};

export default InfoPill;

const styles = StyleSheet.create({
  infoContainer: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 99,
  },
  infoText: {
    ...textStyles.subtitle_Regular,
    fontSize: 13,
    lineHeight: 19.5,
  },
});
