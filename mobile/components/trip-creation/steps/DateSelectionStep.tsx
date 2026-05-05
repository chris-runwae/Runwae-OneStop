import { CalendarContainer } from "@/components/trip-creation/calendar/CalendarContainer";
import React from "react";
import { ScrollView, Text, View } from "react-native";

interface DateSelectionStepProps {
  width: number;
  dark: boolean;
  calendarTheme: any;
  calendarActiveDateRanges: any[];
  onCalendarDayPress: (dateId: string) => void;
  selectedDates: {
    startId?: string;
    endId?: string;
  };
  formatDate: (dateId?: string) => string;
}

export const DateSelectionStep: React.FC<DateSelectionStepProps> = ({
  width,
  dark,
  calendarTheme,
  calendarActiveDateRanges,
  onCalendarDayPress,
  selectedDates,
  formatDate,
}) => {
  return (
    <View style={{ width }} className="px-5 pt-8 flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Text
          className="text-2xl font-bold dark:text-white mb-2"
          style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
        >
          Lock in the {"\n"}dates 🗓️
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 mb-8">
          Please Select your trip dates.
        </Text>

        <View className="mb-4">
          <CalendarContainer
            theme={calendarTheme}
            backgroundColor={dark ? "#1A1A1A" : "#F7F8FA"}
            calendarActiveDateRanges={calendarActiveDateRanges}
            onCalendarDayPress={onCalendarDayPress}
          />
        </View>

        {selectedDates.startId && (
          <View className="flex-row items-center justify-center mt-auto mb-5">
            <Text className="text-primary font-medium">
              {formatDate(selectedDates.startId)}
              {selectedDates.endId
                ? ` → ${formatDate(selectedDates.endId)}`
                : ""}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
