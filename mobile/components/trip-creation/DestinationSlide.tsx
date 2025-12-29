// DestinationSlide.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Dimensions,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

import { COLORS } from '@/constants';
import { searchPlaces } from '@/services/liteapi';
import type { LiteAPIPlace } from '@/types/liteapi.types';

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
  const [searchText, setSearchText] = useState(tripData.destination || '');
  const [places, setPlaces] = useState<LiteAPIPlace[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const slideAnimStyle = useAnimatedStyle(() => ({
    opacity: slideAnimation.value,
    transform: [
      {
        translateX: interpolate(slideAnimation.value, [0, 1], [width * 0.1, 0]),
      },
    ],
  }));

  /* ---------------------------------------------
     Explicit search trigger
  ---------------------------------------------- */
  const handleSearchPress = async () => {
    const query = searchText.trim();

    if (query.length < 3) {
      setErrorMessage('Please enter at least 3 characters');
      return;
    }

    setLoadingPlaces(true);
    setErrorMessage(null);
    setShowSuggestions(false);

    try {
      // Cache hit
      if (placeSearchCache.has(query)) {
        const cached = placeSearchCache.get(query)!;
        setPlaces(cached);
        setShowSuggestions(true);
        return;
      }

      const response = await searchPlaces(query);

      const validPlaces = (response.data || []).filter(
        (place): place is LiteAPIPlace =>
          place &&
          typeof place.placeId === 'string' &&
          typeof place.displayName === 'string'
      );

      placeSearchCache.set(query, validPlaces);
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
    } finally {
      setLoadingPlaces(false);
    }
  };

  /* ---------------------------------------------
     Select a city
  ---------------------------------------------- */
  const handleSelectCity = (place: LiteAPIPlace) => {
    if (!place?.displayName) return;

    setSearchText(`${place.displayName}, ${place.formattedAddress || ''}`);
    onUpdateData('destination', place.displayName);
    onUpdateData('place', place);

    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  /* ---------------------------------------------
     Dropdown style
  ---------------------------------------------- */
  const dropdownStyle: ViewStyle = {
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
  };

  return (
    <View style={{ width }} className="flex-1 px-6 pt-6">
      <Animated.View style={[slideAnimStyle]} className="flex-1">
        <Text
          className="mb-2 text-3xl font-bold"
          style={{ color: isDarkMode ? COLORS.white.base : COLORS.gray[750] }}>
          {slide.title}
        </Text>

        {slide.subtitle && (
          <Text
            className="mb-8 text-base"
            style={{
              color: isDarkMode ? COLORS.gray[400] : COLORS.gray[600],
            }}>
            {slide.subtitle}
          </Text>
        )}

        {/* Input */}
        <View className="relative">
          <View
            className="flex-row items-center rounded-xl px-4 py-3"
            style={{
              backgroundColor: isDarkMode ? '#222222' : COLORS.gray[350],
              borderWidth: 1,
              borderColor: isDarkMode ? '#333333' : COLORS.gray[350],
            }}>
            <Text className="mr-2 text-lg">🔍</Text>
            <TextInput
              placeholder="Search for a city"
              value={searchText}
              onChangeText={setSearchText}
              className="flex-1 text-base"
              style={{
                color: isDarkMode ? COLORS.white.base : COLORS.gray[750],
              }}
            />
          </View>

          {/* Search Button */}
          <TouchableOpacity
            onPress={handleSearchPress}
            disabled={loadingPlaces}
            className="mt-3 items-center rounded-xl py-3"
            style={{
              backgroundColor: loadingPlaces
                ? COLORS.gray[400]
                : colors.primaryColors.default,
            }}>
            {loadingPlaces ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="font-semibold text-white">Search</Text>
            )}
          </TouchableOpacity>

          {/* Error */}
          {errorMessage && (
            <Text
              className="mt-2 text-sm"
              style={{ color: colors.destructiveColors.default }}>
              {errorMessage}
            </Text>
          )}

          {/* Results */}
          {showSuggestions && places.length > 0 && (
            <View
              className="absolute left-0 right-0 mt-32 max-h-64 rounded-xl"
              style={dropdownStyle}>
              <FlatList
                data={places}
                keyExtractor={(item) => item.placeId}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleSelectCity(item)}
                    className="border-b px-4 py-3"
                    style={({ pressed }) => ({
                      borderBottomColor: isDarkMode
                        ? '#333333'
                        : COLORS.gray[400],
                      backgroundColor: pressed
                        ? isDarkMode
                          ? '#2a2a2a'
                          : COLORS.gray[300]
                        : 'transparent',
                    })}>
                    <Text
                      className="text-base"
                      style={{
                        color: isDarkMode
                          ? COLORS.white.base
                          : COLORS.gray[750],
                      }}>
                      {item.displayName}
                    </Text>
                    {item.formattedAddress && (
                      <Text
                        className="mt-1 text-sm"
                        style={{
                          color: isDarkMode
                            ? COLORS.gray[500]
                            : COLORS.gray[400],
                        }}>
                        {item.formattedAddress}
                      </Text>
                    )}
                  </Pressable>
                )}
              />
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
};
