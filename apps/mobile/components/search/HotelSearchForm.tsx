import DestinationInput from '@/components/search/DestinationInput';
import GuestRoomsStepper from '@/components/search/GuestRoomsStepper';
import DateModal from '@/components/trips/edit/DateModal';
import { textStyles } from '@/constants';
import { useHotelSearchState } from '@/hooks/useHotelSearchState';
import { useTheme } from '@react-navigation/native';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  BedDouble,
  Calendar,
  MapPin,
  Users,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Sheet = 'destination' | 'dates' | 'guests' | null;

const PINK = '#FF1F8C';

export default function HotelSearchForm() {
  const { dark } = useTheme();
  const router = useRouter();
  const [sheet, setSheet] = React.useState<Sheet>(null);
  const {
    state,
    setDestination,
    setDates,
    setAdults,
    setRooms,
    isValid,
    toQueryParams,
  } = useHotelSearchState();

  const formatDateLabel = (iso: string | null) =>
    iso ? format(new Date(iso), 'MMM d') : 'Select date';

  const datesLabel = state.checkIn
    ? `${formatDateLabel(state.checkIn)}  →  ${formatDateLabel(state.checkOut)}`
    : 'Select dates';

  const guestsLabel = `${state.adults} ${state.adults === 1 ? 'guest' : 'guests'} · ${state.rooms} ${
    state.rooms === 1 ? 'room' : 'rooms'
  }`;

  const onSearch = () => {
    const params = toQueryParams();
    if (!params) return;
    router.push({ pathname: '/hotels-search/results', params });
  };

  const onDatesSelected = (startId: string, endId: string) => {
    if (startId === endId) {
      setDates(startId, null);
    } else {
      setDates(startId, endId);
    }
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
          Where are you staying?
        </Text>
        <Text style={[styles.subheading, { color: labelClr }]}>
          Pick a destination, dates and guests.
        </Text>
      </View>

      {/* Destination card */}
      <View
        style={[
          styles.routeCard,
          { backgroundColor: cardBg, borderColor: borderClr },
        ]}>
        <Row
          testID="hotel-search-destination"
          icon={<MapPin size={18} color={dark ? '#fff' : '#0F1115'} />}
          label="Destination"
          value={state.destination ?? 'Search city, hotel, or address'}
          placeholder={!state.destination}
          dark={dark}
          onPress={() => setSheet('destination')}
        />
      </View>

      {/* Dates + Guests row */}
      <View style={styles.splitRow}>
        <PressableCell
          testID="hotel-search-dates"
          flex={1.4}
          dark={dark}
          cardBg={cardBg}
          borderClr={borderClr}
          onPress={() => setSheet('dates')}
          icon={<Calendar size={16} color={dark ? '#fff' : '#0F1115'} />}
          label="Dates"
          value={datesLabel}
          placeholder={!state.checkIn || !state.checkOut}
        />
        <PressableCell
          testID="hotel-search-guests"
          flex={1}
          dark={dark}
          cardBg={cardBg}
          borderClr={borderClr}
          onPress={() => setSheet('guests')}
          icon={<Users size={16} color={dark ? '#fff' : '#0F1115'} />}
          label="Guests"
          value={guestsLabel}
          placeholder={false}
        />
      </View>

      <View style={{ height: 14 }} />

      <SearchButton testID="hotel-search-submit" enabled={isValid} onPress={onSearch} />

      <DestinationInput
        visible={sheet === 'destination'}
        initialValue={state.destination}
        onClose={() => setSheet(null)}
        onSelect={(t) => setDestination(t)}
      />
      <DateModal
        visible={sheet === 'dates'}
        onClose={() => setSheet(null)}
        onSelect={onDatesSelected}
        initialStartDate={state.checkIn ?? undefined}
        initialEndDate={state.checkOut ?? undefined}
      />
      <GuestRoomsStepper
        visible={sheet === 'guests'}
        initialAdults={state.adults}
        initialRooms={state.rooms}
        onClose={() => setSheet(null)}
        onConfirm={(adults, rooms) => {
          setAdults(adults);
          setRooms(rooms);
        }}
      />
    </Animated.View>
  );
}

function Row({
  testID,
  icon,
  label,
  value,
  placeholder,
  dark,
  onPress,
}: {
  testID?: string;
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
        testID={testID}
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
  testID,
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
  testID?: string;
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
        testID={testID}
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
  testID,
  enabled,
  onPress,
}: {
  testID?: string;
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
        testID={testID}
        onPress={onPress}
        disabled={!enabled}
        onPressIn={() => {
          if (!enabled) return;
          scale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 18, stiffness: 320 });
        }}
        style={styles.searchBtn}>
        <BedDouble size={18} color="#fff" />
        <Text style={styles.searchBtnText}>Search stays</Text>
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
    ...textStyles.textHeading20,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  subheading: {
    ...textStyles.textBody14,
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
  bareIcon: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...textStyles.textBody12,
    color: '#9ca3af',
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    ...textStyles.textHeading16,
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
    ...textStyles.textBody14,
    fontWeight: '600',
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
    ...textStyles.textHeading16,
    color: '#fff',
    letterSpacing: 0.2,
  },
});
