import React, { useRef } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  Pressable,
  PanResponder,
  Animated,
} from 'react-native';
import { CameraIcon, Image, UserIcon } from 'lucide-react-native';

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCameraPress: () => void;
  onGalleryPress: () => void;
  colors: any;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  onCameraPress,
  onGalleryPress,
  colors,
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
            Select Photo
          </Text>

          <TouchableOpacity
            className="flex-row items-center px-4 py-4"
            onPress={() => {
              onCameraPress();
              onClose();
            }}>
            <CameraIcon size={20} color={colors.textColors.default} />
            <Text className="ml-3 text-base text-gray-900 dark:text-white">
              Take Photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center px-4 py-4"
            onPress={() => {
              onGalleryPress();
              onClose();
            }}>
            <Image size={20} color={colors.textColors.default} />
            <Text className="ml-3 text-base text-gray-900 dark:text-white">
              Choose from Gallery
            </Text>
          </TouchableOpacity>

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
