import { useTheme } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useRouter, useSegments } from 'expo-router';
import {
  ChevronLeft,
  EllipsisVertical,
  Heart,
  Pencil,
  Share,
  Trash2,
  Upload,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ShareModal from './ShareModal';

interface DropdownOption {
  label: string;
  onPress: () => void;
  icon?: any;
  isDestructive?: boolean;
}

interface ItineraryHeaderProps {
  scrollY: SharedValue<number>;
  imageUri: string;
  title: string;
  isOwner?: boolean;
  onEdit?: () => void;
  showMoreOptions?: boolean;
  onMorePress?: () => void;
  hideFavorite?: boolean;
  dropdownOptions?: DropdownOption[];
}

const ItineraryHeader = ({
  scrollY,
  imageUri,
  title,
  isOwner,
  onEdit,
  showMoreOptions,
  onMorePress,
  hideFavorite,
  dropdownOptions,
}: ItineraryHeaderProps) => {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isExperienceOrDestination =
    segments[0] === 'experience' ||
    segments[0] === 'destination' ||
    segments[0] === 'events';

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [100, 200], [0, 1], 'clamp');
    return {
      opacity,
    };
  });

  const { dark } = useTheme();

  const handleOptionPress = (option: DropdownOption) => {
    setIsMenuOpen(false);
    if (option.label === "Share Trip") {
      setIsShareModalVisible(true);
    } else {
      option.onPress();
    }
  };

  return (
    <>
      <View
        className="absolute left-0 right-0 top-0 z-50 flex-row items-center justify-between px-5 pb-3"
        style={{ paddingTop: insets.top + 10, height: insets.top + 60 }}>
        <Animated.View
          className="absolute bottom-0 left-0 right-0 top-0 overflow-hidden bg-gray-100 dark:bg-dark-seconndary"
          style={headerAnimatedStyle}>
          <Animated.Image
            key={imageUri}
            entering={FadeIn.duration(1000)}
            exiting={FadeOut.duration(1000)}
            source={{ uri: imageUri }}
            className="absolute bottom-0 left-0 right-0 top-0"
            resizeMode="cover"
          />
          <BlurView intensity={20} tint="light" className="flex-1" />
        </Animated.View>

        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm dark:bg-dark-seconndary">
          <ChevronLeft
            size={20}
            strokeWidth={1.5}
            color={dark ? '#fff' : '#000'}
          />
        </TouchableOpacity>

        <View className="flex-row items-center gap-x-3">
          {showMoreOptions && !dropdownOptions && (
            <TouchableOpacity
              onPress={onMorePress}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm dark:bg-dark-seconndary">
              <EllipsisVertical
                size={17}
                strokeWidth={1.5}
                color={dark ? '#fff' : '#000'}
              />
            </TouchableOpacity>
          )}

          {!showMoreOptions && (
            <>
              <TouchableOpacity
                onPress={() => setIsShareModalVisible(true)}
                className="h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm dark:bg-dark-seconndary">
                <Upload
                  size={17}
                  strokeWidth={1.5}
                  color={dark ? '#fff' : '#000'}
                />
              </TouchableOpacity>
              {!hideFavorite && (
                <TouchableOpacity
                  onPress={() => setIsFavorite(!isFavorite)}
                  className="h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm dark:bg-dark-seconndary">
                  <Heart
                    size={17}
                    strokeWidth={1.5}
                    color={isFavorite ? '#FF2E92' : dark ? '#fff' : '#000'}
                    fill={isFavorite ? '#FF2E92' : 'transparent'}
                  />
                </TouchableOpacity>
              )}
            </>
          )}

          {dropdownOptions && (
            <TouchableOpacity
              onPress={() => setIsMenuOpen(true)}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm dark:bg-dark-seconndary">
              <EllipsisVertical
                size={17}
                strokeWidth={1.5}
                color={dark ? '#fff' : '#000'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal visible={isMenuOpen} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setIsMenuOpen(false)}>
          <View className="flex-1">
            <View
              className="absolute right-6 overflow-hidden bg-white/70 dark:bg-black/60"
              style={{
                top: insets.top + 60,
                width: 220,
                borderRadius: 32,
              }}>
              <BlurView intensity={80} tint={dark ? 'dark' : 'light'} className="p-1">
                {dropdownOptions?.map((option, index) => (
                  <React.Fragment key={index}>
                    {option.isDestructive && (
                      <View className="mx-4 h-[0.5px] bg-gray-200 dark:bg-white/10 my-1" />
                    )}
                    <TouchableOpacity
                      onPress={() => handleOptionPress(option)}
                      className="px-5 py-4 flex-row items-center justify-between">
                      <Text
                        className={`text-[17px] font-medium ${
                          option.isDestructive
                            ? 'text-[#FF3B30]'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </BlurView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ShareModal
        isVisible={isShareModalVisible}
        onClose={() => setIsShareModalVisible(false)}
        title={title}
        showImage={!isExperienceOrDestination}
        imageUri={imageUri}
      />
    </>
  );
};

export default ItineraryHeader;
