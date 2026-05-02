import React, { useEffect, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
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
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import {
  Calendar,
  Camera,
  Car,
  Clock,
  Compass,
  DollarSign,
  Hotel,
  ImageIcon,
  MapPin,
  Plane,
  Ship,
  StickyNote,
  Utensils,
  X,
} from 'lucide-react-native';

import { Text } from '@/components';
import { AppFonts, Colors } from '@/constants';
import {
  CreateItineraryItemInput,
  ItemType,
} from '@/hooks/useItineraryActions';
import ActionMenu, { ActionOption } from '@/components/common/ActionMenu';

// ----------------------------------------------------------------
// Constants
// ----------------------------------------------------------------

type TypeOption = {
  value: ItemType;
  label: string;
  icon: (c: string, s: number) => React.ReactNode;
  color: string;
};

const TYPE_OPTIONS: TypeOption[] = [
  {
    value: 'activity',
    label: 'Activity',
    icon: (c, s) => <Compass size={s} color={c} />,
    color: '#FF1F8C',
  },
  {
    value: 'flight',
    label: 'Flight',
    icon: (c, s) => <Plane size={s} color={c} />,
    color: '#3b82f6',
  },
  {
    value: 'hotel',
    label: 'Hotel',
    icon: (c, s) => <Hotel size={s} color={c} />,
    color: '#8b5cf6',
  },
  {
    value: 'restaurant',
    label: 'Eat',
    icon: (c, s) => <Utensils size={s} color={c} />,
    color: '#ef4444',
  },
  {
    value: 'transport',
    label: 'Transport',
    icon: (c, s) => <Car size={s} color={c} />,
    color: '#6b7280',
  },
  {
    value: 'tour',
    label: 'Tour',
    icon: (c, s) => <Ship size={s} color={c} />,
    color: '#06b6d4',
  },
  {
    value: 'event',
    label: 'Event',
    icon: (c, s) => <Calendar size={s} color={c} />,
    color: '#f59e0b',
  },
  {
    value: 'other',
    label: 'Other',
    icon: (c, s) => <Compass size={s} color={c} />,
    color: '#9ca3af',
  },
];

const CURRENCY_MAP: Record<string, string> = {
  GBP: '🇬🇧',
  USD: '🇺🇸',
  EUR: '🇪🇺',
  JPY: '🇯🇵',
  AUD: '🇦🇺',
  CAD: '🇨🇦',
  CHF: '🇨🇭',
  SGD: '🇸🇬',
};

const CURRENCIES = Object.keys(CURRENCY_MAP);

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
  const { dark } = useTheme();
  const colors = Colors[dark ? 'dark' : 'light'];
  const translateY = useRef(new Animated.Value(500)).current;

  const [type, setType] = useState<ItemType>('activity');
  const [title, setTitle] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startTimeValue, setStartTimeValue] = useState(new Date());
  const [endTimeValue, setEndTimeValue] = useState(new Date());
  const [location, setLocation] = useState('');
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState('GBP');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [currencyMenuVisible, setCurrencyMenuVisible] = useState(false);
  const [currencyAnchor, setCurrencyAnchor] = useState({ top: 0, right: 0 });
 
  const titleInputRef = useRef<TextInput>(null);
  const currencyRef = useRef<View>(null);

  // Animate in/out
  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start(() => {
        // Auto-focus the title input after animation
        setTimeout(() => titleInputRef.current?.focus(), 100);
      });
    } else {
      Animated.timing(translateY, {
        toValue: 600,
        duration: 220,
        useNativeDriver: true,
      }).start();
      setTimeout(resetForm, 250);
    }
  }, [visible]);

  const resetForm = () => {
    setType('activity');
    setTitle('');
    setStartTimeValue(new Date());
    setEndTimeValue(new Date());
    setLocation('');
    setCost('');
    setCurrency('GBP');
    setNotes('');
    setError('');
    setImageUri(null);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'We need photo library access to add images.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCurrencyPick = () => {
    currencyRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setCurrencyAnchor({ top: pageY + height, right: 20 });
      setCurrencyMenuVisible(true);
    });
  };
 
  const currencyOptions: ActionOption[] = CURRENCIES.map((c) => ({
    label: `${CURRENCY_MAP[c]} ${c}`,
    onPress: () => setCurrency(c),
    isSelected: c === currency,
  }));

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please add a title');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        type,
        startTime: format(startTimeValue, 'HH:mm'),
        endTime: format(endTimeValue, 'HH:mm'),
        locationName: location.trim() || undefined,
        price: cost ? parseFloat(cost) : undefined,
        currency,
        notes: notes.trim() || undefined,
        imageUrl: imageUri || undefined,
      });
      onClose();
    } catch (err) {
      setError('Failed to add item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const activeOption = TYPE_OPTIONS.find((o) => o.value === type)!;
  const activeColor = activeOption.color;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          onClose();
        }}>
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
          {/* Drag handle */}
          <View style={[styles.handleBar, { backgroundColor: dark ? '#374151' : '#E0E0E0' }]} />

          {/* Header */}
          <View style={styles.header}>
            <Text
              style={[
                styles.headerTitle,
                { color: colors.textColors.default },
              ]}>
              Add to Itinerary
            </Text>
            <Pressable 
              onPress={onClose} 
              hitSlop={10} 
              style={[styles.closeBtn, { backgroundColor: dark ? '#1F1F1F' : '#F5F5F5' }]}
            >
              <X size={18} color={dark ? '#ADB5BD' : colors.textColors.subtle} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}>
            {/* ── Type Grid ── */}
            <View style={styles.typeGrid}>
              {TYPE_OPTIONS.map((opt) => {
                const isActive = opt.value === type;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setType(opt.value)}
                    style={[
                      styles.typeGridItem,
                      {
                        backgroundColor: isActive
                          ? opt.color + '15'
                          : (dark ? '#1F1F1F' : '#F7F7F7'),
                        borderColor: isActive ? opt.color + '40' : (dark ? '#374151' : 'transparent'),
                      },
                    ]}>
                    <View
                      style={[
                        styles.typeIconCircle,
                        {
                          backgroundColor: isActive
                            ? opt.color + '20'
                            : (dark ? '#131313' : '#EFEFEF'),
                        },
                      ]}>
                      {opt.icon(
                        isActive ? opt.color : (dark ? '#6B7280' : '#AEAEAE'),
                        18
                      )}
                    </View>
                    <Text
                      style={[
                        styles.typeGridLabel,
                        {
                          color: isActive ? opt.color : '#999',
                          fontFamily: isActive
                            ? AppFonts.inter.semiBold
                            : AppFonts.inter.medium,
                        },
                      ]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* ── Title ── */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: dark ? '#9CA3AF' : '#999' }]}>What's the plan?</Text>
                <View
                  style={[
                    styles.inputRow,
                    {
                      backgroundColor: dark ? '#131313' : '#FAFAFA',
                      borderColor:
                        error && !title.trim() ? '#FF4444' : (dark ? '#374151' : '#F0F0F0'),
                    },
                  ]}>
                  <View
                    style={[
                      styles.inputIcon,
                      { backgroundColor: dark ? '#1F1F1F' : activeColor + '12' },
                    ]}>
                    {activeOption.icon(activeColor, 16)}
                  </View>
                  <TextInput
                    ref={titleInputRef}
                    value={title}
                    onChangeText={(t) => {
                      setTitle(t);
                      if (error) setError('');
                    }}
                    placeholder="What's the plan?"
                    placeholderTextColor={dark ? '#6B7280' : '#C5C5C5'}
                    style={[styles.inputText, { color: dark ? '#fff' : '#1A1A1A' }]}
                  />
              </View>
            </View>

            {/* ── Time Row ── */}
            <View style={styles.inputGroup}>
              <View style={styles.twoCol}>
                {/* Start Time */}
                <View style={styles.halfInput}>
                  <Text style={[styles.inputLabel, { color: dark ? '#9CA3AF' : '#999' }]}>Start Time</Text>
                  <Pressable
                    onPress={() => {
                      setShowStartPicker(!showStartPicker);
                      setShowEndPicker(false);
                    }}
                    style={[styles.inputRow, { backgroundColor: dark ? '#131313' : '#FAFAFA', borderColor: dark ? '#374151' : '#F0F0F0' }]}>
                  <View
                    style={[
                      styles.inputIcon,
                      { backgroundColor: dark ? '#1F1F1F' : '#F0F0F0' },
                    ]}>
                    <Clock size={14} color={dark ? '#6B7280' : '#AEAEAE'} />
                  </View>
                  <Text style={[styles.timeValueText, { color: dark ? '#fff' : '#1A1A1A' }]}>
                    {format(startTimeValue, 'hh:mm a')}
                  </Text>
                </Pressable>
 
                </View>
 
                {/* End Time */}
                <View style={styles.halfInput}>
                  <Text style={[styles.inputLabel, { color: dark ? '#9CA3AF' : '#999' }]}>End Time</Text>
                  <Pressable
                    onPress={() => {
                      setShowEndPicker(!showEndPicker);
                      setShowStartPicker(false);
                    }}
                    style={[styles.inputRow, { backgroundColor: dark ? '#131313' : '#FAFAFA', borderColor: dark ? '#374151' : '#F0F0F0' }]}>
                    <View
                      style={[
                        styles.inputIcon,
                        { backgroundColor: dark ? '#1F1F1F' : '#F0F0F0' },
                      ]}>
                      <Clock size={14} color={dark ? '#6B7280' : '#AEAEAE'} />
                    </View>
                    <Text style={[styles.timeValueText, { color: dark ? '#fff' : '#1A1A1A' }]}>
                      {format(endTimeValue, 'hh:mm a')}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
 
            {/* Native Pickers */}
            {showStartPicker && (
              <DateTimePicker
                value={startTimeValue}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                themeVariant={dark ? 'dark' : 'light'}
                onChange={(event, selectedDate) => {
                  setShowStartPicker(Platform.OS === 'ios');
                  if (selectedDate) setStartTimeValue(selectedDate);
                }}
              />
            )}
 
            {showEndPicker && (
              <DateTimePicker
                value={endTimeValue}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                themeVariant={dark ? 'dark' : 'light'}
                onChange={(event, selectedDate) => {
                  setShowEndPicker(Platform.OS === 'ios');
                  if (selectedDate) setEndTimeValue(selectedDate);
                }}
              />
            )}

            {/* ── Location ── */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: dark ? '#9CA3AF' : '#999' }]}>Location</Text>
              <View style={[styles.inputRow, { backgroundColor: dark ? '#131313' : '#FAFAFA', borderColor: dark ? '#374151' : '#F0F0F0' }]}>
                <View
                  style={[
                    styles.inputIcon,
                    { backgroundColor: dark ? '#1F1F1F' : '#F0F0F0' },
                  ]}>
                  <MapPin size={14} color={dark ? '#6B7280' : '#AEAEAE'} />
                </View>
                <TextInput
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Add location"
                  placeholderTextColor={dark ? '#6B7280' : '#C5C5C5'}
                  style={[styles.inputText, { color: dark ? '#fff' : '#1A1A1A' }]}
                />
              </View>
            </View>

            {/* ── Cost + Currency ── */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: dark ? '#9CA3AF' : '#999' }]}>Cost</Text>
              <View style={styles.twoCol}>
                <View style={[styles.inputRow, { flex: 1, backgroundColor: dark ? '#131313' : '#FAFAFA', borderColor: dark ? '#374151' : '#F0F0F0' }]}>
                  <View
                    style={[
                      styles.inputIcon,
                      { backgroundColor: dark ? '#1F1F1F' : '#F0F0F0' },
                    ]}>
                    <DollarSign size={14} color={dark ? '#6B7280' : '#AEAEAE'} />
                  </View>
                  <TextInput
                    value={cost}
                    onChangeText={setCost}
                    placeholder="Cost"
                    placeholderTextColor={dark ? '#6B7280' : '#C5C5C5'}
                    keyboardType="decimal-pad"
                    style={[styles.inputText, { color: dark ? '#fff' : '#1A1A1A' }]}
                  />
                </View>
                <View ref={currencyRef}>
                  <Pressable
                    onPress={handleCurrencyPick}
                    style={[styles.currencyChip, { backgroundColor: dark ? '#1F1F1F' : '#F5F5F5', borderColor: dark ? '#374151' : '#F0F0F0' }]}>
                    <Text style={[styles.currencyText, { color: dark ? '#fff' : '#333' }]}>
                      {CURRENCY_MAP[currency]} {currency}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
 
            <ActionMenu
              visible={currencyMenuVisible}
              onClose={() => setCurrencyMenuVisible(false)}
              options={currencyOptions}
              anchorPosition={currencyAnchor}
            />

            {/* ── Image ── */}
            <View style={styles.inputGroup}>
              {imageUri ? (
                <View style={styles.imagePreviewRow}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.imagePreview}
                    contentFit="cover"
                  />
                  <Pressable
                    onPress={() => setImageUri(null)}
                    style={styles.imageRemoveBtn}>
                    <X size={14} color="#fff" />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={handlePickImage}
                  style={[styles.imagePickerBtn, { backgroundColor: dark ? '#131313' : '#FAFAFA', borderColor: dark ? '#374151' : '#F0F0F0' }]}>
                  <Camera size={18} color={dark ? '#6B7280' : '#AEAEAE'} />
                  <Text style={[styles.imagePickerText, { color: dark ? '#6B7280' : '#AEAEAE' }]}>Add a photo</Text>
                </Pressable>
              )}
            </View>

            {/* ── Notes ── */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: dark ? '#9CA3AF' : '#999' }]}>Notes</Text>
              <View style={[styles.inputRow, { alignItems: 'flex-start', backgroundColor: dark ? '#131313' : '#FAFAFA', borderColor: dark ? '#374151' : '#F0F0F0' }]}>
                <View
                  style={[
                    styles.inputIcon,
                    { backgroundColor: dark ? '#1F1F1F' : '#F0F0F0', marginTop: 2 },
                  ]}>
                  <StickyNote size={14} color={dark ? '#6B7280' : '#AEAEAE'} />
                </View>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add notes..."
                  placeholderTextColor={dark ? '#6B7280' : '#C5C5C5'}
                  multiline
                  numberOfLines={3}
                  style={[styles.inputText, styles.notesText, { color: dark ? '#fff' : '#1A1A1A' }]}
                />
              </View>
            </View>

            {/* Error */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* ── Submit ── */}
            <Pressable
              onPress={handleSubmit}
              disabled={saving}
              style={[
                styles.submitBtn,
                {
                  backgroundColor: activeColor,
                  opacity: saving ? 0.6 : 1,
                },
              ]}>
              <Text style={styles.submitLabel}>
                {saving ? 'Adding…' : 'Add to Itinerary'}
              </Text>
            </Pressable>

            <View style={{ height: 30 }} />
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
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  avoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    maxHeight: '88%',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: AppFonts.bricolage.semiBold,
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 8,
  },

  // ── Type Grid ──
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  typeGridItem: {
    width: '23%',
    aspectRatio: 0.95,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    gap: 4,
  },
  typeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeGridLabel: {
    fontSize: 11,
    textAlign: 'center',
  },

  // ── Input Rows ──
  inputGroup: {
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    paddingHorizontal: 4,
    minHeight: 48,
  },
  inputIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: AppFonts.inter.semiBold,
    color: '#999',
    marginBottom: 6,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    fontFamily: AppFonts.inter.medium,
    color: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  timeValueText: {
    flex: 1,
    fontSize: 14,
    fontFamily: AppFonts.inter.medium,
    color: '#1A1A1A',
    paddingHorizontal: 12,
  },
  notesText: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  twoCol: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  halfInput: {
    flex: 1,
  },

  // ── Currency ──
  currencyChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  currencyText: {
    fontSize: 14,
    fontFamily: AppFonts.inter.semiBold,
    color: '#333',
  },

  // ── Error ──
  errorText: {
    color: '#FF4444',
    fontSize: 13,
    fontFamily: AppFonts.inter.medium,
    marginBottom: 8,
    paddingLeft: 4,
  },

  // ── Submit ──
  submitBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#FF1F8C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitLabel: {
    color: '#fff',
    fontSize: 16,
    fontFamily: AppFonts.bricolage.semiBold,
  },

  // ── Image Picker ──
  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderStyle: 'dashed',
    paddingVertical: 16,
  },
  imagePickerText: {
    fontSize: 14,
    fontFamily: AppFonts.inter.medium,
    color: '#AEAEAE',
  },
  imagePreviewRow: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 14,
  },
  imageRemoveBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
