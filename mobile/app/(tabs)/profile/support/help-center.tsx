import Accordion from "@/components/accordion";
import ScreenHeader from "@/components/ui/ScreenHeader";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import { helpCenterData } from "@/constants/help-center.constant";
import React from "react";
import { View } from "react-native";

const HelpCeter = () => {

  return (
    <AppSafeAreaView>
      <ScreenHeader
        title="Help Center"
        subtitle="Find clarity for every step of your Runwae journey."
      />

      <View className="mt-10 px-[20px]">
        <Accordion data={helpCenterData} />
      </View>
    </AppSafeAreaView>
  );
};

export default HelpCeter;
