import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
  FlatList,
  Keyboard,
  Alert,
  Platform,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '@clerk/clerk-expo';

import { COLORS } from '@/constants';
import { uploadImage } from '@/utils/uploadImage';
import { useUploadImage } from '@/hooks/useUploadImage';
import { textStyles } from '@/utils/styles';
import { searchPlaces } from '@/services/liteapi';
import type { LiteAPIPlace } from '@/types/liteapi.types';

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
  const [searchText, setSearchText] = useState(tripData.destination || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [places, setPlaces] = useState<LiteAPIPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<LiteAPIPlace | null>(null);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const slideAnimStyle = useAnimatedStyle(() => {
    return {
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
    };
  });

  const handleSelectCity = (place: LiteAPIPlace) => {
    if (!place || !place.displayName) {
      console.error('Invalid place selected:', place);
      return;
    }
    setSelectedPlace(place);
    setSearchText(`${place.displayName}, ${place.formattedAddress}`);
    console.log('place: ', place);
    onUpdateData('destination', place.displayName);
    // onUpdateData('placeId', place.placeId);
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  const dropdownStyle: ViewStyle = {
    backgroundColor: isDarkMode ? '#222222' : COLORS.gray[350],
    borderWidth: 1,
    borderColor: isDarkMode ? '#333333' : COLORS.gray[400],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    top: '100%',
  };

  const handleSearchPlaces = async (query: string) => {
    if (query.length < 2) {
      setShowSuggestions(false);
      setPlaces([]);
      return;
    }

    setLoadingPlaces(true);
    try {
      const response = await searchPlaces(query);
      // Filter out any undefined/null places and ensure they have required properties
      const validPlaces = (response.data || []).filter(
        (place): place is LiteAPIPlace =>
          place != null &&
          typeof place === 'object' &&
          typeof place.placeId === 'string' &&
          typeof place.displayName === 'string'
      );
      setPlaces(validPlaces);
      setShowSuggestions(validPlaces.length > 0);
    } catch (error) {
      console.error('Error searching places:', error);
      setPlaces([]);
      setShowSuggestions(false);
    } finally {
      setLoadingPlaces(false);
    }
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

        <View className="relative">
          <View
            className="flex-row items-center rounded-xl px-4 py-3"
            style={{
              backgroundColor: isDarkMode ? '#222222' : COLORS.gray[350],
              borderWidth: 1,
              borderColor: isDarkMode ? '#333333' : COLORS.gray[350],
            }}>
            <Text
              className="mr-2 text-lg"
              style={{
                color: isDarkMode ? COLORS.gray[500] : COLORS.gray[400],
              }}>
              🔍
            </Text>

            <TextInput
              placeholder="Search for a city"
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                handleSearchPlaces(text);
              }}
              onFocus={() => {
                if (places.length > 0) setShowSuggestions(true);
              }}
              onBlur={() => setShowSuggestions(false)}
              className="flex-1 text-base"
              style={{
                color: isDarkMode ? COLORS.white.base : COLORS.gray[750],
              }}
            />
          </View>

          {showSuggestions && places.length > 0 && (
            <View
              className="absolute left-0 right-0 z-50 mt-1 max-h-64 rounded-xl"
              style={dropdownStyle}>
              {loadingPlaces && (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <ActivityIndicator
                    size="small"
                    color={colors.primaryColors.default}
                  />
                </View>
              )}
              {!loadingPlaces && (
                <FlatList
                  data={places.filter(
                    (place) => place && place.placeId && place.displayName
                  )}
                  keyExtractor={(item) => item.placeId}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleSelectCity(item)}
                      className="border-b px-4 py-3"
                      style={{
                        borderBottomColor: isDarkMode
                          ? '#333333'
                          : COLORS.gray[400],
                      }}>
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
                    </TouchableOpacity>
                  )}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                />
              )}
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

export const DateSlide: React.FC<SlideProps> = ({
  slide,
  slideAnimation,
  tripData,
  onUpdateData,
  colors,
  isDarkMode,
}) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const slideAnimStyle = useAnimatedStyle(() => {
    return {
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
    };
  });

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateRange = () => {
    if (!tripData.startDate || !tripData.endDate) return '';
    const start = new Date(tripData.startDate).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
    const end = new Date(tripData.endDate).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
    return `${start} - ${end}`;
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

        <View className="mb-6">
          <Text
            className="mb-3 text-base font-semibold"
            style={{
              color: isDarkMode ? COLORS.white.base : COLORS.gray[750],
            }}>
            Start Date
          </Text>
          <TouchableOpacity
            onPress={() => setShowStartPicker(true)}
            className="rounded-xl px-4 py-4"
            style={{
              backgroundColor: isDarkMode ? '#222222' : COLORS.gray[350],
              borderWidth: 1,
              borderColor: isDarkMode ? '#333333' : COLORS.gray[350],
            }}>
            <Text
              className="text-base"
              style={{
                color: tripData.startDate
                  ? isDarkMode
                    ? COLORS.white.base
                    : COLORS.gray[750]
                  : isDarkMode
                    ? COLORS.gray[500]
                    : COLORS.gray[400],
              }}>
              {formatDate(
                tripData.startDate ? new Date(tripData.startDate) : null
              )}
            </Text>
          </TouchableOpacity>

          {showStartPicker && (
            <DateTimePicker
              value={
                tripData.startDate ? new Date(tripData.startDate) : new Date()
              }
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowStartPicker(false);
                if (selectedDate) {
                  onUpdateData('startDate', selectedDate.toISOString());
                }
              }}
            />
          )}
        </View>

        <View className="mb-6">
          <Text
            className="mb-3 text-base font-semibold"
            style={{
              color: isDarkMode ? COLORS.white.base : COLORS.gray[750],
            }}>
            End Date
          </Text>
          <TouchableOpacity
            onPress={() => setShowEndPicker(true)}
            className="rounded-xl px-4 py-4"
            style={{
              backgroundColor: isDarkMode ? '#222222' : COLORS.gray[350],
              borderWidth: 1,
              borderColor: isDarkMode ? '#333333' : COLORS.gray[350],
            }}>
            <Text
              className="text-base"
              style={{
                color: tripData.endDate
                  ? isDarkMode
                    ? COLORS.white.base
                    : COLORS.gray[750]
                  : isDarkMode
                    ? COLORS.gray[500]
                    : COLORS.gray[400],
              }}>
              {formatDate(tripData.endDate ? new Date(tripData.endDate) : null)}
            </Text>
          </TouchableOpacity>

          {showEndPicker && (
            <DateTimePicker
              value={tripData.endDate ? new Date(tripData.endDate) : new Date()}
              mode="date"
              display="default"
              minimumDate={
                tripData.startDate ? new Date(tripData.startDate) : new Date()
              }
              onChange={(event, selectedDate) => {
                setShowEndPicker(false);
                if (selectedDate) {
                  onUpdateData('endDate', selectedDate.toISOString());
                }
              }}
            />
          )}
        </View>

        {tripData.startDate && tripData.endDate && (
          <View
            className="mt-4 rounded-xl px-4 py-3"
            style={{ backgroundColor: colors.primaryColors.background }}>
            <Text
              className="text-center text-sm font-medium"
              style={{ color: colors.primaryColors.default }}>
              Selected: {formatDateRange()}
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

export const PersonalizationSlide: React.FC<SlideProps> = ({
  slide,
  slideAnimation,
  tripData,
  onUpdateData,
  colors,
  isDarkMode,
}) => {
  const { pickAndUpload } = useUploadImage();
  const slideAnimStyle = useAnimatedStyle(() => {
    return {
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
    };
  });

  const pickImage = async () => {
    try {
      // Request permissions
      if (Platform.OS !== 'web') {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Sorry, we need camera roll permissions to upload images!'
          );
          return;
        }
      }

      // Launch image picker
      const publicUrl = await pickAndUpload('trip-images');
      if (publicUrl) {
        onUpdateData('headerImage', publicUrl);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
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

        {/* Header Image Upload */}
        <View className="mb-6">
          <Text
            className="mb-3 text-base font-semibold"
            style={{
              color: isDarkMode ? COLORS.white.base : COLORS.gray[750],
            }}>
            Header Image
          </Text>
          <TouchableOpacity
            onPress={pickImage}
            style={{
              borderColor: isDarkMode ? '#333333' : COLORS.gray[350],
              backgroundColor: isDarkMode ? '#1a1a1a' : COLORS.gray[350],
              height: 256,
              aspectRatio: 1,
              borderRadius: 9999,
              overflow: 'hidden',
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {tripData.headerImage ? (
              <Image
                source={{ uri: tripData.headerImage }}
                // className="h-32 w-full rounded-xl"
                style={{
                  height: '100%',
                  width: '100%',
                  borderRadius: 9999,
                }}
                contentFit="contain"
              />
            ) : (
              <>
                <Text
                  style={{
                    ...textStyles.regular_16,
                    color: colors.primaryColors.default,
                  }}>
                  🖼️
                </Text>
                <Text
                  style={{
                    ...textStyles.regular_16,
                    color: colors.primaryColors.default,
                    textAlign: 'center',
                  }}>
                  Tap to upload image
                </Text>
                <Text
                  style={{
                    ...textStyles.regular_12,
                    color: isDarkMode ? COLORS.gray[500] : COLORS.gray[400],
                    textAlign: 'center',
                  }}>
                  png or jpg (max 800x400px)
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Trip Name */}
        <View className="mb-6">
          <Text
            className="mb-3 text-base font-semibold"
            style={{
              color: isDarkMode ? COLORS.white.base : COLORS.gray[750],
            }}>
            Trip Name
          </Text>
          <TextInput
            placeholder="My trip"
            placeholderTextColor={
              isDarkMode ? COLORS.gray[500] : COLORS.gray[400]
            }
            value={tripData.name || ''}
            onChangeText={(text) => onUpdateData('name', text)}
            className="rounded-xl px-4 py-3 text-base"
            style={{
              backgroundColor: isDarkMode ? '#222222' : COLORS.gray[350],
              borderWidth: 1,
              borderColor: isDarkMode ? '#333333' : COLORS.gray[350],
              color: isDarkMode ? COLORS.white.base : COLORS.gray[750],
            }}
          />
        </View>

        {/* Trip Description */}
        <View className="mb-6">
          <View className="mb-3 flex-row items-center">
            <Text
              className="text-base font-semibold"
              style={{
                color: isDarkMode ? COLORS.white.base : COLORS.gray[750],
              }}>
              Trip Description{' '}
            </Text>
            <Text
              className="text-sm"
              style={{
                color: isDarkMode ? COLORS.gray[500] : COLORS.gray[400],
              }}>
              (Optional)
            </Text>
          </View>
          <TextInput
            placeholder="My trip"
            placeholderTextColor={
              isDarkMode ? COLORS.gray[500] : COLORS.gray[400]
            }
            value={tripData.description || ''}
            onChangeText={(text) => onUpdateData('description', text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="rounded-xl px-4 py-3 text-base"
            style={{
              backgroundColor: isDarkMode ? '#222222' : COLORS.gray[350],
              borderWidth: 1,
              borderColor: isDarkMode ? '#333333' : COLORS.gray[350],
              color: isDarkMode ? COLORS.white.base : COLORS.gray[750],
              height: 100,
            }}
          />
        </View>
      </Animated.View>
    </View>
  );
};
