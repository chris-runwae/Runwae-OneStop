import { X } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  runOnJS,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface CustomModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  centeredTitle?: boolean;
  showCloseButton?: boolean;
  showIndicator?: boolean;
  maxContentHeight?: string;
}


const CustomModal: React.FC<CustomModalProps> = ({
  isVisible,
  onClose,
  title,
  children,
  centeredTitle = false,
  showCloseButton = true,
  showIndicator = false,
  maxContentHeight = "80%",
}) => {

  const translateY = useSharedValue(0);

  const context = useSharedValue({ y: 0 });
  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY + context.value.y);
    })
    .onEnd((event) => {
      if (translateY.value > 150 || event.velocityY > 500) {
        runOnJS(onClose)();
      } else {
        translateY.value = withTiming(0, {
          duration: 250,
          easing: Easing.out(Easing.quad),
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // Reset translateY when modal becomes hidden or visible
  React.useEffect(() => {
    if (!isVisible) {
      translateY.value = 0;
      context.value = { y: 0 };
    }
  }, [isVisible]);

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
        <GestureDetector gesture={panGesture}>
          <Animated.View
            exiting={SlideOutDown}
            className="bg-white dark:bg-dark-bg rounded-t-[24px] px-5 pb-10 pt-5"
            style={[animatedStyle, { maxHeight: maxContentHeight as any }]}
          >

            {showIndicator && (
              <TouchableOpacity
                activeOpacity={1}
                onPress={onClose}
                className="items-center mb-5"
              >
                <View className="h-1.5 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
              </TouchableOpacity>
            )}

            {/* Header */}
            <View
              className={`flex-row items-center mb-5 ${centeredTitle ? "justify-center" : "justify-between"}`}
            >
              <Text
                className="text-xl font-bold text-black dark:text-white"
                style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
              >
                {title}
              </Text>
              {showCloseButton && (
                <TouchableOpacity
                  onPress={onClose}
                  className={`h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-transparent dark:border dark:border-gray-200/40 ${centeredTitle ? "absolute right-0" : ""}`}
                >
                  <X size={18} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>

            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

export default CustomModal;
