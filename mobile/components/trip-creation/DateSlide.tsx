import React, { useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';

import { COLORS } from '@/constants';
import { useCalendarTheme } from '@/hooks/useCalendarTheme';
import { SlideHeader } from './SlideHeader';
import { CalendarContainer } from './calendar';
import { Spacer } from '@/components';

const { width } = Dimensions.get('window');

interface DateSlideProps {
  slide: any;
  slideAnimation: any;
  tripData: any;
  onUpdateData: (key: string, value: any) => void;
  colors: any;
  isDarkMode: boolean;
}

export const DateSlide: React.FC<DateSlideProps> = React.memo(
  ({ slide, slideAnimation, tripData, onUpdateData, colors, isDarkMode }) => {
    const handleDateRangeChange = (
      dateRange: { startId?: string; endId?: string } | undefined
    ) => {
      if (dateRange?.startId) {
        onUpdateData('startDate', dateRange.startId);
      }
      if (dateRange?.endId) {
        onUpdateData('endDate', dateRange.endId);
      }
    };

    const slideAnimStyle = useAnimatedStyle(() => ({
      opacity: slideAnimation.value,
      transform: [
        {
          translateX: interpolate(
            slideAnimation.value,
            [0, 1],
            [width * 0.1, 0]
          ),
        },
      ],
    }));

    const calendarTheme = useCalendarTheme({
      primaryColor: colors.primaryColors.default,
      textColor: colors.textColors.default,
    });

    return (
      <View style={{ width }} className="flex-1 px-6 pt-6">
        <Animated.View style={[slideAnimStyle]} className="flex-1">
          <SlideHeader
            title={slide.title}
            subtitle={slide.subtitle}
            isDarkMode={isDarkMode}
          />

          <CalendarContainer
            theme={calendarTheme}
            backgroundColor={'transparent'}
            onDateRangeChange={handleDateRangeChange}
          />

          <Spacer vertical size={48} />
        </Animated.View>
      </View>
    );
  }
);

DateSlide.displayName = 'DateSlide';
