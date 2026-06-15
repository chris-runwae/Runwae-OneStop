import Constants from 'expo-constants';
import React from 'react';
import { NativeModules, Platform } from 'react-native';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';

/**
 * Checks if the native Stripe SDK is available in the current binary.
 */
export const isStripeAvailable = !!NativeModules.StripeSdk;

/**
 * The Apple Pay merchant identifier for the running variant.
 *
 * Single source of truth is `VARIANT_CONFIG[variant].stripeMerchantIdentifier`
 * in app.config.ts, which is (a) baked into the iOS entitlements via the
 * @stripe/stripe-react-native plugin and (b) surfaced here through `extra`.
 * Apple Pay only works when the id passed to initPaymentSheet matches the
 * entitlement id, so every payment screen MUST use this constant rather than
 * hardcoding a value. The fallback is the production id and should never be
 * hit when `extra` is populated by app.config.ts.
 */
export const STRIPE_MERCHANT_IDENTIFIER =
  (
    Constants.expoConfig?.extra as
      | { stripeMerchantIdentifier?: string }
      | undefined
  )?.stripeMerchantIdentifier ?? 'merchant.app.runwae.io';

/**
 * A safe version of StripeProvider that doesn't crash the app if the native module is missing.
 */
export const StripeProviderSafe: typeof StripeProvider = ({ children, ...props }) => {
  if (!isStripeAvailable) {
    if (__DEV__) {
      console.warn(
        '[StripeSafe] Native StripeSdk module not found. Payments will be disabled. ' +
        'Please run "npx expo prebuild --clean && npx expo run:ios" to link it properly.'
      );
    }
    return <>{children}</>;
  }

  return <StripeProvider {...props}>{children}</StripeProvider>;
};

/**
 * A safe version of useStripe hook that returns mocks if the native module is missing.
 */
export const useStripeSafe = () => {
  const realStripe = useStripe();

  if (!isStripeAvailable) {
    return {
      initPaymentSheet: async () => ({ error: { code: 'Failed', message: 'Stripe native module not found' } }),
      presentPaymentSheet: async () => ({ error: { code: 'Failed', message: 'Stripe native module not found' } }),
      confirmPayment: async () => ({ error: { code: 'Failed', message: 'Stripe native module not found' } }),
      // Add other mocked methods here as needed
    } as any;
  }

  return realStripe;
};
