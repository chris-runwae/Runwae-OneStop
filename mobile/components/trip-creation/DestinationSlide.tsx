import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  Keyboard,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  withRepeat,
  withTiming,
  useSharedValue,
  useDerivedValue,
} from 'react-native-reanimated';
import { Info, LoaderCircle } from 'lucide-react-native';

import type { LiteAPIPlace } from '@/types/liteapi.types';
import { createDestinationStyles } from './destination/destinationStyles';
import { usePlaceSearch } from './destination/usePlaceSearch';
import CustomTextInput from '../ui/custome-input';
import { PlaceResults } from './destination/PlaceResults';

const { width } = Dimensions.get('window');

interface SlideProps {
  slide: any;
  slideAnimation: any;
  tripData: any;
  onUpdateData: (key: string, value: any) => void;
  colors: any;
  isDarkMode: boolean;
}

export const DestinationSlide: React.FC<SlideProps> = ({
  slide,
  slideAnimation,
  tripData,
  onUpdateData,
  colors,
  isDarkMode,
}) => {
  // Animation setup
  const spinValue = useSharedValue(0);
  const rotation = useDerivedValue(() => {
    return `${interpolate(spinValue.value, [0, 360], [0, 360])}deg`;
  });

  useEffect(() => {
    spinValue.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1,
      false
    );
  }, []);

  // State management
  const [searchText, setSearchText] = useState(tripData.destination || '');
  const [places, setPlaces] = useState<LiteAPIPlace[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Styles
  const styles = createDestinationStyles(isDarkMode);

  // Place search hook
  const { debouncedSearch, clearSearch } = usePlaceSearch(
    setPlaces,
    setLoadingPlaces,
    setErrorMessage,
    setShowSuggestions
  );

  // Animation styles
  const slideAnimStyle = useAnimatedStyle(() => ({
    opacity: slideAnimation.value,
    transform: [
      {
        translateX: interpolate(slideAnimation.value, [0, 1], [width * 0.1, 0]),
      },
    ],
  }));

  const spinAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: rotation.value }],
  }));

  // Event handlers
  const handleTextChange = useCallback(
    (text: string) => {
      setSearchText(text);
      debouncedSearch(text);
    },
    [debouncedSearch]
  );

  const handleSelectCity = useCallback(
    (place: LiteAPIPlace) => {
      if (!place?.displayName) return;

      setSearchText(`${place.displayName}, ${place.formattedAddress || ''}`);
      onUpdateData('destination', place.displayName);
      onUpdateData('place', place);

      setShowSuggestions(false);
      setErrorMessage(null);
      Keyboard.dismiss();
      clearSearch();
    },
    [onUpdateData, clearSearch]
  );

  // Cleanup
  useEffect(() => {
    return clearSearch;
  }, [clearSearch]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ width }}
      className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-[12px] pt-6">
        <Animated.View style={[slideAnimStyle]} className="flex-1">
          {/* Header */}
          <Text
            style={[
              { fontFamily: 'BricolageGrotesque_700Bold' },
              styles.getTextColor(),
            ]}
            className="mb-2 text-3xl">
            {slide.title}
          </Text>

          {slide.subtitle && (
            <Text
              className="mb-8 text-base"
              style={styles.getSecondaryTextColor()}>
              {slide.subtitle}
            </Text>
          )}

          {/* Search Input */}
          <View className="relative">
            <CustomTextInput
              label="Destination"
              value={searchText}
              onChangeText={handleTextChange}
              className="flex-1"
              placeholder="e.g Paris, Lagos"
              error={errorMessage || undefined}
            />

            {/* Search Results */}
            {showSuggestions && (
              <View
                className="absolute left-0 right-0 mt-8 min-h-64 rounded-xl border"
                style={styles.getDropdownStyle()}>
                <PlaceResults
                  places={places}
                  loading={loadingPlaces}
                  errorMessage={errorMessage}
                  onSelectPlace={handleSelectCity}
                  getTextColor={styles.getTextColor}
                  getSecondaryTextColor={styles.getSecondaryTextColor}
                  getPressableStyle={styles.getPressableStyle}
                  isDarkMode={isDarkMode}
                  spinAnimStyle={spinAnimStyle}
                />
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
