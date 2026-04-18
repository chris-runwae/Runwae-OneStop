import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import { Copy, Link2, Upload } from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Share,
  Text,
  TouchableOpacity,
  useColorScheme,
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
    <Text className="text-gray-500 dark:text-gray-400 text-[10px]">
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

interface ShareModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  imageUri: string;
  showImage?: boolean;
  joinCode?: string | null;
}

const ShareModal = ({
  isVisible,
  onClose,
  title,
  imageUri,
  showImage = true,
  joinCode,
}: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
          className="bg-white dark:bg-dark-seconndary rounded-t-[24px] rounded-b-[45px] p-5"
          style={{ minHeight: showImage ? SCREEN_HEIGHT * 0.6 : undefined }}
        >
          <View className="flex-row justify-between items-center mb-5">
            <Text
              className="text-xl font-bold dark:text-white"
              style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
            >
              Share Trip
            </Text>
          </View>

          {showImage && (
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
          )}

          {joinCode && (
            <View style={{ marginBottom: 20 }}>
              <Text
                className="text-sm font-semibold text-black dark:text-white mb-3"
                style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
                Invite via link
              </Text>
              {/* Code chip with copy button */}
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1c1c1e' : '#F3F4F6', borderRadius: 12, padding: 14, gap: 10, marginBottom: 10 }}>
                <Link2 size={16} color="#6B7280" />
                <Text style={{ flex: 1, fontSize: 14, color: isDark ? '#e5e7eb' : '#374151', letterSpacing: 3, fontWeight: '700' }}>
                  {joinCode}
                </Text>
                <TouchableOpacity onPress={async () => {
                  await Clipboard.setStringAsync(`https://app.runwae.io/invite/${joinCode}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}>
                  <Copy size={16} color={copied ? '#22C55E' : '#6B7280'} />
                </TouchableOpacity>
              </View>
              {/* Native share button */}
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await Share.share({
                      message: `Join my trip on Runwae!\nhttps://app.runwae.io/invite/${joinCode}`,
                      url: `https://app.runwae.io/invite/${joinCode}`,
                    });
                  } catch {
                    // user dismissed or share unavailable
                  }
                }}
                style={{ backgroundColor: '#FF1F8C', borderRadius: 10, paddingVertical: 13, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Share Invite Link</Text>
              </TouchableOpacity>
              {/* Divider */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18, marginBottom: 4 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: isDark ? '#374151' : '#E5E7EB' }} />
                <Text style={{ fontSize: 12, color: isDark ? '#6b7280' : '#9CA3AF' }}>or share to</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: isDark ? '#374151' : '#E5E7EB' }} />
              </View>
            </View>
          )}

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
