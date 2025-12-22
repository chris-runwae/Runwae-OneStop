import React, { useRef } from 'react';
import {
  StyleProp,
  StyleSheet,
  Pressable,
  View,
  ViewStyle,
  useColorScheme,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ImageBackground, Image } from 'expo-image';

import {
  ArrowLeftIcon,
  BellIcon,
  ForwardIcon,
  Menu,
} from 'lucide-react-native';
import { Colors } from '@/constants';
import { MenuItem, Spacer, Text } from '@/components';
import { router } from 'expo-router';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { textStyles } from '@/utils/styles';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

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
};

const ScreenWithImageGallery = ({
  images,
  children,
  header,
}: ScreenContainerProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const bottomSheetRef = useRef<BottomSheet>(null);

  const coverImage =
    typeof images === 'string'
      ? images
      : images?.[0]?.urlHD || images?.[0]?.url;

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const HEADER_HEIGHT = 350;
  const TRANSITION_START = 100; // Start transitioning early when text approaches top
  const TRANSITION_END = 250; // Complete transition at 250px
  const TRANSITION_RANGE = TRANSITION_END - TRANSITION_START; // 150px smooth transition window

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, opacity: number): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Animated styles for large header - must be called before early return
  const largeHeaderAnimatedStyle = useAnimatedStyle(() => {
    // Calculate progress: 0 when scroll < TRANSITION_START, 1 when scroll >= TRANSITION_END
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
    };
  });

  // Animated styles for compact header
  const compactHeaderAnimatedStyle = useAnimatedStyle(() => {
    // Calculate progress: 0 when scroll < TRANSITION_START, 1 when scroll >= TRANSITION_END
    const scrollValue = scrollOffset.value;
    const progress =
      scrollValue < TRANSITION_START
        ? 0
        : scrollValue > TRANSITION_END
          ? 1
          : (scrollValue - TRANSITION_START) / TRANSITION_RANGE;

    // Make it visible - ensure it shows up as soon as transition starts
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

  // STYLES

  const dynamicStyles = StyleSheet.create({
    infoContainer: {
      borderColor: colors.borderColors.default,
      maxWidth: 200,
    },
    emptyText: {
      color: colors.textColors.subtle,
    },
    iconButton: {
      backgroundColor: colors.backgroundColors.subtle,
    },
    iconContentContainer: {
      // position: 'absolute',
      top: 0 + insets.top,
      left: 0,
      right: 0,
      // bottom: 0,
      // paddingTop: insets.top + 12,
    },
  });

  const styles = StyleSheet.create({
    //Container
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColors.default,
      paddingTop: insets.top + 10,
    },

    //Header
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

    //Content
    content: {
      flex: 1,
      paddingHorizontal: 12,
      // backgroundColor: colors.backgroundColors.default,
      // backgroundColor: 'red',
      height: '100%',
    },

    //Cover Image
    coverImage: {
      width: '100%',
      height: 350,
      backgroundColor: colors.imageOverlay,
      marginBottom: 16,
      overflow: 'hidden',
    },

    //HEADER STYLES
    helperImagesContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 6,
      overflow: 'hidden',
    },
    image: {
      flex: 1,
      height: 95,
    },
    contentContainer: {
      paddingHorizontal: 12,
    },
    imageBackground: {
      backgroundColor: colors.imageOverlay,
      width: '100%',
      // height: '100%',
      height: 350,
      flex: 1,
      flexDirection: 'column',
      position: 'relative',
    },
    gradientOverlay: {
      // position: 'absolute',
      // bottom: 0,
      // left: 0,
      // right: 0,
      height: '100%',
      justifyContent: 'flex-end',
    },
    gradientContent: {
      width: '100%',
      justifyContent: 'flex-end',
      paddingHorizontal: 12,
      // alignItems: 'center',
      // paddingBottom: 16,
    },
    iconContentContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 12,
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

    //Text styles
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
  });

  // RENDERERS
  const defaultRightComponent = (
    <View style={styles.svgContainer}>
      <BellIcon size={20} color={colors.headerIcon} />
    </View>
  );

  const defaultLeftComponent = (
    <Pressable onPress={() => router.back()} style={styles.svgContainer}>
      <ArrowLeftIcon size={20} color={colors.headerIcon} />
    </Pressable>
  );

  // Compact header component for Stack.Screen
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
            onPress={() => {
              console.log('Back pressed in CompactHeader');
              router.back();
            }}
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
              onPress={() => {}}
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
    return (
      <Animated.View style={largeHeaderAnimatedStyle}>
        <ImageBackground
          source={{ uri: coverImage ?? '' }}
          style={styles.imageBackground}
          // imageStyle={{ flex: 1, backgroundColor: colors.imageOverlay35 }}
          contentFit="cover"
          transition={1000}>
          <View
            style={[
              styles.iconContentContainer,
              dynamicStyles.iconContentContainer,
              { position: 'absolute' },
            ]}>
            <Pressable
              onPress={() => {
                router.back();
                console.log('Back pressed in LargeHeader');
              }}
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
              style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
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
                onPress={() => {}}
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
        </ImageBackground>
        <Spacer size={8} vertical />
        <View style={styles.helperImagesContainer}>
          {images?.slice(1, 5).map((image: any) => (
            <Image
              key={image?.url}
              source={{ uri: image?.url }}
              style={styles.image}
            />
          ))}
        </View>
      </Animated.View>
    );
  };

  return (
    <>
      {/* <View>
        <Pressable onPress={() => router.back()}>
          <ImageBackground
            source={{ uri: coverImage }}
            style={styles.coverImage}></ImageBackground>
        </Pressable>
        <View style={styles.content}>{children}</View>
      </View> */}

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

      {/* BOTTOM SHEET CONTENT */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['50%']}
        detached={true}
        backgroundStyle={{
          backgroundColor: colors.backgroundColors.subtle,
        }}
        enablePanDownToClose>
        <BottomSheetView
          style={{
            flex: 1,
            backgroundColor: colors.backgroundColors.subtle,
            height: '100%',
          }}>
          <View style={{ padding: 20, gap: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>
              Share Join Code
            </Text>

            {/* SHARE LINK */}
            <TouchableOpacity
              onPress={() => {}}
              style={{
                padding: 14,
                backgroundColor: colors.backgroundColors.default,
                borderRadius: 10,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 16,
                  color: colors.textColors.default,
                }}>
                Share Deep Link
              </Text>
            </TouchableOpacity>

            <MenuItem title="Leave Trip" onPress={() => {}} />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
};

export default ScreenWithImageGallery;
