import { BlurView } from "expo-blur";
import { Upload } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ShareOptionProps {
  icon: any;
  label: string;
  isImage?: boolean;
}

const ShareOption = ({ icon, label, isImage = true }: ShareOptionProps) => (
  <TouchableOpacity className="items-center mb-6 w-1/4">
    <View className="w-14 h-14 rounded-full items-center justify-center mb-2 overflow-hidden">
      {isImage ? (
        <Image source={icon} className="w-full h-full" resizeMode="cover" />
      ) : (
        <View className="bg-gray-100 flex-1 w-full items-center justify-center">
          {icon}
        </View>
      )}
    </View>
    <Text className="text-gray-500 text-[10px]">{label}</Text>
  </TouchableOpacity>
);

const SHARE_OPTIONS = [
  {
    label: "Facebook",
    icon: require("@/assets/images/facebook-share.png"),
  },
  {
    label: "Instagram",
    icon: require("@/assets/images/instagram-share.png"),
  },
  {
    label: "Snapchat",
    icon: require("@/assets/images/snap-share.png"),
  },
  {
    label: "WhatsApp",
    icon: require("@/assets/images/whatsapp-share.png"),
  },
  {
    label: "X",
    icon: require("@/assets/images/twitter-share.png"),
  },
  {
    label: "More",
    icon: <Upload size={20} color="#6B7280" strokeWidth={2} />,
    isImage: false,
  },
];

interface ShareModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  imageUri: string;
}

const ShareModal = ({
  isVisible,
  onClose,
  title,
  imageUri,
}: ShareModalProps) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end p-3">
        <Animated.View
          entering={FadeIn}
          className="absolute inset-0 bg-black/20"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={onClose}
            className="flex-1"
          >
            <BlurView intensity={20} tint="dark" className="flex-1" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400)}
          className="bg-white rounded-t-[24px] rounded-b-[45px] p-5"
          style={{ minHeight: SCREEN_HEIGHT * 0.6 }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-5">
            <Text
              className="text-xl font-bold"
              style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
            >
              Share Trip
            </Text>
          </View>

          {/* Preview Card */}
          <View className="relative mb-10 shadow-xl shadow-black/20">
            <Image
              source={{ uri: imageUri }}
              className="w-full h-[191px] rounded-[15px]"
              resizeMode="cover"
            />
            <View
              className="absolute inset-0 rounded-[15px]"
              style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
            />
            <View className="absolute bottom-6 left-6 right-6">
              <Text
                className="text-white text-2xl font-bold leading-tight"
                style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
              >
                {title}
              </Text>
            </View>
          </View>

          {/* Grid of options */}
          <View className="flex-row flex-wrap justify-start">
            {SHARE_OPTIONS.map((option, index) => (
              <ShareOption
                key={index}
                label={option.label}
                icon={option.icon}
                isImage={option.isImage}
              />
            ))}
          </View>

          {/* Done Button */}
          <TouchableOpacity
            onPress={onClose}
            className="bg-primary h-[45px] rounded-[30px] items-center justify-center mt-5"
          >
            <Text className="text-white text-lg font-bold">Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ShareModal;
