import {
  StyleSheet,
  Pressable,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import React from 'react';

import { Text } from '@/components';
import { Colors } from '@/constants';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};
const PrimaryButton = ({
  title,
  onPress,
  disabled,
  loading,
  style,
}: PrimaryButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, style]}>
      {loading ? (
        <ActivityIndicator size={24} color={Colors.light.textHeading} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </Pressable>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ffdde6',
    borderStyle: 'solid',
    borderColor: '#ffdde6',
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    width: '100%',
    borderRadius: 8,
  },

  add: {
    height: 16,
    width: 16,
  },
  buttonText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
    color: '#ff2e92',
    textAlign: 'left',
  },
});
