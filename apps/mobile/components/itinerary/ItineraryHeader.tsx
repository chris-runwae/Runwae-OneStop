import { useTheme } from 'expo-router/react-navigation';
import { BlurView } from 'expo-blur';
import { useRouter, useSegments } from 'expo-router';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  EllipsisVertical,
  Heart,
  Upload,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  SharedValue,
  interpolate,
  Extrapolation,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Text from '../ui/Text';
import ActionMenu, { ActionOption } from '../common/ActionMenu';
import ShareModal from './ShareModal';
import { AppFonts } from '@/constants';

export const EXPANDED_HEIGHT = 320;

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
  showMoreOptions?: boolean;
  onMorePress?: () => void;
  hideFavorite?: boolean;
  onFavoritePress?: () => void;
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
  const { dark } = useTheme();

  const [isFavorite, setIsFavorite] = useState(false);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const COLLAPSED_HEIGHT = insets.top + 56;
  const RANGE = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;

  const isExperienceOrDestination =
    segments[0] === 'experience' ||
    segments[0] === 'destination' ||
    segments[0] === 'events';

  const isFilled = onFavoritePress ? !!favoriteFilled : isFavorite;

  const handleFavorite = () => {
    if (onFavoritePress) onFavoritePress();
    else setIsFavorite((p) => !p);
  };

  const containerStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, RANGE],
      [EXPANDED_HEIGHT, COLLAPSED_HEIGHT],
      Extrapolation.CLAMP
    ),
  }));

  // Image is taller than the container and slides up at half speed,
  // so it stays filled and visible at every collapse stage.
  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, RANGE],
          [0, -RANGE * 0.5],
          Extrapolation.CLAMP
        ),
      },
      {
        scale: interpolate(
          scrollY.value,
          [-120, 0],
          [1.35, 1],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const blurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [RANGE * 0.5, RANGE],
      [0, 0.45],
      Extrapolation.CLAMP
    ),
  }));

  const expandedTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, RANGE * 0.55],
      [1, 0],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, RANGE],
          [0, 20],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const collapsedTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [RANGE * 0.7, RANGE],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const handleOptionPress = (option: DropdownOption) => {
    if (option.label === 'Share Trip') setIsShareModalVisible(true);
    else option.onPress();
  };

  const actionOptions: ActionOption[] = (dropdownOptions ?? []).map(
    (opt, i, arr) => ({
      label: opt.label,
      isDestructive: opt.isDestructive,
      hasSeparator: opt.isDestructive && i > 0 && !arr[i - 1].isDestructive,
      onPress: () => handleOptionPress(opt),
    })
  );

  return (
    <>
      <Animated.View style={[styles.container, containerStyle]}>
        {/* Image layer: fixed at EXPANDED_HEIGHT, clipped by the container */}
        <Animated.View style={[styles.imageLayer, imageStyle]}>
          <ImageBackground
            key={imageUri}
            source={{ uri: imageUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        </Animated.View>

        {/* Top scrim so white icons read against bright photos */}
        <LinearGradient
          colors={['rgba(0,0,0,0.45)', 'transparent']}
          style={[styles.topScrim, { height: COLLAPSED_HEIGHT + 20 }]}
          pointerEvents="none"
        />

        {/* Bottom scrim for the expanded title */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={styles.bottomScrim}
          pointerEvents="none"
        />

        <Animated.View
          style={[StyleSheet.absoluteFill, blurStyle]}
          pointerEvents="none">
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Collapsed centred title, sits behind the buttons */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.collapsedTitleWrap,
            { top: insets.top, height: 44 },
            collapsedTitleStyle,
          ]}>
          <Text numberOfLines={1} style={styles.collapsedTitle}>
            {title}
          </Text>
        </Animated.View>

        {/* Button row */}
        <View style={[styles.topRow, { top: insets.top, height: 44 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconButton}>
            <ChevronLeft size={20} strokeWidth={2} color="#fff" />
          </TouchableOpacity>

          <View style={styles.rightGroup}>
            {!hideFavorite && (
              <TouchableOpacity
                onPress={handleFavorite}
                style={styles.iconButton}>
                <Heart
                  size={19}
                  strokeWidth={2}
                  color={isFilled ? '#FF2D55' : '#fff'}
                  fill={isFilled ? '#FF2D55' : 'transparent'}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setIsShareModalVisible(true)}
              style={styles.iconButton}>
              <Upload size={19} strokeWidth={2} color="#fff" />
            </TouchableOpacity>

            {showMoreOptions && !dropdownOptions && (
              <TouchableOpacity onPress={onMorePress} style={styles.iconButton}>
                <EllipsisVertical size={19} strokeWidth={2} color="#fff" />
              </TouchableOpacity>
            )}

            {(isMember || isOwner) && dropdownOptions && (
              <TouchableOpacity
                onPress={() => setIsMenuOpen(true)}
                style={styles.iconButton}>
                <EllipsisVertical size={19} strokeWidth={2} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Expanded title pinned to the bottom of the image */}
        <Animated.View
          style={[styles.expandedTitleWrap, expandedTitleStyle]}
          pointerEvents="none">
          <Text style={styles.expandedTitle}>{title}</Text>
        </Animated.View>
      </Animated.View>

      {(isMember || isOwner) && dropdownOptions && (
        <ActionMenu
          visible={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          options={actionOptions}
          anchorPosition={{ top: insets.top + 56, right: 20 }}
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  imageLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: EXPANDED_HEIGHT,
  },
  topScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bottomScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  topRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  collapsedTitleWrap: {
    position: 'absolute',
    left: 70,
    right: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapsedTitle: {
    fontFamily: AppFonts.bricolage.bold,
    fontSize: 17,
    color: '#fff',
  },
  expandedTitleWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
  },
  expandedTitle: {
    fontFamily: AppFonts.bricolage.bold,
    fontSize: 30,
    color: '#fff',
  },
});
