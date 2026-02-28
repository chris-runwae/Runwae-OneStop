import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { Info, LoaderCircle } from 'lucide-react-native';
import type { LiteAPIPlace } from '@/types/liteapi.types';

interface PlaceItemProps {
  place: LiteAPIPlace;
  onPress: (place: LiteAPIPlace) => void;
  getTextColor: () => { color: string };
  getSecondaryTextColor: () => { color: string };
  getPressableStyle: (pressed: boolean) => any;
}

const PlaceItem: React.FC<PlaceItemProps> = ({
  place,
  onPress,
  getTextColor,
  getSecondaryTextColor,
  getPressableStyle,
}) => {
  return (
    <Pressable
      key={place.placeId}
      onPress={() => onPress(place)}
      className="border-b px-4 py-3"
      style={({ pressed }) => getPressableStyle(pressed)}>
      <Text className="text-base" style={getTextColor()}>
        {place.displayName}
      </Text>
      {place.formattedAddress && (
        <Text className="mt-1 text-sm" style={getSecondaryTextColor()}>
          {place.formattedAddress}
        </Text>
      )}
    </Pressable>
  );
};

interface PlaceResultsProps {
  places: LiteAPIPlace[];
  loading: boolean;
  errorMessage: string | null;
  onSelectPlace: (place: LiteAPIPlace) => void;
  getTextColor: () => { color: string };
  getSecondaryTextColor: () => { color: string };
  getPressableStyle: (pressed: boolean) => any;
  isDarkMode: boolean;
  spinAnimStyle: any;
}

export const PlaceResults: React.FC<PlaceResultsProps> = ({
  places,
  loading,
  errorMessage,
  onSelectPlace,
  getTextColor,
  getSecondaryTextColor,
  getPressableStyle,
  isDarkMode,
  spinAnimStyle,
}) => {
  if (loading) {
    return (
      <View className="flex h-[300px] flex-1 flex-col items-center justify-center gap-y-3">
        <Animated.View style={spinAnimStyle}>
          <LoaderCircle size={30} color={isDarkMode ? '#fff' : '#000'} />
        </Animated.View>
        <Text className="text-center text-sm text-gray-500">
          Searching for places...
        </Text>
      </View>
    );
  }

  if (places.length > 0) {
    return (
      <ScrollView
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        className="max-h-64">
        {places.map((place) => (
          <PlaceItem
            key={place.placeId}
            place={place}
            onPress={onSelectPlace}
            getTextColor={getTextColor}
            getSecondaryTextColor={getSecondaryTextColor}
            getPressableStyle={getPressableStyle}
          />
        ))}
      </ScrollView>
    );
  }

  if (errorMessage) {
    return (
      <View className="flex flex-1 items-center justify-center gap-3">
        <View>
          <Info size={40} color={isDarkMode ? '#fff' : '#000'} />
        </View>
        <Text className="text-center text-sm" style={getSecondaryTextColor()}>
          {errorMessage}
        </Text>
      </View>
    );
  }

  return null;
};
