import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { MapPin, Star, ChevronRight } from 'lucide-react-native';

import ScreenContainer from '@/components/containers/ScreenContainer';
import { Text } from '@/components';
import { Colors } from '@/constants';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { textStyles } from '@/utils/styles';
import { searchRates } from '@/services/liteapi';
import type {
  LiteAPIRatesResponse,
  LiteAPIAIHotel,
  LiteAPIHotelRate,
} from '@/types/liteapi.types';

export default function HotelSearchResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    searchType: 'destination' | 'vibe';
    placeId?: string;
    vibeQuery?: string;
    checkin: string;
    checkout: string;
    guests: string;
  }>();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState<LiteAPIAIHotel[]>([]);
  const [rates, setRates] = useState<LiteAPIHotelRate[]>([]);
  const [error, setError] = useState<string | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColors.default,
    },
    content: {
      padding: 16,
    },
    hotelCard: {
      backgroundColor: colors.backgroundColors.default,
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderColors.subtle,
    },
    hotelImage: {
      width: '100%',
      height: 200,
      backgroundColor: colors.borderColors.subtle,
    },
    hotelInfo: {
      padding: 16,
    },
    hotelName: {
      ...textStyles.bold_20,
      fontSize: 18,
      marginBottom: 4,
      color: colors.textColors.default,
    },
    hotelAddress: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      color: colors.textColors.subtle,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    hotelRating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 12,
    },
    ratingText: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      color: colors.textColors.default,
    },
    roomSection: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.borderColors.subtle,
    },
    roomTitle: {
      ...textStyles.bold_20,
      fontSize: 16,
      marginBottom: 8,
      color: colors.textColors.default,
    },
    rateCard: {
      backgroundColor: colors.borderColors.subtle,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    rateHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    rateName: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      fontWeight: '600',
      color: colors.textColors.default,
      flex: 1,
    },
    ratePrice: {
      ...textStyles.bold_20,
      fontSize: 18,
      color: colors.primaryColors.default,
    },
    rateDetails: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 4,
    },
    rateBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      backgroundColor: colors.primaryColors.background,
    },
    rateBadgeText: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.primaryColors.default,
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
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    setError(null);

    try {
      const request = {
        occupancies: [{ adults: parseInt(params.guests || '2') }],
        currency: 'USD',
        guestNationality: 'US',
        checkin: params.checkin,
        checkout: params.checkout,
        roomMapping: true,
        maxRatesPerHotel: 1,
        includeHotelData: true,
        ...(params.searchType === 'destination' && params.placeId
          ? { placeId: params.placeId }
          : {}),
        ...(params.searchType === 'vibe' && params.vibeQuery
          ? { aiSearch: params.vibeQuery }
          : {}),
      };

      const response = await searchRates(request);
      setRates(response.data || []);

      if (response.hotels) {
        setHotels(response.hotels);
      } else {
        // If no hotels array, create one from rates
        const hotelMap = new Map<string, LiteAPIAIHotel>();
        response.data?.forEach((rate) => {
          if (!hotelMap.has(rate.hotelId)) {
            hotelMap.set(rate.hotelId, {
              id: rate.hotelId,
              name: `Hotel ${rate.hotelId}`,
              main_photo: '',
              address: '',
              rating: 0,
            });
          }
        });
        setHotels(Array.from(hotelMap.values()));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search hotels');
      console.error('Error fetching hotels:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHotelRates = (hotelId: string) => {
    return rates.find((r) => r.hotelId === hotelId);
  };

  const getLowestPrice = (hotelRate: LiteAPIHotelRate) => {
    let lowest = Infinity;
    hotelRate.roomTypes.forEach((roomType) => {
      roomType.rates.forEach((rate) => {
        const price = rate.retailRate.total[0]?.amount || 0;
        if (price < lowest) lowest = price;
      });
    });
    return lowest === Infinity ? 0 : lowest;
  };

  const handleSelectHotel = (hotelId: string) => {
    router.push({
      pathname: '/hotel-details',
      params: {
        hotelId,
        checkin: params.checkin,
        checkout: params.checkout,
        guests: params.guests,
      },
    });
  };

  const handleSelectRate = (hotelId: string, offerId: string) => {
    router.push({
      pathname: '/hotel-checkout',
      params: {
        hotelId,
        offerId,
        checkin: params.checkin,
        checkout: params.checkout,
        guests: params.guests,
      },
    });
  };

  if (loading) {
    return (
      <ScreenContainer header={{ title: 'Search Results' }}>
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

  if (error) {
    return (
      <ScreenContainer header={{ title: 'Search Results' }}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer header={{ title: 'Search Results' }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}>
        {hotels.map((hotel) => {
          const hotelRate = getHotelRates(hotel.id);
          if (!hotelRate) return null;

          const lowestPrice = getLowestPrice(hotelRate);
          const groupedRates = useMemo(() => {
            const groups = new Map<
              number,
              (typeof hotelRate.roomTypes)[0]['rates']
            >();
            hotelRate.roomTypes.forEach((roomType) => {
              roomType.rates.forEach((rate) => {
                const roomId = rate.mappedRoomId;
                if (!groups.has(roomId)) {
                  groups.set(roomId, []);
                }
                groups.get(roomId)!.push(rate);
              });
            });
            return groups;
          }, [hotelRate]);

          return (
            <Pressable
              key={hotel.id}
              style={styles.hotelCard}
              onPress={() => handleSelectHotel(hotel.id)}>
              {hotel.main_photo && (
                <ExpoImage
                  source={{ uri: hotel.main_photo }}
                  style={styles.hotelImage}
                  contentFit="cover"
                />
              )}
              <View style={styles.hotelInfo}>
                <Text style={styles.hotelName}>{hotel.name}</Text>
                <View style={styles.hotelAddress}>
                  <MapPin size={14} color={colors.textColors.subtle} />
                  <Text style={{ color: colors.textColors.subtle }}>
                    {hotel.address}
                  </Text>
                </View>
                {hotel.rating > 0 && (
                  <View style={styles.hotelRating}>
                    <Star
                      size={14}
                      fill={colors.primaryColors.default}
                      color={colors.primaryColors.default}
                    />
                    <Text style={styles.ratingText}>
                      {hotel.rating.toFixed(1)}
                    </Text>
                  </View>
                )}

                {Array.from(groupedRates.entries()).map(
                  ([roomId, roomRates]) => {
                    const firstRate = roomRates[0];
                    const roomName = firstRate.name;
                    const roomImage = hotelRate.roomTypes.find((rt) =>
                      rt.rates.some((r) => r.mappedRoomId === roomId)
                    )?.rates[0];

                    return (
                      <View key={roomId} style={styles.roomSection}>
                        <Text style={styles.roomTitle}>{roomName}</Text>
                        {roomRates.map((rate) => (
                          <Pressable
                            key={rate.offerId}
                            style={styles.rateCard}
                            onPress={() =>
                              handleSelectRate(hotel.id, rate.offerId)
                            }>
                            <View style={styles.rateHeader}>
                              <Text style={styles.rateName}>
                                {rate.boardName}
                              </Text>
                              <Text style={styles.ratePrice}>
                                ${rate.retailRate.total[0]?.amount.toFixed(2)}
                              </Text>
                            </View>
                            <View style={styles.rateDetails}>
                              <View style={styles.rateBadge}>
                                <Text style={styles.rateBadgeText}>
                                  {rate.cancellationPolicies.refundableTag ===
                                  'RFN'
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
                          </Pressable>
                        ))}
                      </View>
                    );
                  }
                )}
              </View>
            </Pressable>
          );
        })}

        {hotels.length === 0 && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              No hotels found. Try a different search.
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
