import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';
import { Copy, Link2, Upload } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  Modal,
  Share,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { VARIANT_CONFIG, resolveAppVariant } from '@/app.config';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ShareOptionProps {
  icon: any;
  label: string;
  isImage?: boolean;
  onPress: () => void;
}

const ShareOption = ({ icon, label, isImage = true, onPress }: ShareOptionProps) => (
  <TouchableOpacity className="mb-6 w-1/4 items-center" onPress={onPress}>
    <View className="mb-2 h-14 w-14 items-center justify-center overflow-hidden rounded-full">
      {isImage ? (
        <Image source={icon} className="h-full w-full" resizeMode="cover" />
      ) : (
        <View className="w-full flex-1 items-center justify-center bg-gray-100">
          {icon}
        </View>
      )}
    </View>
    <Text className="text-[10px] text-gray-500 dark:text-gray-400">
      {label}
    </Text>
  </TouchableOpacity>
);

const SHARE_OPTIONS = [
  {
    label: 'Facebook',
    icon: require('@/assets/images/facebook-share.png'),
  },
  {
    label: 'Instagram',
    icon: require('@/assets/images/instagram-share.png'),
  },
  {
    label: 'Snapchat',
    icon: require('@/assets/images/snap-share.png'),
  },
  {
    label: 'WhatsApp',
    icon: require('@/assets/images/whatsapp-share.png'),
  },
  {
    label: 'X',
    icon: require('@/assets/images/twitter-share.png'),
  },
  {
    label: 'More',
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

  const variant = resolveAppVariant();
  const appConfig = VARIANT_CONFIG[variant];

  const universalLink = joinCode ? `https://app.runwae.io/invite/${joinCode}` : null;
  const shareMessage = universalLink
    ? `Join my trip on Runwae! ${universalLink}`
    : 'Join my trip on Runwae!';
  const encoded = encodeURIComponent(shareMessage);
  const encodedUrl = universalLink ? encodeURIComponent(universalLink) : '';

  const openNativeShare = async () => {
    try {
      await Share.share(
        universalLink
          ? { message: shareMessage, url: universalLink }
          : { message: shareMessage }
      );
    } catch {}
  };

  const shareHandlers: Record<string, () => void> = {
    Facebook: () => {
      Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)
        .catch(() => openNativeShare());
    },
    WhatsApp: () => {
      Linking.canOpenURL('whatsapp://send')
        .then((can) =>
          can
            ? Linking.openURL(`whatsapp://send?text=${encoded}`)
            : Linking.openURL(`https://wa.me/?text=${encoded}`)
        )
        .catch(() => openNativeShare());
    },
    X: () => {
      Linking.canOpenURL('twitter://post')
        .then((can) =>
          can
            ? Linking.openURL(`twitter://post?message=${encoded}`)
            : Linking.openURL(`https://twitter.com/intent/tweet?text=${encoded}`)
        )
        .catch(() => openNativeShare());
    },
    Instagram: openNativeShare,
    Snapchat: openNativeShare,
    More: openNativeShare,
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <View className="flex-1 justify-end p-3">
        <Animated.View
          entering={FadeIn}
          className="absolute inset-0 bg-black/20">
          <TouchableOpacity
            activeOpacity={1}
            onPress={onClose}
            className="flex-1">
            <BlurView intensity={20} tint="dark" className="flex-1" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400)}
          className="rounded-b-[45px] rounded-t-[24px] bg-white p-5 dark:bg-dark-seconndary"
          style={{ minHeight: showImage ? SCREEN_HEIGHT * 0.6 : undefined }}>
          <View className="mb-5 flex-row items-center justify-between">
            <Text
              className="text-xl font-bold dark:text-white"
              style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
              Share Trip
            </Text>
          </View>

          {showImage && (
            <View className="relative mb-10 shadow-xl shadow-black/20">
              <Image
                source={{ uri: imageUri }}
                className="h-[191px] w-full rounded-[15px]"
                resizeMode="cover"
              />
              <View
                className="absolute inset-0 rounded-[15px]"
                style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
              />
              <View className="absolute bottom-6 left-6 right-6">
                <Text
                  className="text-2xl font-bold leading-tight text-white"
                  style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
                  {title}
                </Text>
              </View>
            </View>
          )}

          {joinCode && (
            <View style={{ marginBottom: 20 }}>
              <Text
                className="mb-3 text-sm font-semibold text-black dark:text-white"
                style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
                Invite via link
              </Text>
              {/* Code chip with copy button */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isDark ? '#1c1c1e' : '#F3F4F6',
                  borderRadius: 12,
                  padding: 14,
                  gap: 10,
                  marginBottom: 10,
                }}>
                <Link2 size={16} color="#6B7280" />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: isDark ? '#e5e7eb' : '#374151',
                    letterSpacing: 3,
                    fontWeight: '700',
                  }}>
                  {joinCode}
                </Text>
                <TouchableOpacity
                  onPress={async () => {
                    await Clipboard.setStringAsync(
                      `${appConfig.scheme}:///invite/${joinCode}`
                    );
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
                      message: `Join my trip on Runwae!\n${appConfig.scheme}:///invite/${joinCode}`,
                      url: `${appConfig.scheme}:///invite/${joinCode}`,
                    });
                  } catch {
                    // user dismissed or share unavailable
                  }
                }}
                style={{
                  backgroundColor: '#FF1F8C',
                  borderRadius: 10,
                  paddingVertical: 13,
                  alignItems: 'center',
                }}>
                <Text
                  style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                  Share Invite Link
                </Text>
              </TouchableOpacity>
              {/* Divider */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 18,
                  marginBottom: 4,
                }}>
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: isDark ? '#374151' : '#E5E7EB',
                  }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: isDark ? '#6b7280' : '#9CA3AF',
                  }}>
                  or share to
                </Text>
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: isDark ? '#374151' : '#E5E7EB',
                  }}
                />
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
                onPress={shareHandlers[option.label] ?? openNativeShare}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={onClose}
            className="mt-5 h-[45px] items-center justify-center rounded-[30px] bg-primary">
            <Text className="text-lg font-bold text-white">Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ShareModal;
