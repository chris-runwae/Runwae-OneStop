import { Colors, textStyles } from '@/constants';
import { useTheme } from "expo-router/react-navigation";
import { Minus, Plus, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  initialAdults: number;
  initialRooms: number;
  onClose: () => void;
  onConfirm: (adults: number, rooms: number) => void;
};

const ADULTS_RANGE = { min: 1, max: 8 };
const ROOMS_RANGE = { min: 1, max: 4 };

export default function GuestRoomsStepper({
  visible,
  initialAdults,
  initialRooms,
  onClose,
  onConfirm,
}: Props) {
  const { dark } = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [adults, setAdults] = useState(initialAdults);
  const [rooms, setRooms] = useState(initialRooms);

  useEffect(() => {
    if (!visible) return;
    setAdults(initialAdults);
    setRooms(initialRooms);
  }, [visible, initialAdults, initialRooms]);

  const submit = () => {
    onConfirm(adults, rooms);
    onClose();
  };

  const stepperBorder = dark ? '#374151' : '#E5E7EB';

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            backgroundColor: colors.backgroundColors.default,
          },
        ]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={24} color={dark ? '#fff' : '#000'} />
          </Pressable>
          <Text style={[styles.title, { color: dark ? '#fff' : '#000' }]}>
            Guests & rooms
          </Text>
          <Pressable onPress={submit} hitSlop={10}>
            <Text style={styles.done}>Done</Text>
          </Pressable>
        </View>

        <View style={styles.body}>
          <StepRow
            label="Adults"
            sub="Ages 13+"
            value={adults}
            onChange={setAdults}
            range={ADULTS_RANGE}
            dark={dark}
            borderColor={stepperBorder}
          />
          <StepRow
            label="Rooms"
            sub="One bed per room"
            value={rooms}
            onChange={setRooms}
            range={ROOMS_RANGE}
            dark={dark}
            borderColor={stepperBorder}
          />

          <Text
            style={[styles.note, { color: colors.textColors.subtle }]}>
            Children pricing isn&apos;t supported in the mobile flow yet — a single
            adult fare per occupant for now.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

function StepRow({
  label,
  sub,
  value,
  onChange,
  range,
  dark,
  borderColor,
}: {
  label: string;
  sub: string;
  value: number;
  onChange: (n: number) => void;
  range: { min: number; max: number };
  dark: boolean;
  borderColor: string;
}) {
  const decDisabled = value <= range.min;
  const incDisabled = value >= range.max;
  return (
    <View style={styles.row}>
      <View>
        <Text style={[styles.rowTitle, { color: dark ? '#fff' : '#000' }]}>
          {label}
        </Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <View style={styles.controls}>
        <Pressable
          onPress={() => onChange(Math.max(range.min, value - 1))}
          disabled={decDisabled}
          style={[
            styles.stepper,
            { borderColor, opacity: decDisabled ? 0.4 : 1 },
          ]}>
          <Minus size={18} color={dark ? '#fff' : '#000'} />
        </Pressable>
        <Text style={[styles.count, { color: dark ? '#fff' : '#000' }]}>
          {value}
        </Text>
        <Pressable
          onPress={() => onChange(Math.min(range.max, value + 1))}
          disabled={incDisabled}
          style={[
            styles.stepper,
            { borderColor, opacity: incDisabled ? 0.4 : 1 },
          ]}>
          <Plus size={18} color={dark ? '#fff' : '#000'} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#33333322',
  },
  title: {
    ...textStyles.textHeading16,
  },
  done: { ...textStyles.textBody14, color: '#FF1F8C', fontWeight: '700' },
  body: { padding: 20, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowTitle: {
    ...textStyles.textHeading16,
  },
  rowSub: {
    ...textStyles.textBody12,
    color: '#9ca3af',
    marginTop: 2,
  },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: { ...textStyles.textHeading16, minWidth: 24, textAlign: 'center' },
  note: {
    ...textStyles.textBody12,
    marginTop: 8,
    lineHeight: 18,
  },
});
