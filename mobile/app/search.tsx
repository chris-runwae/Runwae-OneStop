import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import SkeletonBox from '@/components/ui/SkeletonBox';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getLinkPreview } from 'link-preview-js';
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Link as LinkIcon,
  MoveRight,
  Search,
  Sparkles,
  X,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Animated as RNAnimated,
  Dimensions,
} from 'react-native';

import CategoryItem from '@/components/ui/CategoryItem';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab: string }>();
  const inputRef = useRef<TextInput>(null);

  const [activeTab, setActiveTab] = useState<string | null>(params.tab || 'flights');
  const [flightType, setFlightType] = useState<'one-way' | 'round-trip'>(
    'one-way'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [previewData, setPreviewData] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const { width } = Dimensions.get('window');
  const containerWidth = width - 40; // 20px paddingHorizontal on ScrollView
  const indicatorAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    let toValue = 0;
    if (activeTab === 'flights') toValue = 0;
    else if (activeTab === 'stays') toValue = 1;
    else if (activeTab === 'experiences') toValue = 2;

    RNAnimated.spring(indicatorAnim, {
      toValue,
      useNativeDriver: true,
      bounciness: 0,
      speed: 16,
    }).start();
  }, [activeTab]);

  const translateX = indicatorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [
      8, // left px-2 padding
      8 + (containerWidth - 16) / 3,
      8 + ((containerWidth - 16) / 3) * 2,
    ],
  });

  useEffect(() => {
    // Auto focus the input when screen mounts
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  const handleTextChange = async (text: string) => {
    setSearchQuery(text);

    // Auto-detect URL logic
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex);

    if (urls && urls.length > 0) {
      if (previewData && previewData.url === urls[0]) return;
      setIsLoadingPreview(true);
      try {
        const data = await getLinkPreview(urls[0]);
        setPreviewData(data);
      } catch (e) {
        console.log('Preview error', e);
        setPreviewData(null);
      } finally {
        setIsLoadingPreview(false);
      }
    } else {
      setPreviewData(null);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPreviewData(null);
  };

  const shadowStyles =
    Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        }
      : { elevation: 5 };

  const renderSearchBar = (
    placeholderText: string = 'https://www.youtube.com/watch...'
  ) => (
    <View className="relative z-50">
      <View
        className="h-[54px] flex-row items-center gap-x-3 rounded-full border border-gray-100 bg-white px-4 dark:border-dark-seconndary dark:bg-dark-seconndary"
        style={shadowStyles}>
        <Search size={20} color="#9ca3af" />
        <TextInput
          ref={inputRef}
          className="flex-1 text-base text-black dark:text-white"
          placeholder={placeholderText}
          placeholderTextColor="#9ca3af"
          selectionColor="#fd2879"
          value={searchQuery}
          onChangeText={handleTextChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={clearSearch} className="p-1 pl-2">
            <X size={20} color="#111827" />
          </Pressable>
        )}
      </View>

      {/* Loading Indicator */}
      {isLoadingPreview && (
        <View
          className="absolute left-0 right-0 top-[60px] z-50 rounded-[24px] border border-transparent bg-white p-4 pt-5 shadow-lg dark:bg-dark-seconndary"
          style={shadowStyles}>
          {/* Tag Skeleton */}
          <View className="mb-3 flex-row items-center">
            <View className="flex-row items-center justify-center opacity-50">
              <LinkIcon size={10} color="#fd2879" />
              <Text className="ml-1.5 mt-0.5 text-sm font-semibold text-[#fd2879]">
                Detecting link...
              </Text>
            </View>
          </View>

          {/* Content Row Skeleton */}
          <View className="mb-5 flex-row items-start">
            <View className="h-[68px] w-[110px] overflow-hidden rounded-[6px]">
              <SkeletonBox width="100%" height="100%" borderRadius={6} />
            </View>
            <View className="ml-3 flex-1 flex-col gap-y-1 pt-1">
              <SkeletonBox width="90%" height={16} borderRadius={4} />
              <SkeletonBox width="60%" height={16} borderRadius={4} />
              <View className="mt-1">
                <SkeletonBox width="40%" height={14} borderRadius={4} />
              </View>
            </View>
          </View>

          {/* Button Skeleton */}
          <SkeletonBox width="100%" height={48} borderRadius={24} />
        </View>
      )}

      {/* Preview Card */}
      {previewData && !isLoadingPreview && (
        <View
          className="absolute left-0 right-0 top-[60px] z-50 rounded-[24px] border border-transparent bg-white p-4 pt-5 shadow-lg dark:bg-dark-seconndary"
          style={shadowStyles}>
          <View className="mb-3 flex-row items-center">
            <LinkIcon size={14} color="#fd2879" />
            <Text className="ml-1.5 mt-0.5 text-[14px] font-bold text-[#fd2879]">
              Link detected
            </Text>
          </View>

          <View className="mb-5 flex-row items-start">
            <View className="h-[68px] w-[110px] overflow-hidden rounded-[6px] bg-gray-100 dark:bg-gray-800">
              {(previewData.images?.[0] || previewData.favicons?.[0]) && (
                <Image
                  source={{
                    uri: previewData.images?.[0] || previewData.favicons?.[0],
                  }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              )}
            </View>
            <View className="ml-3 flex-1 pt-1">
              <Text
                className="text-[15px] font-medium leading-tight text-black dark:text-white"
                numberOfLines={2}>
                {previewData.title || previewData.url}
              </Text>
              <Text className="mt-1.5 text-sm font-semibold tracking-wide text-[#fd2879]">
                {previewData.siteName ||
                  (previewData.url
                    ? new URL(previewData.url).hostname.replace('www.', '')
                    : 'YouTube')}
              </Text>
            </View>
          </View>

          <Pressable
            className="h-[45px] w-full flex-row items-center justify-center gap-x-2 rounded-full bg-black dark:bg-white"
            onPress={() => router.push('/trips')}>
            <Sparkles size={13} color="#ffffff" />
            <Text className="text-base font-semibold text-white dark:text-black">
              Create Itinerary
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  return (
    <AppSafeAreaView
      edges={['top']}
      className="dark:bg-dark-background flex-1 bg-[#F8F9FA]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}>
          <Pressable
            onPress={() => router.back()}
            className="mb-8 h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white dark:border-gray-800 dark:bg-transparent"
            style={shadowStyles}>
            <ChevronLeft size={17} color="#000" />
          </Pressable>

          {/* Categories */}
          <View className="relative z-0 mb-6 border-b border-gray-200 dark:border-dark-seconndary/60">
            <View className="flex-row justify-between px-2">
              <CategoryItem
                imageSrc={require('@/assets/images/plane.png')}
                label="Flights"
                isActive={activeTab === 'flights'}
                onPress={() => setActiveTab('flights')}
              />
              <CategoryItem
                imageSrc={require('@/assets/images/house.png')}
                label="Stays"
                isActive={activeTab === 'stays'}
                onPress={() => setActiveTab('stays')}
              />
              <CategoryItem
                imageSrc={require('@/assets/images/map.png')}
                label="Experiences"
                isActive={activeTab === 'experiences'}
                onPress={() => setActiveTab('experiences')}
              />
            </View>

            {/* Sliding Indicator */}
            {activeTab !== null && (
              <RNAnimated.View
                style={{
                  position: 'absolute',
                  bottom: -1,
                  left: 0,
                  width: (containerWidth - 16) / 3,
                  alignItems: 'center',
                  transform: [{ translateX }],
                }}>
                <View className="h-[3px] w-[60%] rounded-t-[3px] bg-[#fd2879]" />
              </RNAnimated.View>
            )}
          </View>

          {/* DEFAULT / NO TAB VIEW */}
          {activeTab === null && (
            <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="z-50 px-1">
              <View className="mb-4 mt-2 flex-row items-center">
                <View className="flex-row items-center gap-x-1">
                  <Sparkles
                    size={13}
                    fill="#fd2879"
                    strokeWidth={1.5}
                    stroke="#fd2879"
                  />
                  <Text className="text-sm font-bold tracking-wide text-[#fd2879]">
                    NEW
                  </Text>
                </View>
                <View className="mx-3 h-4 w-[1px] bg-gray-300" />
                <Text className="text-sm font-medium text-gray-500">
                  Paste a Link
                </Text>
                <MoveRight size={14} color="#9ca3af" className="mx-3" />
                <Text className="text-sm font-medium text-gray-500">
                  Generate Itinerary
                </Text>
              </View>

              {renderSearchBar()}
            </Animated.View>
          )}

          {/* FLIGHTS VIEW */}
          {activeTab === 'flights' && (
            <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="relative z-50 px-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-black dark:text-white">
                  Where are you flying?
                </Text>
                <View className="h-[30px] w-[30px] items-center justify-center rounded-full bg-primary">
                  <ChevronUp size={22} color="#fff" strokeWidth={2} />
                </View>
              </View>

              <View className="mb-8 flex-row gap-x-3">
                <Pressable
                  className={`rounded-full px-5 py-2 ${flightType === 'one-way' ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-800'}`}
                  onPress={() => setFlightType('one-way')}>
                  <Text
                    className={`text-sm ${flightType === 'one-way' ? 'font-bold text-white' : 'font-medium text-gray-400'}`}>
                    One-way
                  </Text>
                </Pressable>
                <Pressable
                  className={`rounded-full px-5 py-2 ${flightType === 'round-trip' ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-800'}`}
                  onPress={() => setFlightType('round-trip')}>
                  <Text
                    className={`text-sm ${flightType === 'round-trip' ? 'font-bold text-white' : 'font-medium text-gray-400'}`}>
                    Round-trip
                  </Text>
                </Pressable>
              </View>

              <View className="z-50 mb-2">
                <Text className="mb-3 ml-2 text-[14px] font-medium text-gray-500">
                  From
                </Text>
                {renderSearchBar()}
              </View>

              <View className="-z-10 my-6 h-[1px] w-full bg-gray-200 dark:bg-gray-800" />

              <View className="-z-10 mb-2">
                <Text className="mb-2 ml-2 text-[14px] font-medium text-gray-500">
                  To
                </Text>
              </View>

              <View className="-z-10 my-6 h-[1px] w-full bg-gray-200 dark:bg-gray-800" />

              <View className="-z-10 flex-row items-center justify-between">
                <Text className="ml-2 text-[16px] font-medium text-gray-600 dark:text-gray-300">
                  Passengers
                </Text>
                <View className="mr-1 h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                  <ChevronDown size={18} color="#6b7280" />
                </View>
              </View>
            </Animated.View>
          )}

          {/* STAYS VIEW */}
          {activeTab === 'stays' && (
            <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="relative z-50 mt-2 px-2">
              <View className="mb-8 flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-black dark:text-white">
                  Where are you staying?
                </Text>
              </View>

              <View className="z-50 mb-2">
                <Text className="mb-3 ml-2 text-[14px] font-medium text-gray-500">
                  Destination
                </Text>
                {renderSearchBar('Search city, hotel, or address')}
              </View>

              <View className="-z-10 my-6 h-[1px] w-full bg-gray-200 dark:bg-gray-800" />

              <View className="-z-10 mb-8 flex-row items-center justify-between">
                <View className="flex-1 border-r border-gray-200 dark:border-gray-800">
                  <Text className="mb-1 ml-2 text-[14px] font-medium text-gray-500">
                    Check-in
                  </Text>
                  <Text className="ml-2 text-[16px] font-medium text-gray-900 dark:text-white">
                    Select date
                  </Text>
                </View>
                <View className="flex-1 pl-4">
                  <Text className="mb-1 ml-2 text-[14px] font-medium text-gray-500">
                    Check-out
                  </Text>
                  <Text className="ml-2 text-[16px] font-medium text-gray-900 dark:text-white">
                    Select date
                  </Text>
                </View>
              </View>

              <View className="-z-10 my-6 h-[1px] w-full bg-gray-200 dark:bg-gray-800" />

              <View className="-z-10 flex-row items-center justify-between">
                <Text className="ml-2 text-[16px] font-medium text-gray-600 dark:text-gray-300">
                  Guests & Rooms
                </Text>
                <View className="mr-1 h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                  <ChevronDown size={18} color="#6b7280" />
                </View>
              </View>
            </Animated.View>
          )}

          {/* EXPERIENCES VIEW */}
          {activeTab === 'experiences' && (
            <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="relative z-50 mt-2 px-2">
              <View className="mb-8 flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-black dark:text-white">
                  What are you looking for?
                </Text>
              </View>

              <View className="z-50 mb-2">
                <Text className="mb-3 ml-2 text-[14px] font-medium text-gray-500">
                  Location or Activity
                </Text>
                {renderSearchBar('Find activities, tours, or places')}
              </View>

              <View className="-z-10 my-6 h-[1px] w-full bg-gray-200 dark:bg-gray-800" />

              <View className="-z-10 mb-2">
                <Text className="mb-2 ml-2 text-[14px] font-medium text-gray-500">
                  Dates
                </Text>
                <Text className="ml-2 text-[16px] font-medium text-gray-900 dark:text-white">
                  Anytime
                </Text>
              </View>

              <View className="-z-10 my-6 h-[1px] w-full bg-gray-200 dark:bg-gray-800" />

              <View className="-z-10 flex-row items-center justify-between">
                <Text className="ml-2 text-[16px] font-medium text-gray-600 dark:text-gray-300">
                  Guests
                </Text>
                <View className="mr-1 h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                  <ChevronDown size={18} color="#6b7280" />
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </AppSafeAreaView>
  );
}
