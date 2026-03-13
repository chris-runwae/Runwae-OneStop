import OptionButtons from "@/components/ui/OptionButtons";
import { CONTACT_ITEMS } from "@/constants/contact-support.constant";
import { router } from "expo-router";
import { ArrowLeft, MessageSquare } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ContactSupport = () => {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-bg">
      <View className="flex flex-row items-center gap-x-5 py-5 border-b-2 border-b-gray-200 px-[20px]">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-[35px] w-[35px] flex items-center justify-center rounded-full bg-gray-200"
        >
          <ArrowLeft size={18} strokeWidth={1.5} color={"#000000"} />
        </TouchableOpacity>
        <View>
          <Text
            className="font-semibold text-2xl"
            style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
          >
            Contact Support
          </Text>
          <Text className="text-sm text-gray-400">
            We would love to hear from you.
          </Text>
        </View>
      </View>

      <View className="mt-10 px-[20px] flex-1 relative">
        <TouchableOpacity className="absolute bottom-32 flex items-center justify-center right-5 h-[50px] w-[50px] bg-primary rounded-full">
          <MessageSquare size={20} strokeWidth={2} color="#FFFFFF" />
        </TouchableOpacity>
        <View className="flex-col gap-y-5">
          {CONTACT_ITEMS.map((item) => (
            <OptionButtons
              key={item.title}
              title={item.title}
              icon={item.icon}
              onPress={item.onPress}
              badge={item.badge}
              badgeText={item.badgeText}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ContactSupport;
