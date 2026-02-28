import { useMemo } from 'react';
import { CalendarTheme } from '@marceloterreiro/flash-calendar';
import { textStyles } from '@/utils/styles';

interface UseCalendarThemeProps {
  primaryColor: string;
  textColor: string;
}

export const useCalendarTheme = ({ primaryColor, textColor }: UseCalendarThemeProps): CalendarTheme => {
  return useMemo(() => ({
    rowMonth: {
      content: {
        color: textColor,
        ...textStyles.bold_20,
        fontSize: 14,
      },
    },
    rowWeek: {
      container: {},
    },
    itemDayContainer: {
      activeDayFiller: {
        backgroundColor: primaryColor,
      },
    },
    itemDay: {
      idle: ({ isPressed, isWeekend }) => ({
        container: {
          backgroundColor: isPressed ? primaryColor : 'transparent',
          borderRadius: 9999,
        },
        content: {
          color:
            isWeekend && !isPressed ? 'rgba(255, 255, 255, 0.5)' : '#ffffff',
        },
      }),
      active: () => ({
        container: {
          backgroundColor: primaryColor,
        },
        content: {
          color: textColor,
        },
      }),
    },
  }), [primaryColor, textColor]);
};
