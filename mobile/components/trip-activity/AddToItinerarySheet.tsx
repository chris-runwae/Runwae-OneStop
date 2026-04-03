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
  useColorScheme,
} from 'react-native';
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
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
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
      setSelectedDayId(days[0].id);
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
    setSelectedDayId(days.length > 0 ? days[0].id : null);
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
          <View style={styles.handleBar} />

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
            
            <Text style={styles.sectionTitle}>Day</Text>
            <View style={styles.cardGroup}>
              {days.map((day, index) => {
                const isSelected = selectedDayId === day.id;
                return (
                  <Pressable
                    key={day.id}
                    onPress={() => setSelectedDayId(day.id)}
                    style={[
                      styles.radioRow,
                      index !== days.length - 1 && styles.borderBottom
                    ]}>
                    <Text style={styles.radioLabel}>Day {day.day_number}</Text>
                    <View style={[styles.radioOutline, isSelected && styles.radioOutlineSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Time</Text>
            <View style={styles.cardGroup}>
              <Pressable
                onPress={() => {
                  setShowStartPicker(!showStartPicker);
                  setShowEndPicker(false);
                }}
                style={[styles.radioRow, styles.borderBottom]}>
                <Text style={styles.radioLabel}>Start</Text>
                <Text style={[styles.timeText, !startTimeValue && styles.timePlaceholder]}>
                  {startTimeValue ? format(startTimeValue, 'hh:mm a') : '--:--'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowEndPicker(!showEndPicker);
                  setShowStartPicker(false);
                }}
                style={styles.radioRow}>
                <Text style={styles.radioLabel}>End</Text>
                <Text style={[styles.timeText, !endTimeValue && styles.timePlaceholder]}>
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
                onChange={(event, selectedDate) => {
                  setShowEndPicker(Platform.OS === 'ios');
                  if (selectedDate) setEndTimeValue(selectedDate);
                }}
              />
            )}
            
            <View style={{ marginTop: 40 }} />
          </ScrollView>

          <View style={styles.footerContainer}>
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
    color: '#111827',
    marginBottom: 8,
  },
  cardGroup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
    borderBottomColor: '#F3F4F6',
  },
  radioLabel: {
    fontSize: 14,
    fontFamily: AppFonts.inter.medium,
    color: '#6B7280',
  },
  radioOutline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
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
    color: '#374151',
  },
  timePlaceholder: {
    color: '#9CA3AF',
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 16,
    backgroundColor: '#fff',
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
