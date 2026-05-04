import CategoryItem from '@/components/ui/CategoryItem';
import React, { useEffect, useRef } from 'react';
import { Animated as RNAnimated, View } from 'react-native';

export type AnimatedTab<T extends string> = {
  id: T;
  label: string;
  imageSrc: any;
};

type Props<T extends string> = {
  tabs: AnimatedTab<T>[];
  active: T;
  onChange: (id: T) => void;
  containerWidth: number;
};

export default function AnimatedTabBar<T extends string>({
  tabs,
  active,
  onChange,
  containerWidth,
}: Props<T>) {
  const indicatorAnim = useRef(new RNAnimated.Value(0)).current;
  const tabCount = tabs.length;
  const indicatorWidth = (containerWidth - 16) / tabCount;

  useEffect(() => {
    const idx = tabs.findIndex((t) => t.id === active);
    if (idx < 0) return;
    RNAnimated.spring(indicatorAnim, {
      toValue: idx,
      useNativeDriver: true,
      bounciness: 0,
      speed: 16,
    }).start();
  }, [active, tabs, indicatorAnim]);

  const translateX = indicatorAnim.interpolate({
    inputRange: tabs.map((_, i) => i),
    outputRange: tabs.map((_, i) => 8 + indicatorWidth * i),
  });

  return (
    <View className="relative z-0 mb-6 border-b border-gray-200 dark:border-dark-seconndary/60">
      <View className="flex-row justify-between px-2">
        {tabs.map((tab) => (
          <CategoryItem
            key={tab.id}
            imageSrc={tab.imageSrc}
            label={tab.label}
            isActive={active === tab.id}
            onPress={() => onChange(tab.id)}
          />
        ))}
      </View>

      <RNAnimated.View
        style={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          width: indicatorWidth,
          alignItems: 'center',
          transform: [{ translateX }],
        }}>
        <View className="h-[3px] w-[60%] rounded-t-[3px] bg-[#fd2879]" />
      </RNAnimated.View>
    </View>
  );
}
