import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Dimensions,
  TextInput,
  FlatList,
  Keyboard,
  Alert,
  Platform,
  ViewStyle,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

import * as ImagePicker from 'expo-image-picker';
import { searchPlaces } from '@/services/liteapi';
import type { LiteAPIPlace } from '@/types/liteapi.types';

import { COLORS } from '@/constants';
import { useUploadImage } from '@/hooks/useUploadImage';
import { Spacer } from '@/components';
import { textStyles } from '@/utils/styles';
import { SlideHeader } from './SlideHeader';
import { ImageUploadSection } from './components/ImageUploadSection';
import { TripFormFields } from './components/TripFormFields';
import { useTripPersonalization } from './hooks/useTripPersonalization';

const { width } = Dimensions.get('window');

interface SlideProps {
  slide: any;
  slideAnimation: any;
  tripData: any;
  onUpdateData: (key: string, value: any) => void;
  colors: any;
  isDarkMode: boolean;
}

export const DestinationSlide: React.FC<SlideProps> = React.memo(
  ({ slide, slideAnimation, tripData, onUpdateData, colors, isDarkMode }) => {
    const [searchText, setSearchText] = useState(tripData.destination || '');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [places, setPlaces] = useState<LiteAPIPlace[]>([]);
    const [loadingPlaces, setLoadingPlaces] = useState(false);
    const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isPressingSuggestionRef = useRef(false);

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
      // Clear any pending blur timeout
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
      isPressingSuggestionRef.current = false;
      setSearchText(`${place.displayName}, ${place.formattedAddress}`);
      onUpdateData('destination', place.displayName);
      onUpdateData('place', place);
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
      elevation: 10,
      zIndex: 9999,
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

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (blurTimeoutRef.current) {
          clearTimeout(blurTimeoutRef.current);
        }
      };
    }, []);

    return (
      <View style={{ width }} className="flex-1 px-6 pt-6">
        <Animated.View style={[slideAnimStyle]} className="flex-1">
          <SlideHeader
            title={slide.title}
            subtitle={slide.subtitle}
            isDarkMode={isDarkMode}
          />

          <View className="relative" collapsable={false}>
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
                  if (text.length === 0) {
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  // Clear any pending blur timeout
                  if (blurTimeoutRef.current) {
                    clearTimeout(blurTimeoutRef.current);
                    blurTimeoutRef.current = null;
                  }
                  if (places.length > 0) setShowSuggestions(true);
                }}
                blurOnSubmit={false}
                className="flex-1 text-base"
                style={{
                  color: isDarkMode ? COLORS.white.base : COLORS.gray[750],
                }}
              />
            </View>

            {showSuggestions && places.length > 0 && (
              <View
                className="absolute left-0 right-0 mt-1 max-h-64 rounded-xl"
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
                      <Pressable
                        onPress={() => {
                          handleSelectCity(item);
                        }}
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
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="none"
                  />
                )}
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    );
  }
);

DestinationSlide.displayName = 'DestinationSlide';

export { DateSlide } from './DateSlide';

export const PersonalizationSlide: React.FC<SlideProps> = React.memo(
  ({ slide, slideAnimation, tripData, onUpdateData, colors, isDarkMode }) => {
    const { updateField, errors } = useTripPersonalization({
      initialData: tripData,
      onUpdateData,
    });

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

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ width }}
        className="flex-1 px-6 pt-6">
        <Animated.View style={[slideAnimStyle]} className="flex-1">
          <SlideHeader
            title={slide.title}
            subtitle={slide.subtitle}
            isDarkMode={isDarkMode}
          />

          <TripFormFields
            name={tripData.name || ''}
            description={tripData.description || ''}
            nameError={errors.name}
            descriptionError={errors.description}
            onNameChange={(text) => updateField('name', text)}
            onDescriptionChange={(text) => updateField('description', text)}
            isDarkMode={isDarkMode}
          />

          <ImageUploadSection
            value={tripData.headerImage}
            onChange={(url) => updateField('headerImage', url)}
            colors={colors}
            isDarkMode={isDarkMode}
          />
        </Animated.View>
        {/* <Spacer vertical size={148} /> */}
      </ScrollView>
    );
  }
);

PersonalizationSlide.displayName = 'PersonalizationSlide';
