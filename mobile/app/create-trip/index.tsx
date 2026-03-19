import { CalendarContainer } from "@/components/trip-creation/calendar/CalendarContainer";
import { useDateRange } from "@marceloterreiro/flash-calendar";

import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import TripCreatedModal from "@/components/trip-creation/TripCreatedModal";
import { useAuth } from "@/context/AuthContext";
import { createTrip } from "@/utils/supabase/trips.service";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const MOCK_DESTINATIONS = [
  "Paris, France",
  "Suva, Fiji",
  "Nairobi, Kenya",
  "Tokyo, Japan",
  "New York, USA",
  "Bangkok, Thailand",
  "Tromsø, Norway",
  "Merzouga, Morocco",
  "Lagos, Nigeria",
  "London, UK",
  "Bali, Indonesia",
  "Rome, Italy",
  "Madrid, Spain",
  "Barcelona, Spain",
];

const CreateTrip = () => {
  const { dark } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [destination, setDestination] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { user } = useAuth();

  const { calendarActiveDateRanges, onCalendarDayPress, dateRange } =
    useDateRange();
  const [selectedDates, setSelectedDates] = useState<{
    startId?: string;
    endId?: string;
  }>({});

  useEffect(() => {
    setSelectedDates(dateRange);
  }, [dateRange]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDestinations, setFilteredDestinations] = useState<string[]>(
    [],
  );
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (MOCK_DESTINATIONS.includes(searchQuery)) {
      setShowDropdown(false);
      return;
    }
    const handler = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        const matches = MOCK_DESTINATIONS.filter((d) =>
          d.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setFilteredDestinations(matches);
        setShowDropdown(matches.length > 0);
      } else {
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const scrollToStep = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentStep(index);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [2, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      scrollToStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const formatDate = (dateId?: string) => {
    if (!dateId) return "";
    const date = new Date(dateId);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  const calendarTheme = useMemo(
    () => ({
      itemDayContainer: {
        activeDayFiller: {
          backgroundColor: "#FF2E92",
        },
      },
      itemDay: {
        idle: ({ isToday }: { isToday: boolean }) => ({
          container: isToday
            ? {
                borderRadius: 20,
                backgroundColor: "#FF2E92",
              }
            : {},
          content: isToday
            ? {
                color: "#fff",
                fontWeight: "bold",
              }
            : {
                color: dark ? "#fff" : "#000",
              },
        }),
        active: ({ isToday }: { isToday: boolean }) => ({
          container: {
            backgroundColor: "#FF2E92",
          },
          content: {
            color: "#fff",
            fontWeight: isToday ? "bold" : "normal",
          },
        }),
      },
    }),
    [dark],
  );

  const renderStep = useCallback(
    ({ index }: { index: number }) => {
      switch (index) {
        case 0:
          return (
            <View style={{ width }} className="px-5 pt-8">
              <Text
                className="text-2xl font-bold dark:text-white mb-2"
                style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
              >
                Where's the next adventure? 🚀
              </Text>
              <Text className="text-gray-400 dark:text-gray-500 mb-8">
                Please select a destination.
              </Text>

              <View className="mb-6 z-50">
                <Text className="text-sm font-semibold mb-2 dark:text-gray-300">
                  Destination
                </Text>
                <TextInput
                  className="bg-gray-100 dark:bg-dark-seconndary p-4 rounded-xl dark:text-white"
                  placeholder="e.g Paris, Lagos"
                  placeholderTextColor={dark ? "#666" : "#999"}
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    setDestination(text);
                  }}
                />

                {showDropdown && (
                  <View
                    className="absolute top-24 left-0 right-0 bg-white dark:bg-dark-seconndary rounded-xl shadow-lg border border-gray-100 dark:border-white/10 overflow-hidden z-50"
                    style={{ maxHeight: 200 }}
                  >
                    <ScrollView nestedScrollEnabled>
                      {filteredDestinations.map((dest, i) => (
                        <TouchableOpacity
                          key={i}
                          className="p-4 border-b border-gray-50 dark:border-white/5 last:border-0 flex-row items-center"
                          onPress={() => {
                            setDestination(dest);
                            setSearchQuery(dest);
                            setShowDropdown(false);
                          }}
                        >
                          <Ionicons
                            name="location-outline"
                            size={18}
                            color="#FF385C"
                            style={{ marginRight: 10 }}
                          />
                          <Text className="dark:text-white">{dest}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>
          );

        case 1:
          return (
            <View style={{ width }} className="px-5 pt-8 flex-1">
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
              >
                <Text
                  className="text-2xl font-bold dark:text-white mb-2"
                  style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
                >
                  Lock in the {"\n"}dates 🗓️
                </Text>
                <Text className="text-gray-400 dark:text-gray-500 mb-8">
                  Please Select your trip dates.
                </Text>

                <View className="mb-4">
                  <CalendarContainer
                    theme={calendarTheme}
                    backgroundColor={dark ? "#1A1A1A" : "#F7F8FA"}
                    calendarActiveDateRanges={calendarActiveDateRanges}
                    onCalendarDayPress={onCalendarDayPress}
                  />
                </View>

                {selectedDates.startId && (
                  <View className="flex-row items-center justify-center mt-auto mb-5">
                    <Text className="text-primary font-medium">
                      {formatDate(selectedDates.startId)}
                      {selectedDates.endId
                        ? ` → ${formatDate(selectedDates.endId)}`
                        : ""}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          );
        case 2:
          return (
            <View style={{ width }} className="px-5 pt-8">
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text
                  className="text-2xl font-bold dark:text-white mb-2"
                  style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
                >
                  Give your trip some {"\n"}personality ✨
                </Text>
                <Text className="text-gray-400 dark:text-gray-500 mb-8">
                  Personalise your trip; it's all in the details.
                </Text>

                <View className="mb-6">
                  <Text className="text-sm font-semibold mb-2 dark:text-gray-300">
                    Trip Title
                  </Text>

                  <TextInput
                    className="bg-gray-100 dark:bg-dark-seconndary p-4 rounded-xl dark:text-white"
                    placeholder="Placeholder"
                    placeholderTextColor={dark ? "#666" : "#999"}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>

                <View className="mb-6">
                  <Text className="text-sm font-semibold mb-2 dark:text-gray-300">
                    Description
                  </Text>

                  <TextInput
                    className="bg-gray-100 dark:bg-dark-seconndary p-4 rounded-xl dark:text-white h-32"
                    placeholder="Placeholder"
                    placeholderTextColor={dark ? "#666" : "#999"}
                    multiline
                    textAlignVertical="top"
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>

                <View className="mb-10">
                  <Text className="text-sm font-semibold mb-2 dark:text-gray-300">
                    Header Image
                  </Text>

                  <TouchableOpacity
                    onPress={pickImage}
                    className="bg-gray-50 dark:bg-dark-seconndary/30 border border-gray-200 dark:border-white/10 rounded-[8px] h-40 items-center justify-center overflow-hidden"
                  >
                    {image ? (
                      <Image
                        source={{ uri: image }}
                        className="w-full h-full"
                      />
                    ) : (
                      <>
                        <View className="mb-5">
                          <Image
                            source={require("@/assets/images/gallery-icon.png")}
                            style={{ width: 44, height: 44 }}
                            resizeMode="contain"
                          />
                        </View>

                        <Text className="text-primary font-semibold mb-2">
                          Tap to upload image
                        </Text>
                        <Text className="text-xs text-gray-400">
                          png or jpg (max 800x400px)
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          );
        default:
          return null;
      }
    },
    [
      width,
      dark,
      searchQuery,
      destination,
      showDropdown,
      filteredDestinations,
      calendarTheme,
      calendarActiveDateRanges,
      onCalendarDayPress,
      selectedDates,
      title,
      description,
      image,
    ],
  );

  const handleCreateTrip = async () => {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to create a trip.");
      return;
    }

    setIsCreating(true);
    try {
      const result = await createTrip({
        user_id: user.id,
        title: title.trim(),
        destination: destination.trim(),
        start_date: selectedDates.startId || "",
        end_date: selectedDates.endId || selectedDates.startId || "",
        cover_img_url: image || undefined,
        description: description.trim(),
      });

      if (result.success) {
        setShowSuccessModal(true);
      } else {
        Alert.alert("Error", result.error || "Failed to create trip.");
      }
    } catch (error: any) {
      console.error("Error creating trip:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const isButtonDisabled = useMemo(() => {
    if (currentStep === 0) return !destination.trim();
    if (currentStep === 1) return !selectedDates.startId;
    if (currentStep === 2) return !title.trim();
    return false;
  }, [currentStep, destination, selectedDates, title]);

  return (
    <AppSafeAreaView edges={["top"]}>
      <ScreenHeader title="Create Trip" onBack={handleBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <FlatList
          ref={flatListRef}
          data={[0, 1, 2]}
          renderItem={renderStep}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.toString()}
          extraData={[
            currentStep,
            calendarActiveDateRanges,
            dark,
            selectedDates,
            destination,
            searchQuery,
            title,
            image,
          ]}
        />

        <View className="px-5 pb-8">
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isButtonDisabled}
            className={`bg-primary h-[45px] rounded-full justify-center items-center ${
              isButtonDisabled ? "opacity-50" : ""
            }`}
            onPress={() => {
              Keyboard.dismiss();
              if (currentStep < 2) {
                scrollToStep(currentStep + 1);
              } else {
                handleCreateTrip();
              }
            }}
          >
            {isCreating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-medium">
                {currentStep === 2 ? "Create Trip 🥳" : "Next"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <TripCreatedModal
        isVisible={showSuccessModal}
        destination={destination}
        onClose={() => {
          setShowSuccessModal(false);
          router.replace("/trips");
        }}
        onStartPlanning={() => {
          setShowSuccessModal(false);
          router.replace("/trips");
        }}
        onShare={() => {
          Alert.alert("Share", "Sharing feature coming soon! 🚀");
        }}
      />
    </AppSafeAreaView>
  );
};

export default CreateTrip;
