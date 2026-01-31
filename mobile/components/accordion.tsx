import React, { useState } from 'react';
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ChevronDown, Minus, Plus } from 'lucide-react-native';
import { SupportAccordionProps } from '@/types/support.types';

interface AccordionItemProps {
  item: SupportAccordionProps;
  isExpanded: boolean;
  onToggle: () => void;
}

const AccordionItemComponent: React.FC<AccordionItemProps> = ({
  item,
  isExpanded,
  onToggle,
}) => {
  const colorSheme = useColorScheme();

  const derivedHeight = useDerivedValue(() => {
    const targetHeight = isExpanded ? 80 : 0;
    return withTiming(targetHeight, {
      duration: 300,
    });
  });

  const bodyStyle = useAnimatedStyle(() => ({
    height: derivedHeight.value,
    opacity: isExpanded ? 1 : 0,
  }));

  return (
    <View
      className={`mb-4 overflow-hidden rounded-lg border-[1px] ${colorSheme === 'dark' ? 'border-gray-800 bg-black' : 'border-gray-200 bg-[#F8F9FA]'}`}>
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-between p-4">
        <Text
          className={`flex-1 pr-4 text-base font-medium ${colorSheme === 'dark' ? 'text-white' : 'text-black'}`}>
          {item.title}
        </Text>
        <Animated.View
          className="flex items-center justify-center rounded-full bg-[#FF2E92]"
          style={{ height: 20, width: 20 }}>
          {isExpanded ? (
            <Minus size={15} color="#ffffff" />
          ) : (
            <Plus size={15} color="#ffffff" />
          )}
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={bodyStyle} className="overflow-hidden">
        <View className="px-4 pb-4" style={{ minHeight: 80 }}>
          <Text
            className={`text-sm leading-relaxed ${colorSheme === 'dark' ? 'text-white' : 'text-black'}`}>
            {item.description}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

interface AccordionProps {
  data: SupportAccordionProps[];
  allowMultiple?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({
  data,
  allowMultiple = false,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const handleToggle = (index: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);

      if (allowMultiple) {
        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
      } else {
        if (newSet.has(index)) {
          newSet.clear();
        } else {
          newSet.clear();
          newSet.add(index);
        }
      }

      return newSet;
    });
  };

  return (
    <View className="w-full">
      {data.map((item, index) => (
        <AccordionItemComponent
          key={index}
          item={item}
          isExpanded={expandedItems.has(index)}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </View>
  );
};

export default Accordion;
