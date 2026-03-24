import { COLORS } from "@/constants";
import { textStyles } from "@/utils/styles";
import * as Clipboard from "expo-clipboard";
import { Calendar, Check, Copy, MapPin, Upload } from "lucide-react-native";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Toast } from "toastify-react-native";
import CustomModal from "../ui/CustomModal";

interface ShareTripModalProps {
  isVisible: boolean;
  onClose: () => void;
  tripData: {
    title: string;
    destination: string;
    dates: string;
    shareLink: string;
  };
}

const ShareOption = ({
  icon,
  label,
  isImage = true,
  onPress,
}: {
  icon: any;
  label: string;
  isImage?: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    className="items-center mb-6 w-1/4"
  >
    <View className="w-14 h-14 rounded-full items-center justify-center mb-2 overflow-hidden">
      {isImage ? (
        <Image source={icon} className="w-full h-full" resizeMode="cover" />
      ) : (
        <View className="bg-gray-100 dark:bg-gray-800 flex-1 w-full items-center justify-center">
          {icon}
        </View>
      )}
    </View>
    <Text
      className="text-gray-500 dark:text-gray-400 text-[10px]"
      style={{ fontFamily: "BricolageGrotesque-Medium" }}
    >
      {label}
    </Text>
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

const ShareTripModal = ({
  isVisible,
  onClose,
  tripData,
}: ShareTripModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(tripData.shareLink);
    setCopied(true);
    Toast.show({
      type: "success",
      text1: "Copied!",
      text2: "Link copied to clipboard",
      position: "bottom",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialShare = (platform: string) => {
    Toast.show({
      type: "info",
      text1: "Share",
      text2: `Sharing to ${platform} coming soon!`,
      position: "bottom",
    });
  };

  return (
    <CustomModal
      isVisible={isVisible}
      onClose={onClose}
      title="Share Trip Details"
      centeredTitle={false}
      showCloseButton={false}
      maxContentHeight="90%"
    >
      <View className="px-1">
        {/* Trip Info Section */}
        <View className="mb-6">
          <Text
            className="text-xl font-bold text-black dark:text-white mb-3"
            style={{ fontFamily: "BricolageGrotesque-Bold" }}
          >
            {tripData.title || "Festival in Fiji"}
          </Text>

          <View className="flex-row items-center mb-2">
            <MapPin size={16} color={COLORS.pink[500]} />
            <Text
              className="ml-2 text-gray-500"
              style={{ ...textStyles.regular_14 }}
            >
              {tripData.destination || "Suva, Fiji"}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Calendar size={16} color="#9CA3AF" />
            <Text
              className="ml-2 text-gray-500"
              style={{ ...textStyles.regular_14 }}
            >
              {tripData.dates || "Feb 14-21 2026"}
            </Text>
          </View>
        </View>

        <View className="h-[1px] bg-gray-100 dark:bg-gray-800 mb-6" />

        {/* Share Link Section */}
        <View className="mb-8">
          <Text
            className="text-sm font-semibold text-black dark:text-white mb-3"
            style={{ fontFamily: "BricolageGrotesque-SemiBold" }}
          >
            Share your Link
          </Text>
          <View className="flex-row items-center bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-800">
            <Text
              className="flex-1 text-gray-400 mr-2 overflow-hidden"
              numberOfLines={1}
            >
              {tripData.shareLink}
            </Text>
            <TouchableOpacity onPress={handleCopyLink}>
              {copied ? (
                <Check size={20} color="#22C55E" />
              ) : (
                <Copy size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-[1px] bg-gray-100 dark:bg-gray-800 mb-6" />

        <View className="flex-row flex-wrap justify-start">
          {SHARE_OPTIONS.map((option, index) => (
            <ShareOption
              key={index}
              label={option.label}
              icon={option.icon}
              isImage={option.isImage}
              onPress={() => handleSocialShare(option.label)}
            />
          ))}
        </View>

        {/* Done Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onClose}
          className="bg-primary h-[50px] rounded-full justify-center items-center mt-4"
        >
          <Text
            className="text-white text-base font-semibold"
            style={{ fontFamily: "BricolageGrotesque-Bold" }}
          >
            Done
          </Text>
        </TouchableOpacity>
      </View>
    </CustomModal>
  );
};

export default ShareTripModal;

const styles = StyleSheet.create({});
