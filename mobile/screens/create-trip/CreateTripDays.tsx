import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTheme } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { Calendar } from 'lucide-react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CreateStepHeader from './CreateStepHeader';

// ================================================================
// CreateTripDays
// ================================================================

type ActivePicker = 'start' | 'end' | null;

export default function CreateTripDays() {
  const { dark } = useTheme();
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    destination_label: string;
    destination_place_id: string;
    destination_address: string;
  }>();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  // iOS: temp date while the modal is open, committed on Done
  const [pendingDate, setPendingDate] = useState<Date>(new Date());

  // ----------------------------------------------------------------
  // Derived values
  // ----------------------------------------------------------------

  const durationDays: number | null = React.useMemo(() => {
    if (!startDate || !endDate) return null;
    const diff = endDate.getTime() - startDate.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  // ----------------------------------------------------------------
  // Picker open / close
  // ----------------------------------------------------------------

  const openPicker = (which: 'start' | 'end') => {
    const initial =
      which === 'start'
        ? (startDate ?? new Date())
        : (endDate ?? startDate ?? new Date());
    setPendingDate(initial);
    setActivePicker(which);
  };

  const commitDate = () => {
    if (activePicker === 'start') {
      setStartDate(pendingDate);
      if (endDate && pendingDate > endDate) setEndDate(null);
    } else if (activePicker === 'end') {
      setEndDate(pendingDate);
    }
    setActivePicker(null);
  };

  const dismissPicker = () => setActivePicker(null);

  // Android fires onChange once on confirm / dismiss — handle inline
  const onAndroidChange = (_: DateTimePickerEvent, date?: Date) => {
    setActivePicker(null);
    if (!date) return;
    if (activePicker === 'start') {
      setStartDate(date);
      if (endDate && date > endDate) setEndDate(null);
    } else if (activePicker === 'end') {
      setEndDate(date);
    }
  };

  // ----------------------------------------------------------------
  // Navigation
  // ----------------------------------------------------------------

  const navigate = (start: Date | null, end: Date | null) => {
    router.push({
      pathname: '/create-trip/details' as any,
      params: {
        ...params,
        start_date: start ? start.toISOString().split('T')[0] : '',
        end_date: end ? end.toISOString().split('T')[0] : '',
      },
    });
  };

  const handleSkip = () => navigate(null, null);
  const handleNext = () => navigate(startDate, endDate);

  // ----------------------------------------------------------------
  // UI helpers
  // ----------------------------------------------------------------

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const minDate =
    activePicker === 'end' ? (startDate ?? new Date()) : new Date();

  return (
    <AppSafeAreaView>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <CreateStepHeader currentStep={2} totalSteps={3} />

        <Text style={[styles.title, { color: dark ? '#ffffff' : '#111827' }]}>
          When&apos;s the trip?
        </Text>
        <Text
          style={[styles.subtitle, { color: dark ? '#9ca3af' : '#6b7280' }]}>
          Set your travel dates or skip for now.
        </Text>

        {/* Date row */}
        <View style={styles.dateRow}>
          {/* Start date */}
          <TouchableOpacity
            style={[
              styles.dateCard,
              {
                backgroundColor: dark ? '#1c1c1e' : '#f9fafb',
                borderColor: startDate
                  ? '#FF1F8C'
                  : dark
                    ? '#2c2c2e'
                    : '#e5e7eb',
              },
            ]}
            onPress={() => openPicker('start')}>
            <Calendar
              size={18}
              strokeWidth={1.5}
              color={startDate ? '#FF1F8C' : dark ? '#6b7280' : '#9ca3af'}
            />
            <View style={styles.dateCardText}>
              <Text
                style={[
                  styles.dateLabel,
                  { color: dark ? '#6b7280' : '#9ca3af' },
                ]}>
                Start
              </Text>
              <Text
                style={[
                  styles.dateValue,
                  {
                    color: startDate
                      ? dark
                        ? '#ffffff'
                        : '#111827'
                      : dark
                        ? '#4b5563'
                        : '#d1d5db',
                  },
                ]}>
                {startDate ? formatDate(startDate) : 'Select date'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* End date */}
          <TouchableOpacity
            style={[
              styles.dateCard,
              {
                backgroundColor: dark ? '#1c1c1e' : '#f9fafb',
                borderColor: endDate ? '#FF1F8C' : dark ? '#2c2c2e' : '#e5e7eb',
              },
            ]}
            onPress={() => openPicker('end')}>
            <Calendar
              size={18}
              strokeWidth={1.5}
              color={endDate ? '#FF1F8C' : dark ? '#6b7280' : '#9ca3af'}
            />
            <View style={styles.dateCardText}>
              <Text
                style={[
                  styles.dateLabel,
                  { color: dark ? '#6b7280' : '#9ca3af' },
                ]}>
                End
              </Text>
              <Text
                style={[
                  styles.dateValue,
                  {
                    color: endDate
                      ? dark
                        ? '#ffffff'
                        : '#111827'
                      : dark
                        ? '#4b5563'
                        : '#d1d5db',
                  },
                ]}>
                {endDate ? formatDate(endDate) : 'Select date'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Duration badge */}
        {durationDays !== null && durationDays > 0 && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {durationDays} {durationDays === 1 ? 'day' : 'days'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* iOS modal date picker */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={activePicker !== null}
          transparent
          animationType="slide"
          onRequestClose={dismissPicker}>
          <Pressable style={styles.modalBackdrop} onPress={dismissPicker} />
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: dark ? '#1c1c1e' : '#ffffff' },
            ]}>
            {/* Sheet header */}
            <View
              style={[
                styles.sheetHeader,
                { borderBottomColor: dark ? '#2c2c2e' : '#f3f4f6' },
              ]}>
              <TouchableOpacity
                onPress={dismissPicker}
                style={styles.sheetAction}>
                <Text
                  style={[
                    styles.sheetActionText,
                    { color: dark ? '#9ca3af' : '#6b7280' },
                  ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text
                style={[
                  styles.sheetTitle,
                  { color: dark ? '#ffffff' : '#111827' },
                ]}>
                {activePicker === 'start' ? 'Start date' : 'End date'}
              </Text>
              <TouchableOpacity onPress={commitDate} style={styles.sheetAction}>
                <Text
                  style={[
                    styles.sheetActionText,
                    { color: '#FF1F8C', fontWeight: '600' },
                  ]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={pendingDate}
              mode="date"
              display="inline"
              minimumDate={minDate}
              onChange={(_, date) => {
                if (date) setPendingDate(date);
              }}
              themeVariant={dark ? 'dark' : 'light'}
              style={styles.iosPicker}
            />
          </View>
        </Modal>
      )}

      {/* Android native dialog */}
      {Platform.OS === 'android' && activePicker !== null && (
        <DateTimePicker
          value={pendingDate}
          mode="date"
          display="default"
          minimumDate={minDate}
          onChange={onAndroidChange}
        />
      )}

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            borderTopColor: dark ? '#2c2c2e' : '#f3f4f6',
            marginBottom: insets.bottom + 16,
          },
        ]}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipLink}>
          <Text
            style={[styles.skipText, { color: dark ? '#6b7280' : '#9ca3af' }]}>
            Skip for now
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </AppSafeAreaView>
  );
}

// ================================================================
// Styles
// ================================================================

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 26,
    fontFamily: 'BricolageGrotesque-Bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },

  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateCardText: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
  },

  durationBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 31, 140, 0.1)',
    marginBottom: 8,
  },
  durationText: {
    color: '#FF1F8C',
    fontSize: 14,
    fontWeight: '600',
  },

  // iOS Modal sheet
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sheetAction: {
    minWidth: 60,
    alignItems: 'center',
    paddingVertical: 2,
  },
  sheetActionText: {
    fontSize: 16,
  },
  iosPicker: {
    alignSelf: 'center',
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  skipLink: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  nextButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF1F8C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
