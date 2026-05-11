import { useTheme } from '@react-navigation/native';
import { ChevronDown, MoveRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface CollapsibleSectionProps {
  title: string;
  count?: number;
  onSeeMore?: () => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  count,
  onSeeMore,
  children,
  defaultOpen = true,
}) => {
  const { dark } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const rotation = useSharedValue(defaultOpen ? 0 : -90);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    rotation.value = withTiming(next ? 0 : -90, { duration: 200 });
  };

  const caretStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(18).stiffness(180)}
      style={{ marginTop: 24 }}>
      <View
        className="flex-row items-center justify-between px-[20px]"
        style={{ paddingVertical: 4 }}>
        <Pressable
          onPress={toggle}
          hitSlop={6}
          className="flex-1 flex-row items-center"
          style={{ gap: 8 }}>
          <Animated.View style={caretStyle}>
            <ChevronDown
              size={18}
              color={dark ? '#ffffff' : '#0F1115'}
              strokeWidth={2.5}
            />
          </Animated.View>
          <Text
            className="text-base font-semibold dark:text-white"
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
            {title}
          </Text>
          {typeof count === 'number' && count > 0 ? (
            <View
              className="rounded-full bg-gray-100 dark:bg-dark-seconndary"
              style={{ paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {count}
              </Text>
            </View>
          ) : null}
        </Pressable>
        {onSeeMore ? (
          <TouchableOpacity
            onPress={onSeeMore}
            hitSlop={8}
            className="h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-dark-seconndary">
            <MoveRight
              size={14}
              strokeWidth={2}
              color={dark ? '#ffffff' : '#000000'}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {open ? (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(140)}
          style={{ paddingTop: 16 }}>
          {children}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
};

export default CollapsibleSection;
