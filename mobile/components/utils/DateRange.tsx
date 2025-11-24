import { CalendarDays } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';

import { Text } from '@/components';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';

interface DateRangeProps {
  startDate?: string;
  endDate?: string;
  icon?: boolean;
  emoji?: boolean;
}

const DateRange = ({
  startDate,
  endDate,
  icon = false,
  emoji = false,
}: DateRangeProps) => {
  const colorScheme = useColorScheme();
  const appColors = Colors[colorScheme ?? 'light'];

  const styles = StyleSheet.create({
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      overflow: 'hidden',
      flex: 1,
    },
    infoText: {
      ...textStyles.subtitle_Regular,
      fontSize: 13,
      fontWeight: '400',
      lineHeight: 19.5,
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

      // If same year, format as "Apr 26 - May 15, 2026"
      if (start.getFullYear() === end.getFullYear()) {
        const startMonth = start.toLocaleString('default', { month: 'short' });
        const startDay = start.getDate();
        const endMonth = end.toLocaleString('default', { month: 'short' });
        const endDay = end.getDate();
        const year = start.getFullYear();

        if (startMonth === endMonth) {
          return `${startMonth} ${startDay} - ${endDay}, ${year}`;
        } else {
          return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
        }
      } else {
        // Different years
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      }
    }
    return 'Dec 19 - 25, 2025';
  })();

  return (
    <View style={styles.dateContainer}>
      {icon && <CalendarDays size={14} color={appColors.white} />}
      {emoji && <Text style={styles.infoText}>🗓️</Text>}
      <Text style={styles.infoText} numberOfLines={1}>
        {displayDate}
      </Text>
    </View>
  );
};

export default DateRange;
