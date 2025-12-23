import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import {
  useLocalSearchParams,
  router,
  RelativePathString,
  useSegments,
} from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { Calendar } from 'lucide-react-native';

import {
  ScreenContainer,
  Text,
  Spacer,
  PrimaryButton,
  HomeScreenSkeleton,
} from '@/components';
import { Colors, COLORS } from '@/constants';
import { textStyles } from '@/utils/styles';
import { useHotels, useTrips } from '@/hooks';
import type { LiteAPIRate, LiteAPIHotelRate } from '@/types/liteapi.types';

interface RoomWithRate {
  roomId: number;
  roomName: string;
  description?: string;
  photos?: Array<{ url: string }>;
  rate: LiteAPIRate;
  offerId: string;
}

const RoomListScreen = () => {
  const { hotelId, tripId: tripIdParam } = useLocalSearchParams<{
    hotelId: string;
    tripId?: string;
  }>();
  const segments = useSegments();
  // Try to extract trip ID from route segments (e.g., ['(tabs)', 'trips', 'tripId', 'hotels', ...])
  const tripIdFromRoute = segments.find(
    (seg) =>
      seg !== '(tabs)' &&
      seg !== 'trips' &&
      seg !== 'hotels' &&
      seg !== 'room' &&
      seg !== 'list'
  );
  const tripId = tripIdParam || tripIdFromRoute;

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { hotel, fetchHotelById } = useHotels();
  const { fetchTripById } = useTrips();

  const [loading, setLoading] = useState(true);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [rates, setRates] = useState<LiteAPIHotelRate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trip, setTrip] = useState<any>(null);

  // Date state
  const [checkin, setCheckin] = useState<Date>(new Date());
  const [checkout, setCheckout] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  });
  const [showCheckinPicker, setShowCheckinPicker] = useState(false);
  const [showCheckoutPicker, setShowCheckoutPicker] = useState(false);

  // Occupancy state
  const [adults, setAdults] = useState(1);

  const dynamicStyles = StyleSheet.create({
    dateContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    dateButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.backgroundColors.subtle,
      borderWidth: 1,
      borderColor: colors.borderColors.default,
    },
    dateButtonText: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.subtle,
      marginBottom: 4,
    },
    dateButtonValue: {
      ...textStyles.bold_16,
      fontSize: 14,
      color: colors.textColors.default,
    },
    guestsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.backgroundColors.subtle,
      borderWidth: 1,
      borderColor: colors.borderColors.default,
      marginBottom: 16,
    },
    guestButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primaryColors.default,
      alignItems: 'center',
      justifyContent: 'center',
    },
    guestButtonText: {
      ...textStyles.bold_16,
      fontSize: 18,
      color: COLORS.white.base,
    },
    guestCount: {
      ...textStyles.bold_16,
      fontSize: 16,
      color: colors.textColors.default,
      minWidth: 30,
      textAlign: 'center',
    },
    roomCard: {
      backgroundColor: colors.backgroundColors.default,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.borderColors.default,
    },
    roomImage: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      marginBottom: 12,
    },
    roomName: {
      ...textStyles.bold_20,
      fontSize: 18,
      color: colors.textColors.default,
      marginBottom: 8,
    },
    roomDescription: {
      ...textStyles.regular_14,
      fontSize: 14,
      color: colors.textColors.subtle,
      marginBottom: 12,
    },
    rateContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.borderColors.subtle,
    },
    ratePrice: {
      ...textStyles.bold_20,
      fontSize: 20,
      color: colors.primaryColors.default,
    },
    rateInfo: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.subtle,
    },
    errorText: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      color: colors.destructiveColors.default,
      textAlign: 'center',
      padding: 16,
    },
  });

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for display
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Fetch trip data if tripId is provided
  useEffect(() => {
    const loadTrip = async () => {
      if (tripId) {
        try {
          const tripData = await fetchTripById(tripId);
          if (tripData && !Array.isArray(tripData)) {
            setTrip(tripData);
            if (tripData?.start_date) {
              setCheckin(new Date(tripData?.start_date));
            }
            if (tripData?.end_date) {
              setCheckout(new Date(tripData.end_date));
            }
          }
        } catch (error) {
          console.error('Error fetching trip:', error);
        }
      }
    };
    loadTrip();
  }, [tripId, fetchTripById]);

  // Fetch hotel data
  useEffect(() => {
    const loadHotel = async () => {
      if (hotelId) {
        await fetchHotelById(hotelId);
      }
    };
    loadHotel();
  }, [hotelId, fetchHotelById]);

  // Fetch rates
  const fetchRates = async () => {
    if (!hotelId) return;

    setRatesLoading(true);
    setError(null);

    try {
      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'X-API-Key': 'sand_c0155ab8-c683-4f26-8f94-b5e92c5797b9',
        },
        body: JSON.stringify({
          hotelIds: [hotelId],
          occupancies: [{ adults }],
          currency: 'USD',
          guestNationality: 'US',
          checkin: formatDateForAPI(checkin),
          checkout: formatDateForAPI(checkout),
          roomMapping: true,
        }),
      };

      const response = await fetch(
        'https://api.liteapi.travel/v3.0/hotels/rates',
        options
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch rates');
      }

      // Find the rate for this hotel
      const hotelRate = data.data?.find(
        (rate: LiteAPIHotelRate) => rate.hotelId === hotelId
      );

      if (hotelRate) {
        setRates(hotelRate);
      } else {
        setError('No rates available for this hotel');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rates');
      console.error('Error fetching rates:', err);
    } finally {
      setRatesLoading(false);
      setLoading(false);
    }
  };

  // Fetch rates on mount and when dates/occupancy change
  useEffect(() => {
    if (hotelId) {
      fetchRates();
    }
  }, [hotelId, checkin, checkout, adults]);

  // Combine room data with rates
  const roomsWithRates = useMemo(() => {
    if (!rates || !hotel?.rooms) return [];

    const roomsMap = new Map<number, RoomWithRate[]>();

    rates.roomTypes.forEach((roomType) => {
      roomType.rates.forEach((rate) => {
        if (rate.mappedRoomId) {
          const room = hotel.rooms.find((r: any) => r.id === rate.mappedRoomId);

          if (room) {
            if (!roomsMap.has(rate.mappedRoomId)) {
              roomsMap.set(rate.mappedRoomId, []);
            }
            roomsMap.get(rate.mappedRoomId)!.push({
              roomId: rate.mappedRoomId,
              roomName: room.roomName || rate.name,
              description: room.description,
              photos: room.photos,
              rate,
              offerId: roomType.offerId,
            });
          }
        }
      });
    });

    // Convert map to array and take the first rate for each room
    return Array.from(roomsMap.values()).map((roomRates) => roomRates[0]);
  }, [rates, hotel?.rooms]);

  const handleRoomPress = (room: RoomWithRate) => {
    router.push({
      pathname: '/trips/hotels/room/[id]' as RelativePathString,
      params: {
        roomId: room.roomId.toString(),
        hotelId: hotelId as string,
        offerId: room.offerId,
        checkin: formatDateForAPI(checkin),
        checkout: formatDateForAPI(checkout),
        adults: adults.toString(),
      },
    });
  };

  const RoomCard = ({ room }: { room: RoomWithRate }) => {
    const mainPhoto =
      room.photos && room.photos.length > 0
        ? room.photos[0].url
        : hotel?.main_photo;

    return (
      <Pressable
        style={dynamicStyles.roomCard}
        onPress={() => handleRoomPress(room)}>
        {mainPhoto && (
          <Image
            source={{ uri: mainPhoto }}
            style={dynamicStyles.roomImage}
            contentFit="cover"
          />
        )}
        <Text style={dynamicStyles.roomName}>{room.roomName}</Text>
        {room.description && (
          <Text style={dynamicStyles.roomDescription} numberOfLines={2}>
            {room.description}
          </Text>
        )}
        <View style={dynamicStyles.rateContainer}>
          <View>
            <Text style={dynamicStyles.ratePrice}>
              ${room.rate.retailRate.total[0]?.amount?.toFixed(2) || '0.00'}
            </Text>
            <Text style={dynamicStyles.rateInfo}>
              {room.rate.cancellationPolicies.refundableTag === 'RFN'
                ? 'Refundable'
                : 'Non-refundable'}
            </Text>
          </View>
          <Text style={dynamicStyles.rateInfo}>
            {room.rate.boardName || 'Room only'}
          </Text>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return <HomeScreenSkeleton />;
  }

  return (
    <ScreenContainer
      leftComponent
      contentContainerStyle={{ paddingHorizontal: 16 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Spacer size={16} vertical />

        {/* Date Selection */}
        <View style={dynamicStyles.dateContainer}>
          <Pressable
            style={dynamicStyles.dateButton}
            onPress={() => setShowCheckinPicker(true)}>
            <Text style={dynamicStyles.dateButtonText}>Check-in</Text>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Calendar size={14} color={colors.textColors.default} />
              <Text style={dynamicStyles.dateButtonValue}>
                {formatDateForDisplay(checkin)}
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={dynamicStyles.dateButton}
            onPress={() => setShowCheckoutPicker(true)}>
            <Text style={dynamicStyles.dateButtonText}>Check-out</Text>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Calendar size={14} color={colors.textColors.default} />
              <Text style={dynamicStyles.dateButtonValue}>
                {formatDateForDisplay(checkout)}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Date Pickers */}
        {showCheckinPicker && (
          <DateTimePicker
            value={checkin}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowCheckinPicker(false);
              if (selectedDate) {
                setCheckin(selectedDate);
                // Ensure checkout is after checkin
                if (selectedDate >= checkout) {
                  const newCheckout = new Date(selectedDate);
                  newCheckout.setDate(newCheckout.getDate() + 1);
                  setCheckout(newCheckout);
                }
              }
            }}
          />
        )}

        {showCheckoutPicker && (
          <DateTimePicker
            value={checkout}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date(checkin.getTime() + 24 * 60 * 60 * 1000)}
            onChange={(event, selectedDate) => {
              setShowCheckoutPicker(false);
              if (selectedDate) {
                setCheckout(selectedDate);
              }
            }}
          />
        )}

        {/* Guests Selection */}
        <View style={dynamicStyles.guestsContainer}>
          <Text style={textStyles.bold_16}>Guests</Text>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 12,
            }}>
            <Pressable
              style={dynamicStyles.guestButton}
              onPress={() => setAdults(Math.max(1, adults - 1))}>
              <Text style={dynamicStyles.guestButtonText}>-</Text>
            </Pressable>
            <Text style={dynamicStyles.guestCount}>{adults}</Text>
            <Pressable
              style={dynamicStyles.guestButton}
              onPress={() => setAdults(adults + 1)}>
              <Text style={dynamicStyles.guestButtonText}>+</Text>
            </Pressable>
          </View>
        </View>

        {ratesLoading && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator
              size="large"
              color={colors.primaryColors.default}
            />
            <Spacer size={8} vertical />
            <Text style={dynamicStyles.rateInfo}>Loading rates...</Text>
          </View>
        )}

        {error && <Text style={dynamicStyles.errorText}>{error}</Text>}

        {!ratesLoading && !error && roomsWithRates.length === 0 && (
          <Text style={dynamicStyles.errorText}>No rooms available</Text>
        )}

        {!ratesLoading && !error && roomsWithRates.length > 0 && (
          <>
            <Text
              style={[
                textStyles.bold_20,
                { color: colors.textColors.default, marginBottom: 16 },
              ]}>
              Available Rooms
            </Text>
            {roomsWithRates.map((room) => (
              <RoomCard key={room.roomId} room={room} />
            ))}
          </>
        )}

        <Spacer size={32} vertical />
      </ScrollView>
    </ScreenContainer>
  );
};

export default RoomListScreen;
