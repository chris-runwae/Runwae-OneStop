import React, { useRef } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  Pressable,
  PanResponder,
  Animated,
  ScrollView,
} from 'react-native';
import { toDateId } from '@marceloterreiro/flash-calendar';

interface MonthYearModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  title: string;
  items: { id: string; name: string }[];
  currentId: string;
  theme?: any;
  backgroundColor?: string;
}

export const MonthYearModal: React.FC<MonthYearModalProps> = ({
  visible,
  onClose,
  onSelect,
  title,
  items,
  currentId,
  theme,
  backgroundColor,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5; // Only respond to vertical drags downward
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // If dragged down more than 100px, close modal
          Animated.timing(translateY, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true,
          }).start(onClose);
        } else {
          // Otherwise, animate back to original position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Sort items: current item first, then others
  const sortedItems = [...items].sort((a, b) => {
    if (a.id === currentId) return -1;
    if (b.id === currentId) return 1;
    return 0;
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 justify-end bg-black/50 p-3 pb-[20px]">
        <Animated.View
          style={{ transform: [{ translateY }] }}
          className="rounded-[35px] bg-white p-5 dark:bg-[#1a1a1a]"
          {...panResponder.panHandlers}>
          <Pressable className="mx-auto mb-5 h-1 w-12 rounded-full bg-gray-100 dark:bg-gray-400" />

          <Text className="mb-5 text-center text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} className="max-h-80">
            {sortedItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  onSelect(item.id);
                  onClose();
                }}
                className="flex-row items-center px-4 py-4">
                <Text
                  className={`ml-3 text-base ${
                    item.id === currentId
                      ? 'font-semibold text-blue-600 dark:text-blue-400'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                  {item.name}
                  {item.id === currentId && ' (Current)'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            className="mt-2 items-center rounded-2xl bg-gray-100 px-4 py-4 dark:bg-gray-600/50"
            onPress={onClose}>
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              Cancel
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};
