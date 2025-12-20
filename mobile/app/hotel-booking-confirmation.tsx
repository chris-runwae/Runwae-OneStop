import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import {
  CheckCircle,
  MapPin,
  Calendar,
  Users,
  CreditCard,
} from 'lucide-react-native';

import ScreenContainer from '@/components/containers/ScreenContainer';
import { Text } from '@/components';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { Colors } from '@/constants';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { textStyles } from '@/utils/styles';
import { getHotelDetails } from '@/services/liteapi';
import type { LiteAPIHotelDetails } from '@/types/liteapi.types';

export default function HotelBookingConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookingId: string;
    hotelConfirmationCode: string;
    hotelId: string;
    hotelName: string;
    checkin: string;
    checkout: string;
    price: string;
    currency: string;
  }>();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [hotelDetails, setHotelDetails] = useState<LiteAPIHotelDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColors.default,
    },
    content: {
      padding: 16,
    },
    successContainer: {
      alignItems: 'center',
      marginBottom: 32,
    },
    successIcon: {
      marginBottom: 16,
    },
    successTitle: {
      ...textStyles.bold_20,
      fontSize: 24,
      color: colors.primaryColors.default,
      marginBottom: 8,
      textAlign: 'center',
    },
    successMessage: {
      ...textStyles.subtitle_Regular,
      fontSize: 16,
      color: colors.textColors.subtle,
      textAlign: 'center',
    },
    hotelImage: {
      width: '100%',
      height: 200,
      backgroundColor: colors.borderColors.subtle,
      borderRadius: 12,
      marginBottom: 24,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      ...textStyles.bold_20,
      fontSize: 18,
      marginBottom: 12,
      color: colors.textColors.default,
    },
    infoCard: {
      backgroundColor: colors.borderColors.subtle,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 12,
    },
    infoIcon: {
      width: 24,
      alignItems: 'center',
    },
    infoContent: {
      flex: 1,
    },
    infoLabel: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.subtle,
      marginBottom: 4,
    },
    infoValue: {
      ...textStyles.subtitle_Regular,
      fontSize: 16,
      color: colors.textColors.default,
      fontWeight: '600',
    },
    confirmationCode: {
      ...textStyles.bold_20,
      fontSize: 20,
      color: colors.primaryColors.default,
      fontFamily: 'monospace',
      letterSpacing: 2,
    },
    description: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      color: colors.textColors.default,
      lineHeight: 20,
      marginTop: 12,
    },
    facilitiesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    facilityBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: colors.primaryColors.background,
    },
    facilityText: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.primaryColors.default,
    },
    priceCard: {
      backgroundColor: colors.primaryColors.background,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    priceLabel: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      color: colors.textColors.subtle,
      marginBottom: 4,
    },
    priceValue: {
      ...textStyles.bold_20,
      fontSize: 32,
      color: colors.primaryColors.default,
    },
  });

  useEffect(() => {
    fetchHotelDetails();
  }, []);

  const fetchHotelDetails = async () => {
    try {
      const response = await getHotelDetails(params.hotelId);
      setHotelDetails(response.data);
    } catch (err) {
      console.error('Error fetching hotel details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <ScreenContainer header={{ title: 'Booking Confirmed' }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}>
        <View style={styles.successContainer}>
          <CheckCircle size={64} color={colors.primaryColors.default} />
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successMessage}>
            Your hotel reservation has been successfully completed.
          </Text>
        </View>

        {hotelDetails?.main_photo && (
          <ExpoImage
            source={{ uri: hotelDetails.main_photo }}
            style={styles.hotelImage}
            contentFit="cover"
          />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hotel Information</Text>
          <View style={styles.infoCard}>
            <Text style={[styles.infoValue, { marginBottom: 8 }]}>
              {params.hotelName}
            </Text>
            {hotelDetails && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MapPin size={20} color={colors.textColors.subtle} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoValue}>
                    {hotelDetails.address}, {hotelDetails.city},{' '}
                    {hotelDetails.country}
                  </Text>
                </View>
              </View>
            )}
            {hotelDetails?.hotelDescription && (
              <Text style={styles.description}>
                {hotelDetails.hotelDescription
                  .replace(/<[^>]*>/g, '')
                  .substring(0, 200)}
                ...
              </Text>
            )}
            {hotelDetails?.hotelFacilities &&
              hotelDetails.hotelFacilities.length > 0 && (
                <View style={styles.facilitiesContainer}>
                  {hotelDetails.hotelFacilities
                    .slice(0, 5)
                    .map((facility, index) => (
                      <View key={index} style={styles.facilityBadge}>
                        <Text style={styles.facilityText}>{facility}</Text>
                      </View>
                    ))}
                </View>
              )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Calendar size={20} color={colors.textColors.subtle} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Check-in</Text>
                <Text style={styles.infoValue}>
                  {formatDate(params.checkin)}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Calendar size={20} color={colors.textColors.subtle} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Check-out</Text>
                <Text style={styles.infoValue}>
                  {formatDate(params.checkout)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confirmation</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Booking ID</Text>
            <Text style={styles.confirmationCode}>{params.bookingId}</Text>
            <Text style={[styles.infoLabel, { marginTop: 16 }]}>
              Hotel Confirmation Code
            </Text>
            <Text style={styles.confirmationCode}>
              {params.hotelConfirmationCode}
            </Text>
          </View>
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Total Paid</Text>
          <Text style={styles.priceValue}>
            {params.currency} ${parseFloat(params.price).toFixed(2)}
          </Text>
        </View>

        <PrimaryButton
          title="Back to Explore"
          onPress={() => router.push('/(tabs)/explore')}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
