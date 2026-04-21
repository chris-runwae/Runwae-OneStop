import { useTheme } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useRouter, useSegments } from 'expo-router';
import {
  ChevronLeft,
  EllipsisVertical,
  Heart,
  Upload,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActionMenu, { ActionOption } from '../common/ActionMenu';
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
  isMember?: boolean;
  onEdit?: () => void;
  showMoreOptions?: boolean;
  onMorePress?: () => void;
  hideFavorite?: boolean;
  /** When set, heart tap runs this instead of toggling local favorite state. */
  onFavoritePress?: () => void;
  /** Heart fill when `onFavoritePress` is used (parent-controlled). */
  favoriteFilled?: boolean;
  dropdownOptions?: DropdownOption[];
  joinCode?: string | null;
}

const ItineraryHeader = ({
  scrollY,
  imageUri,
  title,
  isOwner,
  isMember,
  onEdit,
  showMoreOptions,
  onMorePress,
  hideFavorite,
  onFavoritePress,
  favoriteFilled,
  dropdownOptions,
  joinCode,
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
    if (option.label === 'Share Trip') {
      setIsShareModalVisible(true);
    } else {
      option.onPress();
    }
  };

  // Map DropdownOption[] -> ActionOption[] for ActionMenu
  const actionOptions: ActionOption[] = (dropdownOptions ?? []).map(
    (opt, i, arr) => ({
      label: opt.label,
      isDestructive: opt.isDestructive,
      // Add a separator before the first destructive item
      hasSeparator: opt.isDestructive && i > 0 && !arr[i - 1].isDestructive,
      onPress: () => handleOptionPress(opt),
    })
  );

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

          <TouchableOpacity
            onPress={() => setIsShareModalVisible(true)}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm dark:bg-dark-seconndary">
            <Upload
              size={17}
              strokeWidth={1.5}
              color={dark ? '#fff' : '#000'}
            />
          </TouchableOpacity>

          {!showMoreOptions && (
            <>
              {!hideFavorite && (
                <TouchableOpacity
                  onPress={() =>
                    onFavoritePress
                      ? onFavoritePress()
                      : setIsFavorite(!isFavorite)
                  }
                  className="h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm dark:bg-dark-seconndary">
                  <Heart
                    size={17}
                    strokeWidth={1.5}
                    color={
                      (onFavoritePress ? favoriteFilled : isFavorite)
                        ? '#FF2E92'
                        : dark
                          ? '#fff'
                          : '#000'
                    }
                    fill={
                      (onFavoritePress ? favoriteFilled : isFavorite)
                        ? '#FF2E92'
                        : 'transparent'
                    }
                  />
                </TouchableOpacity>
              )}
            </>
          )}

          {(isMember || isOwner) && dropdownOptions && (
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

      {(isMember || isOwner) && dropdownOptions && (
        <ActionMenu
          visible={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          options={actionOptions}
          anchorPosition={{ top: insets.top + 60, right: 20 }}
        />
      )}

      <ShareModal
        isVisible={isShareModalVisible}
        onClose={() => setIsShareModalVisible(false)}
        title={title}
        showImage={!isExperienceOrDestination}
        imageUri={imageUri}
        joinCode={joinCode}
      />
    </>
  );
};

export default ItineraryHeader;
