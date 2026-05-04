import { CalendarContainer } from "@/components/trip-creation/calendar/CalendarContainer";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

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
  onQuickPick?: (offsetDays: number) => void;
}

const QUICK_PICKS: { label: string; days: number }[] = [
  { label: "Long weekend", days: 2 },
  { label: "Week", days: 6 },
  { label: "Fortnight", days: 13 },
];

export const DateSelectionStep: React.FC<DateSelectionStepProps> = ({
  width,
  dark,
  calendarTheme,
  calendarActiveDateRanges,
  onCalendarDayPress,
  selectedDates,
  formatDate,
  onQuickPick,
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
        <Text className="text-gray-400 dark:text-gray-500 mb-6">
          Please Select your trip dates.
        </Text>

        {onQuickPick ? (
          <View className="flex-row gap-2 mb-5">
            {QUICK_PICKS.map((pick) => (
              <TouchableOpacity
                key={pick.label}
                activeOpacity={0.8}
                onPress={() => onQuickPick(pick.days)}
                className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700"
              >
                <Text className="text-sm text-black dark:text-white font-medium">
                  {pick.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

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
