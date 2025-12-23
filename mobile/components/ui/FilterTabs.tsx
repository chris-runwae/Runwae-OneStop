import React, { useEffect } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';

import { useColorScheme } from '@/hooks';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';
import { Spacer, Text } from '@/components';

export type FilterTabsProps<T extends string> = {
  options: T[];
  selectedOption: T;
  onOptionChange: (option: T) => void;
  containerStyle?: any;
};

const FilterTabs = <T extends string>({
  options,
  selectedOption,
  onOptionChange,
  containerStyle,
}: FilterTabsProps<T>) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const dynamicStyles = StyleSheet.create({
    filterButton: {
      backgroundColor: colors.backgroundColors.subtle,
      borderWidth: 1,
      borderColor: colors.borderColors.subtle,
    },
    filterButtonActive: {
      backgroundColor: colors.primaryColors.default,
      borderWidth: 1,
      borderColor: colors.primaryColors.border,
    },
    filterButtonText: {
      ...textStyles.regular_12,
      color: colors.textColors.subtle,
    },
    filterButtonTextActive: {
      ...textStyles.regular_12,
      color: colors.white,
    },
  });

  const RenderFilterButton = ({
    option,
    index,
  }: {
    option: T;
    index: number;
  }) => {
    const isActive = selectedOption === option;
    const buttonAnimation = useSharedValue(isActive ? 1 : 0);

    useEffect(() => {
      buttonAnimation.value = withSpring(isActive ? 1 : 0, {
        damping: 15,
        stiffness: 150,
      });
    }, [isActive, buttonAnimation]);

    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(buttonAnimation.value, [0, 1], [1, 1.05]);
      const opacity = interpolate(buttonAnimation.value, [0, 1], [0.8, 1]);

      return {
        transform: [{ scale }],
        opacity,
      };
    });

    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={() => onOptionChange(option)}
          style={[
            styles.filterButton,
            isActive
              ? dynamicStyles.filterButtonActive
              : dynamicStyles.filterButton,
          ]}>
          <Text
            style={[
              dynamicStyles.filterButtonText,
              isActive && dynamicStyles.filterButtonTextActive,
            ]}>
            {option}
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <FlashList
      data={options}
      renderItem={({ item, index }: { item: T; index: number }) => (
        <RenderFilterButton option={item} index={index} />
      )}
      keyExtractor={(item: T) => item}
      horizontal
      showsHorizontalScrollIndicator={false}
      ItemSeparatorComponent={() => <Spacer size={8} horizontal />}
    />
  );
};

export default FilterTabs;

const styles = StyleSheet.create({
  filterButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 20,
    height: 32,
    // paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
