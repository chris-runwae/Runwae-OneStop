import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants';

export const useDateFormatting = () => {
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d');
    } catch {
      return dateString;
    }
  };

  const formatDateRange = (start: string, end?: string) => {
    if (end) {
      try {
        const startDate = parseISO(start);
        const endDate = parseISO(end);
        const startFormatted = format(startDate, 'MMM d');
        const endFormatted = format(endDate, 'MMM d, yyyy');
        return `${startFormatted} - ${endFormatted}`;
      } catch {
        return `${start} - ${end}`;
      }
    }
    return formatDate(start);
  };

  return { formatDate, formatDateRange };
};

export const useCategoryColors = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getCategoryColor = (category: string) => {
    const upperCategory = category.toUpperCase();
    if (upperCategory.includes('MUSIC') || upperCategory.includes('FEST')) {
      return '#10B981';
    }
    if (upperCategory.includes('CULTURAL')) {
      return '#A855F7';
    }
    if (upperCategory.includes('FOOD')) {
      return '#3B82F6';
    }
    return colors.primaryColors.background;
  };

  return getCategoryColor;
};
