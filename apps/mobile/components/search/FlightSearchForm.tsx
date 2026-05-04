import LocationPicker from '@/components/search/LocationPicker';
import PassengerStepper from '@/components/search/PassengerStepper';
import DateModal from '@/components/trips/edit/DateModal';
import {
  useFlightSearchState,
  type TripType,
} from '@/hooks/useFlightSearchState';
import { useTheme } from '@react-navigation/native';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { ArrowRight, Calendar, MapPin, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Sheet = 'origin' | 'destination' | 'dates' | 'passengers' | null;

export default function FlightSearchForm() {
  const { dark } = useTheme();
  const router = useRouter();
  const [sheet, setSheet] = useState<Sheet>(null);
  const {
    state,
    setOrigin,
    setDestination,
    setDepart,
    setReturnDate,
    setAdults,
    setTripType,
    isValid,
    toQueryParams,
  } = useFlightSearchState();

  const formatDateLabel = (iso: string | null) =>
    iso ? format(new Date(iso), 'MMM d, yyyy') : 'Select date';

  const dateLabel =
    state.tripType === 'one-way'
      ? formatDateLabel(state.depart)
      : `${formatDateLabel(state.depart)} → ${formatDateLabel(state.returnDate)}`;

  const onSearch = () => {
    const params = toQueryParams();
    if (!params) return;
    router.push({ pathname: '/flights/results', params });
  };

  const onTripTypeChange = (next: TripType) => setTripType(next);

  const onDatesSelected = (startId: string, endId: string) => {
    setDepart(startId);
    if (state.tripType === 'round-trip') {
      setReturnDate(endId === startId ? null : endId);
    } else {
      setReturnDate(null);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: dark ? '#fff' : '#000' }]}>
          Where are you flying?
        </Text>
      </View>

      <View style={styles.tripTypeRow}>
        {(['one-way', 'round-trip'] as TripType[]).map((tt) => {
          const active = state.tripType === tt;
          return (
            <Pressable
              key={tt}
              onPress={() => onTripTypeChange(tt)}
              style={[
                styles.tripPill,
                {
                  backgroundColor: active
                    ? '#FF1F8C'
                    : dark
                      ? '#1c1c1e'
                      : '#f3f4f6',
                },
              ]}>
              <Text
                style={{
                  color: active
                    ? '#fff'
                    : dark
                      ? '#9ca3af'
                      : '#6b7280',
                  fontWeight: active ? '700' : '500',
                  fontSize: 13,
                }}>
                {tt === 'one-way' ? 'One-way' : 'Round-trip'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FieldRow
        icon={<MapPin size={18} color="#FF1F8C" />}
        label="From"
        value={state.origin ? `${state.origin.iata} · ${state.origin.city}` : 'Select origin'}
        placeholder={!state.origin}
        dark={dark}
        onPress={() => setSheet('origin')}
      />
      <FieldRow
        icon={<MapPin size={18} color="#FF1F8C" />}
        label="To"
        value={
          state.destination
            ? `${state.destination.iata} · ${state.destination.city}`
            : 'Select destination'
        }
        placeholder={!state.destination}
        dark={dark}
        onPress={() => setSheet('destination')}
      />
      <FieldRow
        icon={<Calendar size={18} color="#FF1F8C" />}
        label={state.tripType === 'one-way' ? 'Date' : 'Dates'}
        value={dateLabel}
        placeholder={!state.depart}
        dark={dark}
        onPress={() => setSheet('dates')}
      />
      <FieldRow
        icon={<Users size={18} color="#FF1F8C" />}
        label="Passengers"
        value={`${state.adults} adult${state.adults > 1 ? 's' : ''}`}
        placeholder={false}
        dark={dark}
        onPress={() => setSheet('passengers')}
      />

      <Pressable
        onPress={onSearch}
        disabled={!isValid}
        style={[
          styles.searchBtn,
          { opacity: isValid ? 1 : 0.4 },
        ]}>
        <Text style={styles.searchBtnText}>Search flights</Text>
        <ArrowRight size={18} color="#fff" />
      </Pressable>

      <LocationPicker
        visible={sheet === 'origin'}
        title="Choose origin"
        onClose={() => setSheet(null)}
        onSelect={(a) => setOrigin(a)}
        excludeIata={state.destination?.iata}
      />
      <LocationPicker
        visible={sheet === 'destination'}
        title="Choose destination"
        onClose={() => setSheet(null)}
        onSelect={(a) => setDestination(a)}
        excludeIata={state.origin?.iata}
      />
      <DateModal
        visible={sheet === 'dates'}
        onClose={() => setSheet(null)}
        onSelect={onDatesSelected}
        initialStartDate={state.depart ?? undefined}
        initialEndDate={state.returnDate ?? undefined}
      />
      <PassengerStepper
        visible={sheet === 'passengers'}
        initialAdults={state.adults}
        onClose={() => setSheet(null)}
        onConfirm={setAdults}
      />
    </View>
  );
}

function FieldRow({
  icon,
  label,
  value,
  placeholder,
  dark,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder: boolean;
  dark: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fieldRow,
        {
          backgroundColor: dark ? '#1c1c1e' : '#ffffff',
          borderColor: dark ? '#27272a' : '#E9ECEF',
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      <View
        style={[
          styles.fieldIconWrap,
          { backgroundColor: dark ? '#0d0d0d' : '#FFE5F0' },
        ]}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text
          style={[
            styles.fieldValue,
            {
              color: placeholder ? '#9ca3af' : dark ? '#fff' : '#000',
              fontWeight: placeholder ? '400' : '600',
            },
          ]}
          numberOfLines={1}>
          {value}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 8, gap: 12 },
  headerRow: { paddingHorizontal: 4 },
  heading: { fontSize: 18, fontWeight: '600' },
  tripTypeRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 4, marginVertical: 4 },
  tripPill: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999 },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  fieldIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: { fontSize: 12, color: '#9ca3af', marginBottom: 4, fontWeight: '500' },
  fieldValue: { fontSize: 15 },
  searchBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FF1F8C',
    paddingVertical: 16,
    borderRadius: 999,
  },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
