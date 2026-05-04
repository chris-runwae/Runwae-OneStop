import { COLORS } from '@/constants';
import { textStyles } from '@/utils/styles';
import * as Clipboard from 'expo-clipboard';
import { Calendar, Check, Copy, MapPin, Share2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

const ShareTripModal = ({
  isVisible,
  onClose,
  tripData,
}: ShareTripModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!tripData.shareLink) return;
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

  const handleShare = async () => {
    if (!tripData.shareLink) return;
    try {
      const message = tripData.title
        ? `Join me on ${tripData.title} — ${tripData.shareLink}`
        : tripData.shareLink;
      await Share.share({
        message,
        url: tripData.shareLink,
      });
    } catch {
      // User dismissed or share failed; nothing to surface.
    }
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
          {tripData.title ? (
            <Text
              className="mb-3 text-xl font-bold text-black dark:text-white"
              style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
              {tripData.title}
            </Text>
          ) : null}

          {tripData.destination ? (
            <View className="mb-2 flex-row items-center">
              <MapPin size={16} color={COLORS.pink.default} />
              <Text
                className="ml-2 text-gray-500"
                style={{ ...textStyles.regular_14 }}>
                {tripData.destination}
              </Text>
            </View>
          ) : null}

          {tripData.dates ? (
            <View className="flex-row items-center">
              <Calendar size={16} color="#9CA3AF" />
              <Text
                className="ml-2 text-gray-500"
                style={{ ...textStyles.regular_14 }}>
                {tripData.dates}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="mb-6 h-[1px] bg-gray-100 dark:bg-gray-600" />

        {/* Share Link Section */}
        <View className="mb-6">
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

        {/* Native Share Sheet — opens iOS/Android share UI so the user
            can post to whichever channel they have installed. */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleShare}
          disabled={!tripData.shareLink}
          className={`mb-3 h-[50px] flex-row items-center justify-center rounded-full bg-primary ${
            tripData.shareLink ? '' : 'opacity-50'
          }`}>
          <Share2 size={18} color="#fff" strokeWidth={2} />
          <Text
            className="ml-2 text-base font-semibold text-white"
            style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
            Share
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onClose}
          className="h-[50px] items-center justify-center rounded-full border border-gray-200 dark:border-gray-700">
          <Text
            className="text-base font-semibold text-black dark:text-white"
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
