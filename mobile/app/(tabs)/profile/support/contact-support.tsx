import { ScreenContainer } from '@/components';
import {
  ChevronRight,
  Instagram,
  Linkedin,
  Mail,
  Newspaper,
  Phone,
  Twitter,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';

const ContactSupport = () => {
  const OptionButtons = ({
    title,
    icon,
    badge,
    badgeText,
    onPress,
  }: {
    title: string;
    icon: any;
    badge?: boolean;
    badgeText?: string;
    onPress: () => void;
  }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center justify-between border-b border-b-gray-100 py-4 dark:border-b-gray-800">
        <View className="flex-row items-center gap-x-2">
          <View className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900/60">
            {icon}
          </View>
          <Text className="text-base font-semibold text-black dark:text-white">
            {title}
          </Text>
        </View>

        {badge ? (
          <View className="flex items-center justify-center rounded-full bg-pink-50 px-[15px] py-[8px] dark:bg-pink-950/60">
            <Text className="text-xs font-semibold text-pink-700 dark:text-pink-300">
              {badgeText}
            </Text>
          </View>
        ) : (
          <ChevronRight size={15} color="#ADB5BD" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer leftComponent={true} className="flex-1 px-[12px] py-[8px]">
      <View className="flex-1 px-[12px] py-[8px]">
        <View>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            We would love to hear from you.
          </Text>

          <View className="mt-20">
            <View className="flex-col gap-y-5">
              <OptionButtons
                title="Phone Number"
                icon={<Phone size={15} color="#ADB5BD" />}
                onPress={() => {}}
                badge={true}
                badgeText="Call now"
              />
              <OptionButtons
                title="Email Address"
                icon={<Mail size={15} color="#ADB5BD" />}
                onPress={() => {}}
                badge={true}
                badgeText="Copy"
              />
              <OptionButtons
                title="Instagram"
                icon={<Instagram size={15} color="#ADB5BD" />}
                onPress={() => {}}
              />
              <OptionButtons
                title="Twitter"
                icon={<Twitter size={15} color="#ADB5BD" />}
                onPress={() => {}}
              />
              <OptionButtons
                title="LinkedIn"
                icon={<Linkedin size={15} strokeWidth={1.5} color="#ADB5BD" />}
                onPress={() => {}}
              />
              <OptionButtons
                title="Our Blog"
                icon={<Newspaper size={15} color="#ADB5BD" />}
                onPress={() => {}}
              />
            </View>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

export default ContactSupport;
