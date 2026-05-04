import { DateSelectionStep } from "@/components/trip-creation/steps/DateSelectionStep";
import { DestinationStep } from "@/components/trip-creation/steps/DestinationStep";
import TripSuccessStep from "@/components/trip-creation/steps/TripSuccessStep";
import GroupSizeStep, {
  type GroupSize,
} from "@/components/ai-trip/GroupSizeStep";
import AiVerifyStep from "@/components/ai-trip/AiVerifyStep";
import AiBuildingStep from "@/components/ai-trip/AiBuildingStep";
import { useDateRange } from "@marceloterreiro/flash-calendar";

import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { COLORS } from "@/constants/theme";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Toast } from "toastify-react-native";

import ShareTripModal from "@/components/trip-creation/ShareTripModal";
import { useAuth } from "@/context/AuthContext";
import { useGenerateFreeFormTrip } from "@/hooks/useAiTripActions";
import { useQuery } from "convex/react";
import { api } from "@runwae/convex/convex/_generated/api";
import { usePlaceSearch } from "@/components/trip-creation/hooks/usePlaceSearch";
import { LiteAPIPlace } from "@/types/liteapi.types";

const { width } = Dimensions.get("window");

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const TOTAL_PROGRESS_STEPS = 4; // destination → dates → group → verify

const CreateTripAi = () => {
  const { dark } = useTheme();
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const [destination, setDestination] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [places, setPlaces] = useState<LiteAPIPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const { debouncedSearch } = usePlaceSearch(
    setPlaces,
    setLoading,
    setErrorMessage,
    setShowDropdown,
  );

  const { calendarActiveDateRanges, onCalendarDayPress, dateRange } =
    useDateRange();
  const [selectedDates, setSelectedDates] = useState<{
    startId?: string;
    endId?: string;
  }>({});
  useEffect(() => {
    setSelectedDates(dateRange);
  }, [dateRange]);

  const [groupSize, setGroupSize] = useState<GroupSize | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [adHocTags, setAdHocTags] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [createdTrip, setCreatedTrip] = useState<{
    tripId: string;
    slug: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
  } | null>(null);

  const { user } = useAuth();
  const generateTripAction = useGenerateFreeFormTrip();
  const currentUser = useQuery(api.users.getCurrentUser, {});

  const baseTags = useMemo(() => {
    const tags = currentUser?.travellerTags ?? [];
    return tags.filter((t): t is string => typeof t === "string");
  }, [currentUser]);

  const goToStep = useCallback(
    (next: Step, dir: "forward" | "back" = "forward") => {
      Keyboard.dismiss();
      setDirection(dir);
      setCurrentStep(next);
    },
    [],
  );

  const handleQuickPickDates = useCallback(
    (offsetDays: number) => {
      const today = new Date();
      const todayId = today.toISOString().slice(0, 10);
      const end = new Date(today);
      end.setDate(today.getDate() + offsetDays);
      const endId = end.toISOString().slice(0, 10);
      onCalendarDayPress(todayId);
      onCalendarDayPress(endId);
    },
    [onCalendarDayPress],
  );

  const formatDate = (dateId?: string) => {
    if (!dateId) return "";
    const date = new Date(dateId);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  const calendarTheme = useMemo(
    () => ({
      itemDayContainer: {
        activeDayFiller: {
          backgroundColor: COLORS.pink.default,
        },
      },
      itemDay: {
        idle: ({ isToday }: { isToday: boolean }) => ({
          container: isToday
            ? {
                borderRadius: 20,
                backgroundColor: COLORS.pink.default,
              }
            : {},
          content: isToday
            ? { color: "#fff", fontWeight: "bold" }
            : { color: dark ? "#fff" : "#000" },
        }),
        active: ({ isToday }: { isToday: boolean }) => ({
          container: { backgroundColor: COLORS.pink.default },
          content: {
            color: "#fff",
            fontWeight: isToday ? "bold" : "normal",
          },
        }),
      },
    }),
    [dark],
  );

  const handleSubmit = async () => {
    if (!user?.id || !groupSize) return;
    if (!selectedDates.startId) return;
    if (!destination.trim()) return;
    setIsSubmitting(true);
    goToStep(4, "forward");
    try {
      const idempotencyKey = `mobile_${user.id}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 10)}`;
      const preferences = [...selectedTags, ...adHocTags];
      const startDate = selectedDates.startId;
      const endDate = selectedDates.endId ?? selectedDates.startId;
      const result = await generateTripAction({
        destinationLabel: destination.trim(),
        startDate,
        endDate,
        groupSize,
        preferences,
        idempotencyKey,
      });
      if (result.ok) {
        setCreatedTrip({
          tripId: result.tripId,
          slug: result.slug,
          title: `Trip to ${destination.trim()}`,
          destination: destination.trim(),
          startDate,
          endDate,
        });
        goToStep(5, "forward");
      } else {
        const reason = (result as { reason: string }).reason;
        Toast.show({
          type: "error",
          text1:
            reason === "quota_exhausted"
              ? "AI trip limit reached"
              : "Couldn't build the trip",
          text2:
            reason === "quota_exhausted"
              ? "You've used all your AI trips this month."
              : "Try again, or use the manual flow.",
          position: "bottom",
        });
        goToStep(3, "back");
      }
    } catch (err) {
      console.error("[ai] generate failed", err);
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: err instanceof Error ? err.message : "Try again in a moment.",
        position: "bottom",
      });
      goToStep(3, "back");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 4 || currentStep === 5) {
      router.back();
      return;
    }
    if (currentStep > 0) {
      goToStep((currentStep - 1) as Step, "back");
    } else {
      router.back();
    }
  };

  const isButtonDisabled = useMemo(() => {
    if (currentStep === 0) return !destination.trim();
    if (currentStep === 1) return !selectedDates.startId;
    if (currentStep === 2) return !groupSize;
    return false;
  }, [currentStep, destination, selectedDates, groupSize]);

  const renderStepContent = (step: Step) => {
    switch (step) {
      case 0:
        return (
          <DestinationStep
            width={width}
            dark={dark}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setDestination={setDestination}
            debouncedSearch={debouncedSearch}
            showDropdown={showDropdown}
            setShowDropdown={setShowDropdown}
            places={places}
            loading={loading}
            errorMessage={errorMessage}
          />
        );
      case 1:
        return (
          <DateSelectionStep
            width={width}
            dark={dark}
            calendarTheme={calendarTheme}
            calendarActiveDateRanges={calendarActiveDateRanges}
            onCalendarDayPress={onCalendarDayPress}
            selectedDates={selectedDates}
            formatDate={formatDate}
            onQuickPick={handleQuickPickDates}
          />
        );
      case 2:
        return (
          <GroupSizeStep
            width={width}
            value={groupSize}
            onChange={setGroupSize}
          />
        );
      case 3:
        return (
          <AiVerifyStep
            width={width}
            baseTags={baseTags}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            adHocTags={adHocTags}
            setAdHocTags={setAdHocTags}
          />
        );
      case 4:
        return (
          <AiBuildingStep
            width={width}
            destination={destination}
          />
        );
      case 5:
        return createdTrip ? (
          <TripSuccessStep
            width={width}
            destination={createdTrip.destination}
            title={createdTrip.title}
            onViewTrip={() =>
              router.replace(
                `/(tabs)/(trips)/${createdTrip.tripId}` as any,
              )
            }
            onShare={() => setShowShareModal(true)}
          />
        ) : null;
      default:
        return null;
    }
  };

  const progressTarget =
    currentStep < 4
      ? Math.min(((currentStep + 1) / TOTAL_PROGRESS_STEPS) * 100, 100)
      : 100;
  const progressShared = useSharedValue(progressTarget);
  useEffect(() => {
    progressShared.value = withTiming(progressTarget, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
  }, [progressTarget, progressShared]);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressShared.value}%` as any,
  }));

  const stepEntering =
    direction === "forward"
      ? SlideInRight.duration(280).easing(Easing.out(Easing.cubic))
      : SlideInLeft.duration(280).easing(Easing.out(Easing.cubic));
  const stepExiting =
    direction === "forward"
      ? SlideOutLeft.duration(220).easing(Easing.in(Easing.cubic))
      : SlideOutRight.duration(220).easing(Easing.in(Easing.cubic));

  const headerTitle = useMemo(() => {
    if (currentStep === 5) return "Trip ready";
    if (currentStep === 4) return "Building";
    return "Plan with AI";
  }, [currentStep]);

  const shareLink = useMemo(() => {
    if (!createdTrip?.slug) return "";
    const host =
      process.env.EXPO_PUBLIC_WEB_URL?.replace(/\/$/, "") ??
      "https://runwae.com";
    return `${host}/t/${createdTrip.slug}`;
  }, [createdTrip]);

  const formattedDates = useMemo(() => {
    if (!createdTrip) return "";
    const start = new Date(createdTrip.startDate);
    const end = new Date(createdTrip.endDate);
    const startMonth = start.toLocaleDateString("en-US", { month: "short" });
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = start.getFullYear();
    if (startMonth === end.toLocaleDateString("en-US", { month: "short" })) {
      return `${startMonth} ${startDay}-${endDay} ${year}`;
    }
    return `${startMonth} ${startDay} - ${end.toLocaleDateString("en-US", {
      month: "short",
    })} ${endDay} ${year}`;
  }, [createdTrip]);

  return (
    <AppSafeAreaView edges={["top"]}>
      <ScreenHeader title={headerTitle} onBack={handleBack} />

      {currentStep < 4 ? (
        <View className="px-5">
          <View className="h-[3px] rounded-full bg-gray-200 dark:bg-gray-800 mb-3 overflow-hidden">
            <Animated.View
              style={[
                {
                  height: 3,
                  borderRadius: 3,
                  backgroundColor: COLORS.pink.default,
                },
                progressStyle,
              ]}
            />
          </View>
        </View>
      ) : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View style={{ flex: 1, overflow: "hidden" }}>
          <Animated.View
            key={currentStep}
            entering={stepEntering}
            exiting={stepExiting}
            style={{ flex: 1 }}
          >
            {renderStepContent(currentStep)}
          </Animated.View>
        </View>

        {currentStep < 4 ? (
          <View className="px-5 pb-8">
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isButtonDisabled}
              className={`bg-primary h-[45px] rounded-full justify-center items-center ${
                isButtonDisabled ? "opacity-50" : ""
              }`}
              onPress={() => {
                Keyboard.dismiss();
                if (currentStep < 3) {
                  goToStep((currentStep + 1) as Step, "forward");
                } else {
                  handleSubmit();
                }
              }}
            >
              {isSubmitting && currentStep === 3 ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-medium">
                  {currentStep === 3 ? "Build my trip ✨" : "Next"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
      </KeyboardAvoidingView>

      <ShareTripModal
        isVisible={showShareModal}
        onClose={() => setShowShareModal(false)}
        tripData={{
          title: createdTrip?.title || "",
          destination: createdTrip?.destination || "",
          dates: formattedDates,
          shareLink,
        }}
      />
    </AppSafeAreaView>
  );
};

export default CreateTripAi;
