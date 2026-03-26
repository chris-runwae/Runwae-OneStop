import { COLORS } from '@/constants';
import { textStyles } from '@/utils/styles';
import * as Clipboard from 'expo-clipboard';
import { Calendar, Check, Copy, MapPin, Upload } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Toast } from 'toastify-react-native';
import CustomModal from '../ui/CustomModal';

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
    className="mb-6 w-1/4 items-center">
    <View className="mb-2 h-14 w-14 items-center justify-center overflow-hidden rounded-full">
      {isImage ? (
        <Image source={icon} className="h-full w-full" resizeMode="cover" />
      ) : (
        <View className="w-full flex-1 items-center justify-center bg-gray-100 dark:bg-gray-800">
          {icon}
        </View>
      )}
    </View>
    <Text
      className="text-[10px] text-gray-500 dark:text-gray-400"
      style={{ fontFamily: 'BricolageGrotesque-Medium' }}>
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
      type: 'success',
      text1: 'Copied!',
      text2: 'Link copied to clipboard',
      position: 'bottom',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialShare = (platform: string) => {
    Toast.show({
      type: 'info',
      text1: 'Share',
      text2: `Sharing to ${platform} coming soon!`,
      position: 'bottom',
    });
  };

  return (
    <CustomModal
      isVisible={isVisible}
      onClose={onClose}
      title="Share Trip Details"
      centeredTitle={false}
      showCloseButton={false}
      maxContentHeight="90%">
      <View className="px-1">
        {/* Trip Info Section */}
        <View className="mb-6">
          <Text
            className="mb-3 text-xl font-bold text-black dark:text-white"
            style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
            {tripData.title || 'Festival in Fiji'}
          </Text>

          <View className="mb-2 flex-row items-center">
            <MapPin size={16} color={COLORS.pink.default} />
            <Text
              className="ml-2 text-gray-500"
              style={{ ...textStyles.regular_14 }}>
              {tripData.destination || 'Suva, Fiji'}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Calendar size={16} color="#9CA3AF" />
            <Text
              className="ml-2 text-gray-500"
              style={{ ...textStyles.regular_14 }}>
              {tripData.dates || 'Feb 14-21 2026'}
            </Text>
          </View>
        </View>

        <View className="mb-6 h-[1px] bg-gray-100 dark:bg-gray-600" />

        {/* Share Link Section */}
        <View className="mb-8">
          <Text
            className="mb-3 text-sm font-semibold text-black dark:text-white"
            style={{ fontFamily: 'BricolageGrotesque-SemiBold' }}>
            Share your Link
          </Text>
          <View className="flex-row items-center rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-600">
            <Text
              className="mr-2 flex-1 overflow-hidden text-gray-400"
              numberOfLines={1}>
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

        <View className="mb-6 h-[1px] bg-gray-100 dark:bg-gray-600" />

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
          className="mt-4 h-[50px] items-center justify-center rounded-full bg-primary">
          <Text
            className="text-base font-semibold text-white"
            style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
            Done
          </Text>
        </TouchableOpacity>
      </View>
    </CustomModal>
  );
};

export default ShareTripModal;

const styles = StyleSheet.create({});
