import {
  Calendar,
  toDateId,
  useDateRange,
} from "@marceloterreiro/flash-calendar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { MonthYearModal } from "./MonthYearModal";
import { MonthYearSelector } from "./MonthYearSelector";
import {
  createYearMonthId,
  generateMonths,
  generateYears,
  getCurrentYear,
} from "./calendarUtils";


interface CalendarContainerProps {
  theme: any;
  backgroundColor: string;
  calendarActiveDateRanges: any[];
  onCalendarDayPress: (dateId: string) => void;
}

export const CalendarContainer: React.FC<CalendarContainerProps> = ({
  theme,
  backgroundColor,
  calendarActiveDateRanges,
  onCalendarDayPress,
}) => {
  const today = toDateId(new Date());
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [currentMonthId, setCurrentMonthId] = useState(today);

  const months = useMemo(
    () => generateMonths(currentMonthId),
    [currentMonthId],
  );
  const years = useMemo(() => generateYears(currentMonthId), [currentMonthId]);

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
    [currentMonthId],
  );



  return (
    <View
      style={{
        width: "100%",
        height: "auto",
        padding: 0,
        overflow: "hidden",
      }}
    >
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
        currentId={getCurrentYear(currentMonthId)}

        theme={theme}
        backgroundColor={backgroundColor}
      />
    </View>
  );
};
