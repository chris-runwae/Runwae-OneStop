import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Image,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";

import { COLORS } from "@/constants";

const { width } = Dimensions.get("window");

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
  const slideAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: slideAnimation.value,
      transform: [
        {
          translateX: interpolate(
            slideAnimation.value,
            [0, 1],
            [width * 0.1, 0],
          ),
        },
      ],
    };
  });

  return (
    <View style={{ width }} className="flex-1 px-6 pt-6">
      <Animated.View style={[slideAnimStyle]} className="flex-1">
        <Text
          className="mb-2 text-3xl font-bold"
          style={{ color: isDarkMode ? COLORS.white.base : COLORS.gray[750] }}
        >
          {slide.title}
        </Text>

        {slide.subtitle && (
          <Text
            className="mb-8 text-base"
            style={{
              color: isDarkMode ? COLORS.gray[400] : COLORS.gray[600],
            }}
          >
            {slide.subtitle}
          </Text>
        )}

        <View
          className="flex-row items-center rounded-xl px-4 py-3"
          style={{
            backgroundColor: isDarkMode ? "#222222" : COLORS.gray[350],
            borderWidth: 1,
            borderColor: isDarkMode ? "#333333" : COLORS.gray[350],
          }}
        >
          <Text
            className="mr-2 text-lg"
            style={{
              color: isDarkMode ? COLORS.gray[500] : COLORS.gray[400],
            }}
          >
            🔍
          </Text>
          <TextInput
            placeholder={slide.placeholder}
            placeholderTextColor={
              isDarkMode ? COLORS.gray[500] : COLORS.gray[400]
            }
            value={tripData.destination || ""}
            onChangeText={(text) => onUpdateData("destination", text)}
            className="flex-1 text-base"
            style={{
              color: isDarkMode ? COLORS.white.base : COLORS.gray[750],
            }}
          />
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
            [width * 0.1, 0],
          ),
        },
      ],
    };
  });

  const formatDate = (date: Date | null) => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateRange = () => {
    if (!tripData.startDate || !tripData.endDate) return "";
    const start = new Date(tripData.startDate).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
    const end = new Date(tripData.endDate).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
    return `${start} - ${end}`;
  };

  return (
    <View style={{ width }} className="flex-1 px-6 pt-6">
      <Animated.View style={[slideAnimStyle]} className="flex-1">
        <Text
          className="mb-2 text-3xl font-bold"
          style={{ color: isDarkMode ? COLORS.white.base : COLORS.gray[750] }}
        >
          {slide.title}
        </Text>

        {slide.subtitle && (
          <Text
            className="mb-8 text-base"
            style={{
              color: isDarkMode ? COLORS.gray[400] : COLORS.gray[600],
            }}
          >
            {slide.subtitle}
          </Text>
        )}

        <View className="mb-6">
          <Text
            className="mb-3 text-base font-semibold"
            style={{ color: isDarkMode ? COLORS.white.base : COLORS.gray[750] }}
          >
            Start Date
          </Text>
          <TouchableOpacity
            onPress={() => setShowStartPicker(true)}
            className="rounded-xl px-4 py-4"
            style={{
              backgroundColor: isDarkMode ? "#222222" : COLORS.gray[350],
              borderWidth: 1,
              borderColor: isDarkMode ? "#333333" : COLORS.gray[350],
            }}
          >
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
              }}
            >
              {formatDate(
                tripData.startDate ? new Date(tripData.startDate) : null,
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
                  onUpdateData("startDate", selectedDate.toISOString());
                }
              }}
            />
          )}
        </View>

        <View className="mb-6">
          <Text
            className="mb-3 text-base font-semibold"
            style={{ color: isDarkMode ? COLORS.white.base : COLORS.gray[750] }}
          >
            End Date
          </Text>
          <TouchableOpacity
            onPress={() => setShowEndPicker(true)}
            className="rounded-xl px-4 py-4"
            style={{
              backgroundColor: isDarkMode ? "#222222" : COLORS.gray[350],
              borderWidth: 1,
              borderColor: isDarkMode ? "#333333" : COLORS.gray[350],
            }}
          >
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
              }}
            >
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
                  onUpdateData("endDate", selectedDate.toISOString());
                }
              }}
            />
          )}
        </View>

        {tripData.startDate && tripData.endDate && (
          <View
            className="mt-4 rounded-xl px-4 py-3"
            style={{ backgroundColor: colors.primaryColors.background }}
          >
            <Text
              className="text-center text-sm font-medium"
              style={{ color: colors.primaryColors.default }}
            >
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
  const slideAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: slideAnimation.value,
      transform: [
        {
          translateX: interpolate(
            slideAnimation.value,
            [0, 1],
            [width * 0.1, 0],
          ),
        },
      ],
    };
  });

  return (
    <View style={{ width }} className="flex-1 px-6 pt-6">
      <Animated.View style={[slideAnimStyle]} className="flex-1">
        <Text
          className="mb-2 text-3xl font-bold"
          style={{ color: isDarkMode ? COLORS.white.base : COLORS.gray[750] }}
        >
          {slide.title}
        </Text>

        {slide.subtitle && (
          <Text
            className="mb-8 text-base"
            style={{
              color: isDarkMode ? COLORS.gray[400] : COLORS.gray[600],
            }}
          >
            {slide.subtitle}
          </Text>
        )}

        {/* Header Image Upload */}
        <View className="mb-6">
          <Text
            className="mb-3 text-base font-semibold"
            style={{ color: isDarkMode ? COLORS.white.base : COLORS.gray[750] }}
          >
            Header Image
          </Text>
          <TouchableOpacity
            onPress={() => {
              // TODO: Implement image picker
            }}
            className="items-center justify-center rounded-xl border-2 border-dashed py-12"
            style={{
              borderColor: isDarkMode ? "#333333" : COLORS.gray[350],
              backgroundColor: isDarkMode ? "#1a1a1a" : COLORS.gray[350],
            }}
          >
            {tripData.headerImage ? (
              <Image
                source={{ uri: tripData.headerImage }}
                className="h-32 w-full rounded-xl"
                resizeMode="cover"
              />
            ) : (
              <>
                <Text className="mb-2 text-4xl">🖼️</Text>
                <Text
                  className="mb-1 text-base font-medium"
                  style={{ color: colors.primaryColors.default }}
                >
                  Tap to upload image
                </Text>
                <Text
                  className="text-xs"
                  style={{
                    color: isDarkMode ? COLORS.gray[500] : COLORS.gray[400],
                  }}
                >
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
            style={{ color: isDarkMode ? COLORS.white.base : COLORS.gray[750] }}
          >
            Trip Name
          </Text>
          <TextInput
            placeholder="My trip"
            placeholderTextColor={
              isDarkMode ? COLORS.gray[500] : COLORS.gray[400]
            }
            value={tripData.name || ""}
            onChangeText={(text) => onUpdateData("name", text)}
            className="rounded-xl px-4 py-3 text-base"
            style={{
              backgroundColor: isDarkMode ? "#222222" : COLORS.gray[350],
              borderWidth: 1,
              borderColor: isDarkMode ? "#333333" : COLORS.gray[350],
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
              }}
            >
              Trip Description{" "}
            </Text>
            <Text
              className="text-sm"
              style={{
                color: isDarkMode ? COLORS.gray[500] : COLORS.gray[400],
              }}
            >
              (Optional)
            </Text>
          </View>
          <TextInput
            placeholder="My trip"
            placeholderTextColor={
              isDarkMode ? COLORS.gray[500] : COLORS.gray[400]
            }
            value={tripData.description || ""}
            onChangeText={(text) => onUpdateData("description", text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="rounded-xl px-4 py-3 text-base"
            style={{
              backgroundColor: isDarkMode ? "#222222" : COLORS.gray[350],
              borderWidth: 1,
              borderColor: isDarkMode ? "#333333" : COLORS.gray[350],
              color: isDarkMode ? COLORS.white.base : COLORS.gray[750],
              height: 100,
            }}
          />
        </View>
      </Animated.View>
    </View>
  );
};
