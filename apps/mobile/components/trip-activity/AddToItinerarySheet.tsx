import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { X } from 'lucide-react-native';

import { Text } from '@/components';
import { AppFonts, Colors } from '@/constants';
import { SavedItineraryItem } from '@/hooks/useIdeaActions';
import { ItineraryDayWithItems } from '@/hooks/useItineraryActions';

type Props = {
  visible: boolean;
  onClose: () => void;
  idea: SavedItineraryItem | null;
  days: ItineraryDayWithItems[];
  onSubmit: (dayId: string, startTime?: string | null, endTime?: string | null) => Promise<void>;
};

const AddToItinerarySheet = ({ visible, onClose, idea, days, onSubmit }: Props) => {
  const { dark } = useTheme();
  const colors = Colors[dark ? 'dark' : 'light'];
  const translateY = useRef(new Animated.Value(500)).current;

  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  const [startTimeValue, setStartTimeValue] = useState<Date | null>(null);
  const [endTimeValue, setEndTimeValue] = useState<Date | null>(null);
  
  const [saving, setSaving] = useState(false);

  // Initialize selected day to first day when opening
  useEffect(() => {
    if (visible && days.length > 0 && !selectedDayId) {
      setSelectedDayId(days[0]._id as unknown as string);
    }
  }, [visible, days]);

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
      setTimeout(resetForm, 250);
    }
  }, [visible]);

  const resetForm = () => {
    setSelectedDayId(
      days.length > 0 ? (days[0]._id as unknown as string) : null,
    );
    setStartTimeValue(null);
    setEndTimeValue(null);
  };

  const handleSubmit = async () => {
    if (!selectedDayId || !idea) return;
    setSaving(true);
    try {
      await onSubmit(
        selectedDayId, 
        startTimeValue ? format(startTimeValue, 'HH:mm') : null,
        endTimeValue ? format(endTimeValue, 'HH:mm') : null
      );
      onClose();
    } catch (err) {
      console.error('Failed adding to itinerary:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
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
          <View style={[styles.handleBar, { backgroundColor: dark ? '#374151' : '#D1D5DB' }]} />

          <View style={styles.header}>
            <View style={{ width: 32 }} />
            <Text style={[styles.headerTitle, { color: colors.textColors.default }]}>
              Add to Itinerary
            </Text>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <X size={18} color={colors.textColors.subtle} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            
            <Text style={[styles.sectionTitle, { color: colors.textColors.default }]}>Day</Text>
            <View style={[styles.cardGroup, { backgroundColor: dark ? '#1F1F1F' : '#fff', borderColor: dark ? '#374151' : '#F3F4F6' }]}>
              {days.map((day, index) => {
                const dayIdStr = day._id as unknown as string;
                const isSelected = selectedDayId === dayIdStr;
                return (
                  <Pressable
                    key={dayIdStr}
                    onPress={() => setSelectedDayId(dayIdStr)}
                    style={[
                      styles.radioRow,
                      index !== days.length - 1 && [styles.borderBottom, { borderBottomColor: dark ? '#374151' : '#F3F4F6' }]
                    ]}>
                    <Text style={[styles.radioLabel, { color: isSelected ? (dark ? '#fff' : '#111827') : (dark ? '#ADB5BD' : '#6B7280') }]}>Day {day.dayNumber}</Text>
                    <View style={[styles.radioOutline, { borderColor: isSelected ? '#FF1F8C' : (dark ? '#4B5563' : '#E5E7EB') }]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24, color: colors.textColors.default }]}>Time</Text>
            <View style={[styles.cardGroup, { backgroundColor: dark ? '#1F1F1F' : '#fff', borderColor: dark ? '#374151' : '#F3F4F6' }]}>
              <Pressable
                onPress={() => {
                  setShowStartPicker(!showStartPicker);
                  setShowEndPicker(false);
                }}
                style={[styles.radioRow, [styles.borderBottom, { borderBottomColor: dark ? '#374151' : '#F3F4F6' }]]}>
                <Text style={[styles.radioLabel, { color: dark ? '#ADB5BD' : '#6B7280' }]}>Start</Text>
                <Text style={[styles.timeText, { color: dark ? '#E9ECEF' : '#374151' }, !startTimeValue && { color: dark ? '#6B7280' : '#9CA3AF' }]}>
                  {startTimeValue ? format(startTimeValue, 'hh:mm a') : '--:--'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowEndPicker(!showEndPicker);
                  setShowStartPicker(false);
                }}
                style={styles.radioRow}>
                <Text style={[styles.radioLabel, { color: dark ? '#ADB5BD' : '#6B7280' }]}>End</Text>
                <Text style={[styles.timeText, { color: dark ? '#E9ECEF' : '#374151' }, !endTimeValue && { color: dark ? '#6B7280' : '#9CA3AF' }]}>
                  {endTimeValue ? format(endTimeValue, 'hh:mm a') : '--:--'}
                </Text>
              </Pressable>
            </View>

            {showStartPicker && (
              <DateTimePicker
                value={startTimeValue || new Date()}
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
                value={endTimeValue || new Date()}
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
            
            <View style={{ marginTop: 40 }} />
          </ScrollView>

          <View style={[styles.footerContainer, { backgroundColor: colors.backgroundColors.default }]}>
            <Pressable
              onPress={handleSubmit}
              disabled={saving || !selectedDayId}
              style={[
                styles.submitBtn,
                { opacity: (saving || !selectedDayId) ? 0.6 : 1 },
              ]}>
              <Text style={styles.submitLabel}>
                {saving ? 'Adding...' : 'Done'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddToItinerarySheet;

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
    paddingTop: 8,
    maxHeight: '88%',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: AppFonts.inter.semiBold,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: AppFonts.inter.medium,
    marginBottom: 8,
  },
  cardGroup: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  radioLabel: {
    fontSize: 14,
    fontFamily: AppFonts.inter.medium,
  },
  radioOutline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOutlineSelected: {
    borderColor: '#FF1F8C',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF1F8C',
  },
  timeText: {
    fontSize: 14,
    fontFamily: AppFonts.inter.medium,
  },
  timePlaceholder: {
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 16,
  },
  submitBtn: {
    backgroundColor: '#FF1F8C',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitLabel: {
    color: '#fff',
    fontSize: 15,
    fontFamily: AppFonts.inter.medium,
  },
});
