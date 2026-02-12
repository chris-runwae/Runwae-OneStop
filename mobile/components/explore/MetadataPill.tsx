import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components';

interface MetadataPillProps {
  icon: React.ReactNode;
  text: string;
  colors: any;
}

export function MetadataPill({ icon, text, colors }: MetadataPillProps) {
  return (
    <View
      style={[
        styles.metadataPill,
        { backgroundColor: colors.borderColors.subtle },
      ]}>
      {icon}
      <Text style={[styles.metadataText, { color: colors.textColors.default }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metadataPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  metadataText: {
    fontSize: 13,
  },
});
