import { X } from "lucide-react-native";
import React, { useEffect } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";

interface CustomModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isVisible,
  onClose,
  title,
  children,
}) => {
  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          className="absolute inset-0 bg-black/50"
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown}
          className="bg-white dark:bg-dark-bg rounded-t-[24px] px-5 pb-10 pt-6 max-h-[80%]"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text
              className="text-xl font-bold text-black dark:text-white"
              style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
            >
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <X size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CustomModal;
