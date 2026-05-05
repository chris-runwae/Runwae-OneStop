import { CalendarDays } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';

import Text from '@/components/ui/Text';
import { Colors, textStyles } from '@/constants';

interface DateRangeProps {
  startDate?: string;
  endDate?: string;
  icon?: boolean;
  emoji?: boolean;
  color?: string;
  fontSize?: number;
}

const DateRange = ({
  startDate,
  endDate,
  icon = false,
  emoji = false,
  color,
  fontSize,
}: DateRangeProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const styles = StyleSheet.create({
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      overflow: 'hidden',
      flex: 1,
    },
    infoText: {
      ...textStyles.textBody14,
      fontSize: fontSize || 14,
      fontWeight: '400',
      lineHeight: 21,
      color: color || colors.textColors.subtle,
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const displayDate = (() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // If same year, format as "Apr 26-May 15 2026"
      if (start.getFullYear() === end.getFullYear()) {
        const startMonth = start.toLocaleString('default', { month: 'short' });
        const startDay = start.getDate();
        const endMonth = end.toLocaleString('default', { month: 'short' });
        const endDay = end.getDate();
        const year = start.getFullYear();

        if (startMonth === endMonth) {
          return `${startMonth} ${startDay}-${endDay} ${year}`;
        } else {
          return `${startMonth} ${startDay}-${endMonth} ${endDay} ${year}`;
        }
      } else {
        // Different years
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      }
    }
    return 'Feb 14-21 2026';
  })();

  return (
    <View style={styles.dateContainer}>
      {icon && <CalendarDays size={14} color={colors.white} />}
      {emoji && <Text style={styles.infoText}>🗓️</Text>}
      <Text style={styles.infoText} numberOfLines={1}>
        {displayDate}
      </Text>
    </View>
  );
};

export default DateRange;
