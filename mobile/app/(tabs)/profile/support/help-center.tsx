import Accordion from "@/components/accordion";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { helpCenterData } from "@/constants/help-center.constant";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HelpCeter = () => {

  return (
    <SafeAreaView className="flex-1">
      <ScreenHeader
        title="Help Center"
        subtitle="Find clarity for every step of your Runwae journey."
      />

      <View className="mt-10 px-[20px]">
        <Accordion data={helpCenterData} />
      </View>
    </SafeAreaView>
  );
};

export default HelpCeter;
