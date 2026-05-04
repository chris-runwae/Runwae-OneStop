import { DateSelectionStep } from '@/components/trip-creation/steps/DateSelectionStep';
import { DestinationStep } from '@/components/trip-creation/steps/DestinationStep';
import { TripDetailsStep } from '@/components/trip-creation/steps/TripDetailsStep';
import TripSuccessStep from '@/components/trip-creation/steps/TripSuccessStep';
import CoverImagePicker from '@/components/trip-creation/cover/CoverImagePicker';
import { useDateRange } from '@marceloterreiro/flash-calendar';

import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import ShareTripModal from '@/components/trip-creation/ShareTripModal';
import TemplatePickerModal from '@/components/trip-creation/TemplatePickerModal';
import type { TripVisibility } from '@/components/trip-creation/steps/TripDetailsStep';
import { useAuth } from '@/context/AuthContext';
import { useCreateFromTemplate, useCreateTrip } from '@/hooks/useTripActions';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';
import { uploadImageFromUri } from '@/lib/uploadImage';
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Animated, {
  Easing,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Toast } from 'toastify-react-native';

const { width } = Dimensions.get('window');

import { usePlaceSearch } from '@/components/trip-creation/hooks/usePlaceSearch';
import { LiteAPIPlace } from '@/types/liteapi.types';
import { Colors } from '@/constants';

type Step = 0 | 1 | 2 | 3;

const TOTAL_PROGRESS_STEPS = 3;

const CreateTrip = () => {
  const { dark } = useTheme();
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme ?? 'light'];

  const params = useLocalSearchParams<{ seedDestination?: string }>();
  const seed =
    typeof params.seedDestination === 'string' ? params.seedDestination : '';

  const [destination, setDestination] = useState(seed);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [coverIsRemote, setCoverIsRemote] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [createdTrip, setCreatedTrip] = useState<{
    tripId: string;
    slug: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
  } | null>(null);
  const [currency, setCurrency] = useState('GBP');
  const [visibility, setVisibility] = useState<TripVisibility>('private');

  const { user } = useAuth();
  const createTripMut = useCreateTrip();
  const createFromTemplateMut = useCreateFromTemplate();
  const generateUrlMut = useMutation(api.users.generateImageUploadUrl);
  const resolveUrlMut = useMutation(api.users.resolveStorageUrl);
  const currentUser = useQuery(api.users.getCurrentUser, {});
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const hasInitCurrency = useRef(false);
  useEffect(() => {
    if (hasInitCurrency.current) return;
    const pref = currentUser?.preferredCurrency;
    if (typeof pref === 'string' && pref.length > 0) {
      setCurrency(pref);
      hasInitCurrency.current = true;
    }
  }, [currentUser]);

  const { calendarActiveDateRanges, onCalendarDayPress, dateRange } =
    useDateRange();
  const [selectedDates, setSelectedDates] = useState<{
    startId?: string;
    endId?: string;
  }>({});

  useEffect(() => {
    setSelectedDates(dateRange);
  }, [dateRange]);

  const [searchQuery, setSearchQuery] = useState(seed);
  const [places, setPlaces] = useState<LiteAPIPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const { debouncedSearch } = usePlaceSearch(
    setPlaces,
    setLoading,
    setErrorMessage,
    setShowDropdown
  );

  const goToStep = useCallback(
    (next: Step, dir: 'forward' | 'back' = 'forward') => {
      Keyboard.dismiss();
      setDirection(dir);
      setCurrentStep(next);
    },
    []
  );

  const handleQuickPickDates = useCallback(
    (offsetDays: number) => {
      const today = new Date();
      const todayId = today.toISOString().slice(0, 10);
      const end = new Date(today);
      end.setDate(today.getDate() + offsetDays);
      const endId = end.toISOString().slice(0, 10);
      // useDateRange tracks start/end via its own state machine — calling
      // onCalendarDayPress twice mirrors the user tapping start then end.
      onCalendarDayPress(todayId);
      onCalendarDayPress(endId);
    },
    [onCalendarDayPress]
  );

  const handleBack = () => {
    if (currentStep === 3) {
      // Success terminal — back exits the flow.
      router.back();
      return;
    }
    if (currentStep > 0) {
      goToStep((currentStep - 1) as Step, 'back');
    } else {
      router.back();
    }
  };

  const formatDate = (dateId?: string) => {
    if (!dateId) return '';
    const date = new Date(dateId);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
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
            ? {
                color: '#fff',
                fontWeight: 'bold',
              }
            : {
                color: dark ? '#fff' : '#000',
              },
        }),
        active: ({ isToday }: { isToday: boolean }) => ({
          container: {
            backgroundColor: COLORS.pink.default,
          },
          content: {
            color: '#fff',
            fontWeight: isToday ? 'bold' : 'normal',
          },
        }),
      },
    }),
    [dark]
  );

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
          <TripDetailsStep
            width={width}
            dark={dark}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            image={coverUri}
            pickImage={async () => setShowCoverPicker(true)}
            currency={currency}
            setCurrency={setCurrency}
            visibility={visibility}
            setVisibility={setVisibility}
          />
        );
      case 3:
        return createdTrip ? (
          <TripSuccessStep
            width={width}
            destination={createdTrip.destination}
            title={createdTrip.title}
            onViewTrip={() => {
              router.replace(`/(tabs)/(trips)/${createdTrip.tripId}` as any);
            }}
            onShare={() => setShowShareModal(true)}
          />
        ) : null;
      default:
        return null;
    }
  };

  const handleCreateTrip = async () => {
    if (!user?.id) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'You must be logged in to create a trip.',
        position: 'bottom',
      });
      return;
    }

    setIsCreating(true);
    try {
      let coverImageUrl: string | undefined;
      if (coverUri) {
        if (coverIsRemote) {
          coverImageUrl = coverUri;
        } else {
          try {
            coverImageUrl = await uploadImageFromUri(coverUri, {
              generateUrl: () => generateUrlMut(),
              resolveUrl: (args) => resolveUrlMut(args),
            });
          } catch (uploadErr) {
            console.error('Error uploading cover:', uploadErr);
          }
        }
      }

      const result = await createTripMut({
        title: title.trim(),
        description: description.trim() || undefined,
        destinationLabel: destination.trim(),
        startDate: selectedDates.startId || '',
        endDate: selectedDates.endId || selectedDates.startId || '',
        visibility,
        currency,
        coverImageUrl,
      });

      setCreatedTrip({
        tripId: result.tripId,
        slug: result.slug,
        title: title.trim(),
        destination: destination.trim(),
        startDate: selectedDates.startId || '',
        endDate: selectedDates.endId || selectedDates.startId || '',
      });
      goToStep(3, 'forward');
    } catch (error: any) {
      console.error('Error creating trip:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error?.message || 'An unexpected error occurred. Please try again.',
        position: 'bottom',
      });
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

  const shareLink = useMemo(() => {
    if (!createdTrip?.slug) return '';
    const host =
      process.env.EXPO_PUBLIC_WEB_URL?.replace(/\/$/, '') ??
      'https://runwae.com';
    return `${host}/t/${createdTrip.slug}`;
  }, [createdTrip]);

  const formattedDates = useMemo(() => {
    if (!createdTrip) return '';
    const start = new Date(createdTrip.startDate);
    const end = new Date(createdTrip.endDate);
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = start.getFullYear();
    if (startMonth === end.toLocaleDateString('en-US', { month: 'short' })) {
      return `${startMonth} ${startDay}-${endDay} ${year}`;
    }
    return `${startMonth} ${startDay} - ${end.toLocaleDateString('en-US', {
      month: 'short',
    })} ${endDay} ${year}`;
  }, [createdTrip]);

  // Animated progress bar fill — only visible while in steps 0–2.
  const progressTarget =
    currentStep < 3
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
    direction === 'forward'
      ? SlideInRight.duration(280).easing(Easing.out(Easing.cubic))
      : SlideInLeft.duration(280).easing(Easing.out(Easing.cubic));
  const stepExiting =
    direction === 'forward'
      ? SlideOutLeft.duration(220).easing(Easing.in(Easing.cubic))
      : SlideOutRight.duration(220).easing(Easing.in(Easing.cubic));

  return (
    <AppSafeAreaView edges={['top']}>
      <ScreenHeader
        title={currentStep === 3 ? 'All set' : 'Create Trip'}
        onBack={handleBack}
      />

      {currentStep < 3 ? (
        <View className="px-5">
          <View
            className="mb-3 h-[3px] overflow-hidden rounded-full"
            style={{ backgroundColor: colors.borderColors.subtle }}>
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

          <TouchableOpacity
            onPress={() => setShowTemplatePicker(true)}
            activeOpacity={0.8}
            className="mb-4 flex-row items-center justify-between rounded-xl border px-4 py-3"
            style={{
              borderColor: colors.borderColors.subtle,
              backgroundColor: colors.backgroundColors.subtle,
            }}>
            <View>
              <Text className="text-sm font-semibold text-black dark:text-white">
                Start from a template ✨
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Skip the setup — pick a curated itinerary
              </Text>
            </View>
            <Text className="text-base text-primary">›</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <View style={{ flex: 1, overflow: 'hidden' }}>
          <Animated.View
            key={currentStep}
            entering={stepEntering}
            exiting={stepExiting}
            style={{ flex: 1 }}>
            {renderStepContent(currentStep)}
          </Animated.View>
        </View>

        {currentStep < 3 ? (
          <View className="px-5 pb-8">
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isButtonDisabled}
              className={`h-[45px] items-center justify-center rounded-full bg-primary ${
                isButtonDisabled ? 'opacity-50' : ''
              }`}
              onPress={() => {
                Keyboard.dismiss();
                if (currentStep < 2) {
                  goToStep((currentStep + 1) as Step, 'forward');
                } else {
                  handleCreateTrip();
                }
              }}>
              {isCreating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-medium text-white">
                  {currentStep === 2 ? 'Create Trip 🥳' : 'Next'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
      </KeyboardAvoidingView>

      <CoverImagePicker
        visible={showCoverPicker}
        onClose={() => setShowCoverPicker(false)}
        seedQuery={destination || searchQuery}
        selectedUrl={coverIsRemote ? coverUri : null}
        onPickLocal={(uri) => {
          setCoverUri(uri);
          setCoverIsRemote(false);
        }}
        onPickUnsplash={(url) => {
          setCoverUri(url);
          setCoverIsRemote(true);
        }}
      />

      <TemplatePickerModal
        isVisible={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        onSelect={async (templateId) => {
          try {
            const result = await createFromTemplateMut({ templateId });
            setShowTemplatePicker(false);
            router.replace(`/(tabs)/(trips)/${result.tripId}` as any);
          } catch (err) {
            Toast.show({
              type: 'error',
              text1: 'Could not create trip',
              text2:
                err instanceof Error
                  ? err.message
                  : 'Try a different template.',
              position: 'bottom',
            });
          }
        }}
      />

      <ShareTripModal
        isVisible={showShareModal}
        onClose={() => {
          setShowShareModal(false);
        }}
        tripData={{
          title: createdTrip?.title || '',
          destination: createdTrip?.destination || '',
          dates: formattedDates,
          shareLink: shareLink,
        }}
      />
    </AppSafeAreaView>
  );
};

export default CreateTrip;
