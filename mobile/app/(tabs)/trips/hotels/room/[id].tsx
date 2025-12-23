import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { RelativePathString, router, useLocalSearchParams } from 'expo-router';

import {
  Text,
  Spacer,
  PrimaryButton,
  HomeScreenSkeleton,
  InfoPill,
  ScreenWithImageGallery,
  Collapsible,
} from '@/components';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';
import { useHotels } from '@/hooks';

const RoomDetailScreen = () => {
  const { roomId, hotelId, offerId, checkin, checkout, adults } =
    useLocalSearchParams<{
      roomId: string;
      hotelId: string;
      offerId?: string;
      checkin?: string;
      checkout?: string;
      adults?: string;
    }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { hotel, loading, fetchHotelById, fetchRoomRates, roomRates } =
    useHotels();

  const [rate, setRate] = useState<any>(null);
  const [rateLoading, setRateLoading] = useState(false);

  console.log('roomRates: ', JSON.stringify(roomId));

  // Memoize styles to prevent recreation on every render
  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        image: {
          width: '100%',
          height: 300,
          borderRadius: 16,
          marginBottom: 16,
        },
        title: {
          ...textStyles.bold_20,
          fontSize: 24,
          color: colors.textColors.default,
          marginBottom: 8,
        },
        description: {
          ...textStyles.regular_14,
          fontSize: 14,
          lineHeight: 20,
          color: colors.textColors.subtle,
          marginBottom: 16,
        },
        infoRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 16,
        },
        sectionTitle: {
          ...textStyles.bold_20,
          fontSize: 18,
          color: colors.textColors.default,
          marginBottom: 12,
        },
        amenityItem: {
          padding: 8,
          borderRadius: 8,
          backgroundColor: colors.backgroundColors.subtle,
          marginRight: 8,
          marginBottom: 8,
        },
        amenityText: {
          ...textStyles.regular_14,
          fontSize: 12,
          color: colors.textColors.default,
        },
        rateContainer: {
          backgroundColor: colors.backgroundColors.subtle,
          padding: 16,
          borderRadius: 12,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: colors.borderColors.default,
        },
        ratePrice: {
          ...textStyles.bold_20,
          fontSize: 28,
          color: colors.primaryColors.default,
          marginBottom: 4,
        },
        rateInfo: {
          ...textStyles.subtitle_Regular,
          fontSize: 12,
          color: colors.textColors.subtle,
          marginBottom: 2,
        },
        divider: {
          height: 1,
          backgroundColor: colors.borderColors.subtle,
          marginVertical: 16,
        },
        bedTypeContainer: {
          padding: 12,
          backgroundColor: colors.backgroundColors.subtle,
          borderRadius: 8,
          marginBottom: 8,
        },
        bedTypeText: {
          ...textStyles.regular_14,
          fontSize: 14,
          color: colors.textColors.default,
        },
      }),
    [colors]
  );

  // Find the room from hotel data
  const room = useMemo(() => {
    if (!hotel?.rooms || !roomId) return null;
    return hotel.rooms.find((r: any) => r.id === parseInt(roomId));
  }, [hotel?.rooms, roomId]);

  // Fetch hotel data - use useCallback to prevent infinite loops
  const loadHotel = useCallback(async () => {
    if (hotelId) {
      await fetchHotelById(hotelId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  useEffect(() => {
    loadHotel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch rate if offerId is provided - memoize to prevent unnecessary calls
  const loadRate = useCallback(async () => {
    if (!hotelId || !offerId || !checkin || !checkout) return;

    setRateLoading(true);
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
          occupancies: [{ adults: parseInt(adults || '1') }],
          currency: 'USD',
          guestNationality: 'US',
          checkin,
          checkout,
          roomMapping: true,
        }),
      };

      const body = {
        hotelIds: [hotelId],
        occupancies: [{ adults: parseInt(adults || '1') }],
        currency: 'USD',
        guestNationality: 'US',
        checkin,
        checkout,
        roomMapping: true,
      };

      const response = await fetchRoomRates(body);

      //W
      if (response?.data) {
        console.log('This was successful');
        //We need to find the the rates
        // const hotelRate = response?.data?.find(
        //   (r: any) => r.hotelId === hotelId
        // );
        // console.log('hotelRate: ', JSON.stringify(hotelRate));
        // if (hotelRate) {
        //   // Find the specific rate by offerId
        //   for (const roomType of hotelRate.roomTypes) {
        //     if (roomType.offerId === offerId) {
        //       setRate(roomType.rates[0]); // Get first rate
        //       break;
        //     }
        //   }
        // }
      }
    } catch (error) {
      console.error('Error fetching rate:', error);
    } finally {
      setRateLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, offerId, checkin, checkout, adults]);

  useEffect(() => {
    if (!rateLoading) {
      loadRate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, offerId, checkin, checkout, adults]);

  if (loading || !room) {
    return <HomeScreenSkeleton />;
  }

  return (
    <ScreenWithImageGallery
      images={room?.photos}
      header={{ title: room.roomName }}
      leftComponent>
      {/* Room Name */}
      <Text style={dynamicStyles.title}>{room.roomName}</Text>

      {/* Room Info */}
      <View style={dynamicStyles.infoRow}>
        {room.maxAdults && (
          <InfoPill
            type="destination"
            value={`${room.maxAdults} Adult${room.maxAdults > 1 ? 's' : ''}`}
          />
        )}
        {room.maxChildren !== undefined && room.maxChildren > 0 && (
          <InfoPill
            type="destination"
            value={`${room.maxChildren} Child${room.maxChildren > 1 ? 'ren' : ''}`}
          />
        )}
        {room.roomSizeSquare && (
          <InfoPill
            type="destination"
            value={`${room.roomSizeSquare} ${room.roomSizeUnit || 'm²'}`}
          />
        )}
      </View>

      {/* Rate Information */}
      {rate && (
        <View style={dynamicStyles.rateContainer}>
          <Spacer size={16} vertical />
          <Text style={dynamicStyles.ratePrice}>
            ${rate.retailRate.total[0]?.amount?.toFixed(2) || '0.00'}
          </Text>
          <Text style={dynamicStyles.rateInfo}>
            {rate.cancellationPolicies.refundableTag === 'RFN'
              ? 'Refundable'
              : 'Non-refundable'}
          </Text>
          <Text style={dynamicStyles.rateInfo}>
            {rate.boardName || 'Room only'}
          </Text>
          {checkin && checkout && (
            <Text style={dynamicStyles.rateInfo}>
              {new Date(checkin).toLocaleDateString()} -{' '}
              {new Date(checkout).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}

      {/* Description */}
      {room.description && (
        <>
          <Text style={dynamicStyles.description}>{room.description}</Text>
          <Spacer size={16} vertical />
        </>
      )}

      {/* Bed Types */}
      {room.bedTypes && room.bedTypes.length > 0 && (
        <>
          <Collapsible title="Bed Types" iconPosition="right">
            {room.bedTypes.map((bed: any, index: number) => (
              <View key={index} style={dynamicStyles.bedTypeContainer}>
                <Text style={dynamicStyles.bedTypeText}>
                  {bed.quantity}x {bed.bedType}
                  {bed.bedSize && ` (${bed.bedSize})`}
                </Text>
              </View>
            ))}
          </Collapsible>
          <Spacer size={16} vertical />
        </>
      )}

      {/* Room Amenities */}
      {room.roomAmenities && room.roomAmenities.length > 0 && (
        <>
          <Collapsible title="Amenities" iconPosition="right">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {room.roomAmenities.map((amenity: any) => (
                <View
                  key={amenity.amenitiesId}
                  style={dynamicStyles.amenityItem}>
                  <Text style={dynamicStyles.amenityText}>{amenity.name}</Text>
                </View>
              ))}
            </View>
          </Collapsible>
          <Spacer size={16} vertical />
        </>
      )}

      {/* Views */}
      {room.views && room.views.length > 0 && (
        <>
          <Text style={dynamicStyles.sectionTitle}>Views</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {room.views.map((view: any, index: number) => (
              <View key={index} style={dynamicStyles.amenityItem}>
                <Text style={dynamicStyles.amenityText}>{view}</Text>
              </View>
            ))}
          </View>
          <View style={dynamicStyles.divider} />
        </>
      )}

      {/* Booking Button */}
      <Spacer size={16} vertical />
      <PrimaryButton
        title="Book Room"
        onPress={() => {
          // Only pass essential data, not the entire photos array
          router.push({
            pathname: '/trips/hotels/room/booking' as RelativePathString,
            params: {
              roomId: roomId as string,
              hotelId: hotelId as string,
              offerId: offerId || '',
              checkin: checkin || '',
              checkout: checkout || '',
              adults: adults || '1',
            },
          });
        }}
      />

      <Spacer size={150} vertical />
    </ScreenWithImageGallery>
  );
};

export default RoomDetailScreen;
