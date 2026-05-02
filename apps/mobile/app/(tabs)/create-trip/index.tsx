import { DateSelectionStep } from '@/components/trip-creation/steps/DateSelectionStep';
import { DestinationStep } from '@/components/trip-creation/steps/DestinationStep';
import { TripDetailsStep } from '@/components/trip-creation/steps/TripDetailsStep';
import { useDateRange } from '@marceloterreiro/flash-calendar';

import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import TripCreatedModal from '@/components/trip-creation/TripCreatedModal';
import { useAuth } from '@/context/AuthContext';
import { createTrip } from '@/utils/supabase/trips.service';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Toast } from 'toastify-react-native';

const { width } = Dimensions.get('window');

import { usePlaceSearch } from '@/components/trip-creation/hooks/usePlaceSearch';
import { LiteAPIPlace } from '@/types/liteapi.types';

const CreateTrip = () => {
  const { dark } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [destination, setDestination] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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

  const [searchQuery, setSearchQuery] = useState('');
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

  const scrollToStep = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentStep(index);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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
    if (!dateId) return '';
    const date = new Date(dateId);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const calendarTheme = useMemo(
    () => ({
      itemDayContainer: {
        activeDayFiller: {
          backgroundColor: '#FF2E92',
        },
      },
      itemDay: {
        idle: ({ isToday }: { isToday: boolean }) => ({
          container: isToday
            ? {
                borderRadius: 20,
                backgroundColor: '#FF2E92',
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
            backgroundColor: '#FF2E92',
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

  const renderStep = useCallback(
    ({ index }: { index: number }) => {
      switch (index) {
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
              image={image}
              pickImage={pickImage}
            />
          );
        default:
          return null;
      }
    },
    [
      width,
      dark,
      searchQuery,
      debouncedSearch,
      showDropdown,
      places,
      loading,
      errorMessage,
      calendarTheme,
      calendarActiveDateRanges,
      onCalendarDayPress,
      selectedDates,
      title,
      description,
      image,
    ]
  );

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
      const result = await createTrip({
        user_id: user.id,
        title: title.trim(),
        destination: destination.trim(),
        start_date: selectedDates.startId || '',
        end_date: selectedDates.endId || selectedDates.startId || '',
        cover_img_url: image || undefined,
        description: description.trim(),
      });

      if (result.success) {
        setShowSuccessModal(true);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: result.error || 'Failed to create trip.',
          position: 'bottom',
        });
      }
    } catch (error: any) {
      console.error('Error creating trip:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error.message || 'An unexpected error occurred. Please try again.',
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

  return (
    <AppSafeAreaView edges={['top']}>
      <ScreenHeader title="Create Trip" onBack={handleBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
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
            className={`h-[45px] items-center justify-center rounded-full bg-primary ${
              isButtonDisabled ? 'opacity-50' : ''
            }`}
            onPress={() => {
              Keyboard.dismiss();
              if (currentStep < 2) {
                scrollToStep(currentStep + 1);
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
      </KeyboardAvoidingView>

      <TripCreatedModal
        isVisible={showSuccessModal}
        destination={destination}
        onClose={() => {
          setShowSuccessModal(false);
          router.replace('/trips');
        }}
        onStartPlanning={() => {
          setShowSuccessModal(false);
          router.replace('/trips');
        }}
        onShare={() => {
          Toast.show({
            type: 'info',
            text1: 'Share',
            text2: 'Sharing feature coming soon! 🚀',
            position: 'bottom',
          });
        }}
      />
    </AppSafeAreaView>
  );
};

export default CreateTrip;
