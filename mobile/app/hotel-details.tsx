import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { MapPin, Star, ChevronRight } from 'lucide-react-native';

import ScreenContainer from '@/components/containers/ScreenContainer';
import { Text } from '@/components';
import { Colors } from '@/constants';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { textStyles } from '@/utils/styles';
import { searchRates, getHotelDetails } from '@/services/liteapi';
import type {
  LiteAPIHotelDetails,
  LiteAPIHotelRate,
} from '@/types/liteapi.types';

export default function HotelDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    hotelId: string;
    checkin: string;
    checkout: string;
    guests: string;
  }>();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [loading, setLoading] = useState(true);
  const [hotelDetails, setHotelDetails] = useState<LiteAPIHotelDetails | null>(
    null
  );
  const [rates, setRates] = useState<LiteAPIHotelRate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColors.default,
    },
    content: {
      padding: 16,
    },
    hotelImage: {
      width: '100%',
      height: 250,
      backgroundColor: colors.borderColors.subtle,
      marginBottom: 16,
      borderRadius: 12,
    },
    hotelName: {
      ...textStyles.bold_20,
      fontSize: 24,
      marginBottom: 8,
      color: colors.textColors.default,
    },
    hotelAddress: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      color: colors.textColors.subtle,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    hotelRating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 16,
    },
    ratingText: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      color: colors.textColors.default,
    },
    description: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      color: colors.textColors.default,
      marginBottom: 24,
      lineHeight: 20,
    },
    sectionTitle: {
      ...textStyles.bold_20,
      fontSize: 20,
      marginBottom: 16,
      color: colors.textColors.default,
    },
    roomSection: {
      marginBottom: 24,
    },
    roomTitle: {
      ...textStyles.bold_20,
      fontSize: 18,
      marginBottom: 12,
      color: colors.textColors.default,
    },
    rateCard: {
      backgroundColor: colors.borderColors.subtle,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.borderColors.default,
    },
    rateHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    rateInfo: {
      flex: 1,
    },
    rateName: {
      ...textStyles.subtitle_Regular,
      fontSize: 16,
      fontWeight: '600',
      color: colors.textColors.default,
      marginBottom: 4,
    },
    rateBoard: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      color: colors.textColors.subtle,
    },
    ratePrice: {
      ...textStyles.bold_20,
      fontSize: 24,
      color: colors.primaryColors.default,
    },
    rateDetails: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    rateBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: colors.primaryColors.background,
    },
    rateBadgeText: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.primaryColors.default,
    },
    selectButton: {
      marginTop: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: colors.primaryColors.default,
      alignItems: 'center',
    },
    selectButtonText: {
      ...textStyles.bold_20,
      fontSize: 16,
      color: colors.white,
    },
    facilitiesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 24,
    },
    facilityBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: colors.borderColors.subtle,
    },
    facilityText: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.default,
    },
    errorContainer: {
      padding: 16,
      alignItems: 'center',
    },
    errorText: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      color: colors.destructiveColors.default,
      textAlign: 'center',
    },
  });

  useEffect(() => {
    fetchHotelData();
  }, []);

  const fetchHotelData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch hotel details and rates in parallel
      const [detailsResponse, ratesResponse] = await Promise.all([
        getHotelDetails(params.hotelId),
        searchRates({
          hotelIds: [params.hotelId],
          occupancies: [{ adults: parseInt(params.guests || '2') }],
          currency: 'USD',
          guestNationality: 'US',
          checkin: params.checkin,
          checkout: params.checkout,
          roomMapping: true,
          includeHotelData: true,
        }),
      ]);

      setHotelDetails(detailsResponse.data);
      const hotelRate = ratesResponse.data?.find(
        (r) => r.hotelId === params.hotelId
      );
      setRates(hotelRate || null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load hotel details'
      );
      console.error('Error fetching hotel data:', err);
    } finally {
      setLoading(false);
    }
  };

  const groupedRates = useMemo(() => {
    if (!rates) return new Map();
    const groups = new Map<number, (typeof rates.roomTypes)[0]['rates']>();
    rates.roomTypes.forEach((roomType) => {
      roomType.rates.forEach((rate) => {
        const roomId = rate.mappedRoomId;
        if (!groups.has(roomId)) {
          groups.set(roomId, []);
        }
        groups.get(roomId)!.push(rate);
      });
    });
    return groups;
  }, [rates]);

  const handleSelectRate = (offerId: string) => {
    router.push({
      pathname: '/hotel-checkout',
      params: {
        hotelId: params.hotelId,
        offerId,
        checkin: params.checkin,
        checkout: params.checkout,
        guests: params.guests,
      },
    });
  };

  if (loading) {
    return (
      <ScreenContainer header={{ title: 'Hotel Details' }}>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator
            size="large"
            color={colors.primaryColors.default}
          />
        </View>
      </ScreenContainer>
    );
  }

  if (error || !hotelDetails) {
    return (
      <ScreenContainer header={{ title: 'Hotel Details' }}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Hotel not found'}</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer header={{ title: hotelDetails.name }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}>
        {hotelDetails.main_photo && (
          <ExpoImage
            source={{ uri: hotelDetails.main_photo }}
            style={styles.hotelImage}
            contentFit="cover"
          />
        )}

        <Text style={styles.hotelName}>{hotelDetails.name}</Text>
        <View style={styles.hotelAddress}>
          <MapPin size={14} color={colors.textColors.subtle} />
          <Text style={{ color: colors.textColors.subtle }}>
            {hotelDetails.address}, {hotelDetails.city}, {hotelDetails.country}
          </Text>
        </View>

        {hotelDetails.starRating > 0 && (
          <View style={styles.hotelRating}>
            <Star
              size={16}
              fill={colors.primaryColors.default}
              color={colors.primaryColors.default}
            />
            <Text style={styles.ratingText}>
              {hotelDetails.starRating} stars
            </Text>
          </View>
        )}

        {hotelDetails.hotelDescription && (
          <Text style={styles.description}>
            {hotelDetails.hotelDescription.replace(/<[^>]*>/g, '')}
          </Text>
        )}

        {hotelDetails.hotelFacilities &&
          hotelDetails.hotelFacilities.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Facilities</Text>
              <View style={styles.facilitiesContainer}>
                {hotelDetails.hotelFacilities
                  .slice(0, 10)
                  .map((facility, index) => (
                    <View key={index} style={styles.facilityBadge}>
                      <Text style={styles.facilityText}>{facility}</Text>
                    </View>
                  ))}
              </View>
            </View>
          )}

        {rates && groupedRates.size > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Available Rooms</Text>
            {Array.from(groupedRates.entries()).map(([roomId, roomRates]) => {
              const firstRate = roomRates[0];
              const roomName = firstRate.name;
              const roomData = hotelDetails.rooms?.find((r) => r.id === roomId);

              return (
                <View key={roomId} style={styles.roomSection}>
                  <Text style={styles.roomTitle}>{roomName}</Text>
                  {roomRates.map((rate) => (
                    <View key={rate.offerId} style={styles.rateCard}>
                      <View style={styles.rateHeader}>
                        <View style={styles.rateInfo}>
                          <Text style={styles.rateName}>{rate.boardName}</Text>
                          <Text style={styles.rateBoard}>Board Type</Text>
                        </View>
                        <Text style={styles.ratePrice}>
                          ${rate.retailRate.total[0]?.amount.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.rateDetails}>
                        <View style={styles.rateBadge}>
                          <Text style={styles.rateBadgeText}>
                            {rate.cancellationPolicies.refundableTag === 'RFN'
                              ? 'Refundable'
                              : 'Non-refundable'}
                          </Text>
                        </View>
                        {rate.retailRate.taxesAndFees?.[0]?.included && (
                          <View style={styles.rateBadge}>
                            <Text style={styles.rateBadgeText}>
                              Taxes included
                            </Text>
                          </View>
                        )}
                      </View>
                      <Pressable
                        style={styles.selectButton}
                        onPress={() => handleSelectRate(rate.offerId)}>
                        <Text style={styles.selectButtonText}>
                          Select This Rate
                        </Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        )}

        {(!rates || groupedRates.size === 0) && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              No rates available for selected dates.
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
