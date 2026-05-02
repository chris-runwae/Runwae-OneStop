// DestinationSlide.tsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Dimensions,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
  ViewStyle,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  withRepeat,
  withTiming,
  useSharedValue,
  useDerivedValue,
} from 'react-native-reanimated';

import { COLORS } from '@/constants';
import { searchPlaces } from '@/services/liteapi';
import type { LiteAPIPlace } from '@/types/liteapi.types';
import CustomTextInput from '../ui/custome-input';
import { Info, LoaderCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

/* ---------------------------------------------
   Simple in-memory cache (session scoped)
---------------------------------------------- */
const placeSearchCache = new Map<string, LiteAPIPlace[]>();

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

  const [searchText, setSearchText] = useState(tripData.destination || '');
  const [places, setPlaces] = useState<LiteAPIPlace[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const debounceTimeoutRef = useRef<number | null>(null);

  const slideAnimStyle = useAnimatedStyle(() => ({
    opacity: slideAnimation.value,
    transform: [
      {
        translateX: interpolate(slideAnimation.value, [0, 1], [width * 0.1, 0]),
      },
    ],
  }));

  const spinAnimStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: rotation.value,
      },
    ],
  }));

  /* ---------------------------------------------
     Debounced search function
  ---------------------------------------------- */
  const performSearch = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 3) {
      setErrorMessage('Please enter at least 3 characters');
      setPlaces([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingPlaces(true);
    setErrorMessage(null);

    try {
      // Cache hit
      if (placeSearchCache.has(trimmedQuery)) {
        const cached = placeSearchCache.get(trimmedQuery)!;
        setPlaces(cached);
        setShowSuggestions(true);
        setLoadingPlaces(false);
        return;
      }

      const response = await searchPlaces(trimmedQuery);

      const validPlaces = (response.data || []).filter(
        (place): place is LiteAPIPlace =>
          place &&
          typeof place.placeId === 'string' &&
          typeof place.displayName === 'string'
      );

      placeSearchCache.set(trimmedQuery, validPlaces);
      setPlaces(validPlaces);
      setShowSuggestions(validPlaces.length > 0);

      if (validPlaces.length === 0) {
        setErrorMessage('No results found');
      }
    } catch (error: any) {
      console.error('Error searching places:', error);

      if (error?.message?.includes('request limit')) {
        setErrorMessage('Too many searches — please wait a moment');
      } else {
        setErrorMessage('Failed to search places');
      }

      setPlaces([]);
      setShowSuggestions(false);
    } finally {
      setLoadingPlaces(false);
    }
  }, []);

  /* ---------------------------------------------
     Debounced text change handler
  ---------------------------------------------- */
  const handleTextChange = useCallback(
    (text: string) => {
      setSearchText(text);

      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Show loading state immediately if text is long enough
      if (text.trim().length >= 3) {
        setShowSuggestions(true);
      }

      // Set new timeout for 1 second
      debounceTimeoutRef.current = setTimeout(() => {
        performSearch(text);
      }, 1000);
    },
    [performSearch]
  );

  /* ---------------------------------------------
     Cleanup timeout on unmount
  ---------------------------------------------- */
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  /* ---------------------------------------------
     Select a city
  ---------------------------------------------- */
  const handleSelectCity = (place: LiteAPIPlace) => {
    if (!place?.displayName) return;

    setSearchText(`${place.displayName}, ${place.formattedAddress || ''}`);
    onUpdateData('destination', place.displayName);
    onUpdateData('place', place);

    setShowSuggestions(false);
    setErrorMessage(null);
    Keyboard.dismiss();

    // Clear any pending search when a place is selected
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  };

  /* ---------------------------------------------
     Reusable style objects for better performance
  ---------------------------------------------- */
  const getInputStyle = () => ({
    backgroundColor: isDarkMode ? '#222222' : COLORS.gray[350],
    borderWidth: 1,
    borderColor: isDarkMode ? '#333333' : COLORS.gray[350],
  });

  const getTextColor = () => ({
    color: isDarkMode ? COLORS.white.base : COLORS.gray[750],
  });

  const getSecondaryTextColor = () => ({
    color: isDarkMode ? COLORS.gray[400] : COLORS.gray[600],
  });

  const getDropdownStyle = (): ViewStyle => ({
    backgroundColor: isDarkMode ? '#222222' : COLORS.gray[350],
    borderWidth: 1,
    borderColor: isDarkMode ? '#333333' : COLORS.gray[400],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    zIndex: 9999,
    top: '100%',
  });

  const getPressableStyle = (pressed: boolean) => ({
    borderBottomColor: isDarkMode ? '#333333' : COLORS.gray[400],
    backgroundColor: pressed
      ? isDarkMode
        ? '#2a2a2a'
        : COLORS.gray[300]
      : 'transparent',
  });

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
          <Text
            style={[
              { fontFamily: 'BricolageGrotesque_700Bold' },
              getTextColor(),
            ]}
            className="mb-2 text-3xl">
            {slide.title}
          </Text>

          {slide.subtitle && (
            <Text className="mb-8 text-base" style={getSecondaryTextColor()}>
              {slide.subtitle}
            </Text>
          )}

          {/* Input */}
          <View className="relative">
            <View>
              <CustomTextInput
                label="Destination"
                value={searchText}
                onChangeText={handleTextChange}
                className="flex-1"
                labelStyle="mb-2 text-black dark:text-gray-400 font-[BricolageGrotesque_700Bold]!"
                placeholder="e.g Paris, Lagos"
                error={errorMessage || undefined}
              />
            </View>

            {/* Results */}
            {showSuggestions && (
              <View
                className="absolute left-0 right-0 mt-8 min-h-64 rounded-xl"
                style={getDropdownStyle()}>
                {loadingPlaces ? (
                  // Skeleton loader
                  <View className="flex h-[300px] flex-1 flex-col items-center justify-center gap-y-3">
                    <Animated.View style={spinAnimStyle}>
                      <LoaderCircle
                        size={30}
                        color={isDarkMode ? '#fff' : '#000'}
                      />
                    </Animated.View>
                    <Text className="text-center text-sm text-gray-500">
                      Searching for places...
                    </Text>
                  </View>
                ) : places.length > 0 ? (
                  <ScrollView
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={true}
                    className="max-h-64">
                    {places.map((item) => (
                      <Pressable
                        key={item.placeId}
                        onPress={() => handleSelectCity(item)}
                        className="border-b px-4 py-3"
                        style={({ pressed }) => getPressableStyle(pressed)}>
                        <Text className="text-base" style={getTextColor()}>
                          {item.displayName}
                        </Text>
                        {item.formattedAddress && (
                          <Text
                            className="mt-1 text-sm"
                            style={getSecondaryTextColor()}>
                            {item.formattedAddress}
                          </Text>
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>
                ) : errorMessage ? (
                  <View className="flex flex-1 items-center justify-center gap-3">
                    <View>
                      <Info size={40} color={isDarkMode ? '#fff' : '#000'} />
                    </View>
                    <Text
                      className="text-center text-sm"
                      style={getSecondaryTextColor()}>
                      {errorMessage}
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
