import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import { toDateId } from '@marceloterreiro/flash-calendar';
import { useTheme } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { Calendar } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CalendarContainer } from '@/components/trip-creation/calendar';
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
  const [pendingDates, setPendingDates] = useState<{
    startId?: string;
    endId?: string;
  }>({});

  const calendarActiveDateRanges = useMemo(() => {
    if (!pendingDates.startId) return [];
    return [
      {
        startId: pendingDates.startId,
        endId: pendingDates.endId || pendingDates.startId,
      },
    ];
  }, [pendingDates.startId, pendingDates.endId]);

  const handleDayPress = (dateId: string) => {
    if (activePicker === 'start') {
      setPendingDates((prev) => {
        const next = { ...prev, startId: dateId };
        if (prev.endId && dateId > prev.endId) {
          next.endId = undefined;
        }
        return next;
      });
    } else {
      if (pendingDates.startId && dateId < pendingDates.startId) {
        setPendingDates({ startId: dateId, endId: undefined });
      } else {
        setPendingDates((prev) => ({ ...prev, endId: dateId }));
      }
    }
  };

  const calendarTheme = useMemo(
    () => ({
      itemDay: {
        idle: ({
          isToday,
          isWeekend,
        }: {
          isToday: boolean;
          isWeekend: boolean;
        }) => ({
          container: isToday
            ? {
                borderRadius: 20,
                backgroundColor: '#FF2E92',
              }
            : {},
          content: isToday
            ? {
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 12,
              }
            : {
                color: dark ? '#fff' : '#111827',
                fontSize: 12,
              },
        }),
        active: ({ isStart, isEnd }: { isStart: boolean; isEnd: boolean }) => ({
          container: {
            backgroundColor:
              isStart || isEnd ? '#FF2E92' : 'rgba(255, 46, 146, 0.15)',
            borderRadius: isStart && isEnd ? 20 : 0,
            ...(isStart && !isEnd
              ? {
                  borderTopLeftRadius: 20,
                  borderBottomLeftRadius: 20,
                }
              : {}),
            ...(isEnd && !isStart
              ? {
                  borderTopRightRadius: 20,
                  borderBottomRightRadius: 20,
                }
              : {}),
            // Eliminate tiny sub-pixel gaps in the grid
            marginHorizontal: -0.5,
          },
          content: {
            color: isStart || isEnd ? '#fff' : '#FF2E92',
            fontSize: 12,
            fontWeight: isStart || isEnd ? 'bold' : 'normal',
          },
        }),
      },
      itemDayContainer: {
        activeDayFiller: {
          backgroundColor: 'rgba(255, 46, 146, 0.15)',
          height: 40,
        },
      },
      itemWeekName: {
        content: {
          color: dark ? '#6b7280' : '#9ca3af',
          fontSize: 11,
          fontWeight: '500',
        },
      },
    }),
    [dark]
  );

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
    // Sync pending dates with current committed dates
    setPendingDates({
      startId: startDate ? toDateId(startDate) : undefined,
      endId: endDate ? toDateId(endDate) : undefined,
    });
    setActivePicker(which);
  };

  const commitDate = () => {
    // Save dates from pending state
    if (pendingDates.startId) {
      setStartDate(new Date(pendingDates.startId));
    }
    if (pendingDates.endId) {
      setEndDate(new Date(pendingDates.endId));
    } else {
      setEndDate(null);
    }

    // Explicitly close the picker state
    setActivePicker(null);
  };

  const dismissPicker = () => setActivePicker(null);

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
                  ? '#FF2E92'
                  : dark
                    ? '#2c2c2e'
                    : '#e5e7eb',
              },
            ]}
            onPress={() => openPicker('start')}>
            <Calendar
              size={18}
              strokeWidth={1.5}
              color={startDate ? '#FF2E92' : dark ? '#6b7280' : '#9ca3af'}
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
                borderColor: endDate ? '#FF2E92' : dark ? '#2c2c2e' : '#e5e7eb',
              },
            ]}
            onPress={() => openPicker('end')}>
            <Calendar
              size={18}
              strokeWidth={1.5}
              color={endDate ? '#FF2E92' : dark ? '#6b7280' : '#9ca3af'}
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

      {/* Custom calendar modal */}
      <Modal
        visible={activePicker !== null}
        transparent
        animationType="slide"
        onRequestClose={dismissPicker}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(0,0,0,0.5)' },
            ]}
            onPress={dismissPicker}
          />
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
                style={styles.sheetAction}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
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
                  { color: dark ? '#ffffff' : '#111827', fontSize: 15 },
                ]}>
                {activePicker === 'start'
                  ? 'Select Start Date'
                  : 'Select End Date'}
              </Text>
              <TouchableOpacity
                onPress={commitDate}
                style={[styles.sheetAction, { zIndex: 9999 }]}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                <Text
                  style={[
                    styles.sheetActionText,
                    { color: '#FF2E92', fontWeight: '600' },
                  ]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ padding: 10 }}>
              <CalendarContainer
                theme={calendarTheme}
                backgroundColor={dark ? '#1c1c1e' : '#ffffff'}
                calendarActiveDateRanges={calendarActiveDateRanges}
                onCalendarDayPress={handleDayPress}
              />
            </View>
          </View>
        </View>
      </Modal>

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
    backgroundColor: 'rgba(255, 46, 146, 0.1)',
    marginBottom: 8,
  },
  durationText: {
    color: '#FF2E92',
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
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#FF2E92',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
