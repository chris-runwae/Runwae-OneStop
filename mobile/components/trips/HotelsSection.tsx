import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';

import { Spacer, Text } from '@/components';
import { Colors, textStyles } from '@/constants';
import { useHotels } from '@/hooks/useHotels';
import type { TripWithEverything } from '@/hooks/useTripActions';
import type { HotelCitySection } from '@/types/hotel.types';
import HotelCard from './HotelCard';
import { LiteAPIHotelRateItem } from '@/types/liteapi.types';

interface Props {
  trip: TripWithEverything;
}

// Default check-in/out if trip has no dates: today + 1 / today + 2
function defaultDates() {
  const today = new Date();
  const checkin = new Date(today);
  checkin.setDate(today.getDate() + 1);
  const checkout = new Date(today);
  checkout.setDate(today.getDate() + 2);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { checkin: fmt(checkin), checkout: fmt(checkout) };
}

export default function HotelsSection({ trip }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const defaults = useMemo(() => defaultDates(), []);
  const checkin = trip.trip_details?.start_date ?? defaults.checkin;
  const checkout = trip.trip_details?.end_date ?? defaults.checkout;
  const adults = Math.max(1, trip.group_members?.length ?? 1);

  const { data, citySections, loading, error } = useHotels(
    trip.destination_label ?? null,
    checkin,
    checkout,
    adults,
    trip.destination_place_id ?? null
  );

  const sectionTitle = trip.destination_label
    ? `Hotels in ${trip.destination_label}`
    : 'Hotels';

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FF1F8C" />
        <Spacer size={8} vertical />
        <Text style={[styles.hint, { color: colors.textColors.subtle }]}>
          Finding hotels…
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={[styles.hint, { color: colors.textColors.subtle }]}>
          Couldn&apos;t load hotels. Pull to refresh.
        </Text>
      </View>
    );
  }

  if (citySections) {
    // Multiple city sections — each with a horizontal scroll
    const sections = data as HotelCitySection[];
    if (sections.length === 0) return null;

    return (
      <View>
        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
        <Spacer size={12} vertical />

        <FlashList
          data={sections}
          keyExtractor={(s: HotelCitySection) => s.city}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }: { item: HotelCitySection }) => (
            <View key={item.city} style={styles.citySection}>
              <Text style={styles.cityLabel}>{item.city}</Text>
              <Spacer size={10} vertical />
              <FlashList
                data={item.hotels}
                keyExtractor={(h) => h.hotelId}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                renderItem={({ item, index }) => (
                  <View style={styles.horizontalCard}>
                    <HotelCard
                      hotel={item as unknown as LiteAPIHotelRateItem}
                      tripId={trip.id}
                      checkin={checkin}
                      checkout={checkout}
                      adults={adults}
                      imageUri={item.thumbnail}
                      title={item.name}
                      description={item.address}
                      onAdd={() => {}}
                      onViewDetails={() => {}}
                      onOptionsPress={() => {}}
                      style={{
                        marginLeft: index % 2 !== 0 ? 6 : 0, // right column gets left margin
                        marginRight: index % 2 === 0 ? 6 : 0, // left column gets right margin
                      }}
                    />
                  </View>
                )}
              />
              <Spacer size={16} vertical />
            </View>
          )}
        />
      </View>
    );
  }

  // Single destination — flat vertical list
  const hotels = data as LiteAPIHotelRateItem[];

  if (hotels.length === 0) return null;

  return (
    <View>
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>
      <Spacer size={12} vertical />
      <FlashList
        data={hotels}
        keyExtractor={(h) => h.hotelId}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <HotelCard
            hotel={item as unknown as LiteAPIHotelRateItem}
            tripId={trip.id}
            checkin={checkin}
            checkout={checkout}
            adults={adults}
            imageUri={item.thumbnail}
            title={item.name}
            description={item.address}
            onAdd={() => {}}
            onViewDetails={() => {}}
            onOptionsPress={() => {}}
            style={{
              marginLeft: index % 2 !== 0 ? 6 : 0, // right column gets left margin
              marginRight: index % 2 === 0 ? 6 : 0, // left column gets right margin
            }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  hint: {
    ...textStyles.regular_14,
    fontSize: 13,
  },
  sectionTitle: {
    ...textStyles.bold_20,
    fontSize: 17,
  },
  cityLabel: {
    ...textStyles.regular_14,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#FF1F8C',
    fontWeight: '700',
  },
  citySection: {},
  horizontalList: {
    paddingRight: 16,
  },
  horizontalCard: {
    // width: 260,
    marginRight: 12,
  },
});
