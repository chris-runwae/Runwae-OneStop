import React, { useRef, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Pressable,
  View,
  ViewStyle,
  useColorScheme,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  ArrowLeftIcon,
  ForwardIcon,
  Menu,
  Edit,
  Trash2,
} from 'lucide-react-native';
import { Colors } from '@/constants';
import { Spacer, Text } from '@/components';
import { router } from 'expo-router';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { textStyles } from '@/utils/styles';
import { ImageGallery } from './ImageGallery';
import { MenuModal, MenuOption } from './MenuModal';
import { ShareBottomSheet } from './ShareBottomSheet';
import BottomSheet from '@gorhom/bottom-sheet';

type ImageType = {
  url?: string;
  urlHD?: string;
  defaultImage?: boolean;
  order?: number;
};

type ScreenContainerProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  header?: {
    rightComponent?: React.ReactNode;
    title?: string;
    leftComponent?: React.ReactNode;
  };
  contentContainerStyle?: StyleProp<ViewStyle>;
  leftComponent?: boolean;
  rightComponent?: boolean;
  className?: string;
  images?: ImageType[];
  menuOptions?: MenuOption[];
  shareData?: {
    title?: string;
    message?: string;
    url?: string;
    imageUrl?: string;
  };
  onShare?: () => void;
  shareAdditionalOptions?: {
    title: string;
    onPress: () => void;
  }[];
};

const ScreenWithImageGallery = ({
  images,
  children,
  header,
  menuOptions,
  shareData,
  onShare,
  shareAdditionalOptions,
}: ScreenContainerProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);
  const [menuModalVisible, setMenuModalVisible] = useState(false);

  const coverImage =
    typeof images === 'string'
      ? images
      : images?.[0]?.urlHD || images?.[0]?.url;

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const HEADER_HEIGHT = 350;
  const TRANSITION_START = 100;
  const TRANSITION_END = 250;
  const TRANSITION_RANGE = TRANSITION_END - TRANSITION_START;

  // Default menu options if none provided
  const defaultMenuOptions: MenuOption[] = menuOptions || [
    {
      id: 'edit',
      label: 'Edit',
      icon: Edit,
      onPress: () => {
        console.log('Edit pressed');
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      onPress: () => {
        console.log('Delete pressed');
      },
      destructive: true,
    },
  ];

  // Animated styles for large header
  const largeHeaderAnimatedStyle = useAnimatedStyle(() => {
    const scrollValue = scrollOffset.value;
    const progress =
      scrollValue < TRANSITION_START
        ? 0
        : scrollValue > TRANSITION_END
          ? 1
          : (scrollValue - TRANSITION_START) / TRANSITION_RANGE;

    const headerHeight = interpolate(
      progress,
      [0, 1],
      [HEADER_HEIGHT, 0],
      'clamp'
    );
    const opacity = interpolate(
      progress,
      [0, 0.3, 0.7, 1],
      [1, 0.8, 0.3, 0],
      'clamp'
    );
    const translateY = interpolate(
      progress,
      [0, 1],
      [0, -HEADER_HEIGHT / 2],
      'clamp'
    );

    return {
      height: headerHeight,
      opacity,
      transform: [{ translateY }],
      overflow: 'hidden',
    };
  });

  // Animated styles for compact header
  const compactHeaderAnimatedStyle = useAnimatedStyle(() => {
    const scrollValue = scrollOffset.value;
    const progress =
      scrollValue < TRANSITION_START
        ? 0
        : scrollValue > TRANSITION_END
          ? 1
          : (scrollValue - TRANSITION_START) / TRANSITION_RANGE;

    const opacity = interpolate(
      progress,
      [0, 0.2, 0.6, 1],
      [0, 0.6, 0.95, 1],
      'clamp'
    );
    const translateY = interpolate(progress, [0, 1], [-10, 0], 'clamp');

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const handleImagePress = (index: number) => {
    setGalleryInitialIndex(index);
    setGalleryVisible(true);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColors.default,
      paddingTop: insets.top + 10,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderColor: colors.borderColors.subtle,
    },
    rightComponent: {
      flex: 1,
      alignItems: 'flex-end',
    },
    leftComponent: {
      flex: 1,
      alignItems: 'flex-start',
    },
    headerTitle: {
      ...textStyles.bold_20,
      fontWeight: '500',
      fontSize: 24,
      lineHeight: 30,
      color: colors.textColors.default,
      maxWidth: '64%',
    },
    svgContainer: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].headerGrey,
      height: 50,
      aspectRatio: 1,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
      paddingHorizontal: 12,
      height: '100%',
    },
    coverImage: {
      width: '100%',
      height: 350,
      backgroundColor: colors.imageOverlay,
      marginBottom: 16,
      overflow: 'hidden',
    },
    helperImagesContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 6,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    helperImageWrapper: {
      flex: 1,
      height: 95,
      overflow: 'hidden',
      position: 'relative',
    },
    contentContainer: {
      paddingHorizontal: 12,
    },
    imageBackground: {
      width: '100%',
      height: 350,
      flexDirection: 'column',
      position: 'relative',
      backgroundColor: '#000',
    },
    gradientOverlay: {
      height: '100%',
      justifyContent: 'flex-end',
    },
    gradientContent: {
      width: '100%',
      justifyContent: 'flex-end',
      paddingHorizontal: 12,
    },
    iconContentContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 12,
      position: 'absolute',
      top: 0 + insets.top,
      left: 0,
      right: 0,
    },
    iconButton: {
      padding: 8,
      borderRadius: 99,
    },
    locationTimeSpan: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    infoContainer: {
      paddingVertical: 4,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderRadius: 99,
    },
    infoText: {
      ...textStyles.subtitle_Regular,
      fontSize: 13,
      lineHeight: 19.5,
    },
    title: {
      ...textStyles.bold_20,
      fontSize: 32,
      lineHeight: 38.4,
    },
    description: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      lineHeight: 19.5,
    },
    emptyContainer: {
      paddingVertical: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      lineHeight: 19.5,
    },
    compactHeader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      width: Dimensions.get('window').width,
      zIndex: 1000,
      justifyContent: 'flex-end',
    },
    compactHeaderContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      height: 44,
      width: '100%',
    },
    compactIconButton: {
      padding: 8,
      borderRadius: 99,
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    compactTitle: {
      ...textStyles.bold_20,
      fontSize: 17,
      lineHeight: 22,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 8,
    },
    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.15)',
      zIndex: 1,
      pointerEvents: 'none',
    },
    imageWrapper: {
      width: '100%',
      height: 350,
      overflow: 'hidden',
    },
  });

  // Compact header component
  const CompactHeader = () => {
    return (
      <Animated.View
        style={[
          styles.compactHeader,
          compactHeaderAnimatedStyle,
          {
            backgroundColor: colors.backgroundColors.default,
            paddingTop: insets.top,
            minHeight: 44 + insets.top,
          },
        ]}>
        <View style={styles.compactHeaderContent}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.compactIconButton,
              { backgroundColor: colors.backgroundColors.subtle },
            ]}>
            <ArrowLeftIcon size={20} color={colors.textColors.default} />
          </Pressable>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {header?.title}
          </Text>
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
            <Pressable
              onPress={() => {
                bottomSheetRef.current?.expand();
              }}
              style={[
                styles.compactIconButton,
                { backgroundColor: colors.backgroundColors.subtle },
              ]}>
              <ForwardIcon size={20} color={colors.textColors.default} />
            </Pressable>

            <Pressable
              onPress={() => setMenuModalVisible(true)}
              style={[
                styles.compactIconButton,
                { backgroundColor: colors.backgroundColors.subtle },
              ]}>
              <Menu size={20} color={colors.textColors.default} />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    );
  };

  // Large header component
  const LargeHeader = () => {
    if (!coverImage) {
      return null;
    }

    return (
      <Animated.View style={largeHeaderAnimatedStyle}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => images && images.length > 0 && handleImagePress(0)}
          style={styles.imageWrapper}>
          <View style={styles.imageBackground}>
            <Image
              source={{ uri: coverImage }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={1000}
              cachePolicy="memory-disk"
            />
            {/* Darker overlay for better text readability */}
            <View style={styles.imageOverlay} />
            <LinearGradient
              colors={['transparent', 'rgba(0, 0, 0, 0.5)']}
              style={[styles.gradientOverlay, { zIndex: 2 }]}>
              <View
                style={[
                  styles.iconContentContainer,
                  { position: 'absolute', top: insets.top, zIndex: 10 },
                ]}>
                <Pressable
                  onPress={() => router.back()}
                  style={[
                    styles.iconButton,
                    {
                      backgroundColor: colors.backgroundColors.default,
                      zIndex: 1000,
                    },
                  ]}>
                  <ArrowLeftIcon size={20} color={colors.textColors.default} />
                </Pressable>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {header?.title}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 4,
                    alignItems: 'center',
                  }}>
                  <Pressable
                    onPress={() => {
                      bottomSheetRef.current?.expand();
                    }}
                    style={[
                      styles.iconButton,
                      {
                        backgroundColor: colors.backgroundColors.default,
                        zIndex: 1000,
                      },
                    ]}>
                    <ForwardIcon size={20} color={colors.textColors.default} />
                  </Pressable>

                  <Pressable
                    onPress={() => setMenuModalVisible(true)}
                    style={[
                      styles.iconButton,
                      {
                        backgroundColor: colors.backgroundColors.default,
                        zIndex: 1000,
                      },
                    ]}>
                    <Menu size={20} color={colors.textColors.default} />
                  </Pressable>
                </View>
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
        {images && images.length > 1 && (
          <>
            <Spacer size={8} vertical />
            <View style={styles.helperImagesContainer}>
              {images.slice(1, 5).map((image: ImageType, index: number) => (
                <TouchableOpacity
                  key={image?.url || index}
                  activeOpacity={0.9}
                  onPress={() => handleImagePress(index + 1)}
                  style={styles.helperImageWrapper}>
                  <Image
                    source={{ uri: image?.url }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                  />
                  <View style={styles.imageOverlay} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </Animated.View>
    );
  };

  return (
    <>
      <View
        style={{ flex: 1, backgroundColor: colors.backgroundColors.default }}>
        <CompactHeader />
        <Animated.ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}>
          <LargeHeader />

          <Spacer size={16} vertical />
          <View style={styles.content}>{children}</View>
        </Animated.ScrollView>
      </View>

      {/* Image Gallery Modal */}
      {images && images.length > 0 && (
        <ImageGallery
          images={images}
          initialIndex={galleryInitialIndex}
          visible={galleryVisible}
          onClose={() => setGalleryVisible(false)}
        />
      )}

      {/* Menu Modal */}
      <MenuModal
        visible={menuModalVisible}
        onClose={() => setMenuModalVisible(false)}
        options={defaultMenuOptions}
      />

      {/* Share Bottom Sheet */}
      <ShareBottomSheet
        bottomSheetRef={bottomSheetRef}
        shareData={shareData}
        onShare={onShare}
        additionalOptions={shareAdditionalOptions}
      />
    </>
  );
};

export default ScreenWithImageGallery;
