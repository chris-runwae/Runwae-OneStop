import Accordion from "@/components/accordion";
import { helpCenterData } from "@/constants/help-center.constant";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HelpCeter = () => {
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
            Help Center
          </Text>
          <Text className="text-sm text-gray-400">
            Find clarity for every step of your Runwae journey.
          </Text>
        </View>
      </View>

      <View className="mt-10 px-[20px]">
        <Accordion data={helpCenterData} />
      </View>
    </SafeAreaView>
  );
};

export default HelpCeter;
