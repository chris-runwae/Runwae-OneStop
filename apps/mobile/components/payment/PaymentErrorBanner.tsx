import { AlertCircle, X } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';

import { Text } from '@/components';
import { AppFonts } from '@/constants';

type Props = {
  message: string;
  onDismiss: () => void;
};

/**
 * Inline banner shown above the Pay CTA when a payment attempt fails in a
 * recoverable way (card declined, network blip). Stays put until the user
 * dismisses or retries — replaces Alert.alert which dropped messages on tap
 * and felt jarring inside the payment flow.
 *
 * For *fatal* errors (Stripe Payment Sheet never initialised) keep using
 * the existing `initError` text — different surface, different meaning.
 */
const PaymentErrorBanner = ({ message, onDismiss }: Props) => {
  const dark = useColorScheme() === 'dark';
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: dark ? '#3A1424' : '#FFF1F8',
          borderColor: dark ? '#7A1B47' : '#FFD3E6',
        },
      ]}>
      <AlertCircle size={16} color={dark ? '#FF6FB1' : '#FF1F8C'} />
      <Text style={[styles.message, { color: dark ? '#FF8AC3' : '#B30C5C' }]}>
        {message}
      </Text>
      <Pressable hitSlop={10} onPress={onDismiss} style={styles.dismiss}>
        <X size={14} color={dark ? '#FF6FB1' : '#FF1F8C'} />
      </Pressable>
    </View>
  );
};

export default PaymentErrorBanner;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  message: {
    flex: 1,
    fontSize: 13,
    lineHeight: 17,
    fontFamily: AppFonts.inter.medium,
  },
  dismiss: {
    padding: 2,
  },
});
