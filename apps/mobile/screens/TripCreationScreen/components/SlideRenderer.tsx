import React from 'react';
import { View, ScrollView } from 'react-native';
import {
  DateSlide,
  PersonalizationSlide,
} from '@/components/trip-creation/TripCreationSlides';
import { DestinationSlide } from '@/components/trip-creation/DestinationSlide';

interface TripData {
  destination: string;
  startDate: string | null;
  endDate: string | null;
  name: string;
  description: string;
  headerImage: string | null;
  place: any;
}

interface SlideRendererProps {
  currentStep: number;
  currentSlide: any;
  slideAnimation: any;
  tripData: any;
  onUpdateData: (key: string, value: any) => void;
  colors: any;
  isDarkMode: boolean;
  scrollRef: any;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({
  currentStep,
  currentSlide,
  slideAnimation,
  tripData,
  onUpdateData,
  colors,
  isDarkMode,
  scrollRef,
}) => {
  const renderSlide = () => {
    switch (currentSlide.type) {
      case 'destination':
        return (
          <DestinationSlide
            slide={currentSlide}
            slideAnimation={slideAnimation}
            tripData={tripData}
            onUpdateData={onUpdateData}
            colors={colors}
            isDarkMode={isDarkMode}
          />
        );
      case 'dates':
        return (
          <DateSlide
            slide={currentSlide}
            slideAnimation={slideAnimation}
            tripData={tripData}
            onUpdateData={onUpdateData}
            colors={colors}
            isDarkMode={isDarkMode}
          />
        );
      case 'personalization':
        return (
          <PersonalizationSlide
            slide={currentSlide}
            slideAnimation={slideAnimation}
            tripData={tripData}
            onUpdateData={onUpdateData}
            colors={colors}
            isDarkMode={isDarkMode}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        className="flex-1">
        {renderSlide()}
      </ScrollView>
    </View>
  );
};
