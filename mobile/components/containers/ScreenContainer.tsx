import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Pressable,
  View,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArrowLeftIcon, BellIcon } from 'lucide-react-native';
import { Colors } from '@/constants';
import { Text } from '@/components';
import { router } from 'expo-router';

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
};

const ScreenContainer = ({
  children,
  style,
  header,
  className,
  contentContainerStyle,
  leftComponent = false,
  rightComponent = false,
}: ScreenContainerProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

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
      fontFamily: 'Space Grotesk',
      fontWeight: '500',
      fontSize: 25,
      lineHeight: 30,
      letterSpacing: 0,
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
      // paddingHorizontal: 15,
      backgroundColor: colors.backgroundColors.default,
    },
  });

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

  return (
    <View style={styles.container} className={className}>
      <View style={[styles.header, style]}>
        <View style={styles.leftComponent}>
          {(header?.leftComponent && header.leftComponent) ||
            (leftComponent && defaultLeftComponent) || (
              <Text style={styles.headerTitle}>{header?.title ?? 'Home'}</Text>
            )}
        </View>

        <View style={styles.rightComponent}>
          {(header?.rightComponent && header?.rightComponent) ||
            (rightComponent && defaultRightComponent)}
        </View>
      </View>

      <View style={[styles.content, contentContainerStyle]}>{children}</View>
    </View>
  );
};

export default ScreenContainer;
