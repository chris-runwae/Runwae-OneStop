import { useTheme } from "expo-router/react-navigation";
import { Minus, Plus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  initialAdults: number;
  onClose: () => void;
  onConfirm: (adults: number) => void;
};

const MAX_ADULTS = 9;

export default function PassengerStepper({
  visible,
  initialAdults,
  onClose,
  onConfirm,
}: Props) {
  const { dark } = useTheme();
  const insets = useSafeAreaInsets();
  const [adults, setAdults] = useState(initialAdults);

  React.useEffect(() => {
    if (visible) setAdults(initialAdults);
  }, [visible, initialAdults]);

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            backgroundColor: dark ? '#0d0d0d' : '#ffffff',
          },
        ]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={24} color={dark ? '#fff' : '#000'} />
          </Pressable>
          <Text style={[styles.title, { color: dark ? '#fff' : '#000' }]}>
            Passengers
          </Text>
          <Pressable
            onPress={() => {
              onConfirm(adults);
              onClose();
            }}
            hitSlop={10}>
            <Text style={styles.done}>Done</Text>
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={styles.row}>
            <View>
              <Text style={[styles.rowTitle, { color: dark ? '#fff' : '#000' }]}>
                Adults
              </Text>
              <Text style={styles.rowSub}>Ages 12+</Text>
            </View>
            <View style={styles.controls}>
              <Pressable
                onPress={() => setAdults((n) => Math.max(1, n - 1))}
                disabled={adults <= 1}
                style={[
                  styles.stepper,
                  {
                    borderColor: dark ? '#374151' : '#E5E7EB',
                    opacity: adults <= 1 ? 0.4 : 1,
                  },
                ]}>
                <Minus size={18} color={dark ? '#fff' : '#000'} />
              </Pressable>
              <Text
                style={[
                  styles.count,
                  { color: dark ? '#fff' : '#000' },
                ]}>
                {adults}
              </Text>
              <Pressable
                onPress={() => setAdults((n) => Math.min(MAX_ADULTS, n + 1))}
                disabled={adults >= MAX_ADULTS}
                style={[
                  styles.stepper,
                  {
                    borderColor: dark ? '#374151' : '#E5E7EB',
                    opacity: adults >= MAX_ADULTS ? 0.4 : 1,
                  },
                ]}>
                <Plus size={18} color={dark ? '#fff' : '#000'} />
              </Pressable>
            </View>
          </View>

          <Text style={styles.note}>
            Phase 1 supports adult passengers only. Children and infants land
            with the next release.
          </Text>
        </View>
      </View>
    </Modal>
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
  title: { fontSize: 17, fontWeight: '600' },
  done: { color: '#FF1F8C', fontWeight: '700', fontSize: 15 },
  body: { padding: 20, gap: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowSub: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: { minWidth: 24, textAlign: 'center', fontSize: 16, fontWeight: '700' },
  note: { fontSize: 12, color: '#9ca3af', marginTop: 8, lineHeight: 18 },
});
