import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarContainer } from '@/components/trip-creation/calendar/CalendarContainer';
import { useDateRange } from '@marceloterreiro/flash-calendar';
import { format } from 'date-fns';
import { Colors } from '@/constants/theme';
import { useTheme } from '@react-navigation/native';

interface DateModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (startDate: string, endDate: string) => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

export default function DateModal({
  visible,
  onClose,
  onSelect,
  initialStartDate,
  initialEndDate,
}: DateModalProps) {
  const insets = useSafeAreaInsets();
  const { dark } = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { calendarActiveDateRanges, onCalendarDayPress, dateRange } = useDateRange();

  // Initialize with existing dates when visible
  useEffect(() => {
    if (visible && initialStartDate && !dateRange.startId) {
      onCalendarDayPress(initialStartDate);
      if (initialEndDate && initialEndDate !== initialStartDate) {
        onCalendarDayPress(initialEndDate);
      }
    }
  }, [visible, initialStartDate, initialEndDate]);

  const formatDate = (dateId?: string) => {
    if (!dateId) return 'Select date';
    try {
      return format(new Date(dateId), 'MMM d, yyyy');
    } catch (e) {
      return dateId;
    }
  };

  const calendarTheme = useMemo(
    () => ({
      itemDayContainer: {
        activeDayFiller: {
          backgroundColor: '#FF1F8C',
        },
      },
      itemDay: {
        idle: ({ isToday }: { isToday: boolean }) => ({
          container: isToday
            ? { borderRadius: 20, backgroundColor: dark ? '#333' : '#f3f4f6' }
            : {},
          content: { color: dark ? '#fff' : '#000' },
        }),
        active: ({ isToday }: { isToday: boolean }) => ({
          container: { backgroundColor: '#FF1F8C' },
          content: { color: '#fff' },
        }),
      },
    }),
    [dark]
  );

  const handleDone = () => {
    if (dateRange.startId) {
      onSelect(dateRange.startId, dateRange.endId || dateRange.startId);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View
        style={[
          styles.modalContainer,
          {
            backgroundColor: colors.backgroundColors.default,
            paddingTop: insets.top,
          },
        ]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <X size={24} color={dark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: dark ? '#fff' : '#000' }]}>
            Select Dates
          </Text>
          <TouchableOpacity onPress={handleDone} style={styles.modalDoneButton}>
            <Text style={{ color: '#FF1F8C', fontWeight: 'bold' }}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 20 }}>
            <CalendarContainer
              theme={calendarTheme}
              backgroundColor={dark ? '#1c1c1e' : '#f3f4f6'}
              calendarActiveDateRanges={calendarActiveDateRanges}
              onCalendarDayPress={onCalendarDayPress}
            />

            <View style={styles.dateSummary}>
              <View
                style={[
                  styles.dateSummaryItem,
                  { backgroundColor: dark ? '#131313' : '#f8f9fa' },
                ]}>
                <Text style={styles.dateSummaryLabel}>Start Date</Text>
                <Text
                  style={[
                    styles.dateSummaryValue,
                    { color: dark ? '#fff' : '#000' },
                  ]}>
                  {formatDate(dateRange.startId)}
                </Text>
              </View>
              <View
                style={[
                  styles.dateSummaryItem,
                  { backgroundColor: dark ? '#131313' : '#f8f9fa' },
                ]}>
                <Text style={styles.dateSummaryLabel}>End Date</Text>
                <Text
                  style={[
                    styles.dateSummaryValue,
                    { color: dark ? '#fff' : '#000' },
                  ]}>
                  {formatDate(dateRange.endId)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#33333333',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalDoneButton: {
    padding: 5,
  },
  dateSummary: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  dateSummaryItem: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
  },
  dateSummaryLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 6,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateSummaryValue: {
    fontSize: 15,
    fontWeight: '600',
  },
});
