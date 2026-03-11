import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import {
  Calendar,
  toDateId,
  useDateRange,
} from '@marceloterreiro/flash-calendar';
import { MonthYearModal } from './MonthYearModal';
import { MonthYearSelector } from './MonthYearSelector';
import {
  generateMonths,
  generateYears,
  createYearMonthId,
} from './calendarUtils';

interface CalendarContainerProps {
  theme: any;
  backgroundColor: string;
  onDateRangeChange?: (
    dateRange: { startId?: string; endId?: string } | undefined
  ) => void;
}

export const CalendarContainer: React.FC<CalendarContainerProps> = ({
  theme,
  backgroundColor,
  onDateRangeChange,
}) => {
  const today = toDateId(new Date());
  const { calendarActiveDateRanges, onCalendarDayPress, dateRange } =
    useDateRange();

  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [currentMonthId, setCurrentMonthId] = useState(today);

  // Memoized month and year data
  const months = useMemo(
    () => generateMonths(currentMonthId),
    [currentMonthId]
  );
  const years = useMemo(() => generateYears(currentMonthId), [currentMonthId]);

  // Callbacks for modal actions
  const handleMonthSelect = useCallback((monthId: string) => {
    setCurrentMonthId(monthId);
  }, []);

  const handleYearSelect = useCallback(
    (yearId: string) => {
      const currentDate = new Date(currentMonthId);
      const currentMonth = currentDate.getMonth();
      const yearMonthId = createYearMonthId(parseInt(yearId), currentMonth);
      setCurrentMonthId(yearMonthId);
    },
    [currentMonthId]
  );

  // Sync date range changes with parent
  useEffect(() => {
    onDateRangeChange?.(dateRange);
  }, [dateRange, onDateRangeChange]);

  return (
    <View
      style={{
        width: '100%',
        height: 'auto',
        padding: 0,
        backgroundColor,
        borderRadius: 16,
        overflow: 'hidden',
      }}>
      <MonthYearSelector
        currentMonthId={currentMonthId}
        onMonthPress={() => setShowMonthModal(true)}
        onYearPress={() => setShowYearModal(true)}
        theme={theme}
      />

      <Calendar
        calendarActiveDateRanges={calendarActiveDateRanges}
        calendarMonthId={currentMonthId}
        onCalendarDayPress={onCalendarDayPress}
        theme={theme}
        calendarMonthHeaderHeight={0}
        calendarDayHeight={40}
      />

      <MonthYearModal
        visible={showMonthModal}
        onClose={() => setShowMonthModal(false)}
        onSelect={handleMonthSelect}
        title="Select Month"
        items={months}
        currentId={currentMonthId}
        theme={theme}
        backgroundColor={backgroundColor}
      />

      <MonthYearModal
        visible={showYearModal}
        onClose={() => setShowYearModal(false)}
        onSelect={handleYearSelect}
        title="Select Year"
        items={years}
        currentId={currentMonthId}
        theme={theme}
        backgroundColor={backgroundColor}
      />
    </View>
  );
};
