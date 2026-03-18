import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { Calendar } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Platform,
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

export default function CreateTripDays() {
  const { dark } = useTheme();
  const params = useLocalSearchParams<{
    destination_label:    string;
    destination_place_id: string;
    destination_address:  string;
  }>();

  const [startDate,      setStartDate]      = useState<Date | null>(null);
  const [endDate,        setEndDate]        = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker,   setShowEndPicker]   = useState(false);

  // ----------------------------------------------------------------
  // Derived values
  // ----------------------------------------------------------------

  const durationDays: number | null = React.useMemo(() => {
    if (!startDate || !endDate) return null;
    const diff = endDate.getTime() - startDate.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  // ----------------------------------------------------------------
  // Handlers
  // ----------------------------------------------------------------

  const onStartChange = (_: DateTimePickerEvent, date?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (date) {
      setStartDate(date);
      // Reset end date if it is before the new start
      if (endDate && date > endDate) setEndDate(null);
    }
  };

  const onEndChange = (_: DateTimePickerEvent, date?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (date) setEndDate(date);
  };

  const navigate = (start: Date | null, end: Date | null) => {
    router.push({
      pathname: '/create-trip/details' as any,
      params: {
        ...params,
        start_date: start ? start.toISOString().split('T')[0] : '',
        end_date:   end   ? end.toISOString().split('T')[0]   : '',
      },
    });
  };

  const handleSkip = () => navigate(null, null);
  const handleNext = () => navigate(startDate, endDate);

  // ----------------------------------------------------------------
  // UI helpers
  // ----------------------------------------------------------------

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <AppSafeAreaView>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CreateStepHeader currentStep={2} totalSteps={3} />

        <Text style={[styles.title, { color: dark ? '#ffffff' : '#111827' }]}>
          When's the trip?
        </Text>
        <Text style={[styles.subtitle, { color: dark ? '#9ca3af' : '#6b7280' }]}>
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
                  : (dark ? '#2c2c2e' : '#e5e7eb'),
              },
            ]}
            onPress={() => setShowStartPicker(true)}
          >
            <Calendar size={18} strokeWidth={1.5} color={startDate ? '#FF1F8C' : (dark ? '#6b7280' : '#9ca3af')} />
            <View style={styles.dateCardText}>
              <Text style={[styles.dateLabel, { color: dark ? '#6b7280' : '#9ca3af' }]}>Start</Text>
              <Text style={[styles.dateValue, { color: startDate ? (dark ? '#ffffff' : '#111827') : (dark ? '#4b5563' : '#d1d5db') }]}>
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
                borderColor: endDate
                  ? '#FF1F8C'
                  : (dark ? '#2c2c2e' : '#e5e7eb'),
              },
            ]}
            onPress={() => setShowEndPicker(true)}
          >
            <Calendar size={18} strokeWidth={1.5} color={endDate ? '#FF1F8C' : (dark ? '#6b7280' : '#9ca3af')} />
            <View style={styles.dateCardText}>
              <Text style={[styles.dateLabel, { color: dark ? '#6b7280' : '#9ca3af' }]}>End</Text>
              <Text style={[styles.dateValue, { color: endDate ? (dark ? '#ffffff' : '#111827') : (dark ? '#4b5563' : '#d1d5db') }]}>
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

        {/* Date pickers */}
        {showStartPicker && (
          <DateTimePicker
            value={startDate ?? new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={new Date()}
            onChange={onStartChange}
            themeVariant={dark ? 'dark' : 'light'}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDate ?? startDate ?? new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={startDate ?? new Date()}
            onChange={onEndChange}
            themeVariant={dark ? 'dark' : 'light'}
          />
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: dark ? '#2c2c2e' : '#f3f4f6' }]}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipLink}>
          <Text style={[styles.skipText, { color: dark ? '#6b7280' : '#9ca3af' }]}>Skip for now</Text>
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
