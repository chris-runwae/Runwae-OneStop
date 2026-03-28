import React, { useEffect, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from 'react-native';
import {
  Calendar,
  Car,
  Compass,
  Hotel,
  Plane,
  Ship,
  Utensils,
  X,
} from 'lucide-react-native';

import { Text } from '@/components';
import { Colors } from '@/constants';
import { CreateItineraryItemInput, ItemType } from '@/hooks/useItineraryActions';

// ----------------------------------------------------------------
// Constants
// ----------------------------------------------------------------

type TypeOption = { value: ItemType; label: string; icon: (c: string) => React.ReactNode };

const TYPE_OPTIONS: TypeOption[] = [
  { value: 'flight',     label: 'Flight',     icon: (c) => <Plane    size={16} color={c} /> },
  { value: 'hotel',      label: 'Hotel',      icon: (c) => <Hotel    size={16} color={c} /> },
  { value: 'activity',   label: 'Activity',   icon: (c) => <Compass  size={16} color={c} /> },
  { value: 'restaurant', label: 'Restaurant', icon: (c) => <Utensils size={16} color={c} /> },
  { value: 'transport',  label: 'Transport',  icon: (c) => <Car      size={16} color={c} /> },
  { value: 'cruise',     label: 'Cruise',     icon: (c) => <Ship     size={16} color={c} /> },
  { value: 'event',      label: 'Event',      icon: (c) => <Calendar size={16} color={c} /> },
  { value: 'other',      label: 'Other',      icon: (c) => <Compass  size={16} color={c} /> },
];

const CURRENCIES = ['GBP', 'USD', 'EUR', 'JPY', 'AUD', 'CAD', 'CHF', 'SGD'];

const TYPE_COLORS: Record<ItemType, string> = {
  flight:     '#3b82f6',
  hotel:      '#8b5cf6',
  activity:   '#f59e0b',
  restaurant: '#ef4444',
  transport:  '#6b7280',
  cruise:     '#06b6d4',
  event:      '#ec4899',
  other:      '#9ca3af',
};

// ----------------------------------------------------------------
// Props
// ----------------------------------------------------------------

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: CreateItineraryItemInput) => Promise<void>;
};

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------

const AddItineraryItemSheet = ({ visible, onClose, onSubmit }: Props) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const translateY = useRef(new Animated.Value(500)).current;

  const [type,      setType]      = useState<ItemType>('activity');
  const [title,     setTitle]     = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime,   setEndTime]   = useState('');
  const [location,  setLocation]  = useState('');
  const [cost,      setCost]      = useState('');
  const [currency,  setCurrency]  = useState('GBP');
  const [notes,     setNotes]     = useState('');
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  // Animate in/out
  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 600,
        duration: 220,
        useNativeDriver: true,
      }).start();
      // Reset form when closing
      setTimeout(resetForm, 250);
    }
  }, [visible]);

  const resetForm = () => {
    setType('activity');
    setTitle('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setCost('');
    setCurrency('GBP');
    setNotes('');
    setError('');
  };

  const handleCurrencyPick = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', ...CURRENCIES],
          cancelButtonIndex: 0,
        },
        (i) => {
          if (i > 0) setCurrency(CURRENCIES[i - 1]);
        },
      );
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        type,
        start_time: startTime.trim() || null,
        end_time:   endTime.trim()   || null,
        location:   location.trim()  || null,
        cost:       cost ? parseFloat(cost) : null,
        currency,
        notes:      notes.trim()     || null,
      });
      onClose();
    } catch (err) {
      setError('Failed to add item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const activeColor = TYPE_COLORS[type];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.avoidingView}
        pointerEvents="box-none">
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.backgroundColors.default,
              transform: [{ translateY }],
            },
          ]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.textColors.default }]}>
              Add to Itinerary
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={20} color={colors.textColors.subtle} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Type selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.typeRow}
              style={{ marginBottom: 16 }}>
              {TYPE_OPTIONS.map((opt) => {
                const isActive = opt.value === type;
                const chipColor = TYPE_COLORS[opt.value];
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setType(opt.value)}
                    style={[
                      styles.typeChip,
                      {
                        backgroundColor: isActive
                          ? chipColor + '20'
                          : colors.backgroundColors.subtle,
                        borderColor: isActive ? chipColor : 'transparent',
                        borderWidth: 1.5,
                      },
                    ]}>
                    {opt.icon(isActive ? chipColor : colors.textColors.subtle)}
                    <Text
                      style={[
                        styles.typeChipLabel,
                        {
                          color: isActive
                            ? chipColor
                            : colors.textColors.subtle,
                        },
                      ]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Title */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textColors.subtle }]}>
                Title *
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Check in at hotel"
                placeholderTextColor={colors.textColors.subtle}
                style={[
                  styles.input,
                  {
                    color: colors.textColors.default,
                    backgroundColor: colors.backgroundColors.subtle,
                    borderColor: error && !title.trim()
                      ? '#ef4444'
                      : colors.borderColors.subtle,
                  },
                ]}
              />
            </View>

            {/* Time row */}
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textColors.subtle }]}>
                  Start time
                </Text>
                <TextInput
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="09:00"
                  placeholderTextColor={colors.textColors.subtle}
                  keyboardType="numbers-and-punctuation"
                  style={[
                    styles.input,
                    {
                      color: colors.textColors.default,
                      backgroundColor: colors.backgroundColors.subtle,
                      borderColor: colors.borderColors.subtle,
                    },
                  ]}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textColors.subtle }]}>
                  End time
                </Text>
                <TextInput
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="11:00"
                  placeholderTextColor={colors.textColors.subtle}
                  keyboardType="numbers-and-punctuation"
                  style={[
                    styles.input,
                    {
                      color: colors.textColors.default,
                      backgroundColor: colors.backgroundColors.subtle,
                      borderColor: colors.borderColors.subtle,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Location */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textColors.subtle }]}>
                Location
              </Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Heathrow Terminal 5"
                placeholderTextColor={colors.textColors.subtle}
                style={[
                  styles.input,
                  {
                    color: colors.textColors.default,
                    backgroundColor: colors.backgroundColors.subtle,
                    borderColor: colors.borderColors.subtle,
                  },
                ]}
              />
            </View>

            {/* Cost + currency */}
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textColors.subtle }]}>
                  Cost
                </Text>
                <TextInput
                  value={cost}
                  onChangeText={setCost}
                  placeholder="0.00"
                  placeholderTextColor={colors.textColors.subtle}
                  keyboardType="decimal-pad"
                  style={[
                    styles.input,
                    {
                      color: colors.textColors.default,
                      backgroundColor: colors.backgroundColors.subtle,
                      borderColor: colors.borderColors.subtle,
                    },
                  ]}
                />
              </View>
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textColors.subtle }]}>
                  Currency
                </Text>
                <Pressable
                  onPress={handleCurrencyPick}
                  style={[
                    styles.input,
                    styles.currencyBtn,
                    {
                      backgroundColor: colors.backgroundColors.subtle,
                      borderColor: colors.borderColors.subtle,
                    },
                  ]}>
                  <Text style={{ color: colors.textColors.default, fontSize: 15 }}>
                    {currency}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Notes */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textColors.subtle }]}>
                Notes
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Any extra details..."
                placeholderTextColor={colors.textColors.subtle}
                multiline
                numberOfLines={3}
                style={[
                  styles.input,
                  styles.notesInput,
                  {
                    color: colors.textColors.default,
                    backgroundColor: colors.backgroundColors.subtle,
                    borderColor: colors.borderColors.subtle,
                  },
                ]}
              />
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            {/* Submit */}
            <Pressable
              onPress={handleSubmit}
              disabled={saving}
              style={[
                styles.submitBtn,
                { backgroundColor: activeColor, opacity: saving ? 0.6 : 1 },
              ]}>
              <Text style={styles.submitLabel}>
                {saving ? 'Adding…' : 'Add to Itinerary'}
              </Text>
            </Pressable>

            <View style={{ height: 24 }} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddItineraryItemSheet;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  avoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'BricolageGrotesque-SemiBold',
  },
  typeRow: {
    gap: 8,
    paddingRight: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  typeChipLabel: {
    fontSize: 13,
    fontFamily: 'BricolageGrotesque-Medium',
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'BricolageGrotesque-Medium',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  currencyBtn: {
    justifyContent: 'center',
    minWidth: 80,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 8,
  },
  submitBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitLabel: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'BricolageGrotesque-SemiBold',
  },
});
