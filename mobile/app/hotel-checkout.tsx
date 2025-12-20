import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import ScreenContainer from '@/components/containers/ScreenContainer';
import { Text } from '@/components';
import { TextInput } from '@/components/inputs/TextInput';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { Colors } from '@/constants';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { textStyles } from '@/utils/styles';
import { prebookOffer, getHotelDetails, bookHotel } from '@/services/liteapi';
import type { LiteAPIPrebookResponse } from '@/types/liteapi.types';

type CheckoutStep = 'details' | 'payment' | 'processing';

export default function HotelCheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    hotelId: string;
    offerId: string;
    checkin: string;
    checkout: string;
    guests: string;
  }>();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [step, setStep] = useState<CheckoutStep>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guest details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  // Prebook data
  const [prebookData, setPrebookData] = useState<
    LiteAPIPrebookResponse['data'] | null
  >(null);
  const [hotelName, setHotelName] = useState('');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColors.default,
    },
    content: {
      padding: 16,
    },
    sectionTitle: {
      ...textStyles.bold_20,
      fontSize: 20,
      marginBottom: 16,
      color: colors.textColors.default,
    },
    inputContainer: {
      marginBottom: 16,
    },
    summaryCard: {
      backgroundColor: colors.borderColors.subtle,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    summaryLabel: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      color: colors.textColors.subtle,
    },
    summaryValue: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      color: colors.textColors.default,
      fontWeight: '600',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.borderColors.default,
    },
    totalLabel: {
      ...textStyles.bold_20,
      fontSize: 18,
      color: colors.textColors.default,
    },
    totalValue: {
      ...textStyles.bold_20,
      fontSize: 18,
      color: colors.primaryColors.default,
    },
    paymentContainer: {
      flex: 1,
      marginTop: 16,
    },
    webView: {
      flex: 1,
      backgroundColor: colors.backgroundColors.default,
    },
    errorContainer: {
      padding: 16,
      backgroundColor: colors.destructiveColors.background,
      borderRadius: 12,
      marginBottom: 16,
    },
    errorText: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      color: colors.destructiveColors.default,
    },
    sandboxNote: {
      padding: 12,
      backgroundColor: colors.primaryColors.background,
      borderRadius: 8,
      marginBottom: 16,
    },
    sandboxNoteText: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.primaryColors.default,
    },
  });

  useEffect(() => {
    fetchHotelName();
  }, []);

  const fetchHotelName = async () => {
    try {
      const response = await getHotelDetails(params.hotelId);
      setHotelName(response.data.name);
    } catch (err) {
      console.error('Error fetching hotel name:', err);
    }
  };

  const handlePrebook = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Please fill in all guest details');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await prebookOffer({
        usePaymentSdk: true,
        offerId: params.offerId,
      });

      setPrebookData(response.data);
      setStep('payment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to prebook offer');
      console.error('Error prebooking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (
    transactionId: string,
    prebookId: string
  ) => {
    setStep('processing');
    setLoading(true);
    setError(null);

    try {
      const response = await bookHotel({
        prebookId,
        holder: {
          firstName,
          lastName,
          email,
        },
        payment: {
          method: 'TRANSACTION_ID',
          transactionId,
        },
        guests: [
          {
            occupancyNumber: 1,
            firstName,
            lastName,
            email,
          },
        ],
      });

      router.replace({
        pathname: '/hotel-booking-confirmation',
        params: {
          bookingId: response.data.bookingId,
          hotelConfirmationCode: response.data.hotelConfirmationCode,
          hotelId: params.hotelId,
          hotelName: response.data.hotel.name,
          checkin: response.data.checkin,
          checkout: response.data.checkout,
          price: response.data.price.toString(),
          currency: response.data.currency,
        },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to complete booking'
      );
      setStep('payment');
      console.error('Error booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentHTML = () => {
    if (!prebookData) return '';

    const returnUrl = Platform.select({
      web: `${typeof window !== 'undefined' ? window.location.origin : ''}/hotel-checkout?prebookId=${prebookData.prebookId}&transactionId=${prebookData.transactionId}`,
      default: `runwae://hotel-checkout?prebookId=${prebookData.prebookId}&transactionId=${prebookData.transactionId}`,
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://payment-wrapper.liteapi.travel/dist/liteAPIPayment.js?v=a1"></script>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: ${colors.backgroundColors.default};
            }
            .container {
              max-width: 500px;
              margin: 0 auto;
            }
            .lp-submit-button {
              width: 100%;
              padding: 14px;
              background: ${colors.primaryColors.default};
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              margin-top: 20px;
            }
            .lp-submit-button:hover {
              opacity: 0.9;
            }
            .lp-submit-button:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div id="targetElement"></div>
          </div>
          <script>
            var liteAPIConfig = {
              publicKey: 'sandbox',
              secretKey: '${prebookData.secretKey}',
              returnUrl: '${returnUrl}',
              targetElement: '#targetElement',
              appearance: { theme: 'flat' },
              options: { business: { name: 'Runwae OneStop' } }
            };
            var liteAPIPayment = new LiteAPIPayment(liteAPIConfig);
            document.addEventListener('DOMContentLoaded', function() {
              liteAPIPayment.handlePayment();
            });
          </script>
        </body>
      </html>
    `;
  };

  const handleOpenPaymentBrowser = async () => {
    if (!prebookData) return;

    // For native platforms, we'll need to create a payment page URL
    // Since we can't easily host HTML, we'll show instructions
    // In a real app, you'd host the payment page on your server
    if (Platform.OS !== 'web') {
      setError(
        'Payment form is currently only available on web. Please complete your booking on the web version.'
      );
      return;
    }

    // For web, the payment form is already rendered in the page
    // The payment SDK will handle the form submission
  };

  useEffect(() => {
    // Handle deep link for payment return
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      if (url.includes('prebookId=') && url.includes('transactionId=')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const prebookId = urlParams.get('prebookId');
        const transactionId = urlParams.get('transactionId');
        if (prebookId && transactionId && prebookData) {
          handlePaymentSuccess(transactionId, prebookId);
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Also check if we're returning from payment (for web)
    if (
      Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      window.location
    ) {
      const urlParams = new URLSearchParams(window.location.search);
      const prebookId = urlParams.get('prebookId');
      const transactionId = urlParams.get('transactionId');
      if (prebookId && transactionId && prebookData && step === 'payment') {
        handlePaymentSuccess(transactionId, prebookId);
      }
    }

    return () => {
      subscription.remove();
    };
  }, [prebookData, step]);

  if (step === 'payment' && prebookData) {
    return (
      <ScreenContainer header={{ title: 'Payment' }}>
        <View style={styles.container}>
          <View style={styles.sandboxNote}>
            <Text style={styles.sandboxNoteText}>
              💳 Sandbox Mode: Use test card 4242 4242 4242 4242, any CVV, any
              future expiration date
            </Text>
          </View>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {Platform.OS === 'web' ? (
            <View style={styles.paymentContainer}>
              {/* @ts-ignore - Web only */}
              {typeof document !== 'undefined' && (
                <div
                  dangerouslySetInnerHTML={{ __html: generatePaymentHTML() }}
                  style={{ width: '100%', minHeight: '400px' }}
                />
              )}
            </View>
          ) : (
            <View style={styles.paymentContainer}>
              <Text
                style={{
                  marginBottom: 16,
                  color: colors.textColors.subtle,
                  textAlign: 'center',
                }}>
                Payment form is currently only available on web. Please complete
                your booking on the web version.
              </Text>
              <PrimaryButton
                title="Back to Search"
                onPress={() => router.back()}
              />
            </View>
          )}
        </View>
      </ScreenContainer>
    );
  }

  if (step === 'processing') {
    return (
      <ScreenContainer header={{ title: 'Processing' }}>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator
            size="large"
            color={colors.primaryColors.default}
          />
          <Text style={{ marginTop: 16, color: colors.textColors.default }}>
            Completing your booking...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer header={{ title: 'Checkout' }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Guest Details</Text>

        <View style={styles.inputContainer}>
          <TextInput
            label="First Name"
            placeholder="Enter first name"
            value={firstName}
            onChangeText={setFirstName}
            isRequired
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            label="Last Name"
            placeholder="Enter last name"
            value={lastName}
            onChangeText={setLastName}
            isRequired
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            label="Email"
            placeholder="Enter email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            isRequired
          />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          Booking Summary
        </Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Hotel</Text>
            <Text style={styles.summaryValue}>{hotelName || 'Loading...'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Check-in</Text>
            <Text style={styles.summaryValue}>
              {new Date(params.checkin).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Check-out</Text>
            <Text style={styles.summaryValue}>
              {new Date(params.checkout).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Guests</Text>
            <Text style={styles.summaryValue}>{params.guests}</Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <PrimaryButton
          title="Continue to Payment"
          onPress={handlePrebook}
          loading={loading}
          disabled={
            loading || !firstName.trim() || !lastName.trim() || !email.trim()
          }
        />
      </ScrollView>
    </ScreenContainer>
  );
}
