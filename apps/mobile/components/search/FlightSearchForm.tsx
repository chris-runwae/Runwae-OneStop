import LocationPicker from '@/components/search/LocationPicker';
import PassengerStepper from '@/components/search/PassengerStepper';
import DateModal from '@/components/trips/edit/DateModal';
import {
  useFlightSearchState,
  type TripType,
} from '@/hooks/useFlightSearchState';
import { useTheme } from "expo-router/react-navigation";
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  ArrowUpDown,
  Calendar,
  MapPin,
  Plane,
  Users,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Sheet = 'origin' | 'destination' | 'dates' | 'passengers' | null;

const PINK = '#FF1F8C';

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
    iso ? format(new Date(iso), 'MMM d') : 'Select date';

  const dateLabel =
    state.tripType === 'one-way'
      ? formatDateLabel(state.depart)
      : `${formatDateLabel(state.depart)}  →  ${formatDateLabel(state.returnDate)}`;

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

  const swapOriginDestination = () => {
    const o = state.origin;
    const d = state.destination;
    setOrigin(d ?? null);
    setDestination(o ?? null);
  };

  const cardBg = dark ? '#1c1c1e' : '#ffffff';
  const borderClr = dark ? '#27272a' : '#EEF0F3';
  const labelClr = dark ? '#9ca3af' : '#6B7280';

  return (
    <Animated.View
      style={styles.wrap}
      entering={FadeIn.duration(280)}
      layout={LinearTransition.springify().damping(18).stiffness(180)}>
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: dark ? '#fff' : '#0F1115' }]}>
          Where are you flying?
        </Text>
        <Text style={[styles.subheading, { color: labelClr }]}>
          Pick your route, dates and travellers.
        </Text>
      </View>

      <TripTypeSegmented
        value={state.tripType}
        onChange={onTripTypeChange}
        dark={dark}
      />

      {/* Route card — From / swap / To grouped together */}
      <View
        style={[
          styles.routeCard,
          {
            backgroundColor: cardBg,
            borderColor: borderClr,
          },
        ]}>
        <RouteRow
          icon={<Plane size={18} color={dark ? '#fff' : '#0F1115'} />}
          label="From"
          value={
            state.origin
              ? `${state.origin.iata} · ${state.origin.city}`
              : 'Select origin'
          }
          placeholder={!state.origin}
          dark={dark}
          onPress={() => setSheet('origin')}
        />

        <View style={styles.divider}>
          <View
            style={[
              styles.dividerLine,
              { backgroundColor: dark ? '#27272a' : '#EEF0F3' },
            ]}
          />
          <Pressable
            onPress={swapOriginDestination}
            hitSlop={12}
            style={({ pressed }) => [
              styles.swapBtn,
              {
                backgroundColor: cardBg,
                borderColor: dark ? '#27272a' : '#EEF0F3',
                transform: [{ scale: pressed ? 0.92 : 1 }],
              },
            ]}>
            <ArrowUpDown size={16} color={PINK} />
          </Pressable>
        </View>

        <RouteRow
          icon={<MapPin size={18} color={dark ? '#fff' : '#0F1115'} />}
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
      </View>

      {/* Dates + Passengers row — split card */}
      <View style={styles.splitRow}>
        <PressableCell
          flex={state.tripType === 'one-way' ? 1 : 1.4}
          dark={dark}
          cardBg={cardBg}
          borderClr={borderClr}
          onPress={() => setSheet('dates')}
          icon={<Calendar size={16} color={dark ? '#fff' : '#0F1115'} />}
          label={state.tripType === 'one-way' ? 'Date' : 'Dates'}
          value={dateLabel}
          placeholder={!state.depart}
        />
        <PressableCell
          flex={1}
          dark={dark}
          cardBg={cardBg}
          borderClr={borderClr}
          onPress={() => setSheet('passengers')}
          icon={<Users size={16} color={dark ? '#fff' : '#0F1115'} />}
          label="Travellers"
          value={`${state.adults} adult${state.adults > 1 ? 's' : ''}`}
          placeholder={false}
        />
      </View>

      <View style={{ height: 14 }} />

      <SearchButton enabled={isValid} onPress={onSearch} />

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
    </Animated.View>
  );
}

function TripTypeSegmented({
  value,
  onChange,
  dark,
}: {
  value: TripType;
  onChange: (t: TripType) => void;
  dark: boolean;
}) {
  const trackBg = dark ? '#1c1c1e' : '#F1F3F5';
  const [trackWidth, setTrackWidth] = useState(0);
  const indicator = useSharedValue(value === 'one-way' ? 0 : 1);

  React.useEffect(() => {
    indicator.value = withSpring(value === 'one-way' ? 0 : 1, {
      damping: 18,
      stiffness: 220,
    });
  }, [value, indicator]);

  const cellWidth = trackWidth > 0 ? (trackWidth - 8) / 2 : 0;
  const animatedIndicator = useAnimatedStyle(() => ({
    transform: [{ translateX: indicator.value * cellWidth }],
  }));

  return (
    <View
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      style={[styles.segWrap, { backgroundColor: trackBg }]}>
      {cellWidth > 0 ? (
        <Animated.View
          style={[
            styles.segIndicator,
            { width: cellWidth },
            animatedIndicator,
            {
              backgroundColor: '#fff',
              shadowColor: '#000',
              shadowOpacity: dark ? 0 : 0.08,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 6,
              elevation: 2,
            },
            dark && { backgroundColor: '#2c2c2e' },
          ]}
        />
      ) : null}
      {(['one-way', 'round-trip'] as TripType[]).map((tt) => {
        const active = value === tt;
        return (
          <Pressable
            key={tt}
            onPress={() => onChange(tt)}
            style={styles.segBtn}>
            <Text
              style={{
                fontSize: 13.5,
                fontWeight: active ? '700' : '500',
                color: active ? (dark ? '#fff' : '#0F1115') : '#9ca3af',
                letterSpacing: 0.1,
              }}>
              {tt === 'one-way' ? 'One-way' : 'Round-trip'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function RouteRow({
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
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.985, { damping: 18, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 18, stiffness: 320 });
        }}
        onPress={onPress}
        style={styles.routeRow}>
        <View style={styles.bareIcon}>{icon}</View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{label}</Text>
          <Text
            numberOfLines={1}
            style={[
              styles.value,
              {
                color: placeholder ? '#9ca3af' : dark ? '#fff' : '#0F1115',
                fontWeight: placeholder ? '500' : '700',
              },
            ]}>
            {value}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function PressableCell({
  flex,
  dark,
  cardBg,
  borderClr,
  onPress,
  icon,
  label,
  value,
  placeholder,
}: {
  flex: number;
  dark: boolean;
  cardBg: string;
  borderClr: string;
  onPress: () => void;
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder: boolean;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={[{ flex }, animatedStyle]}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 18, stiffness: 320 });
        }}
        onPress={onPress}
        style={[
          styles.cell,
          { backgroundColor: cardBg, borderColor: borderClr },
        ]}>
        <View style={styles.cellHead}>
          {icon}
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text
          numberOfLines={1}
          style={[
            styles.cellValue,
            {
              color: placeholder ? '#9ca3af' : dark ? '#fff' : '#0F1115',
              fontWeight: placeholder ? '500' : '700',
            },
          ]}>
          {value}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function SearchButton({
  enabled,
  onPress,
}: {
  enabled: boolean;
  onPress: () => void;
}) {
  const opacity = useSharedValue(enabled ? 1 : 0.45);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    opacity.value = withTiming(enabled ? 1 : 0.45, { duration: 220 });
  }, [enabled, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.searchBtnWrap, animatedStyle]}>
      <Pressable
        onPress={onPress}
        disabled={!enabled}
        onPressIn={() => {
          if (!enabled) return;
          scale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 18, stiffness: 320 });
        }}
        style={[styles.searchBtn]}>
        <Text style={styles.searchBtnText}>Search flights</Text>
        {enabled ? (
          <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut}>
            <ArrowRight size={18} color="#fff" />
          </Animated.View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 4,
    paddingTop: 8,
    gap: 18,
  },
  headerRow: {
    paddingHorizontal: 4,
    gap: 4,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    fontFamily: Platform.select({
      ios: 'BricolageGrotesque-ExtraBold',
      android: 'BricolageGrotesque-ExtraBold',
    }),
  },
  subheading: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  segWrap: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 4,
    position: 'relative',
    height: 42,
  },
  segIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: 999,
  },
  segBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  routeCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 6,
    overflow: 'visible',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'flex-end',
    position: 'relative',
  },
  dividerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1,
  },
  swapBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: -18,
  },
  bareIcon: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11.5,
    color: '#9ca3af',
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cell: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    minHeight: 92,
    justifyContent: 'space-between',
  },
  cellHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cellValue: {
    fontSize: 15.5,
  },
  searchBtnWrap: {
    marginTop: 4,
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: PINK,
    paddingVertical: 17,
    borderRadius: 999,
    shadowColor: PINK,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4,
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
